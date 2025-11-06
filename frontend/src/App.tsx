import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Dashboard from "./pages/Dashboard";
import Simulator from "./pages/Simulator";
import AdminPanel from "./pages/AdminPanel";
import KnowledgeBase from "./pages/KnowledgeBase";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/knowledge" element={<KnowledgeBase />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
