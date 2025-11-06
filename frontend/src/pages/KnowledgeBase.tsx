import React, { useState, useEffect } from "react";
import { Search, Plus, Edit, Trash2, BookOpen } from "lucide-react";
import api from "../services/api";

interface KnowledgeItem {
  _id: string;
  question: string;
  answer: string;
  category?: string;
  confidence: number;
  createdAt: string;
  updatedAt: string;
}

const KnowledgeBase: React.FC = () => {
  const [items, setItems] = useState<KnowledgeItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<KnowledgeItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<KnowledgeItem | null>(null);

  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    category: "",
  });

  useEffect(() => {
    fetchKnowledgeItems();
  }, []);

  useEffect(() => {
    filterItems();
  }, [items, searchQuery]);

  const fetchKnowledgeItems = async () => {
    try {
      const response = await api.get("/knowledge");
      setItems(response.data);
    } catch (error) {
      console.error("Error fetching knowledge items:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    if (!searchQuery.trim()) {
      setFilteredItems(items);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = items.filter(
      (item) =>
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        (item.category && item.category.toLowerCase().includes(query))
    );
    setFilteredItems(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.question.trim() || !formData.answer.trim()) {
      alert("Question and answer are required");
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        await api.put(`/knowledge/${editingItem._id}`, formData);
      } else {
        // Create new item
        await api.post("/knowledge", formData);
      }

      setFormData({ question: "", answer: "", category: "" });
      setShowAddForm(false);
      setEditingItem(null);
      fetchKnowledgeItems();
    } catch (error) {
      console.error("Error saving knowledge item:", error);
      alert("Failed to save knowledge item");
    }
  };

  const handleEdit = (item: KnowledgeItem) => {
    setEditingItem(item);
    setFormData({
      question: item.question,
      answer: item.answer,
      category: item.category || "",
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this knowledge item?")) {
      return;
    }

    try {
      await api.delete(`/knowledge/${id}`);
      fetchKnowledgeItems();
    } catch (error) {
      console.error("Error deleting knowledge item:", error);
      alert("Failed to delete knowledge item");
    }
  };

  const resetForm = () => {
    setFormData({ question: "", answer: "", category: "" });
    setShowAddForm(false);
    setEditingItem(null);
  };

  if (loading) {
    return <div className="loading">Loading knowledge base...</div>;
  }

  return (
    <div className="container">
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "30px",
        }}
      >
        <h1 style={{ fontSize: "28px", fontWeight: "600" }}>Knowledge Base</h1>
        <button
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <Plus size={16} />
          Add Knowledge
        </button>
      </div>

      <div className="card" style={{ marginBottom: "20px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Search size={20} color="#666" />
          <input
            type="text"
            className="input"
            placeholder="Search questions, answers, or categories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1 }}
          />
        </div>
      </div>

      {(showAddForm || editingItem) && (
        <div className="card" style={{ marginBottom: "20px" }}>
          <h2 style={{ marginBottom: "20px" }}>
            {editingItem ? "Edit Knowledge Item" : "Add New Knowledge Item"}
          </h2>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Question:
              </label>
              <input
                type="text"
                className="input"
                value={formData.question}
                onChange={(e) =>
                  setFormData({ ...formData, question: e.target.value })
                }
                placeholder="Enter the customer question..."
                required
              />
            </div>

            <div style={{ marginBottom: "16px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Answer:
              </label>
              <textarea
                className="textarea"
                value={formData.answer}
                onChange={(e) =>
                  setFormData({ ...formData, answer: e.target.value })
                }
                placeholder="Enter the answer..."
                rows={4}
                required
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                Category (optional):
              </label>
              <input
                type="text"
                className="input"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                placeholder="e.g., Services, Pricing, Policies..."
              />
            </div>

            <div style={{ display: "flex", gap: "12px" }}>
              <button type="submit" className="btn btn-success">
                {editingItem ? "Update" : "Add"} Knowledge Item
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={resetForm}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h2>Learned Answers ({filteredItems.length})</h2>
          <div style={{ fontSize: "14px", color: "#666" }}>
            Total: {items.length} items
          </div>
        </div>

        {filteredItems.length === 0 ? (
          <div style={{ textAlign: "center", color: "#666", padding: "40px" }}>
            <BookOpen
              size={48}
              style={{ marginBottom: "16px", opacity: 0.5 }}
            />
            <p>
              {searchQuery
                ? "No knowledge items match your search"
                : "No knowledge items yet"}
            </p>
            {!searchQuery && (
              <p style={{ marginTop: "8px" }}>
                Knowledge items are automatically added when supervisors respond
                to escalated questions.
              </p>
            )}
          </div>
        ) : (
          <div style={{ display: "grid", gap: "16px" }}>
            {filteredItems.map((item) => (
              <div
                key={item._id}
                style={{
                  border: "1px solid #ddd",
                  borderRadius: "6px",
                  padding: "20px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "12px",
                  }}
                >
                  <div style={{ flex: 1 }}>
                    {item.category && (
                      <span
                        style={{
                          display: "inline-block",
                          backgroundColor: "#e9ecef",
                          color: "#495057",
                          padding: "2px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          marginBottom: "8px",
                        }}
                      >
                        {item.category}
                      </span>
                    )}
                    <h3 style={{ marginBottom: "8px", color: "#007bff" }}>
                      Q: {item.question}
                    </h3>
                    <p style={{ marginBottom: "12px", lineHeight: "1.5" }}>
                      <strong>A:</strong> {item.answer}
                    </p>
                  </div>

                  <div
                    style={{ display: "flex", gap: "8px", marginLeft: "16px" }}
                  >
                    <button
                      className="btn btn-secondary"
                      onClick={() => handleEdit(item)}
                      style={{ padding: "6px 12px" }}
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      className="btn btn-danger"
                      onClick={() => handleDelete(item._id)}
                      style={{ padding: "6px 12px" }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
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
                  <span>
                    Added: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <span>Confidence: {Math.round(item.confidence * 100)}%</span>
                  {item.updatedAt !== item.createdAt && (
                    <span>
                      Updated: {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default KnowledgeBase;
