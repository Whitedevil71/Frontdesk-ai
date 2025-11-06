import React, { useState, useEffect } from "react";
import { BarChart3, Users, MessageSquare, Clock } from "lucide-react";
import api from "../services/api";

interface Stats {
  totalRequests: number;
  pendingRequests: number;
  resolvedRequests: number;
  knowledgeItems: number;
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats>({
    totalRequests: 0,
    pendingRequests: 0,
    resolvedRequests: 0,
    knowledgeItems: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [requestsRes, knowledgeRes] = await Promise.all([
        api.get("/help-requests"),
        api.get("/knowledge"),
      ]);

      const requests = requestsRes.data;
      const knowledge = knowledgeRes.data;

      setStats({
        totalRequests: requests.length,
        pendingRequests: requests.filter((r: any) => r.status === "pending")
          .length,
        resolvedRequests: requests.filter((r: any) => r.status === "resolved")
          .length,
        knowledgeItems: knowledge.length,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading dashboard...</div>;
  }

  return (
    <div className="container">
      <h1 style={{ marginBottom: "30px", fontSize: "28px", fontWeight: "600" }}>
        Dashboard
      </h1>

      <div className="grid grid-2">
        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <MessageSquare size={24} color="#007bff" />
            <h3>Total Requests</h3>
          </div>
          <div
            style={{ fontSize: "32px", fontWeight: "600", color: "#007bff" }}
          >
            {stats.totalRequests}
          </div>
          <p style={{ color: "#666", marginTop: "8px" }}>
            All help requests received
          </p>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <Clock size={24} color="#ffc107" />
            <h3>Pending Requests</h3>
          </div>
          <div
            style={{ fontSize: "32px", fontWeight: "600", color: "#ffc107" }}
          >
            {stats.pendingRequests}
          </div>
          <p style={{ color: "#666", marginTop: "8px" }}>
            Awaiting supervisor response
          </p>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <BarChart3 size={24} color="#28a745" />
            <h3>Resolved Requests</h3>
          </div>
          <div
            style={{ fontSize: "32px", fontWeight: "600", color: "#28a745" }}
          >
            {stats.resolvedRequests}
          </div>
          <p style={{ color: "#666", marginTop: "8px" }}>
            Successfully handled
          </p>
        </div>

        <div className="card">
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "16px",
            }}
          >
            <Users size={24} color="#6f42c1" />
            <h3>Knowledge Items</h3>
          </div>
          <div
            style={{ fontSize: "32px", fontWeight: "600", color: "#6f42c1" }}
          >
            {stats.knowledgeItems}
          </div>
          <p style={{ color: "#666", marginTop: "8px" }}>
            AI training data points
          </p>
        </div>
      </div>

      <div className="card" style={{ marginTop: "30px" }}>
        <h2 style={{ marginBottom: "20px" }}>System Overview</h2>
        <div style={{ display: "grid", gap: "16px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Resolution Rate</span>
            <span style={{ fontWeight: "600" }}>
              {stats.totalRequests > 0
                ? Math.round(
                    (stats.resolvedRequests / stats.totalRequests) * 100
                  )
                : 0}
              %
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>AI Knowledge Base Size</span>
            <span style={{ fontWeight: "600" }}>
              {stats.knowledgeItems} items
            </span>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>Active Requests</span>
            <span style={{ fontWeight: "600" }}>{stats.pendingRequests}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
