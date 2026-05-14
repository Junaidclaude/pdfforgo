// Shared helper: loads pdfjs-dist and configures its Web Worker.
// Worker is loaded from unpkg CDN on first call (cached by the browser).
// Only call this inside async functions in client components.
export async function getPdfjs() {
  const pdfjs = await import('pdfjs-dist')
  if (!pdfjs.GlobalWorkerOptions.workerSrc) {
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`
  }
  return pdfjs
}
