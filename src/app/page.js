import Link from "next/link";

export default function Home() {
  return (
    <main className="container animate-fade-in" style={{ paddingTop: "4rem", paddingBottom: "4rem" }}>
      <div className="flex-center" style={{ flexDirection: "column", gap: "2rem", textAlign: "center" }}>
        
        <div>
          <h1 style={{ fontSize: "3rem", fontWeight: 700, marginBottom: "0.5rem" }}>
            Smart Menu <span style={{ color: "var(--accent-primary)" }}>Engine</span>
          </h1>
          <p style={{ color: "var(--text-secondary)", fontSize: "1.125rem", maxWidth: "600px", margin: "0 auto" }}>
            The foundation for your Enterprise QR Ordering System is now deployed.
          </p>
        </div>

        <div className="glass-panel" style={{ padding: "2rem", width: "100%", maxWidth: "500px", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>System Active</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "0.95rem" }}>
            This system is currently configured for a single operational Cafe.
          </p>
          
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", justifyContent: "center" }}>
            <Link href="/menu" className="btn-primary">View QR Menu Demo</Link>
            <Link href="/login" className="btn-secondary">Admin Login</Link>
          </div>
        </div>

      </div>
    </main>
  );
}
