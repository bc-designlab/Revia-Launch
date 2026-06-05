// Renders the official Revia wordmark SVG via CSS mask so the fill color
// can be changed by editing backgroundColor alone — the source SVG is untouched.
export default function ReviaLogo({
  height = 20,
  color = "#8D6BE8",
}: {
  height?: number;
  color?: string;
}) {
  const width = Math.round(height * (840 / 331));

  return (
    <span
      role="img"
      aria-label="Revia"
      className="inline-block shrink-0"
      style={{
        width,
        height,
        backgroundColor: color,
        WebkitMaskImage: "url('/logo/revia-logo.svg')",
        maskImage: "url('/logo/revia-logo.svg')",
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}
