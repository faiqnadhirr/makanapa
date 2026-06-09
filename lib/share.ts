import { toPng } from "html-to-image";

export type ShareResult = "shared" | "downloaded" | "error";

/**
 * Turn a DOM node into a PNG and either open the native share sheet (mobile)
 * or fall back to a direct download (desktop / unsupported browsers).
 */
export async function shareNodeAsImage(
  node: HTMLElement,
  fileName: string,
): Promise<ShareResult> {
  try {
    const dataUrl = await toPng(node, {
      pixelRatio: 1,
      cacheBust: true,
      // The node is rendered off-screen; force its real dimensions.
      width: node.offsetWidth,
      height: node.offsetHeight,
    });

    const blob = await (await fetch(dataUrl)).blob();
    const file = new File([blob], fileName, { type: "image/png" });

    // Prefer the native share sheet when the browser can share files.
    if (
      typeof navigator !== "undefined" &&
      navigator.canShare?.({ files: [file] })
    ) {
      await navigator.share({
        files: [file],
        title: "Makan Apa Hari Ini?",
        text: "Ini menu makanku hari ini 🍽️",
      });
      return "shared";
    }

    // Fallback: trigger a download.
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = fileName;
    link.click();
    return "downloaded";
  } catch (error) {
    // AbortError just means the user dismissed the share sheet — not a failure.
    if (error instanceof Error && error.name === "AbortError") return "shared";
    console.error("Share failed:", error);
    return "error";
  }
}
