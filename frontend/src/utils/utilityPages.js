const IMAGE_TARGETS = [10, 20, 30, 50, 100, 200];
const PDF_TARGETS = [100, 200, 300, 500];

const imagePages = IMAGE_TARGETS.map((target) => ({
  slug: `compress-image-to-${target}kb`,
  title: `Compress Image to ${target}KB`,
  summary: `Reduce image size close to ${target}KB for exam and form uploads without manual trial and error.`,
  route: `/tool/imgcompress?target=${target}&unit=KB`,
  targetLabel: `${target}KB`,
  category: "Image",
  kind: "target",
}));

const pdfPages = PDF_TARGETS.map((target) => ({
  slug: `compress-pdf-to-${target}kb`,
  title: `Compress PDF to ${target}KB`,
  summary: `Shrink PDF files toward ${target}KB for upload forms, marksheets, and certificates.`,
  route: `/pdf/compress?target=${target}&unit=KB`,
  targetLabel: `${target}KB`,
  category: "PDF",
  kind: "target",
}));

const converterPages = [
  {
    slug: "image-to-pdf-online",
    title: "Image to PDF",
    summary: "Convert multiple images into one clean PDF without switching between different sites.",
    route: "/pdf/image-to-pdf",
    category: "Converter",
    kind: "converter",
    bestFor: "JPG, PNG, WEBP, and HEIC images",
  },
  {
    slug: "jpg-to-pdf-online",
    title: "JPG to PDF",
    summary: "Turn JPG or JPEG images into one PDF for form uploads and document sharing.",
    route: "/pdf/image-to-pdf?source=jpg",
    category: "Converter",
    kind: "converter",
    bestFor: "JPG and JPEG images",
  },
  {
    slug: "png-to-pdf-online",
    title: "PNG to PDF",
    summary: "Convert PNG images to PDF while keeping them neatly arranged page by page.",
    route: "/pdf/image-to-pdf?source=png",
    category: "Converter",
    kind: "converter",
    bestFor: "PNG screenshots and form images",
  },
  {
    slug: "webp-to-pdf-online",
    title: "WEBP to PDF",
    summary: "Convert WEBP images into a shareable PDF for upload and print workflows.",
    route: "/pdf/image-to-pdf?source=webp",
    category: "Converter",
    kind: "converter",
    bestFor: "WEBP images downloaded from modern phones and browsers",
  },
];

export const UTILITY_PAGE_DATA = [...imagePages, ...pdfPages, ...converterPages];

export function getUtilityPageBySlug(slug) {
  return UTILITY_PAGE_DATA.find((item) => item.slug === slug) || null;
}
