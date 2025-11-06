import React, { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2 } from "lucide-react";
import api from "../services/api";

interface SimpleVoiceCallProps {
  callerId: string;
  sessionId: string | null;
  onMessage: (speaker: "caller" | "ai", message: string) => void;
}

const SimpleVoiceCall: React.FC<SimpleVoiceCallProps> = ({
  callerId,
  sessionId,
  onMessage,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false, // Explicitly disable video
      });

      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(chunks, { type: "audio/wav" });
        await processAudio(audioBlob);

        // Stop all tracks to turn off microphone indicator
        stream.getTracks().forEach((track) => track.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
      setAudioChunks(chunks);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert("Could not access microphone. Please check permissions.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [mediaRecorder]);

  const processAudio = async (audioBlob: Blob) => {
    try {
      // Convert audio to text using OpenAI Whisper
      const formData = new FormData();
      formData.append("audio", audioBlob, "audio.wav");

      const transcriptionResponse = await fetch(
        "http://localhost:4000/api/livekit/stt",
        {
          method: "POST",
          body: audioBlob,
        }
      );

      if (!transcriptionResponse.ok) {
        throw new Error("Transcription failed");
      }

      const { transcription } = await transcriptionResponse.json();

      // Add user message to conversation
      onMessage("caller", transcription);

      // Add to transcript
      if (sessionId) {
        await api.post(`/calls/${sessionId}/transcript`, {
          speaker: "caller",
          message: transcription,
        });
      }

      // Send to AI for processing
      const aiResponse = await api.post("/help-requests", {
        question: transcription,
        callerId,
        sessionId,
      });

      let aiMessage = "";
      if (aiResponse.data.type === "direct") {
        aiMessage = aiResponse.data.answer;
      } else {
        aiMessage = aiResponse.data.message;
      }

      // Add AI response to conversation
      onMessage("ai", aiMessage);

      // Add AI response to transcript
      if (sessionId) {
        await api.post(`/calls/${sessionId}/transcript`, {
          speaker: "ai",
          message: aiMessage,
        });
      }

      // Convert AI response to speech
      await playAIResponse(aiMessage);
    } catch (error) {
      console.error("Error processing audio:", error);
      onMessage(
        "ai",
        "Sorry, I had trouble understanding that. Could you please try again?"
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const playAIResponse = async (text: string) => {
    try {
      const response = await fetch("http://localhost:4000/api/livekit/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        const audioUrl = URL.createObjectURL(audioBlob);

        if (audioRef.current) {
          audioRef.current.src = audioUrl;
          audioRef.current.play();
        }
      }
    } catch (error) {
      console.error("Error playing AI response:", error);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: "20px" }}>Voice Conversation</h3>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "100px",
            height: "100px",
            borderRadius: "50%",
            backgroundColor: isRecording
              ? "#dc3545"
              : isProcessing
              ? "#ffc107"
              : "#28a745",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: isProcessing ? "not-allowed" : "pointer",
            transition: "all 0.3s ease",
            transform: isRecording ? "scale(1.1)" : "scale(1)",
          }}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isProcessing ? (
            <Volume2 size={32} color="white" />
          ) : isRecording ? (
            <MicOff size={32} color="white" />
          ) : (
            <Mic size={32} color="white" />
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          {isProcessing ? (
            <div>
              <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                Processing...
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Converting speech to text and getting AI response
              </div>
            </div>
          ) : isRecording ? (
            <div>
              <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                Listening...
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Speak your question, then click to stop
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                Ready to Listen
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Click the microphone to start speaking
              </div>
            </div>
          )}
        </div>

        <div
          style={{
            padding: "16px",
            backgroundColor: "#f8f9fa",
            borderRadius: "6px",
            fontSize: "14px",
            textAlign: "center",
            maxWidth: "400px",
          }}
        >
          <strong>How it works:</strong>
          <ol
            style={{ textAlign: "left", margin: "8px 0", paddingLeft: "20px" }}
          >
            <li>Click microphone to start recording</li>
            <li>Speak your question clearly</li>
            <li>Click again to stop and process</li>
            <li>AI will respond with voice</li>
          </ol>
        </div>
      </div>

      <audio ref={audioRef} style={{ display: "none" }} />
    </div>
  );
};

export default SimpleVoiceCall;
