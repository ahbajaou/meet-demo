'use client';

import { useState } from 'react';
import VideoStream from '../compoment/VideoStream';
import WebRTCConnection from '../compoment/WebRTCConnection';

export default function VideoChat() {
  const [roomId, setRoomId] = useState('');

  return (
    <div className='flex flex-col items-center  min-h-screen p-10'>
      <h1>WebRTC Video Chat</h1>
      <input 
        type="text" 
        placeholder="Enter Room ID" 
        onChange={(e) => setRoomId(e.target.value)} 
      />
      {roomId && <WebRTCConnection roomId={roomId} />}
    </div>
  );
}