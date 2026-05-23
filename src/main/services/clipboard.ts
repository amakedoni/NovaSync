import { clipboard, desktopCapturer, screen } from 'electron';

/**
 * Read text from the system clipboard.
 * Safe read-only operation — always available.
 */
export function readClipboard(): string {
  return clipboard.readText();
}

/**
 * Write text to the system clipboard.
 * Confirmable action — called only via explicit user action.
 */
export function writeClipboard(text: string): void {
  clipboard.writeText(text);
}

/**
 * Capture the primary display as a PNG buffer.
 * Manual trigger only — user clicks "Capture screen" button.
 */
export async function captureScreen(): Promise<Buffer> {
  const sources = await desktopCapturer.getSources({
    types: ['screen'],
    thumbnailSize: screen.getPrimaryDisplay().workAreaSize,
  });

  if (sources.length === 0) {
    throw new Error('No screen sources found');
  }

  return sources[0].thumbnail.toPNG();
}

/**
 * Convert PNG buffer to base64 data URL for multimodal models.
 */
export function toDataUrl(buffer: Buffer): string {
  const base64 = buffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}
