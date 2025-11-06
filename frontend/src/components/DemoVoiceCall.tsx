import React, { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, Play } from "lucide-react";
import api from "../services/api";

interface DemoVoiceCallProps {
  callerId: string;
  sessionId: string | null;
  onMessage: (speaker: "caller" | "ai", message: string) => void;
}

const DemoVoiceCall: React.FC<DemoVoiceCallProps> = ({
  callerId,
  sessionId,
  onMessage,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(
    null
  );
  const [recordedAudio, setRecordedAudio] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  // Demo transcriptions for common questions
  const demoTranscriptions: { [key: string]: string } = {
    keratin: "Do you do keratin treatments?",
    hours: "What are your hours?",
    cancellation: "What is your cancellation policy for same-day appointments?",
    wedding: "Do you offer wedding packages?",
    pricing: "How much does a haircut cost?",
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: false, // Explicitly no video
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
        const audioUrl = URL.createObjectURL(audioBlob);
        setRecordedAudio(audioUrl);

        // Stop all tracks to turn off microphone indicator
        stream.getTracks().forEach((track) => track.stop());

        // Process the audio
        await processAudio();
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
    } catch (error) {
      console.error("Error starting recording:", error);
      alert(
        "Could not access microphone. Please check permissions and ensure you're using HTTPS or localhost."
      );
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
      setIsRecording(false);
      setIsProcessing(true);
    }
  }, [mediaRecorder]);

  const processAudio = async () => {
    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // For demo purposes, randomly select a transcription
      const keys = Object.keys(demoTranscriptions);
      const randomKey = keys[Math.floor(Math.random() * keys.length)];
      const transcription = demoTranscriptions[randomKey];

      // Add user message to conversation
      onMessage("caller", `[Voice] ${transcription}`);

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
      onMessage("ai", `[AI Voice] ${aiMessage}`);

      // Add AI response to transcript
      if (sessionId) {
        await api.post(`/calls/${sessionId}/transcript`, {
          speaker: "ai",
          message: aiMessage,
        });
      }

      // Simulate AI speech (in a real implementation, this would be TTS)
      setTimeout(() => {
        onMessage("ai", "🔊 AI is speaking the response above");
      }, 1000);
    } catch (error) {
      console.error("Error processing audio:", error);
      onMessage(
        "ai",
        "Sorry, I had trouble processing that. Please try again."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const playRecordedAudio = () => {
    if (recordedAudio && audioRef.current) {
      audioRef.current.src = recordedAudio;
      audioRef.current.play();
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: "20px" }}>Voice Conversation (Demo Mode)</h3>

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
            width: "120px",
            height: "120px",
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
            boxShadow: isRecording ? "0 0 20px rgba(220, 53, 69, 0.5)" : "none",
          }}
          onClick={isRecording ? stopRecording : startRecording}
        >
          {isProcessing ? (
            <Volume2 size={40} color="white" />
          ) : isRecording ? (
            <MicOff size={40} color="white" />
          ) : (
            <Mic size={40} color="white" />
          )}
        </div>

        <div style={{ textAlign: "center" }}>
          {isProcessing ? (
            <div>
              <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                Processing Speech...
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Converting to text and getting AI response
              </div>
            </div>
          ) : isRecording ? (
            <div>
              <div
                style={{
                  fontWeight: "600",
                  marginBottom: "8px",
                  color: "#dc3545",
                }}
              >
                🎤 Recording...
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Speak clearly, then click to stop
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                Ready for Voice Input
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Click the microphone to start recording
              </div>
            </div>
          )}
        </div>

        {recordedAudio && (
          <button
            className="btn btn-secondary"
            onClick={playRecordedAudio}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <Play size={16} />
            Play Your Recording
          </button>
        )}

        <div
          style={{
            padding: "16px",
            backgroundColor: "#e3f2fd",
            borderRadius: "6px",
            fontSize: "14px",
            textAlign: "center",
            maxWidth: "500px",
            border: "1px solid #2196f3",
          }}
        >
          <strong>🎯 Demo Mode Active</strong>
          <div style={{ marginTop: "8px", fontSize: "13px" }}>
            This demonstrates the voice workflow without requiring OpenAI
            credits:
          </div>
          <ul
            style={{
              textAlign: "left",
              margin: "8px 0",
              paddingLeft: "20px",
              fontSize: "13px",
            }}
          >
            <li>✅ Real microphone recording</li>
            <li>✅ Simulated speech-to-text</li>
            <li>✅ Real AI processing & escalation</li>
            <li>✅ Complete supervisor workflow</li>
            <li>✅ Knowledge base learning</li>
          </ul>
          <div style={{ fontSize: "12px", color: "#666", marginTop: "8px" }}>
            In production: Add OpenAI credits for real speech processing
          </div>
        </div>
      </div>

      <audio ref={audioRef} controls style={{ display: "none" }} />
    </div>
  );
};

export default DemoVoiceCall;
