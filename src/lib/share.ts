/**
 * Opens the iOS/Android share sheet with `file` attached (Save Image, Instagram, Messages…),
 * or downloads it on browsers without file sharing. Must be called directly from a tap:
 * iOS Safari rejects navigator.share() after any await, so prepare the file beforehand.
 * Returns an error message, or null on success or when the user dismisses the sheet.
 */
export async function shareFile(file: File, title: string, text: string): Promise<string | null> {
  if (navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title, text });
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) return "Couldn't open the share sheet.";
    }
    return null;
  }
  const href = URL.createObjectURL(file);
  const a = Object.assign(document.createElement("a"), { href, download: file.name });
  a.click();
  setTimeout(() => URL.revokeObjectURL(href), 1000);
  return null;
}
