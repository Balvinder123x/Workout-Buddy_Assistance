/**
 * Ambient background: soft gradient orbs that drift behind content.
 * Purely decorative, so it is hidden from assistive tech and disabled by the
 * reduced-motion rule in index.css.
 */
export function AmbientBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="absolute -left-32 -top-32 h-96 w-96 animate-float rounded-full bg-violet-600/20 blur-3xl" />
      <div
        className="absolute right-0 top-1/3 h-80 w-80 animate-float rounded-full bg-cyan-500/15 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-0 left-1/4 h-72 w-72 animate-float rounded-full bg-coral-500/10 blur-3xl"
        style={{ animationDelay: "4s" }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#0a0a12_75%)]" />
    </div>
  );
}
