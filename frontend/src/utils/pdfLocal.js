import { PDFDocument } from "pdf-lib";

async function fileToBytes(file) {
  return new Uint8Array(await file.arrayBuffer());
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

export async function mergePdfFiles(files) {
  const merged = await PDFDocument.create();
  let pageCount = 0;

  for (const file of files) {
    const src = await PDFDocument.load(await fileToBytes(file));
    const copiedPages = await merged.copyPages(src, src.getPageIndices());
    copiedPages.forEach((page) => merged.addPage(page));
    pageCount += src.getPageCount();
  }

  const bytes = await merged.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  return {
    url: await blobToDataUrl(blob),
    originalCount: files.length,
    pageCount,
    pdfKB: Math.round(blob.size / 1024),
  };
}

export function parsePageSelection(selection, totalPages) {
  const clean = String(selection || "").trim();
  if (!clean) throw new Error("Enter page numbers or ranges like 1,3,5-7.");

  const pages = new Set();
  clean.split(",").forEach((part) => {
    const token = part.trim();
    if (!token) return;
    if (token.includes("-")) {
      const [startRaw, endRaw] = token.split("-");
      const start = Number(startRaw);
      const end = Number(endRaw);
      if (!Number.isInteger(start) || !Number.isInteger(end) || start < 1 || end < start) {
        throw new Error(`Invalid page range: ${token}`);
      }
      for (let page = start; page <= end; page += 1) {
        if (page > totalPages) throw new Error(`Page ${page} exceeds the PDF length.`);
        pages.add(page);
      }
    } else {
      const page = Number(token);
      if (!Number.isInteger(page) || page < 1) throw new Error(`Invalid page number: ${token}`);
      if (page > totalPages) throw new Error(`Page ${page} exceeds the PDF length.`);
      pages.add(page);
    }
  });

  const result = Array.from(pages).sort((a, b) => a - b);
  if (!result.length) throw new Error("No valid pages selected.");
  return result;
}

export async function splitPdfFile(file, selection) {
  const src = await PDFDocument.load(await fileToBytes(file));
  const originalPages = src.getPageCount();
  const selectedPages = parsePageSelection(selection, originalPages);
  const out = await PDFDocument.create();
  const copiedPages = await out.copyPages(src, selectedPages.map((page) => page - 1));
  copiedPages.forEach((page) => out.addPage(page));
  const bytes = await out.save();
  const blob = new Blob([bytes], { type: "application/pdf" });

  return {
    url: await blobToDataUrl(blob),
    originalPages,
    extractedPages: selectedPages.length,
    selectedPages,
    pdfKB: Math.round(blob.size / 1024),
  };
}

async function readImageDimensions(file) {
  const objectUrl = URL.createObjectURL(file);
  try {
    const dims = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = reject;
      img.src = objectUrl;
    });
    return dims;
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

export async function imagesToPdfFiles(files, pageMode = "a4", orientation = "auto") {
  const pdf = await PDFDocument.create();
  const dimsList = await Promise.all(files.map(readImageDimensions));
  const A4 = { width: 595.28, height: 841.89 };

  for (let index = 0; index < files.length; index += 1) {
    const file = files[index];
    const bytes = await fileToBytes(file);
    const dims = dimsList[index];
    const isPng = /png/i.test(file.type);
    const image = isPng ? await pdf.embedPng(bytes) : await pdf.embedJpg(bytes);

    let pageWidth = A4.width;
    let pageHeight = A4.height;

    if (pageMode === "original") {
      pageWidth = dims.width;
      pageHeight = dims.height;
    } else if (orientation === "landscape") {
      pageWidth = A4.height;
      pageHeight = A4.width;
    } else if (orientation === "portrait") {
      pageWidth = A4.width;
      pageHeight = A4.height;
    } else if (dims.width > dims.height) {
      pageWidth = A4.height;
      pageHeight = A4.width;
    }

    const page = pdf.addPage([pageWidth, pageHeight]);
    const scale = Math.min(pageWidth / dims.width, pageHeight / dims.height);
    const drawWidth = dims.width * scale;
    const drawHeight = dims.height * scale;
    const x = (pageWidth - drawWidth) / 2;
    const y = (pageHeight - drawHeight) / 2;
    page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
  }

  const bytes = await pdf.save();
  const blob = new Blob([bytes], { type: "application/pdf" });
  return {
    url: await blobToDataUrl(blob),
    originalCount: files.length,
    pageCount: files.length,
    pdfKB: Math.round(blob.size / 1024),
    pageMode,
    orientation,
  };
}

