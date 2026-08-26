export default function StreamLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Scoped to this route only — the rest of the app keeps its existing
          type system. Outfit gives the hub's headline/channel-identity type
          a rounded, friendly presence closer to real streaming-box UIs than
          a geometric display face; body copy still rides the app's IBM Plex
          Sans (loaded globally in the root layout) for consistency. */}
      <link
        href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
      {children}
    </>
  )
}
