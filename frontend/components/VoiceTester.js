'use client';

import { useState } from 'react';
import { useTranslation } from '../i18n';
import { config } from '../lib/config';

export const VoiceTester = ({ voice }) => {
  const [testing, setTesting] = useState(false);
  const { t } = useTranslation();

  const handleTest = async () => {
    setTesting(true);
    
    try {
      // Get the voice data to determine which audio file to play
      const selectedVoiceData = config.voiceOptions.find(v => v.id === voice);
      let audioFile = '';
      
      // Map voice to audio file
      if (selectedVoiceData?.name === 'Alex') {
        audioFile = '/alex.mp3';
      } else if (selectedVoiceData?.name === 'Emma') {
        audioFile = '/emma.mp3';
      }
      
      if (audioFile) {
        // Create and play audio
        const audio = new Audio(audioFile);
        
        // Handle audio events
        audio.onloadeddata = () => {
          console.log('Audio loaded successfully');
        };
        
        audio.onerror = (error) => {
          console.error('Audio load error:', error);
          setTesting(false);
        };
        
        audio.onended = () => {
          setTesting(false);
        };
        
        // Play the audio
        await audio.play();
      } else {
        // Fallback for unknown voices
        setTimeout(() => {
          setTesting(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error playing audio:', error);
      setTesting(false);
    }
  };

  const selectedVoiceData = config.voiceOptions.find(v => v.id === voice);
  const genderText = selectedVoiceData?.gender ? t(`devices.${selectedVoiceData.gender}`) : '';
  const displayName = selectedVoiceData ? `${selectedVoiceData.name} (${genderText})` : voice;

  return (
    <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🔊</div>
          <div>
            <div className="font-medium text-slate-800 dark:text-slate-200">
              {displayName}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              {t('devices.testVoicePreview')}
            </div>
          </div>
        </div>
        
        <button
          type="button"
          onClick={handleTest}
          disabled={testing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-all duration-200 text-sm font-medium"
        >
          {testing ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('devices.testing')}</span>
            </div>
          ) : (
            t('devices.testVoice')
          )}
        </button>
      </div>
    </div>
  );
};
