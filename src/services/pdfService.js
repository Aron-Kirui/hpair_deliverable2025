// src/services/pdfService.js

export const MAX_PDF_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

const looksLikePdfByExt = (name = "") =>
  /\.pdf$/i.test(name || "");

const looksLikePdfByMime = (type = "") =>
  type === "application/pdf" ||
  type === "application/x-pdf" ||
  type === "applications/pdf";

/** Validate a single file as a PDF under size limit */
export const validatePdf = (file) => {
  if (!file) return { valid: false, error: "No file selected." };

  const isPdf = looksLikePdfByMime(file.type) || looksLikePdfByExt(file.name);
  if (!isPdf) return { valid: false, error: "Only PDF files are allowed." };

  if (file.size > MAX_PDF_SIZE_BYTES) {
    return { valid: false, error: "File must be 5MB or smaller." };
  }

  return { valid: true };
};

/** Create an object URL for previewing the PDF */
export const createPdfObjectUrl = (file) => URL.createObjectURL(file);

/** Revoke an object URL when you're done with it */
export const revokeObjectUrl = (url) => {
  try { if (url) URL.revokeObjectURL(url); } catch {}
};

/** Optional helper: read as ArrayBuffer (e.g., if you later upload) */
export const readAsArrayBuffer = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });

/** Pretty size like "1.2 MB" */
export const formatSize = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
};
