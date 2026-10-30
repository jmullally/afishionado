"use client";

import { useEffect, useRef, useState } from "react";
import { BarcodeDetector, prepareZXingModule } from "barcode-detector/ponyfill";

// The barcode reader's WebAssembly file is served from public/zxing/ (copied from
// node_modules/zxing-wasm/dist/reader/) rather than a third-party CDN.
prepareZXingModule({
  overrides: {
    locateFile: (path: string, prefix: string) => (path.endsWith(".wasm") ? "/zxing/zxing_reader.wasm" : prefix + path),
  },
});

/** Full-screen camera view that reads a tin's barcode (EAN/UPC) and reports it once. */
export function BarcodeScanner({ onDetected, onClose }: { onDetected: (code: string) => void; onClose: () => void }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let stopped = false;
    const detector = new BarcodeDetector({ formats: ["ean_13", "ean_8", "upc_a", "upc_e"] });

    async function scan() {
      const video = videoRef.current;
      if (stopped || !video) return;
      if (video.readyState >= 2) {
        try {
          const [hit] = await detector.detect(video);
          if (hit && !stopped) {
            stopped = true;
            navigator.vibrate?.(60);
            onDetected(hit.rawValue);
            return;
          }
        } catch {
          // A frame that can't be read; try the next one.
        }
      }
      timer = setTimeout(scan, 200);
    }

    navigator.mediaDevices
      ?.getUserMedia({ video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }, audio: false })
      .then(async (s) => {
        stream = s;
        if (stopped || !videoRef.current) return;
        videoRef.current.srcObject = s;
        await videoRef.current.play();
        scan();
      })
      .catch(() => setError("Camera not available. Allow camera access, or type the numbers under the barcode instead."));

    return () => {
      stopped = true;
      if (timer) clearTimeout(timer);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [onDetected]);

  const digits = typed.replace(/\D/g, "");

  return (
    <div className="pt-safe pb-safe fixed inset-0 z-50 flex flex-col bg-ink text-white">
      <div className="flex items-center justify-between px-4 py-3">
        <p className="font-semibold">Scan a barcode</p>
        <button type="button" onClick={onClose} className="rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold">
          Cancel
        </button>
      </div>

      <div className="relative flex-1 overflow-hidden">
        <video ref={videoRef} playsInline muted className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="h-36 w-4/5 max-w-sm rounded-2xl border-4 border-gold/90 shadow-[0_0_0_9999px_rgba(19,38,58,0.45)]" />
        </div>
        {error && <p className="absolute inset-x-4 top-4 rounded-xl bg-coral p-3 text-sm">{error}</p>}
      </div>

      <form
        className="flex gap-2 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          if (digits.length >= 8) onDetected(digits);
        }}
      >
        <input
          value={typed}
          onChange={(e) => setTyped(e.target.value)}
          inputMode="numeric"
          placeholder="Or type the barcode number"
          className="field flex-1 text-ink"
        />
        <button className="btn" disabled={digits.length < 8}>
          Look up
        </button>
      </form>
    </div>
  );
}
