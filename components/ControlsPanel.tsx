import React from "react";
import { PhoneIcon, EndCallIcon, CopyIcon } from "./Icons";

interface ControlsPanelProps {
  myId: string;
  idCopied: boolean;
  copyIdToClipboard: () => void;
  call: any;
  incomingCall: any;
  friendId: string;
  setFriendId: (id: string) => void;
  startCall: () => void;
  answerCall: () => void;
  endCall: () => void;
  setIncomingCall: (call: any) => void;
  peer: any;
  styles: any;
}

const ControlsPanel: React.FC<ControlsPanelProps> = ({
  myId, idCopied, copyIdToClipboard, call, incomingCall, friendId, setFriendId,
  startCall, answerCall, endCall, setIncomingCall, peer, styles
}) => (
  <div style={styles.controlsPanel}>
    <div style={styles.idSection}>
      <span style={styles.idText}>Your ID: {myId || 'Generating...'}</span>
      <button style={{...styles.button, padding: '8px'}} onClick={copyIdToClipboard} disabled={!myId} title="Copy ID">
        {idCopied ? 'Copied!' : <CopyIcon />}
      </button>
    </div>

    {!call && !incomingCall && (
      <div style={styles.buttonGroup}>
        <input type="text" value={friendId} onChange={(e) => setFriendId(e.target.value)} placeholder="Enter friend's ID to call" style={styles.input}/>
        <button onClick={startCall} disabled={!friendId || !peer || peer.disconnected} style={{...styles.button, ...styles.buttonPrimary}}>
          <PhoneIcon /> Call
        </button>
      </div>
    )}

    {incomingCall && (
      <div>
        <p style={{textAlign: 'center', margin: '0 0 10px 0'}}>Incoming call from {incomingCall.peer}</p>
        <div style={styles.buttonGroup}>
          <button onClick={answerCall} style={{...styles.button, ...styles.buttonPrimary, flex: 1}}>Answer</button>
          <button onClick={() => setIncomingCall(null)} style={{...styles.button, flex: 1}}>Reject</button>
        </div>
      </div>
    )}

    {call && (
      <div style={styles.buttonGroup}>
        <button onClick={endCall} style={{...styles.button, ...styles.buttonDanger, flex: 1}}>
          <EndCallIcon /> End Call
        </button>
      </div>
    )}
  </div>
);

export default ControlsPanel;