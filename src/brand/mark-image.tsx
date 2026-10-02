import { TWN_MARK_INK, TWN_MARK_PAPER } from "./tokens";

interface TwnMarkImageProps {
  size: number;
  /** App icons need an opaque square. Favicon SVG does not. */
  surface?: "paper" | "ink";
}

/**
 * Raster TWN for Apple, PWA and OG. Playfair is loaded by the caller.
 * Paper + ink reads on a light or dark home screen without a badge around it.
 */
export function TwnMarkImage({ size, surface = "paper" }: TwnMarkImageProps) {
  const inkOnPaper = surface === "paper";

  return (
    <div
      style={{
        width: size,
        height: size,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: inkOnPaper ? TWN_MARK_PAPER : TWN_MARK_INK,
      }}
    >
      <div
        style={{
          display: "flex",
          color: inkOnPaper ? TWN_MARK_INK : TWN_MARK_PAPER,
          fontFamily: "Playfair",
          fontWeight: 900,
          fontSize: Math.round(size * 0.26),
          letterSpacing: Math.round(size * 0.04),
          lineHeight: 1,
        }}
      >
        TWN
      </div>
    </div>
  );
}
