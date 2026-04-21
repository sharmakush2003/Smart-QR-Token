"use client";

import { useState } from "react";
import { loginOwner } from "../../services/authService";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const result = await loginOwner(email, password);

    if (result.success) {
      // In the future we will route to /admin/[restaurantId]/dashboard
      // For now, just route to an admin placeholder or home
      router.push("/admin/dashboard");
    } else {
      setErrorMsg(result.error || "Failed to authenticate.");
      setLoading(false);
    }
  };

  return (
    <main className="flex-center animate-fade-in" style={{ minHeight: "100vh", padding: "1.5rem" }}>
      <div 
        className="glass-panel" 
        style={{ 
          width: "100%", 
          maxWidth: "420px", 
          padding: "2.5rem 2rem",
          position: "relative",
          overflow: "hidden"
        }}
      >
        {/* Subtle background glow effect behind the form */}
        <div style={{
          position: "absolute",
          top: "-50px",
          left: "50%",
          transform: "translateX(-50%)",
          width: "150px",
          height: "150px",
          background: "var(--accent-primary)",
          filter: "blur(100px)",
          opacity: 0.15,
          zIndex: -1
        }} />

        <div style={{ textAlign: "center", marginBottom: "2rem" }}>
          <div style={{ 
            width: "50px", 
            height: "50px", 
            background: "rgba(245, 158, 11, 0.1)", 
            borderRadius: "var(--radius-md)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 1rem auto",
            border: "1px solid rgba(245, 158, 11, 0.2)"
          }}>
            <Lock size={24} color="var(--accent-primary)" />
          </div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "700" }}>Admin Portal</h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", marginTop: "0.25rem" }}>
            Secure access for restaurant management
          </p>
        </div>

        {errorMsg && (
          <div style={{ 
            background: "rgba(239, 68, 68, 0.1)", 
            color: "var(--danger)", 
            padding: "0.75rem", 
            borderRadius: "var(--radius-sm)",
            fontSize: "0.85rem",
            marginBottom: "1.5rem",
            border: "1px solid rgba(239, 68, 68, 0.2)"
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          
          {/* Email Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="manager@cafe.com"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent-primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
              />
            </div>
          </div>

          {/* Password Field */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", fontWeight: 500 }}>Password</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-secondary)" }}>
                <Lock size={18} />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "0.75rem 1rem 0.75rem 2.5rem",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  color: "var(--text-primary)",
                  outline: "none",
                  transition: "border-color 0.2s ease"
                }}
                onFocus={(e) => e.target.style.borderColor = "var(--accent-primary)"}
                onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ 
              marginTop: "1rem", 
              display: "flex", 
              justifyContent: "center", 
              alignItems: "center", 
              gap: "0.5rem",
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : "Sign In to Dashboard"}
            {!loading && <ArrowRight size={18} />}
          </button>

        </form>

      </div>
    </main>
  );
}
