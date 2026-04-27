export const UTILITY_PAGE_DATA = [
  {
    slug: "compress-image-to-20kb",
    title: "Compress Image to 20KB",
    summary: "Reduce image size to around 20KB for exam and form uploads.",
    route: "/tool/imgcompress?target=20&unit=KB",
    targetLabel: "20KB",
    category: "Image",
  },
  {
    slug: "compress-image-to-50kb",
    title: "Compress Image to 50KB",
    summary: "Resize and compress image files close to 50KB without manual trial and error.",
    route: "/tool/imgcompress?target=50&unit=KB",
    targetLabel: "50KB",
    category: "Image",
  },
  {
    slug: "compress-pdf-to-100kb",
    title: "Compress PDF to 100KB",
    summary: "Shrink PDF files toward 100KB for portals with strict upload limits.",
    route: "/pdf/compress?target=100&unit=KB",
    targetLabel: "100KB",
    category: "PDF",
  },
  {
    slug: "compress-pdf-to-200kb",
    title: "Compress PDF to 200KB",
    summary: "Compress marksheets, certificates, and forms close to 200KB for upload.",
    route: "/pdf/compress?target=200&unit=KB",
    targetLabel: "200KB",
    category: "PDF",
  },
];

export function getUtilityPageBySlug(slug) {
  return UTILITY_PAGE_DATA.find((item) => item.slug === slug) || null;
}
