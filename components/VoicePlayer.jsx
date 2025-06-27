// components/VoicePlayer.jsx
// This component provides audio playback functionality for tender summaries
// It fetches a voice summary from the API and allows the user to play/stop it

import { useState } from 'react';
import { SpeakerWaveIcon, StopIcon } from '@heroicons/react/24/outline';

export default function VoicePlayer({ tenderId, onError }) {
  // State for managing audio playback
  const [audioSrc, setAudioSrc] = useState(null); // URL of the audio file
  const [isPlaying, setIsPlaying] = useState(false); // Whether audio is currently playing
  const [loading, setLoading] = useState(false); // Whether audio is being generated

  // Handle play/pause button click
  const handlePlay = async () => {
    try {
      setLoading(true);
      
      // If we don't have the audio yet, fetch it from the API
      if (!audioSrc) {
        const response = await fetch('/api/voiceSummary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tenderId }),
        });
        
        if (!response.ok) throw new Error('Failed to generate voice summary');
        
        const { url } = await response.json();
        setAudioSrc(url);
      }
      
      // Get the audio element and toggle play/pause
      const audio = document.getElementById(`audio-${tenderId}`);
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (error) {
      // Call the error handler if provided
      onError?.(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Play/Stop button */}
      <button
        onClick={handlePlay}
        disabled={loading}
        className="btn btn-secondary"
      >
        {loading ? (
          // Loading spinner
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-900 mr-2"></div>
        ) : isPlaying ? (
          // Stop icon when playing
          <StopIcon className="h-4 w-4 mr-2" />
        ) : (
          // Speaker icon when not playing
          <SpeakerWaveIcon className="h-4 w-4 mr-2" />
        )}
        {loading ? 'Generating...' : isPlaying ? 'Stop' : 'Listen'}
      </button>
      
      {/* Hidden audio element */}
      {audioSrc && (
        <audio
          id={`audio-${tenderId}`}
          src={audioSrc}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}
    </div>
  );
}