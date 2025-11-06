import React from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar: React.FC = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="nav">
      <div className="nav-container">
        <Link to="/" className="nav-brand">
          Frontdesk AI
        </Link>
        <ul className="nav-links">
          <li>
            <Link
              to="/"
              className={`nav-link ${isActive("/") ? "active" : ""}`}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/simulator"
              className={`nav-link ${isActive("/simulator") ? "active" : ""}`}
            >
              Voice Simulator
            </Link>
          </li>
          <li>
            <Link
              to="/admin"
              className={`nav-link ${isActive("/admin") ? "active" : ""}`}
            >
              Admin Panel
            </Link>
          </li>
          <li>
            <Link
              to="/knowledge"
              className={`nav-link ${isActive("/knowledge") ? "active" : ""}`}
            >
              Knowledge Base
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
