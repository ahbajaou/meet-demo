
'use client';

import { useEffect, useRef } from 'react';

export default function VideoStream() {
  const videoRef = useRef(null);

  useEffect(() => {
    const getMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Error accessing media devices:", err);
      }
    };

    getMedia();
  }, []);

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      playsInline
      style={{ width: '100%', maxWidth: '500px' }}
    />
  );
}