'use client';

import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';
import io from 'socket.io-client';
import { VAD, assetPath } from '@ricky0123/vad-web'; // Import VAD


import VideoSection from '../components/VideoSection';
import Subtitles from '../components/Subtitles';
import ControlsPanel from '../components/ControlsPanel';

// const socket = io('http://localhost:3001');

// --- Styles ---
const styles = {
  container: { fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#121212', color: '#FFFFFF', padding: '20px' },
  mainContent: { width: '100%', maxWidth: '1000px', display: 'flex', flexDirection: 'column', gap: '20px' },
  videoContainer: { display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' },
  videoBox: { position: 'relative', flex: '1', minWidth: '300px', maxWidth: '500px', aspectRatio: '16 / 9', backgroundColor: '#000000', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333' },
  video: { width: '100%', height: '100%', objectFit: 'cover' },
  videoLabel: { position: 'absolute', top: '10px', left: '10px', backgroundColor: 'rgba(0, 0, 0, 0.5)', color: 'white', padding: '4px 8px', borderRadius: '6px', fontSize: '14px' },
  subtitlesContainer: { width: '100%', height: '120px', backgroundColor: '#1a1a1a', borderRadius: '12px', border: '1px solid #333', padding: '15px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' },
  subtitleText: { margin: 0, fontSize: '15px', lineHeight: '1.4' },
  controlsPanel: { backgroundColor: '#1a1a1a', borderRadius: '12px', border: '1px solid #333', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' },
  idSection: { display: 'flex', alignItems: 'center', gap: '10px', backgroundColor: '#2a2a2a', padding: '10px', borderRadius: '8px' },
  idText: { flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  input: { flex: 1, padding: '12px', backgroundColor: '#2a2a2a', border: '1px solid #444', borderRadius: '8px', color: 'white', fontSize: '16px' },
  button: { padding: '12px 20px', border: '1px solid #555', borderRadius: '8px', backgroundColor: '#2a2a2a', color: 'white', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', transition: 'background-color 0.2s, border-color 0.2s' },
  buttonPrimary: { backgroundColor: '#f0f0f0', color: '#121212', border: '1px solid #f0f0f0', fontWeight: 'bold' },
  buttonDanger: { backgroundColor: '#401515', color: '#ffc4c4', border: '1px solid #722f2f' },
  buttonGroup: { display: 'flex', gap: '10px', flexWrap: 'wrap' },
  error: { color: '#ffc4c4', backgroundColor: '#401515', padding: '10px', border: '1px solid #722f2f', borderRadius: '8px', textAlign: 'center' }
};

// Utility: Convert Int16Array PCM to WAV Blob
function pcmToWavBlob(int16Array, sampleRate = 44100) {
  const numChannels = 1;
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataLength = int16Array.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataLength);
  const view = new DataView(buffer);

  // RIFF identifier 'RIFF'
  view.setUint32(0, 0x52494646, false);
  // file length minus RIFF identifier length and file description length = fileSize - 8
  view.setUint32(4, 36 + dataLength, true);
  // RIFF type 'WAVE'
  view.setUint32(8, 0x57415645, false);
  // format chunk identifier 'fmt '
  view.setUint32(12, 0x666d7420, false);
  // format chunk length 16
  view.setUint32(16, 16, true);
  // sample format (raw)
  view.setUint16(20, 1, true);
  // channel count
  view.setUint16(22, numChannels, true);
  // sample rate
  view.setUint32(24, sampleRate, true);
  // byte rate (sample rate * block align)
  view.setUint32(28, byteRate, true);
  // block align (channel count * bytes per sample)
  view.setUint16(32, blockAlign, true);
  // bits per sample
  view.setUint16(34, 16, true);
  // data chunk identifier 'data'
  view.setUint32(36, 0x64617461, false);
  // data chunk length
  view.setUint32(40, dataLength, true);

  // Write PCM samples
  for (let i = 0; i < int16Array.length; i++) {
    view.setInt16(44 + i * 2, int16Array[i], true);
  }

  return new Blob([buffer], { type: 'audio/wav' });
}


// --- Main App Component ---
const VideoCallApp = () => {
  // State for PeerJS and call management
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [call, setCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);
  const [idCopied, setIdCopied] = useState(false);

  // State for subtitles
  const [subtitles, setSubtitles] = useState([]);

  // Refs for DOM elements and audio processing
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const subtitlesEndRef = useRef(null);
  const audioContextRef = useRef(null);
  const scriptProcessorRef = useRef(null);


  const startSendingAudio = (stream) => {
    if (!stream || !stream.getAudioTracks().length) {
      console.warn("Stream has no audio tracks.");
      return;
    }
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    audioContextRef.current = audioContext;
    const source = audioContext.createMediaStreamSource(stream);
    const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
    scriptProcessorRef.current = scriptProcessor;

    scriptProcessor.onaudioprocess = (event) => {
      const inputData = event.inputBuffer.getChannelData(0);
      // Convert Float32Array to Buffer for sending to backend
      const audioBuffer = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        audioBuffer[i] = Math.max(-1, Math.min(1, inputData[i])) * 32767;
      }
      // Send to backend (WebSocket or fetch)
      // socket.emit('audio_chunk', audioBuffer.buffer);
      // OR use fetch:
      // fetch('/api/audio', { method: 'POST', body: audioBuffer });
      // console.log('Audio chunk sent:', audioBuffer);
      const wavBlob = pcmToWavBlob(audioBuffer, audioContext.sampleRate);
      // Send to backend (example with fetch)
      // fetch('/api/audio', { method: 'POST', body: wavBlob });
      console.log('WAV Blob ready:', wavBlob);
    };

    source.connect(scriptProcessor);
    scriptProcessor.connect(audioContext.destination);
  };



  const stopSendingAudio = () => {
    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
    }
  };

  // --- Effect 1: PeerJS Initialization and Connection Management ---
  // This effect runs only once on component mount.
  useEffect(() => {
    const newPeer = new Peer();
    setPeer(newPeer);

    newPeer.on('open', (id) => {
      setMyId(id);
      setError(null); // Clear any previous connection errors
    });

    newPeer.on('call', (incoming) => setIncomingCall(incoming));

    newPeer.on('disconnected', () => {
      setError('Connection to server lost. Attempting to reconnect...');
      // PeerJS will automatically try to reconnect.
    });

    newPeer.on('error', (err) => {
      console.error('PeerJS error:', err);
      setError(`Error: ${err.type}. Please refresh and try again.`);
    });

    // Cleanup on component unmount
    return () => {
      newPeer.destroy();
    };
  }, []); // Empty dependency array ensures this runs only once.

  // useEffect(() => {
  //   if (!myId) return; // Don't attach listener until we have an ID

  //   const handleTranslation = (data) => {
  //     const newSubtitle = {
  //       id: Date.now() + Math.random(),
  //       text: `${data.userId === myId ? 'You' : 'Friend'}: ${data.text}`
  //     };
  //     setSubtitles(prev => [...prev, newSubtitle]);
  //     console.log('Received translated text:', newSubtitle.text);
  //   };

  //   socket.on('translated_text', handleTranslation);

  //   // Cleanup the listener
  //   return () => {
  //     socket.off('translated_text', handleTranslation);
  //   };
  // }, [myId]);


  // --- Effect 3: Handle video streams ---
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  // --- Effect 4: Auto-scroll subtitles ---
  useEffect(() => {
    subtitlesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [subtitles]);

  // --- Core Call Functions ---
  const startCall = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      startSendingAudio(stream);
      // console.log('----> : ' , stream.getAudioTracks().length);

      const newCall = peer.call(friendId, stream);
      setCall(newCall);

      newCall.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      });
      newCall.on('close', endCall);
      newCall.on('error', (err) => setError(`Call Error: ${err.message}`));
    } catch (err) {
      console.error('Failed to start call:', err);
      setError(`Failed to access camera/microphone: ${err.message}`);
    }
  };

  const answerCall = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setLocalStream(stream);
      startSendingAudio(stream);

      incomingCall.answer(stream);
      setCall(incomingCall);
      setIncomingCall(null);

      incomingCall.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
      });
      incomingCall.on('close', endCall);
      incomingCall.on('error', (err) => setError(`Call Error: ${err.message}`));
    } catch (err) {
      console.error('Failed to answer call:', err);
      setError(`Failed to access camera/microphone: ${err.message}`);
    }
  };

  const endCall = () => {
    stopSendingAudio();
    if (call) call.close();
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
      remoteVideoRef.current.srcObject = null;
    }
    setCall(null);
    setIncomingCall(null);
    setSubtitles([]);
  };

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(myId).then(() => {
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 2000);
    });
  };



  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <VideoSection localVideoRef={localVideoRef} remoteVideoRef={remoteVideoRef} styles={styles} />
        <Subtitles subtitles={subtitles} subtitlesEndRef={subtitlesEndRef} styles={styles} />
        {error && <div style={styles.error}>{error}</div>}
        <ControlsPanel
          myId={myId}
          idCopied={idCopied}
          copyIdToClipboard={copyIdToClipboard}
          call={call}
          incomingCall={incomingCall}
          friendId={friendId}
          setFriendId={setFriendId}
          startCall={startCall}
          answerCall={answerCall}
          endCall={endCall}
          setIncomingCall={setIncomingCall}
          peer={peer}
          styles={styles}
        />
      </div>
    </div>
  );
};

export default VideoCallApp;
