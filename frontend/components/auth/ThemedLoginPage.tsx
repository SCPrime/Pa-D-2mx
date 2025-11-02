/**
 * Themed Login Page - Dr. SC Prime's Design (PaiiD 2MX - DEX Platform)
 * 
 * Features:
 * - CompletePaiiDLogo (iPi Wrapped Logo) with integrated chat box
 * - Dark gradient theme matching UserSetupAI design
 * - Glassmorphism card with animated particles
 * - Emerald green accent colors
 */

import { useState } from "react";
import CompletePaiiDLogo from "../CompletePaiiDLogo";
import LoginForm from "./LoginForm";
import { logger } from "../../lib/logger";

interface ThemedLoginPageProps {
  onSuccess?: () => void;
  onSwitchToRegister?: () => void;
}

export default function ThemedLoginPage({ onSuccess, onSwitchToRegister }: ThemedLoginPageProps) {
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = () => {
    logger.info("[ThemedLoginPage] Login successful - PaiiD 2MX");
    onSuccess?.();
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)",
        position: "relative",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      {/* Animated Background Particles */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          background:
            "radial-gradient(circle at 20% 50%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)",
          animation: "pulse 8s ease-in-out infinite",
        }}
      />

      {/* Floating Stars */}
      {[...Array(30)].map((_, i) => (
        <div
          key={i}
          style={{
            position: "absolute",
            width: "2px",
            height: "2px",
            background: "rgba(255, 255, 255, 0.5)",
            borderRadius: "50%",
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            animation: `twinkle ${2 + Math.random() * 3}s ease-in-out infinite`,
            animationDelay: `${Math.random() * 2}s`,
          }}
        />
      ))}

      {/* Main Content */}
      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          maxWidth: "480px",
        }}
      >
        {/* Logo Section */}
        <div
          style={{
            textAlign: "center",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: "24px",
            }}
          >
            <CompletePaiiDLogo size={64} enableModal={true} />
          </div>
          <h1
            style={{
              fontSize: "32px",
              fontWeight: 700,
              color: "#fff",
              marginBottom: "8px",
              letterSpacing: "-0.02em",
            }}
          >
            Welcome to PaiiD 2MX
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#94a3b8",
              fontWeight: 400,
            }}
          >
            Decentralized Exchange Platform
          </p>
        </div>

        {/* Login Card */}
        <div
          style={{
            background: "rgba(15, 23, 42, 0.6)",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
            border: "1px solid rgba(148, 163, 184, 0.2)",
            borderRadius: "16px",
            padding: "40px",
            boxShadow:
              "0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 10px 10px -5px rgba(0, 0, 0, 0.2)",
          }}
        >
          {!showRegister ? (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={() => {
                setShowRegister(true);
                onSwitchToRegister?.();
              }}
            />
          ) : (
            <div style={{ textAlign: "center", color: "#94a3b8" }}>
              <p>Registration form coming soon...</p>
              <button
                onClick={() => setShowRegister(false)}
                style={{
                  marginTop: "20px",
                  background: "none",
                  border: "none",
                  color: "#10b981",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Back to Login
              </button>
            </div>
          )}
        </div>

        {/* Footer Hint */}
        <div
          style={{
            marginTop: "24px",
            textAlign: "center",
            fontSize: "13px",
            color: "#64748b",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
            <span>💡</span>
            <span>Click the logo to chat with AI assistant</span>
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
          }
          50% {
            opacity: 0.8;
          }
        }

        @keyframes twinkle {
          0%,
          100% {
            opacity: 0.2;
          }
          50% {
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}

