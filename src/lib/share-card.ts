/**
 * Draws a check-in as a 1080×1350 image (Instagram's portrait size): the photo, the tin,
 * the rating and the note, with a small afishionado footer. Runs in the browser on a canvas.
 */

const W = 1080;
const H = 1350;
const PAD = 72;
const COLORS = { cream: "#f6f1e7", paper: "#fffdf8", ink: "#13263a", muted: "#5d6b78", line: "#e4dccb", sea: "#1c6e72", gold: "#e3a52a" };

export type CardInput = {
  photoUrl: string | null;
  brand: string;
  name: string;
  rating: number;
  note: string | null;
  meta: string;
};

/** The page's next/font families, so the card matches the app. */
function fontFamilies() {
  const css = getComputedStyle(document.documentElement);
  return {
    display: css.getPropertyValue("--font-display-face").trim() || "Georgia, serif",
    body: css.getPropertyValue("--font-body").trim() || "system-ui, sans-serif",
  };
}

/** Splits text into at most `maxLines` lines that fit `width`, ending with "…" if cut short. */
function wrap(ctx: CanvasRenderingContext2D, text: string, width: number, maxLines: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (ctx.measureText(next).width <= width) {
      line = next;
      continue;
    }
    if (line) lines.push(line);
    line = word;
    if (lines.length === maxLines) break;
  }
  if (lines.length < maxLines && line) lines.push(line);
  else if (line && lines.length === maxLines) {
    let last = lines[maxLines - 1];
    while (last && ctx.measureText(`${last}…`).width > width) last = last.slice(0, -1);
    lines[maxLines - 1] = `${last.trimEnd()}…`;
  }
  return lines;
}

/** The tin logo (same shapes as components/Logo.tsx), drawn into a w-wide box at x,y. */
function drawTin(ctx: CanvasRenderingContext2D, x: number, y: number, w: number) {
  const s = w / 56;
  ctx.save();
  ctx.translate(x - 4 * s, y - 12 * s);
  ctx.scale(s, s);
  ctx.fillStyle = COLORS.sea;
  ctx.beginPath();
  roundRect(ctx, 4, 12, 56, 40, 14);
  ctx.fill();
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  roundRect(ctx, 9, 17, 46, 30, 10);
  ctx.fill();
  ctx.fillStyle = COLORS.ink;
  ctx.fill(new Path2D("M17 32c6-7 17-8 25-3l6-4v14l-6-4c-8 5-19 4-25-3z"));
  ctx.fillStyle = COLORS.gold;
  ctx.beginPath();
  ctx.arc(22.5, 31, 1.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = COLORS.ink;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(49, 22, 3, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

function drawStars(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rating: number) {
  ctx.font = `${size}px ${fontFamilies().body}`;
  const stars = "★★★★★";
  const width = ctx.measureText(stars).width;
  ctx.fillStyle = COLORS.line;
  ctx.fillText(stars, x, y);
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y - size, (width * rating) / 5, size * 1.3);
  ctx.clip();
  ctx.fillStyle = COLORS.gold;
  ctx.fillText(stars, x, y);
  ctx.restore();
  return width;
}

async function loadPhoto(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Photo download failed (${res.status})`);
  return createImageBitmap(await res.blob());
}

/** Rounded rectangle path, with a plain rectangle where the browser lacks roundRect. */
function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  if (typeof ctx.roundRect === "function") ctx.roundRect(x, y, w, h, r);
  else ctx.rect(x, y, w, h);
}

export async function renderShareCard(input: CardInput): Promise<Blob> {
  const { display, body } = fontFamilies();
  // Preload only each list's first font: next/font's "… Fallback" faces point at local fonts
  // Android doesn't have, and Chrome there rejects the whole load. Nor is a font worth failing the card over.
  const first = (family: string) => family.split(",")[0];
  await Promise.all([
    document.fonts.load(`700 64px ${first(display)}`),
    document.fonts.load(`600 32px ${first(body)}`),
    document.fonts.load(`400 34px ${first(body)}`),
  ]).catch((err) => console.warn("Share card fonts didn't load", err));
  const photo = input.photoUrl
    ? await loadPhoto(input.photoUrl).catch((err) => {
        console.warn("Share card photo didn't load", err);
        return null;
      })
    : null;

  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = COLORS.cream;
  ctx.fillRect(0, 0, W, H);

  // Photo (cover-cropped into a rounded frame), or a big tin when there's no photo.
  const frame = { x: PAD, y: PAD, w: W - PAD * 2, h: 720 };
  ctx.save();
  ctx.beginPath();
  roundRect(ctx, frame.x, frame.y, frame.w, frame.h, 40);
  ctx.clip();
  if (photo) {
    const scale = Math.max(frame.w / photo.width, frame.h / photo.height);
    const dw = photo.width * scale;
    const dh = photo.height * scale;
    ctx.drawImage(photo, frame.x + (frame.w - dw) / 2, frame.y + (frame.h - dh) / 2, dw, dh);
    photo.close();
  } else {
    ctx.fillStyle = "rgba(28,110,114,0.1)";
    ctx.fillRect(frame.x, frame.y, frame.w, frame.h);
    drawTin(ctx, W / 2 - 220, frame.y + frame.h / 2 - 157, 440);
  }
  ctx.restore();

  let y = frame.y + frame.h + 80;
  const textW = W - PAD * 2;

  ctx.fillStyle = COLORS.sea;
  ctx.font = `600 32px ${body}`;
  ctx.fillText(input.brand.toUpperCase(), PAD, y);

  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 64px ${display}`;
  for (const line of wrap(ctx, input.name, textW, 2)) {
    y += 72;
    ctx.fillText(line, PAD, y);
  }

  y += 84;
  const starsW = drawStars(ctx, PAD, y, 60, input.rating);
  ctx.fillStyle = COLORS.ink;
  ctx.font = `700 56px ${display}`;
  ctx.fillText(input.rating.toFixed(1), PAD + starsW + 24, y);

  if (input.note) {
    ctx.fillStyle = COLORS.ink;
    ctx.font = `400 34px ${body}`;
    y += 24;
    for (const line of wrap(ctx, input.note, textW, 2)) {
      y += 46;
      ctx.fillText(line, PAD, y);
    }
  }

  // Footer: date/place on the left, wordmark on the right.
  const footerY = H - PAD + 8;
  ctx.fillStyle = COLORS.muted;
  ctx.font = `400 28px ${body}`;
  ctx.fillText(wrap(ctx, input.meta, textW - 420, 1)[0] ?? "", PAD, footerY);

  ctx.font = `700 40px ${display}`;
  const parts: [string, string][] = [["a", COLORS.ink], ["fish", COLORS.sea], ["ionado", COLORS.ink]];
  const wordW = parts.reduce((w, [t]) => w + ctx.measureText(t).width, 0);
  let x = W - PAD - wordW;
  drawTin(ctx, x - 64, footerY - 34, 50);
  for (const [t, color] of parts) {
    ctx.fillStyle = color;
    ctx.fillText(t, x, footerY);
    x += ctx.measureText(t).width;
  }

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Could not create the card"))), "image/jpeg", 0.9),
  );
}
