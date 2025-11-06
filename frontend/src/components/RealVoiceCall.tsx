import React, { useState, useRef, useCallback } from "react";
import { Mic, MicOff, Volume2, AlertCircle } from "lucide-react";
import api from "../services/api";

interface RealVoiceCallProps {
  callerId: string;
  sessionId: string | null;
  onMessage: (speaker: "caller" | "ai", message: string) => void;
}

const RealVoiceCall: React.FC<RealVoiceCallProps> = ({
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
  const [error, setError] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(
    null
  );

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      setIsRecording(true);
      setIsProcessing(false);

      // Use speech recognition directly (no audio recording needed)
      if (
        "webkitSpeechRecognition" in window ||
        "SpeechRecognition" in window
      ) {
        console.log("🎯 Starting direct speech recognition");
        onMessage("caller", "🎤 Listening... speak your question now!");

        const transcription = await transcribeWithWebAPI();
        await handleTranscription(transcription);
      } else {
        // Fallback for browsers without speech recognition
        setError(
          "Speech recognition not supported in this browser. Please use a modern browser like Chrome or Edge."
        );
      }
    } catch (error: any) {
      console.error("Error with speech recognition:", error);
      setIsRecording(false);

      if (error === "not-allowed") {
        setError(
          "Microphone permission denied. Please allow microphone access and try again."
        );
      } else if (error === "no-speech") {
        onMessage(
          "ai",
          "🔇 No speech detected. Please speak louder and try again."
        );
      } else if (error === "network") {
        setError("Network error. Please check your connection and try again.");
      } else {
        setError(`Speech recognition error: ${error}. Please try again.`);
      }
    }
  }, []);

  const stopRecording = useCallback(() => {
    // Speech recognition will stop automatically when user stops speaking
    // This function is mainly for UI feedback
    setIsRecording(false);
    setIsProcessing(true);
    onMessage("caller", "🔄 Processing your speech...");
  }, [onMessage]);

  // This function is no longer needed since we use speech recognition directly

  const transcribeWithWebAPI = (): Promise<string> => {
    return new Promise((resolve, reject) => {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;

      if (!SpeechRecognition) {
        reject("Speech recognition not supported in this browser");
        return;
      }

      const recognition = new SpeechRecognition();

      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        console.log("🎤 Speech recognition started - speak now!");
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        const confidence = event.results[0][0].confidence;
        console.log(
          "✅ Speech recognized:",
          transcript,
          "Confidence:",
          confidence
        );

        setIsRecording(false);
        setIsProcessing(true);

        resolve(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error("❌ Speech recognition error:", event.error);
        setIsRecording(false);
        setIsProcessing(false);
        reject(event.error);
      };

      recognition.onend = () => {
        console.log("🔇 Speech recognition ended");
        setIsRecording(false);
      };

      try {
        recognition.start();
      } catch (error) {
        console.error("Failed to start speech recognition:", error);
        setIsRecording(false);
        reject(error);
      }
    });
  };

  const promptForTranscription = (): Promise<string | null> => {
    return new Promise((resolve) => {
      const transcription = prompt(
        "Speech recognition not available. Please type what you said:"
      );
      resolve(transcription);
    });
  };

  const speakAIResponse = async (text: string) => {
    try {
      console.log("🔊 Converting AI response to speech:", text);
      onMessage("ai", "🔊 AI is speaking...");

      // Use browser's built-in speech synthesis (most reliable)
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.8;
        utterance.pitch = 1.1;
        utterance.volume = 1.0;

        // Wait for voices to load and use the best available
        const voices = speechSynthesis.getVoices();
        const preferredVoice =
          voices.find(
            (voice) =>
              voice.lang.startsWith("en") &&
              (voice.name.includes("Google") ||
                voice.name.includes("Microsoft") ||
                voice.name.includes("Samantha") ||
                voice.name.includes("Karen"))
          ) || voices.find((voice) => voice.lang.startsWith("en"));

        if (preferredVoice) {
          utterance.voice = preferredVoice;
          console.log("🎤 Using voice:", preferredVoice.name);
        }

        speechSynthesis.speak(utterance);

        return new Promise<void>((resolve) => {
          utterance.onend = () => {
            console.log("✅ AI finished speaking");
            onMessage("ai", "✅ AI finished speaking");
            resolve();
          };
          utterance.onerror = (error) => {
            console.log("❌ Speech synthesis error:", error);
            onMessage("ai", "❌ Voice synthesis error");
            resolve();
          };
        });
      } else {
        console.log("❌ Speech synthesis not supported");
        onMessage("ai", "❌ Voice synthesis not supported in this browser");
      }
    } catch (error) {
      console.error("Error with AI speech:", error);
      onMessage("ai", "🔇 (Voice synthesis failed, but message sent)");
    }
  };

  const speakWithOpenAI = async (text: string) => {
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

        const audio = new Audio(audioUrl);
        audio.play();

        return new Promise<void>((resolve) => {
          audio.onended = () => {
            console.log("✅ OpenAI TTS finished");
            resolve();
          };
          audio.onerror = () => {
            console.log("❌ OpenAI TTS error");
            resolve();
          };
        });
      }
    } catch (error) {
      console.error("OpenAI TTS error:", error);
    }
  };

  const handleTranscription = async (transcription: string) => {
    try {
      // Add user message to conversation
      onMessage("caller", `🗣️ "${transcription}"`);

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
      onMessage("ai", `🤖 ${aiMessage}`);

      // CRITICAL: Make AI speak the response with voice
      await speakAIResponse(aiMessage);

      // Add AI response to transcript
      if (sessionId) {
        await api.post(`/calls/${sessionId}/transcript`, {
          speaker: "ai",
          message: aiMessage,
        });
      }
    } catch (error) {
      console.error("Error handling transcription:", error);
      onMessage(
        "ai",
        "Sorry, I had trouble processing your request. Please try again."
      );
    } finally {
      // Reset states
      setIsProcessing(false);
      setIsRecording(false);
    }
  };

  if (error) {
    return (
      <div className="card">
        <h3 style={{ marginBottom: "20px" }}>Voice Input</h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "20px",
            padding: "20px",
          }}
        >
          <AlertCircle size={48} color="#dc3545" />
          <div style={{ textAlign: "center", color: "#dc3545" }}>
            <strong>Microphone Error</strong>
            <div style={{ marginTop: "8px", fontSize: "14px" }}>{error}</div>
          </div>
          <button
            className="btn btn-primary"
            onClick={() => {
              setError(null);
              startRecording();
            }}
          >
            Try Again
          </button>
          <div
            style={{
              padding: "12px",
              backgroundColor: "#fff3cd",
              borderRadius: "6px",
              fontSize: "13px",
              textAlign: "center",
            }}
          >
            <strong>Troubleshooting:</strong>
            <ul
              style={{
                textAlign: "left",
                margin: "8px 0",
                paddingLeft: "20px",
              }}
            >
              <li>Make sure you're using HTTPS or localhost</li>
              <li>Check browser microphone permissions</li>
              <li>Try refreshing the page</li>
              <li>Use text input as alternative</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 style={{ marginBottom: "20px" }}>
        🎤 Complete Voice Conversation 🔊
      </h3>

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
            animation: isRecording ? "pulse 1.5s infinite" : "none",
          }}
          onClick={isRecording || isProcessing ? undefined : startRecording}
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
                🎯 Processing Your Voice...
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Converting speech to text and getting AI response
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
                🎤 Listening to You...
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Speak clearly, then click to stop recording
              </div>
            </div>
          ) : (
            <div>
              <div style={{ fontWeight: "600", marginBottom: "8px" }}>
                Ready for Your Voice
              </div>
              <div style={{ fontSize: "14px", color: "#666" }}>
                Click the microphone and speak your question
              </div>
            </div>
          )}
        </div>

        {recordedAudio && (
          <div style={{ textAlign: "center" }}>
            <div
              style={{
                marginBottom: "8px",
                fontSize: "14px",
                color: "#28a745",
              }}
            >
              ✅ Audio recorded successfully
            </div>
            <audio controls src={recordedAudio} style={{ maxWidth: "300px" }} />
          </div>
        )}

        <div
          style={{
            padding: "16px",
            backgroundColor: "#e8f5e8",
            borderRadius: "6px",
            fontSize: "14px",
            textAlign: "center",
            maxWidth: "500px",
            border: "1px solid #28a745",
          }}
        >
          <strong>🎤 Complete Voice Conversation 🔊</strong>
          <div style={{ marginTop: "8px", fontSize: "13px" }}>
            Full two-way voice communication:
          </div>
          <ul
            style={{
              textAlign: "left",
              margin: "8px 0",
              paddingLeft: "20px",
              fontSize: "13px",
            }}
          >
            <li>✅ You speak → AI listens</li>
            <li>✅ AI processes your words</li>
            <li>✅ AI responds with voice</li>
            <li>✅ Complete voice conversation</li>
            <li>✅ Supervisor escalation with voice</li>
          </ul>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1.1);
          }
          50% {
            transform: scale(1.2);
          }
          100% {
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
};

export default RealVoiceCall;
