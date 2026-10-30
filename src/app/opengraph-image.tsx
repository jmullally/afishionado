import { ImageResponse } from "next/og";

export const alt = "afishionado: a tasting diary for tinned fish";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const SEA = "#1c6e72";
const GOLD = "#e3a52a";
const INK = "#13263a";

/** Google Fonts serves TTF (which the image renderer needs) when asked without a browser user agent. */
async function loadFont(family: string, weight: number, text: string) {
  try {
    const css = await (
      await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`)
    ).text();
    const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
    return url ? await (await fetch(url)).arrayBuffer() : null;
  } catch {
    return null;
  }
}

function Tin({ width }: { width: number }) {
  return (
    <svg width={width} height={(width * 40) / 56} viewBox="4 12 56 40">
      <rect x="4" y="12" width="56" height="40" rx="14" fill={SEA} />
      <rect x="9" y="17" width="46" height="30" rx="10" fill={GOLD} />
      <path d="M17 32c6-7 17-8 25-3l6-4v14l-6-4c-8 5-19 4-25-3z" fill={INK} />
      <circle cx="22.5" cy="31" r="1.6" fill={GOLD} />
      <circle cx="49" cy="22" r="3" fill="none" stroke={INK} strokeWidth="2" />
    </svg>
  );
}

export default async function OpengraphImage() {
  const headline = "A tasting diary for tinned fish.";
  const tagline = "Rate every tin. Remember the good ones.";
  const [display, body] = await Promise.all([
    loadFont("Fraunces", 700, `afishionado${headline}`),
    loadFont("Inter", 400, tagline),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 90px",
          background: "#f6f1e7",
          color: INK,
          fontFamily: display ? "Fraunces" : "serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", maxWidth: 680 }}>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700 }}>
            a<span style={{ color: SEA }}>fish</span>ionado
          </div>
          <div style={{ marginTop: 28, fontSize: 76, fontWeight: 700, lineHeight: 1.05 }}>{headline}</div>
          <div style={{ marginTop: 32, fontSize: 30, color: "#5d6b78", fontFamily: body ? "Inter" : "sans-serif" }}>
            {tagline}
          </div>
        </div>
        <div style={{ display: "flex", transform: "rotate(-8deg)" }}>
          <Tin width={340} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        ...(display ? [{ name: "Fraunces", data: display, weight: 700 as const, style: "normal" as const }] : []),
        ...(body ? [{ name: "Inter", data: body, weight: 400 as const, style: "normal" as const }] : []),
      ],
    },
  );
}
