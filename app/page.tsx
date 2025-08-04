'use client';

import { useState, useEffect, useRef } from 'react';
import Peer from 'peerjs';

const VideoCallApp = () => {
  const [peer, setPeer] = useState(null);
  const [myId, setMyId] = useState('');
  const [friendId, setFriendId] = useState('');
  const [call, setCall] = useState(null);
  const [incomingCall, setIncomingCall] = useState(null);
  const [localStream, setLocalStream] = useState(null);
  const [error, setError] = useState(null);
  
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
      setError(`PeerJS Error: ${err.type}`);
    });

    return () => {
      if (peer) peer.destroy();
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Update video elements when streams change
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  const startCall = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      
      const newCall = peer.call(friendId, stream);
      setCall(newCall);
      
      newCall.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
      
      newCall.on('close', endCall);
      newCall.on('error', (err) => {
        setError(`Call Error: ${err.message}`);
      });
      
    } catch (err) {
      console.error('Failed to start call:', err);
      setError(`Failed to access camera/microphone: ${err.message}`);
    }
  };

  const answerCall = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      setLocalStream(stream);
      incomingCall.answer(stream);
      setCall(incomingCall);
      setIncomingCall(null);
      
      incomingCall.on('stream', (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      });
      
      incomingCall.on('close', endCall);
      incomingCall.on('error', (err) => {
        setError(`Call Error: ${err.message}`);
      });
      
    } catch (err) {
      console.error('Failed to answer call:', err);
      setError(`Failed to access camera/microphone: ${err.message}`);
    }
  };

  const endCall = () => {
    if (call) {
      call.close();
    }
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
      setLocalStream(null);
    }
    if (remoteVideoRef.current?.srcObject) {
      remoteVideoRef.current.srcObject = null;
    }
    setCall(null);
    setIncomingCall(null);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Video Call App</h1>
      
      {error && (
        <div style={{ 
          color: 'red', 
          padding: '10px', 
          marginBottom: '20px',
          border: '1px solid red',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      <div style={{ 
        display: 'flex', 
        gap: '20px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div>
          <h3>Your Camera</h3>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              height: 'auto',
              backgroundColor: '#222',
              borderRadius: '8px'
            }}
          />
        </div>
        <div>
          <h3>Remote Camera</h3>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            style={{ 
              width: '100%', 
              maxWidth: '400px', 
              height: 'auto',
              backgroundColor: '#222',
              borderRadius: '8px'
            }}
          />
        </div>
      </div>
      
      <div style={{ 
        marginBottom: '20px',
        padding: '15px',
        backgroundColor: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <strong>Your ID:</strong> {myId || 'Generating...'}
      </div>
      
      {!call && !incomingCall && (
        <div style={{ 
          display: 'flex', 
          gap: '10px', 
          marginBottom: '20px',
          flexWrap: 'wrap'
        }}>
          <input
            type="text"
            value={friendId}
            onChange={(e) => setFriendId(e.target.value)}
            placeholder="Enter friend ID"
            style={{ 
              padding: '10px',
              flex: '1',
              minWidth: '200px',
              borderRadius: '4px',
              border: '1px solid #ddd'
            }}
          />
          <button 
            onClick={startCall}
            disabled={!friendId}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: '#007bff', 
              color: 'white', 
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Start Call
          </button>
        </div>
      )}
      
      {incomingCall && (
        <div style={{ 
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          borderRadius: '8px'
        }}>
          <p style={{ marginBottom: '10px' }}>Incoming call from {incomingCall.peer}</p>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              onClick={answerCall}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#28a745', 
                color: 'white', 
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Answer
            </button>
            <button 
              onClick={endCall}
              style={{ 
                padding: '10px 20px', 
                backgroundColor: '#dc3545', 
                color: 'white', 
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Reject
            </button>
          </div>
        </div>
      )}
      
      {call && (
        <button 
          onClick={endCall}
          style={{ 
            padding: '10px 20px', 
            backgroundColor: '#dc3545', 
            color: 'white', 
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          End Call
        </button>
      )}
    </div>
  );
};

export default VideoCallApp;