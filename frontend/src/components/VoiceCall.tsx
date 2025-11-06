import React, { useState, useEffect, useCallback } from "react";
import { Room, RoomEvent, Track } from "livekit-client";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import api from "../services/api";

interface VoiceCallProps {
  callerId: string;
  sessionId: string | null;
  onCallEnd: () => void;
  onMessage: (speaker: "caller" | "ai", message: string) => void;
}

const VoiceCall: React.FC<VoiceCallProps> = ({
  callerId,
  sessionId,
  onCallEnd,
  onMessage,
}) => {
  const [room, setRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectToRoom = useCallback(async () => {
    if (!sessionId) return;

    setIsConnecting(true);
    setError(null);

    try {
      // Get LiveKit token
      const tokenResponse = await api.post("/livekit/token", {
        roomName: `call-${sessionId}`,
        participantName: callerId,
      });

      const { token, url } = tokenResponse.data;

      // Create and connect to room
      const newRoom = new Room();

      newRoom.on(RoomEvent.Connected, () => {
        console.log("Connected to LiveKit room");
        setIsConnected(true);
        setIsConnecting(false);
      });

      newRoom.on(RoomEvent.Disconnected, () => {
        console.log("Disconnected from LiveKit room");
        setIsConnected(false);
        onCallEnd();
      });

      newRoom.on(
        RoomEvent.TrackSubscribed,
        (track, publication, participant) => {
          if (track.kind === Track.Kind.Audio) {
            const audioElement = track.attach();
            document.body.appendChild(audioElement);
          }
        }
      );

      newRoom.on(RoomEvent.DataReceived, (payload, participant) => {
        try {
          const data = JSON.parse(new TextDecoder().decode(payload));
          if (data.type === "ai_response") {
            onMessage("ai", data.message);
          }
        } catch (error) {
          console.error("Error parsing data:", error);
        }
      });

      await newRoom.connect(url, token);

      // Enable microphone only (no camera)
      await newRoom.localParticipant.setMicrophoneEnabled(true);

      setRoom(newRoom);
    } catch (error) {
      console.error("Error connecting to room:", error);
      setError("Failed to connect to voice call. Please try again.");
      setIsConnecting(false);
    }
  }, [sessionId, callerId, onCallEnd, onMessage]);

  const disconnectFromRoom = useCallback(async () => {
    if (room) {
      await room.disconnect();
      setRoom(null);
      setIsConnected(false);
    }
  }, [room]);

  const toggleMute = useCallback(async () => {
    if (room && room.localParticipant) {
      const audioTrack = room.localParticipant.getTrackPublication(
        Track.Source.Microphone
      );
      if (audioTrack) {
        if (isMuted) {
          await audioTrack.unmute();
        } else {
          await audioTrack.mute();
        }
        setIsMuted(!isMuted);
      }
    }
  }, [room, isMuted]);

  useEffect(() => {
    if (sessionId && !room && !isConnecting) {
      connectToRoom();
    }

    return () => {
      if (room) {
        room.disconnect();
      }
    };
  }, [sessionId, room, isConnecting, connectToRoom]);

  if (error) {
    return (
      <div className="card" style={{ textAlign: "center", padding: "40px" }}>
        <div style={{ color: "#dc3545", marginBottom: "16px" }}>{error}</div>
        <button
          className="btn btn-primary"
          onClick={() => {
            setError(null);
            connectToRoom();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: "20px" }}>Voice Call</h3>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          marginBottom: "20px",
        }}
      >
        <div
          style={{
            width: "12px",
            height: "12px",
            borderRadius: "50%",
            backgroundColor: isConnected
              ? "#28a745"
              : isConnecting
              ? "#ffc107"
              : "#dc3545",
          }}
        />
        <span>
          {isConnecting
            ? "Connecting..."
            : isConnected
            ? "Connected"
            : "Disconnected"}
        </span>
      </div>

      <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
        <button
          className={`btn ${isMuted ? "btn-danger" : "btn-primary"}`}
          onClick={toggleMute}
          disabled={!isConnected}
        >
          {isMuted ? <MicOff size={16} /> : <Mic size={16} />}
          {isMuted ? "Unmute" : "Mute"}
        </button>

        <button
          className="btn btn-danger"
          onClick={disconnectFromRoom}
          disabled={!isConnected && !isConnecting}
        >
          <PhoneOff size={16} />
          End Call
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "12px",
          backgroundColor: "#f8f9fa",
          borderRadius: "6px",
          fontSize: "14px",
        }}
      >
        <strong>Voice Features:</strong>
        <ul style={{ margin: "8px 0", paddingLeft: "20px" }}>
          <li>Real-time voice conversation with AI</li>
          <li>Automatic speech-to-text processing</li>
          <li>AI responses via text-to-speech</li>
          <li>Supervisor escalation when needed</li>
        </ul>
      </div>
    </div>
  );
};

export default VoiceCall;
