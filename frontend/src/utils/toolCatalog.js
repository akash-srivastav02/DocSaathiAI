export const TOOL_CATEGORIES = [
  {
    id: "quick",
    title: "Quick Access",
    items: [
      { id: "photo", label: "Resize Photo", route: "/tool/photo", icon: "PH", desc: "Exam photo presets", live: true, accent: "#3b82f6" },
      { id: "signature", label: "Signature Cleaner", route: "/tool/signature", icon: "SG", desc: "Resize and clean sign", live: true, accent: "#8b5cf6" },
      { id: "compress-pdf", label: "Compress PDF", route: "/pdf/compress", icon: "PDF", desc: "Target KB and MB", live: true, accent: "#14b8a6" },
      { id: "img-to-pdf", label: "Images to PDF", route: "/pdf/image-to-pdf", icon: "IP", desc: "JPG, PNG, WEBP, HEIC", live: true, accent: "#22c55e" },
      { id: "crop", label: "Resize Image", route: "/tool/crop", icon: "CR", desc: "Crop and resize", live: true, accent: "#ec4899" },
      { id: "merge", label: "Photo + Sign / Date", route: "/merger", icon: "MX", desc: "One clean merged file", live: true, accent: "#f97316" },
    ],
  },
  {
    id: "pdf-tools",
    title: "PDF Tools",
    items: [
      { id: "pdf-compress", label: "Compress PDF", route: "/pdf/compress", icon: "CP", desc: "Shrink upload size", live: true, accent: "#14b8a6" },
      { id: "img-to-pdf-card", label: "Images to PDF", route: "/pdf/image-to-pdf", icon: "IP", desc: "Multiple images to one PDF", live: true, accent: "#22c55e" },
      { id: "merge-pdf", label: "Merge PDF", icon: "MP", desc: "Combine documents", live: false, accent: "#3b82f6" },
      { id: "split-pdf", label: "Split PDF", icon: "SP", desc: "Extract pages", live: false, accent: "#ef4444" },
      { id: "pdf-to-jpg", label: "PDF to JPG", icon: "PJ", desc: "Pages to images", live: false, accent: "#6366f1" },
      { id: "pdf-to-word", label: "PDF to Word", icon: "PW", desc: "Editable DOCX", live: false, accent: "#f59e0b" },
    ],
  },
  {
    id: "image-tools",
    title: "Image Tools",
    items: [
      { id: "exam-photo", label: "Exam Photo Resizer", route: "/tool/photo", icon: "EX", desc: "Portal-ready dimensions", live: true, accent: "#3b82f6" },
      { id: "signature-live", label: "Signature Resizer", route: "/tool/signature", icon: "SG", desc: "Clean and resize", live: true, accent: "#8b5cf6" },
      { id: "custom-resize", label: "Custom Image Resizer", route: "/tool/crop", icon: "RS", desc: "Width, height and crop", live: true, accent: "#06b6d4" },
      { id: "img-compress", label: "Image Compressor", route: "/tool/imgcompress", icon: "IC", desc: "Exact KB target", live: true, accent: "#f97316" },
      { id: "universal-image-converter", label: "Universal Image Converter", icon: "UC", desc: "PNG, WEBP, HEIC to JPG", live: false, accent: "#10b981" },
      { id: "passport-sheet", label: "Passport Photo Sheet Maker", icon: "PS", desc: "Multiple copies on one page", live: false, accent: "#a855f7" },
      { id: "print-aadhaar", label: "Print Aadhaar Card", icon: "AA", desc: "Front and back layout", live: false, accent: "#2563eb" },
    ],
  },
  {
    id: "smart",
    title: "Smart Productivity Tools",
    items: [
      { id: "signature-cleaner", label: "Signature Cleaner", route: "/tool/signature", icon: "CL", desc: "Better contrast and sizing", live: true, accent: "#6366f1" },
      { id: "utility-jpg-pdf", label: "JPG to PDF", route: "/utility/jpg-to-pdf-online", icon: "JP", desc: "Quick document combine", live: true, accent: "#3b82f6" },
      { id: "unicode-devlys", label: "Unicode → Devlys", icon: "UD", desc: "Hindi typing conversion", live: false, accent: "#22c55e" },
      { id: "qr-generator", label: "QR Generator", icon: "QR", desc: "Static QR code maker", live: false, accent: "#14b8a6" },
    ],
  },
  {
    id: "career",
    title: "Career & Business Tools",
    items: [
      { id: "resume-builder", label: "ATS Resume Builder", icon: "RB", desc: "Simple resume creator", live: false, accent: "#ec4899" },
      { id: "ats-checker", label: "ATS Resume Checker", icon: "AT", desc: "Resume scan and suggestions", live: false, accent: "#06b6d4" },
      { id: "gst-invoice", label: "GST Invoice Generator", icon: "GI", desc: "Basic invoice export", live: false, accent: "#f59e0b" },
    ],
  },
  {
    id: "media",
    title: "Media & Video Tools",
    items: [
      { id: "video-compress", label: "Compress Video", icon: "VC", desc: "Reduce MP4 size", live: false, accent: "#8b5cf6" },
      { id: "trim-video", label: "Trim Video", icon: "TV", desc: "Cut short clips", live: false, accent: "#ef4444" },
      { id: "extract-audio", label: "Extract Audio", icon: "EA", desc: "MP4 to MP3", live: false, accent: "#10b981" },
      { id: "screen-recorder", label: "Screen Recorder", icon: "SR", desc: "Browser recording", live: false, accent: "#0ea5e9" },
    ],
  },
];

export const HOME_SECTIONS = [
  {
    id: "quick-access",
    title: "Quick Access",
    subtitle: "Start with the most-used tools.",
    viewAllLabel: "All Tools",
    items: TOOL_CATEGORIES[0].items.concat(
      { id: "print-aadhaar-quick", label: "Print Aadhaar", icon: "PA", desc: "Front and back", live: false, accent: "#6366f1" },
      { id: "resume-quick", label: "Resume Builder", icon: "RB", desc: "ATS-friendly", live: false, accent: "#ec4899" }
    ),
  },
  {
    id: "government-docs",
    title: "Government Document Tools",
    subtitle: "Used for exam forms, Aadhaar, licences and portal uploads.",
    items: [
      { id: "pan-card-photo", label: "PAN Card Photo", icon: "PA", desc: "213x213px, 300 DPI", live: false, accent: "#f97316" },
      { id: "voter-id-photo", label: "Voter ID Photo", icon: "VO", desc: "3.5x4.5cm, <100KB", live: false, accent: "#3b82f6" },
      { id: "school-admission", label: "School Admission", icon: "SC", desc: "KV, NVS and more", live: false, accent: "#8b5cf6" },
      { id: "driving-licence", label: "Driving Licence", icon: "DL", desc: "35x45mm, <20KB", live: false, accent: "#ef4444" },
    ],
    pills: [
      { label: "20KB", route: "/utility/compress-image-to-20kb" },
      { label: "50KB", route: "/utility/compress-image-to-50kb" },
      { label: "100KB", route: "/utility/compress-image-to-100kb" },
      { label: "200KB", route: "/utility/compress-image-to-200kb" },
      { label: "300KB", route: "/utility/compress-image-to-300kb" },
    ],
  },
  {
    id: "popular-exams",
    title: "Popular Exams",
    subtitle: "Photo and signature pages with exact specs.",
    items: [
      { id: "ssc-cgl", label: "SSC CGL Photo & Signature", route: "/exam/ssc-cgl", icon: "SSC", desc: "3.5x4.5cm • 50KB", live: true, accent: "#60a5fa" },
      { id: "upsc-cds", label: "UPSC CDS Photo Resize", route: "/exam/upsc-cds", icon: "UPSC", desc: "350x350px • 300KB", live: true, accent: "#f59e0b" },
      { id: "neet-ug", label: "NEET UG Photo Resize", route: "/exam/neet-ug", icon: "NEET", desc: "3.5x4.5cm • 200KB", live: true, accent: "#22c55e" },
      { id: "jee-main", label: "JEE Main Photo Size", route: "/exam/jee-main", icon: "JEE", desc: "3.5x4.5cm • 200KB", live: true, accent: "#8b5cf6" },
    ],
  },
  {
    id: "guides",
    title: "Latest Guides & Updates",
    subtitle: "Trust-building guide cards and SEO content blocks.",
    items: [
      { id: "guide-aadhaar", label: "Aadhaar Card Size in cm, pixels and mm", icon: "GD", desc: "Exact size guide for print and uploads.", live: false, accent: "#3b82f6" },
      { id: "guide-pdf-merge", label: "The ultimate guide to merging and organizing PDFs", icon: "PD", desc: "What merge, split and compress actually solve.", live: false, accent: "#8b5cf6" },
      { id: "guide-csv-pdf", label: "CSV to PDF guide", icon: "CV", desc: "Spreadsheet data to printable PDF.", live: false, accent: "#22c55e" },
    ],
  },
];

export function getCatalogTool(toolId) {
  for (const category of TOOL_CATEGORIES) {
    const match = category.items.find((item) => item.id === toolId);
    if (match) return { ...match, category: category.title };
  }
  return null;
}
