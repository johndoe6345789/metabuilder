const features = [
  "One-click app deployment",
  "Domain management",
  "Container monitoring",
  "Environment variables",
  "SSL certificate management",
  "Real-time logs",
];

export default function Home() {
  return (
    <main style={{ maxWidth: 640, margin: "0 auto", padding: "64px 24px" }}>
      {/* App Icon */}
      <div
        style={{
          width: 96,
          height: 96,
          borderRadius: 24,
          background: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
          margin: "0 auto 24px",
        }}
      />

      {/* Title */}
      <h1
        style={{
          fontSize: 36,
          fontWeight: 700,
          textAlign: "center",
          marginBottom: 16,
        }}
      >
        CaproverForge
      </h1>

      {/* Description */}
      <p
        style={{
          fontSize: 18,
          lineHeight: 1.6,
          color: "var(--text-muted)",
          textAlign: "center",
          marginBottom: 48,
        }}
      >
        Mobile admin panel for CapRover. Deploy apps, manage domains, monitor
        containers, and configure your PaaS &mdash; all from your phone.
      </p>

      {/* Download Button */}
      <div style={{ textAlign: "center", marginBottom: 56 }}>
        <a
          href="https://github.com/nicholasgriffintn/caproverforge/releases/latest"
          style={{
            display: "inline-block",
            background: "var(--accent)",
            color: "#fff",
            fontSize: 18,
            fontWeight: 600,
            padding: "14px 36px",
            borderRadius: 12,
            textDecoration: "none",
            transition: "background 0.2s",
          }}
          onMouseOver={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background =
              "var(--accent-hover)")
          }
          onMouseOut={(e) =>
            ((e.currentTarget as HTMLAnchorElement).style.background =
              "var(--accent)")
          }
        >
          Download APK
        </a>
      </div>

      {/* Features */}
      <section style={{ marginBottom: 56 }}>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 20 }}>
          Features
        </h2>
        <ul
          style={{
            listStyle: "none",
            display: "grid",
            gap: 12,
          }}
        >
          {features.map((feature) => (
            <li
              key={feature}
              style={{
                padding: "14px 18px",
                background: "var(--bg-card)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                fontSize: 15,
              }}
            >
              <span style={{ color: "var(--accent)", marginRight: 10 }}>
                &#10003;
              </span>
              {feature}
            </li>
          ))}
        </ul>
      </section>

      {/* Build from Source */}
      <section>
        <h2 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>
          Build from Source
        </h2>
        <div
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            borderRadius: 10,
            padding: 20,
          }}
        >
          <pre
            style={{
              fontSize: 14,
              lineHeight: 1.7,
              overflowX: "auto",
              color: "var(--text-muted)",
            }}
          >
            {`git clone https://github.com/nicholasgriffintn/caproverforge.git
cd caproverforge
./gradlew assembleDebug`}
          </pre>
          <p
            style={{
              fontSize: 13,
              color: "var(--text-muted)",
              marginTop: 14,
            }}
          >
            Requires Android SDK and JDK 17+. The built APK will be at{" "}
            <code
              style={{
                background: "var(--bg)",
                padding: "2px 6px",
                borderRadius: 4,
                fontSize: 12,
              }}
            >
              app/build/outputs/apk/debug/
            </code>
          </p>
        </div>
      </section>
    </main>
  );
}
