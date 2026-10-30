"use client";

import { useCallback, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

// The scanner pulls in a ~1 MB barcode reader, so it only loads when someone taps Scan.
const BarcodeScanner = dynamic(() => import("./BarcodeScanner").then((m) => m.BarcodeScanner), { ssr: false });

/** Opens the camera scanner, then looks the barcode up at /scan/[code]. */
export function ScanButton({ mode }: { mode: "browse" | "checkin" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const onDetected = useCallback(
    (code: string) => {
      setOpen(false);
      router.push(`/scan/${encodeURIComponent(code)}${mode === "checkin" ? "?for=checkin" : ""}`);
    },
    [router, mode],
  );

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="btn-ghost shrink-0" aria-label="Scan a barcode">
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
          <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M13 8v8M17 8v8" />
        </svg>
        Scan
      </button>
      {open && <BarcodeScanner onDetected={onDetected} onClose={() => setOpen(false)} />}
    </>
  );
}
