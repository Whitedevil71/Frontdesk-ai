import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Phone, PhoneOff } from "lucide-react";
import api from "../services/api";
import socketService from "../services/socket";
import RealVoiceCall from "../components/RealVoiceCall";

interface Message {
  speaker: "caller" | "ai";
  message: string;
  timestamp: Date;
}

const Simulator: React.FC = () => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [callerId] = useState(`caller-${Date.now()}`);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [textInput, setTextInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [useVoice, setUseVoice] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isCallActive) {
      const socket = socketService.connect();
      socketService.joinCaller(callerId);

      socketService.onSupervisorResponse((data) => {
        addMessage("ai", data.response);
      });

      return () => {
        socketService.off("supervisor-response");
      };
    }
  }, [isCallActive, callerId]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const addMessage = (speaker: "caller" | "ai", message: string) => {
    const newMessage: Message = {
      speaker,
      message,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
  };

  const startCall = async () => {
    try {
      const response = await api.post("/calls/start", {
        callerId,
        callerName: "Demo Caller",
      });

      setSessionId(response.data.sessionId);
      setIsCallActive(true);
      addMessage(
        "ai",
        "Hello! Welcome to our salon. How can I help you today?"
      );
    } catch (error) {
      console.error("Error starting call:", error);
      alert("Failed to start call. Please check your connection.");
    }
  };

  const endCall = async () => {
    if (sessionId) {
      try {
        await api.post(`/calls/${sessionId}/end`);
      } catch (error) {
        console.error("Error ending call:", error);
      }
    }

    setIsCallActive(false);
    setIsRecording(false);
    setSessionId(null);
    socketService.disconnect();
  };

  const sendTextMessage = async () => {
    if (!textInput.trim() || isLoading) return;

    const userMessage = textInput.trim();
    setTextInput("");
    setIsLoading(true);

    addMessage("caller", userMessage);

    // Add to transcript
    if (sessionId) {
      try {
        await api.post(`/calls/${sessionId}/transcript`, {
          speaker: "caller",
          message: userMessage,
        });
      } catch (error) {
        console.error("Error adding to transcript:", error);
      }
    }

    try {
      const response = await api.post("/help-requests", {
        question: userMessage,
        callerId,
        sessionId,
      });

      if (response.data.type === "direct") {
        // AI handled directly
        addMessage("ai", response.data.answer);

        // Add AI response to transcript
        if (sessionId) {
          await api.post(`/calls/${sessionId}/transcript`, {
            speaker: "ai",
            message: response.data.answer,
          });
        }
      } else {
        // Escalated to supervisor
        addMessage("ai", response.data.message);

        if (sessionId) {
          await api.post(`/calls/${sessionId}/transcript`, {
            speaker: "ai",
            message: response.data.message,
          });
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
      addMessage(
        "ai",
        "I apologize, but I'm having technical difficulties. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendTextMessage();
    }
  };

  return (
    <div className="container">
      <h1 style={{ marginBottom: "30px", fontSize: "28px", fontWeight: "600" }}>
        Voice Call Simulator
      </h1>

      <div className="grid grid-2">
        <div className="card">
          <h2 style={{ marginBottom: "20px" }}>Call Controls</h2>

          <div style={{ marginBottom: "20px" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "16px",
              }}
            >
              <input
                type="checkbox"
                checked={useVoice}
                onChange={(e) => setUseVoice(e.target.checked)}
                disabled={isCallActive}
              />
              Use Real Voice Input (browser speech recognition)
            </label>
          </div>

          <div style={{ display: "flex", gap: "12px", marginBottom: "20px" }}>
            {!isCallActive ? (
              <button className="btn btn-success" onClick={startCall}>
                <Phone size={16} />
                Start Call
              </button>
            ) : (
              <button className="btn btn-danger" onClick={endCall}>
                <PhoneOff size={16} />
                End Call
              </button>
            )}
          </div>

          <div
            style={{
              padding: "12px",
              backgroundColor: "#f8f9fa",
              borderRadius: "6px",
              fontSize: "14px",
            }}
          >
            <strong>Status:</strong>{" "}
            {isCallActive ? "Call Active" : "No Active Call"}
            {isCallActive && (
              <>
                <br />
                <strong>Caller ID:</strong> {callerId}
                <br />
                <strong>Session:</strong> {sessionId}
              </>
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: "20px" }}>Test Questions</h2>
          <div style={{ display: "grid", gap: "8px" }}>
            <button
              className="btn btn-secondary"
              onClick={() => setTextInput("Do you do keratin treatments?")}
              disabled={!isCallActive}
              style={{ textAlign: "left", justifyContent: "flex-start" }}
            >
              "Do you do keratin treatments?"
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setTextInput("What are your hours?")}
              disabled={!isCallActive}
              style={{ textAlign: "left", justifyContent: "flex-start" }}
            >
              "What are your hours?"
            </button>
            <button
              className="btn btn-secondary"
              onClick={() =>
                setTextInput(
                  "What's your cancellation policy for same-day appointments?"
                )
              }
              disabled={!isCallActive}
              style={{ textAlign: "left", justifyContent: "flex-start" }}
            >
              "What's your cancellation policy?"
            </button>
            <button
              className="btn btn-secondary"
              onClick={() => setTextInput("Do you offer wedding packages?")}
              disabled={!isCallActive}
              style={{ textAlign: "left", justifyContent: "flex-start" }}
            >
              "Do you offer wedding packages?"
            </button>
          </div>
        </div>
      </div>

      {isCallActive && useVoice && (
        <RealVoiceCall
          callerId={callerId}
          sessionId={sessionId}
          onMessage={addMessage}
        />
      )}

      {isCallActive && (
        <div className="card">
          <h2 style={{ marginBottom: "20px" }}>Conversation</h2>

          <div
            style={{
              height: "400px",
              overflowY: "auto",
              border: "1px solid #ddd",
              borderRadius: "6px",
              padding: "16px",
              marginBottom: "16px",
              backgroundColor: "#fafafa",
            }}
          >
            {messages.map((message, index) => (
              <div
                key={index}
                style={{
                  marginBottom: "16px",
                  display: "flex",
                  justifyContent:
                    message.speaker === "caller" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "70%",
                    padding: "12px 16px",
                    borderRadius: "18px",
                    backgroundColor:
                      message.speaker === "caller" ? "#007bff" : "#e9ecef",
                    color: message.speaker === "caller" ? "white" : "#333",
                  }}
                >
                  <div style={{ fontSize: "14px", marginBottom: "4px" }}>
                    <strong>
                      {message.speaker === "caller" ? "You" : "AI Assistant"}
                    </strong>
                  </div>
                  <div>{message.message}</div>
                  <div
                    style={{
                      fontSize: "12px",
                      opacity: 0.7,
                      marginTop: "4px",
                    }}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div style={{ textAlign: "center", color: "#666" }}>
                AI is thinking...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <input
              type="text"
              className="input"
              placeholder="Type your message..."
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              style={{ flex: 1 }}
            />
            <button
              className="btn btn-primary"
              onClick={sendTextMessage}
              disabled={!textInput.trim() || isLoading}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Simulator;
