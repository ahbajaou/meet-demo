'use client';

import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

const VideoCallApp = () => {
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [call, setCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();

  useEffect(() => {
    // Initialize PeerJS
    const newPeer = new Peer({
      host: '0.peerjs.com',
      port: 443,
      path: '/',
      debug: 3
    });

    setPeer(newPeer);

    newPeer.on('open', (id) => {
      setMyId(id);
    });

    newPeer.on('call', (incoming) => {
      setIncomingCall(incoming);
    });

    newPeer.on('error', (err) => {
      console.error('PeerJS error:', err);
    });

    return () => {
      if (peer) peer.destroy();
    };
  }, []);

  const startCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      
      const newCall = peer.call(friendId, stream);
      setCall(newCall);
      
      newCall.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
      
      newCall.on('close', endCall);
      
    } catch (err) {
      console.error('Failed to start call:', err);
    }
  };

  const answerCall = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localVideoRef.current.srcObject = stream;
      
      incomingCall.answer(stream);
      setCall(incomingCall);
      setIncomingCall(null);
      
      incomingCall.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });
      
      incomingCall.on('close', endCall);
      
    } catch (err) {
      console.error('Failed to answer call:', err);
    }
  };

  const endCall = () => {
    if (call) call.close();
    if (localVideoRef.current?.srcObject) {
      localVideoRef.current.srcObject.getTracks().forEach(track => track.stop());
    }
    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject = null;
    }
    setCall(null);
    setIncomingCall(null);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <video
          ref={localVideoRef}
          autoPlay
          muted
          style={{ width: '300px', height: '225px', backgroundColor: '#222' }}
        />
        <video
          ref={remoteVideoRef}
          autoPlay
          style={{ width: '300px', height: '225px', backgroundColor: '#222' }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <strong>Your ID:</strong> {myId || 'Generating...'}
      </div>
      
      {!call && !incomingCall && (
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
          <input
            type="text"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            placeholder="Enter friend ID"
            style={{ padding: '8px' }}
          />
          <button 
            onClick={startCall}
            disabled={!friendId}
            style={{ padding: '8px 16px', backgroundColor: '#007bff', color: 'white', border: 'none' }}
          >
            Start Call
          </button>
        </div>
      )}
      
      {incomingCall && (
        <div style={{ marginBottom: '20px' }}>
          <p>Incoming call from {incomingCall.peer}</p>
          <button 
            onClick={answerCall}
            style={{ padding: '8px 16px', backgroundColor: '#28a745', color: 'white', border: 'none', marginRight: '10px' }}
          >
            Answer
          </button>
          <button 
            onClick={endCall}
            style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}
          >
            Reject
          </button>
        </div>
      )}
      
      {call && (
        <button 
          onClick={endCall}
          style={{ padding: '8px 16px', backgroundColor: '#dc3545', color: 'white', border: 'none' }}
        >
          End Call
        </button>
      )}
    </div>
  );
};

export default VideoCallApp;