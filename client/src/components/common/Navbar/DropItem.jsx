import React from "react";
import { Link } from "react-router-dom";

export const DropItem = ({ icon, label, to, onClick }) => (
  <Link
    to={to}
    onClick={onClick}
    className="flex items-center gap-3 rounded-xl mx-2 px-3 py-2.5 transition-all duration-200 group"
    style={{
      fontFamily: "'Jost', sans-serif",
      fontSize: "0.8125rem",
      fontWeight: 500,
      color: "#0A1628",
      textDecoration: "none",
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = "linear-gradient(135deg, rgba(201,148,42,0.08), rgba(232,184,75,0.04))";
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = "transparent";
    }}
  >
    <span style={{ color: "#C9942A", flexShrink: 0 }}>{icon}</span>
    {label}
  </Link>
);
