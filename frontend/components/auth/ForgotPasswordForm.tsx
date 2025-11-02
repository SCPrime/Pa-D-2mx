/**
 * Forgot Password Form Component
 *
 * Sends password reset email to user.
 * Integrates with backend /auth/forgot-password endpoint.
 */

import { useState } from "react";
import { logger } from "../../lib/logger";

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
}

export default function ForgotPasswordForm({
  onSuccess,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    // Basic email validation
    if (!email.includes("@")) {
      setError("Please enter a valid email address");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error("Failed to send reset email");
      }

      const data = await response.json();
      logger.info("[ForgotPassword] Reset email sent", { email });

      setMessage(
        data.message ||
          "If your email is registered, you will receive a password reset link shortly."
      );
      setEmailSent(true);
      setEmail("");

      // Call success callback after 2 seconds
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      logger.error("[ForgotPassword] Error sending reset email", err);
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setIsLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div style={{ textAlign: "center" }}>
        <div
          style={{
            padding: "16px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            color: "#10b981",
            marginBottom: "24px",
          }}
        >
          <div style={{ fontSize: "48px", marginBottom: "12px" }}>✉️</div>
          <p style={{ fontSize: "16px", marginBottom: "8px", fontWeight: 600 }}>Check Your Email</p>
          <p style={{ fontSize: "14px", color: "#94a3b8" }}>{message}</p>
        </div>

        <button
          onClick={onBackToLogin}
          style={{
            padding: "12px 24px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            color: "#10b981",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      style={{ display: "flex", flexDirection: "column", gap: "20px" }}
    >
      <div style={{ textAlign: "center", marginBottom: "8px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#fff", marginBottom: "8px" }}>
          Reset Password
        </h2>
        <p style={{ fontSize: "14px", color: "#94a3b8" }}>
          Enter your email and we&apos;ll send you a reset link
        </p>
      </div>

      <div>
        <label
          htmlFor="forgot-email"
          style={{
            display: "block",
            marginBottom: "8px",
            color: "#cbd5e1",
            fontSize: "14px",
            fontWeight: 500,
          }}
        >
          Email Address
        </label>
        <input
          id="forgot-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          disabled={isLoading}
          style={{
            width: "100%",
            padding: "12px 16px",
            background: "rgba(15, 23, 42, 0.6)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            color: "#fff",
            fontSize: "15px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(16, 185, 129, 0.6)")}
          onBlur={(e) => (e.target.style.borderColor = "rgba(16, 185, 129, 0.3)")}
        />
      </div>

      {error && (
        <div
          style={{
            padding: "12px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "8px",
            color: "#fca5a5",
            fontSize: "14px",
          }}
        >
          {error}
        </div>
      )}

      {message && (
        <div
          style={{
            padding: "12px",
            background: "rgba(16, 185, 129, 0.1)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            borderRadius: "8px",
            color: "#10b981",
            fontSize: "14px",
          }}
        >
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        style={{
          padding: "14px",
          background: isLoading
            ? "rgba(16, 185, 129, 0.5)"
            : "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          border: "none",
          borderRadius: "8px",
          color: "#fff",
          fontSize: "16px",
          fontWeight: 600,
          cursor: isLoading ? "not-allowed" : "pointer",
          transition: "transform 0.2s, box-shadow 0.2s",
          boxShadow: "0 4px 12px rgba(16, 185, 129, 0.3)",
        }}
        onMouseEnter={(e) => !isLoading && (e.currentTarget.style.transform = "translateY(-1px)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
      >
        {isLoading ? "Sending..." : "Send Reset Link"}
      </button>

      <div style={{ textAlign: "center", fontSize: "14px", color: "#94a3b8" }}>
        Remember your password?{" "}
        <button
          type="button"
          onClick={onBackToLogin}
          style={{
            background: "none",
            border: "none",
            color: "#10b981",
            cursor: "pointer",
            textDecoration: "underline",
            fontSize: "14px",
          }}
        >
          Back to Login
        </button>
      </div>
    </form>
  );
}

