import React from "react";

interface Subtitle {
  id: string | number;
  text: string;
}

interface SubtitlesProps {
  subtitles: Subtitle[];
  subtitlesEndRef: React.RefObject<HTMLDivElement>;
  styles: any;
}

const Subtitles: React.FC<SubtitlesProps> = ({ subtitles, subtitlesEndRef, styles }) => (
  <div style={styles.subtitlesContainer}>
    {subtitles.map(sub => <p key={sub.id} style={styles.subtitleText}>{sub.text}</p>)}
    {subtitles.length === 0 && <p style={{...styles.subtitleText, color: '#888'}}>Subtitles will appear here...</p>}
    <div ref={subtitlesEndRef} />
  </div>
);

export default Subtitles;