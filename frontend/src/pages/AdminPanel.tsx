import React, { useState, useEffect } from "react";
import { Clock, CheckCircle, XCircle, MessageSquare } from "lucide-react";
import api from "../services/api";
import socketService from "../services/socket";

interface HelpRequest {
  _id: string;
  question: string;
  callerId: string;
  status: "pending" | "resolved" | "unresolved";
  supervisorResponse?: string;
  confidence: number;
  createdAt: string;
  resolvedAt?: string;
  timeoutAt: string;
}

const AdminPanel: React.FC = () => {
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<HelpRequest | null>(
    null
  );
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchRequests();

    // Connect to socket for real-time updates
    const socket = socketService.connect();
    socketService.joinSupervisor();

    socketService.onNewHelpRequest((request) => {
      setRequests((prev) => [request, ...prev]);
      // Show notification
      if (Notification.permission === "granted") {
        new Notification("New Help Request", {
          body: request.question,
          icon: "/favicon.ico",
        });
      }
    });

    socketService.onRequestUpdate((updatedRequest) => {
      setRequests((prev) =>
        prev.map((req) =>
          req._id === updatedRequest._id ? updatedRequest : req
        )
      );
    });

    // Request notification permission
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }

    return () => {
      socketService.off("new-help-request");
      socketService.off("request-updated");
    };
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await api.get("/help-requests");
      setRequests(response.data);
    } catch (error) {
      console.error("Error fetching requests:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRespond = async () => {
    if (!selectedRequest || !response.trim()) return;

    setSubmitting(true);
    try {
      await api.post(`/help-requests/${selectedRequest._id}/respond`, {
        response: response.trim(),
      });

      setResponse("");
      setSelectedRequest(null);

      // Refresh requests
      fetchRequests();
    } catch (error) {
      console.error("Error responding to request:", error);
      alert("Failed to send response. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleMarkUnresolved = async (requestId: string) => {
    try {
      await api.post(`/help-requests/${requestId}/unresolved`);
      fetchRequests();
    } catch (error) {
      console.error("Error marking as unresolved:", error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} color="#ffc107" />;
      case "resolved":
        return <CheckCircle size={16} color="#28a745" />;
      case "unresolved":
        return <XCircle size={16} color="#dc3545" />;
      default:
        return null;
    }
  };

  const getTimeRemaining = (timeoutAt: string) => {
    const timeout = new Date(timeoutAt);
    const now = new Date();
    const diff = timeout.getTime() - now.getTime();

    if (diff <= 0) return "Expired";

    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  const pendingRequests = requests.filter((r) => r.status === "pending");
  const resolvedRequests = requests.filter((r) => r.status === "resolved");
  const unresolvedRequests = requests.filter((r) => r.status === "unresolved");

  return (
    <div className="container">
      <h1 style={{ marginBottom: "30px", fontSize: "28px", fontWeight: "600" }}>
        Supervisor Admin Panel
      </h1>

      <div className="grid grid-3" style={{ marginBottom: "30px" }}>
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <Clock size={20} color="#ffc107" />
            <h3>Pending</h3>
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "600", color: "#ffc107" }}
          >
            {pendingRequests.length}
          </div>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <CheckCircle size={20} color="#28a745" />
            <h3>Resolved</h3>
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "600", color: "#28a745" }}
          >
            {resolvedRequests.length}
          </div>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginBottom: "8px",
            }}
          >
            <XCircle size={20} color="#dc3545" />
            <h3>Unresolved</h3>
          </div>
          <div
            style={{ fontSize: "24px", fontWeight: "600", color: "#dc3545" }}
          >
            {unresolvedRequests.length}
          </div>
        </div>
      </div>

      <div className="grid grid-2">
        <div className="card">
          <h2 style={{ marginBottom: "20px" }}>Help Requests</h2>

          <div style={{ maxHeight: "600px", overflowY: "auto" }}>
            {requests.length === 0 ? (
              <p
                style={{ textAlign: "center", color: "#666", padding: "40px" }}
              >
                No help requests yet
              </p>
            ) : (
              requests.map((request) => (
                <div
                  key={request._id}
                  style={{
                    border: "1px solid #ddd",
                    borderRadius: "6px",
                    padding: "16px",
                    marginBottom: "12px",
                    cursor:
                      request.status === "pending" ? "pointer" : "default",
                    backgroundColor:
                      selectedRequest?._id === request._id
                        ? "#e3f2fd"
                        : "white",
                  }}
                  onClick={() => {
                    if (request.status === "pending") {
                      setSelectedRequest(request);
                      setResponse("");
                    }
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      marginBottom: "8px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                      }}
                    >
                      {getStatusIcon(request.status)}
                      <span className={`status-badge status-${request.status}`}>
                        {request.status}
                      </span>
                    </div>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {new Date(request.createdAt).toLocaleString()}
                    </div>
                  </div>

                  <div style={{ marginBottom: "8px" }}>
                    <strong>Question:</strong> {request.question}
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: "12px",
                      color: "#666",
                    }}
                  >
                    <span>Caller: {request.callerId}</span>
                    <span>
                      Confidence: {Math.round(request.confidence * 100)}%
                    </span>
                    {request.status === "pending" && (
                      <span style={{ color: "#ffc107", fontWeight: "500" }}>
                        Timeout: {getTimeRemaining(request.timeoutAt)}
                      </span>
                    )}
                  </div>

                  {request.supervisorResponse && (
                    <div
                      style={{
                        marginTop: "12px",
                        padding: "8px",
                        backgroundColor: "#f8f9fa",
                        borderRadius: "4px",
                      }}
                    >
                      <strong>Response:</strong> {request.supervisorResponse}
                    </div>
                  )}

                  {request.status === "resolved" && (
                    <div
                      style={{
                        marginTop: "8px",
                        fontSize: "12px",
                        color: "#28a745",
                      }}
                    >
                      Resolved: {new Date(request.resolvedAt!).toLocaleString()}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="card">
          <h2 style={{ marginBottom: "20px" }}>Response Panel</h2>

          {selectedRequest ? (
            <div>
              <div
                style={{
                  marginBottom: "20px",
                  padding: "16px",
                  backgroundColor: "#f8f9fa",
                  borderRadius: "6px",
                }}
              >
                <h3 style={{ marginBottom: "8px" }}>Selected Request</h3>
                <p>
                  <strong>Question:</strong> {selectedRequest.question}
                </p>
                <p>
                  <strong>Caller:</strong> {selectedRequest.callerId}
                </p>
                <p>
                  <strong>Confidence:</strong>{" "}
                  {Math.round(selectedRequest.confidence * 100)}%
                </p>
                <p>
                  <strong>Time Remaining:</strong>{" "}
                  {getTimeRemaining(selectedRequest.timeoutAt)}
                </p>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  Your Response:
                </label>
                <textarea
                  className="textarea"
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder="Type your response to help the customer..."
                  rows={6}
                />
              </div>

              <div style={{ display: "flex", gap: "12px" }}>
                <button
                  className="btn btn-success"
                  onClick={handleRespond}
                  disabled={!response.trim() || submitting}
                >
                  <MessageSquare size={16} />
                  {submitting ? "Sending..." : "Send Response"}
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => handleMarkUnresolved(selectedRequest._id)}
                >
                  Mark Unresolved
                </button>

                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSelectedRequest(null);
                    setResponse("");
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              style={{ textAlign: "center", color: "#666", padding: "40px" }}
            >
              <MessageSquare
                size={48}
                style={{ marginBottom: "16px", opacity: 0.5 }}
              />
              <p>Select a pending request to respond</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
