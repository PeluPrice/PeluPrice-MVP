"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { YellowClient } from "../services/yellow";

// Basit localStorage helper
const jwtKey = "yellow_jwt";
const getJwt = () => (typeof window !== "undefined" ? localStorage.getItem(jwtKey) : null);
const setJwt = (v) => { if (typeof window !== "undefined") (v ? localStorage.setItem(jwtKey, v) : localStorage.removeItem(jwtKey)); };

// MetaMask/Wallet imza (ham JSON'u personal_sign ile imzalar)
async function browserSigner(rawJson) {
  if (!window.ethereum) throw new Error("Wallet not found");
  const [account] = await window.ethereum.request({ method: "eth_requestAccounts" });
  // personal_sign params: [data, account]
  const hex = "0x" + Buffer.from(rawJson, "utf8").toString("hex");
  const sig = await window.ethereum.request({ method: "personal_sign", params: [hex, account] });
  return sig; // demo amaçlı; prod’da EIP-712 tercih edin
}

export default function YellowDemo() {
  const [account, setAccount] = useState(null);
  const [status, setStatus] = useState("idle");
  const [log, setLog] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const ycRef = useRef(null);

  // RFQ form state
  const [base, setBase] = useState("USDC");
  const [quote, setQuote] = useState("ETH");
  const [amount, setAmount] = useState("1000");
  const [side, setSide] = useState("buy");

  const addLog = (x) => setLog((s) => [{ ts: new Date().toLocaleTimeString(), x }, ...s].slice(0, 100));

  useEffect(() => {
    if (!ycRef.current) {
      ycRef.current = new YellowClient({
        url: process.env.NEXT_PUBLIC_YELLOW_WS || "wss://clearnode.sandbox.example/ws",
        app: "PeluPrice",
        participant: "demo-user",       // isterseniz wallet adresini de yazabilirsiniz
        chainId: 1,
        getJwt,
        setJwt,
        signer: browserSigner,
      });

      const off1 = ycRef.current.on("status", (s) => { setStatus(s); addLog(`status: ${s}`); });
      const off2 = ycRef.current.on("error", (e) => addLog(`ERROR: ${e}`));
      const off3 = ycRef.current.on("message", (m) => addLog(`msg: ${m.type}`));
      const off4 = ycRef.current.on("sent", (m) => addLog(`sent: ${m.type}`));
      const off5 = ycRef.current.on("needAuth", () => addLog("needAuth: call authenticate()"));
      const off6 = ycRef.current.on("quote", (q) => setQuotes((arr) => [q, ...arr].slice(0, 50)));

      return () => { off1?.(); off2?.(); off3?.(); off4?.(); off5?.(); off6?.(); ycRef.current?.close(); };
    }
  }, []);

  const connectWallet = async () => {
    if (!window.ethereum) { alert("Cüzdan bulunamadı"); return; }
    const [acc] = await window.ethereum.request({ method: "eth_requestAccounts" });
    setAccount(acc);
    addLog(`wallet: ${acc}`);
  };

  const connectWS = async () => {
    try {
      await ycRef.current.connect();
    } catch (e) { addLog("connect error: " + e.message); }
  };

  const authenticate = async () => {
    try {
      await ycRef.current.authenticate({
        allowances: [
          // Örnek: USDC 1e18 formatında izin – gerçek ClearNode kurallarına göre ayarla
          { asset: "USDC", amount: "1000000000" } // 1000 USDC (örnek)
        ],
        expirySec: 1800,
      });
    } catch (e) { addLog("auth error: " + e.message); }
  };

  const sendRFQ = () => {
    try {
      ycRef.current.rfqRequest({ base, quote, side, amount });
      addLog(`RFQ -> ${side} ${amount} ${base}/${quote}`);
    } catch (e) { addLog("rfq error: " + e.message); }
  };

  return (
    <div style={{ maxWidth: 920, margin: "40px auto", fontFamily: "Inter, system-ui" }}>
      <h1 style={{ marginBottom: 8 }}>PeluPrice × Yellow Demo</h1>
      <p style={{ marginTop: 0, opacity: 0.8 }}>
        WebSocket’e bağlan, imzalı doğrulama yap, ardından RFQ iste ve gelen <em>quote</em>’ları izle.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginTop: 16 }}>
        <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
          <h3>Bağlantı</h3>
          <p><b>Durum:</b> {status}</p>
          <button onClick={connectWallet} style={{ padding: "8px 12px", borderRadius: 8 }}>
            {account ? `Cüzdan: ${account.slice(0,6)}…${account.slice(-4)}` : "Cüzdan Bağla"}
          </button>{" "}
          <button onClick={connectWS} style={{ padding: "8px 12px", borderRadius: 8 }}>
            WS Connect
          </button>{" "}
          <button onClick={authenticate} style={{ padding: "8px 12px", borderRadius: 8 }}>
            Authenticate
          </button>
          <div style={{ fontSize: 12, opacity: 0.7, marginTop: 8 }}>
            WS: {process.env.NEXT_PUBLIC_YELLOW_WS || "wss://clearnode.sandbox.example/ws"}
          </div>
        </div>

        <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12 }}>
          <h3>RFQ Gönder</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            <label>Base
              <input value={base} onChange={e => setBase(e.target.value)} style={{ width: "100%" }}/>
            </label>
            <label>Quote
              <input value={quote} onChange={e => setQuote(e.target.value)} style={{ width: "100%" }}/>
            </label>
            <label>Miktar
              <input value={amount} onChange={e => setAmount(e.target.value)} style={{ width: "100%" }}/>
            </label>
            <label>Yön
              <select value={side} onChange={e => setSide(e.target.value)} style={{ width: "100%" }}>
                <option value="buy">buy</option>
                <option value="sell">sell</option>
              </select>
            </label>
          </div>
          <button onClick={sendRFQ} style={{ marginTop: 12, padding: "8px 12px", borderRadius: 8 }}>
            RFQ Gönder
          </button>
        </div>
      </div>

      <div style={{ marginTop: 16, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12, minHeight: 240 }}>
          <h3>Gelen Quote’lar</h3>
          {quotes.length === 0 && <div style={{ opacity: 0.6 }}>Henüz yok</div>}
          {quotes.map((q, i) => (
            <div key={i} style={{ padding: 8, borderBottom: "1px dashed #eee" }}>
              <b>{q.provider || "provider"}</b> — {q.side} {q.amount} {q.base}/{q.quote} @ <b>{q.price}</b>
              {q.ttlMs ? <span style={{ opacity: 0.7 }}> (ttl {Math.round(q.ttlMs)}ms)</span> : null}
            </div>
          ))}
        </div>
        <div style={{ padding: 16, border: "1px solid #eee", borderRadius: 12, minHeight: 240 }}>
          <h3>Log</h3>
          <div style={{ fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12 }}>
            {log.map((l, i) => <div key={i}>[{l.ts}] {l.x}</div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
