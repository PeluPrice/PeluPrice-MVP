// services/yellow.js
// ClearNode/Nitrolite WS istemcisi – subprotocol + ayrıntılı log + EIP-712 auth akışı
import {
  createAuthRequestMessage,
  createAuthVerifyMessage,
  parseRPCResponse,
  RPCMethod,
} from '@erc7824/nitrolite';

export class YellowClient {
  constructor(opts) {
    this.url = opts.url;                                   // wss://.../ws
    this.subprotocol = opts.subprotocol || 'nitrolite-rpc';// gerekli ise
    this.domainName = opts.domainName || 'PeluPrice';      // EIP-712 domain.name
    this.wallet = opts.wallet;                              // EOA (0x...)
    this.participant = opts.participant || opts.wallet;     // participant addr
    this.application = opts.application;                    // app contract addr (0x...)
    this.scope = opts.scope || 'console';
    this.allowances = opts.allowances || [];                // [{asset, amount}]
    this.expireSec = opts.expireSec || 1800;

    this.stateWalletClient = opts.stateWalletClient;        // imza için wallet client (örn.: ethers/viem)
    this.makeEip712Signer = opts.makeEip712Signer;          // (walletClient, policyFields, domain) => signer

    this.getJwt = opts.getJwt || (() => null);
    this.setJwt = opts.setJwt || (() => {});
    this.jwt = this.getJwt();

    this.ws = null;
    this.events = {};
    this.isManualClose = false;
    this.backoff = { base: 800, max: 8000, tries: 0 };
  }

  on(ev, cb) {
    (this.events[ev] ||= []).push(cb);
    return () => this.events[ev] = (this.events[ev] || []).filter(f => f !== cb);
  }
  _emit(ev, data) { (this.events[ev] || []).forEach(f => { try { f(data); } catch(e){ console.error(e); } }); }

  async connect() {
    this.isManualClose = false;
    await this._open();
  }
  close() {
    this.isManualClose = true;
    if (this.ws && this.ws.readyState <= 1) this.ws.close(1000, 'manual');
  }

  async _open() {
    try {
      if (this.ws && this.ws.readyState <= 1) this.ws.close();
      this._emit('status', 'connecting');

      // Subprotocol gerekiyorsa ikinci parametreyle veriyoruz
      this.ws = new WebSocket(this.url, this.subprotocol);

      this.ws.onopen = () => {
        this._emit('status', 'connected');
        this.backoff.tries = 0;

        // JWT varsa resume dene
        if (this.jwt) {
          this._send({ req: [this._rid(), 'auth_resume', [this.jwt], Date.now()] });
        } else {
          // tam auth akışına geç
          this._authRequest();
        }
      };

      this.ws.onmessage = async (ev) => {
        let msg;
        try { msg = parseRPCResponse(ev.data); } catch { return; }

        // Genel log
        this._emit('message', msg);

        // AUTH CHALLENGE
        if (msg.method === RPCMethod.AuthChallenge) {
          try {
            const signer = this.makeEip712Signer(
              this.stateWalletClient,
              {
                scope: this.scope,
                application: this.application,
                participant: this.participant,
                expire: Math.floor(Date.now() / 1000) + this.expireSec,
                allowances: this.allowances,
              },
              { name: this.domainName }
            );
            const verifyMsg = await createAuthVerifyMessage(signer, msg);
            this.ws.send(verifyMsg);
            this._emit('sent', { kind: 'auth_verify' });
          } catch (e) {
            this._emit('error', 'auth_verify_sign_error: ' + e.message);
          }
          return;
        }

        // AUTH SONUÇ
        if (msg.method === RPCMethod.AuthVerify) {
          if (msg.params?.success) {
            this.jwt = msg.params.jwtToken;
            this.setJwt(this.jwt);
            this._emit('status', 'authenticated');
          } else {
            this.jwt = null; this.setJwt(null);
            this._emit('error', 'auth_failed');
          }
          return;
        }

        // RESUME SONUÇ
        if (msg.method === 'auth_resume') {
          if (msg.params?.success) {
            this._emit('status', 'authenticated');
          } else {
            this.jwt = null; this.setJwt(null);
            this._authRequest();
          }
          return;
        }

        // RFQ QUOTE vb.
        if (msg.method === 'rfq_quote') {
          this._emit('quote', msg.params);
          return;
        }

        if (msg.method === RPCMethod.Error) {
          this._emit('error', msg.params?.error || 'rpc_error');
        }
      };

      this.ws.onerror = (e) => {
        this._emit('error', 'ws_error');
      };

      this.ws.onclose = (e) => {
        this._emit('status', 'disconnected');
        this._emit('close', { code: e.code, reason: e.reason });
        if (!this.isManualClose) this._reconnect();
      };

    } catch (e) {
      this._emit('error', 'open_failed: ' + e.message);
      this._reconnect();
    }
  }

  _reconnect() {
    const t = Math.min(this.backoff.max, this.backoff.base * Math.pow(2, this.backoff.tries++));
    this._emit('status', `reconnecting in ${t}ms`);
    setTimeout(() => this._open(), t);
  }

  async _authRequest() {
    try {
      const authReqMsg = await createAuthRequestMessage({
        wallet: this.wallet,
        participant: this.participant,
        app_name: this.domainName,
        expire: Math.floor(Date.now() / 1000) + this.expireSec,
        scope: this.scope,
        application: this.application,
        allowances: this.allowances,
      });
      this.ws.send(authReqMsg);
      this._emit('sent', { kind: 'auth_request' });
    } catch (e) {
      this._emit('error', 'auth_request_error: ' + e.message);
    }
  }

  rfqRequest({ base, quote, side, amount }) {
    const req = { req: [this._rid(), 'rfq_request', [{ base, quote, side, amount }], Date.now()] };
    this._send(req);
  }

  _send(obj) {
    if (!this.ws || this.ws.readyState !== 1) {
      this._emit('error', 'ws_not_open');
      return;
    }
    const payload = typeof obj === 'string' ? obj : JSON.stringify(obj);
    this.ws.send(payload);
    this._emit('sent', obj);
  }

  _rid() {
    return Math.floor(Math.random() * 1e9);
  }
}
