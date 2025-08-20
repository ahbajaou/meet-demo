
'use client'

import React, { useEffect, useRef, useState } from 'react'
import Peer from 'peerjs';

export default function page() {
  const [peerId, setPeerId] = useState('');
  const [remotePeerIdValue, setRemotePeerIdValue] = useState('');
  const remoteVideoRef = useRef(null);
  const currentUserVideoRef = useRef(null);
  const peerInstance = useRef(null);

  useEffect(() => {
    const peer = new Peer();
    console.log('---> : ', peer);
    peer.on('open', (id) => {
      setPeerId(id)
    });
    peer.on('call', (call) => {
      var getUserMedia = navigator.getUserMedia
        || navigator.webkitGetUserMedia
        || navigator.mozGetUserMedia;

      getUserMedia({ video: true, audio: true }, (mediaStream) => {
        currentUserVideoRef.current.srcObject = mediaStream;
        currentUserVideoRef.current.play();
        call.answer(mediaStream)
        call.on('stream', function (remoteStream) {
          remoteVideoRef.current.srcObject = remoteStream
          remoteVideoRef.current.play();
        });
      });
    })
    peerInstance.current = peer;
  }, []);
  
  const call = (remotePeerId) => {
    var getUserMedia = navigator.getUserMedia
      || navigator.webkitGetUserMedia
      || navigator.mozGetUserMedia;

    getUserMedia({ video: true, audio: true }, (mediaStream) => {

      currentUserVideoRef.current.srcObject = mediaStream;
      currentUserVideoRef.current.play();

      const call = peerInstance.current.call(remotePeerId, mediaStream)

      call.on('stream', (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream
        remoteVideoRef.current.play();
      });
    });
  }
  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-900 text-gray-200 p-8">

      {/* --- Header --- */}
      <h1 className="text-2xl font-bold mb-4">
        Current user id is <span className="text-white font-mono bg-gray-700 px-2 py-1 rounded">{peerId}</span>
      </h1>

      {/* --- Controls for Calling --- */}
      <div className="flex items-center space-x-2 mb-6">
        <input
          className="bg-gray-800 border border-gray-600 text-white px-4 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500"
          type="text"
          placeholder="Enter remote peer ID"
          value={remotePeerIdValue}
          onChange={e => setRemotePeerIdValue(e.target.value)}
        />
        <button
          onClick={() => call(remotePeerIdValue)}
          className="bg-gray-600 text-white font-semibold px-6 py-2 rounded-md hover:bg-gray-500 transition-colors"
        >
          Call
        </button>
      </div>

      {/* --- Video Feeds --- */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Current User's Video */}
        <div>
          <video ref={currentUserVideoRef} muted autoPlay className="w-96 h-72 bg-black rounded-lg border-2 border-gray-700 object-cover" />
        </div>

        {/* Remote User's Video */}
        <div>
          <video ref={remoteVideoRef} autoPlay className="w-96 h-72 bg-black rounded-lg border-2 border-gray-700 object-cover" />
        </div>
      </div>

    </div>
  )
}

// export default page