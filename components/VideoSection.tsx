import React from "react";

interface VideoSectionProps {
  localVideoRef: React.RefObject<HTMLVideoElement>;
  remoteVideoRef: React.RefObject<HTMLVideoElement>;
  styles: any;
}

const VideoSection: React.FC<VideoSectionProps> = ({ localVideoRef, remoteVideoRef, styles }) => (
  <div style={styles.videoContainer}>
    <div style={styles.videoBox}>
      <video ref={localVideoRef} autoPlay muted playsInline style={styles.video} />
      <span style={styles.videoLabel}>You</span>
    </div>
    <div style={styles.videoBox}>
      <video ref={remoteVideoRef} autoPlay playsInline style={styles.video} />
      <span style={styles.videoLabel}>Friend</span>
    </div>
  </div>
);

export default VideoSection;