export const EXAM_PAGE_DATA = [
  { name: "SSC CGL", slug: "ssc-cgl", family: "SSC", summary: "Resize SSC CGL photo and signature to the exact upload format." },
  { name: "SSC CHSL", slug: "ssc-chsl", family: "SSC", summary: "Prepare SSC CHSL photo and signature without guesswork." },
  { name: "SSC MTS", slug: "ssc-mts", family: "SSC", summary: "Fix SSC MTS photo and signature for form upload." },
  { name: "SSC GD", slug: "ssc-gd", family: "SSC", summary: "Create SSC GD-ready photo and signature in seconds." },
  { name: "SBI PO", slug: "sbi-po", family: "Banking", summary: "Get SBI PO photo and signature to the correct size and KB range." },
  { name: "SBI Clerk", slug: "sbi-clerk", family: "Banking", summary: "Prepare SBI Clerk photo and signature for online application forms." },
  { name: "IBPS PO", slug: "ibps-po", family: "Banking", summary: "Resize and compress IBPS PO photo and signature online." },
  { name: "IBPS Clerk", slug: "ibps-clerk", family: "Banking", summary: "Fix IBPS Clerk photo and signature upload issues quickly." },
  { name: "IBPS RRB", slug: "ibps-rrb", family: "Banking", summary: "Prepare IBPS RRB photo and signature with the right specs." },
  { name: "RRB NTPC", slug: "rrb-ntpc", family: "Railway", summary: "Create RRB NTPC photo and signature files that fit the portal limits." },
  { name: "RRB Group D", slug: "rrb-group-d", family: "Railway", summary: "Resize RRB Group D photo and signature for upload-ready output." },
  { name: "RRB JE", slug: "rrb-je", family: "Railway", summary: "Get RRB JE photo and signature prepared in one place." },
  { name: "JEE Main", slug: "jee-main", family: "Entrance", summary: "Prepare JEE Main photo and signature without manual resizing." },
  { name: "JEE Advanced", slug: "jee-advanced", family: "Entrance", summary: "Create JEE Advanced photo and signature files with the correct format." },
  { name: "NEET UG", slug: "neet-ug", family: "Entrance", summary: "Fix NEET UG photo and signature for smoother form submission." },
  { name: "CUET UG", slug: "cuet-ug", family: "Entrance", summary: "Resize CUET UG photo and signature with the right dimensions and size." },
  { name: "UPSC CSE", slug: "upsc-cse", family: "UPSC", summary: "Prepare UPSC CSE photo and signature to match the application portal." },
  { name: "UPSC CDS", slug: "upsc-cds", family: "UPSC", summary: "Create UPSC CDS-ready photo and signature files online." },
  { name: "UPSC NDA", slug: "upsc-nda", family: "UPSC", summary: "Get UPSC NDA photo and signature sized correctly for upload." },
  { name: "Delhi Police Constable", slug: "delhi-police-constable", family: "Police", summary: "Fix Delhi Police Constable photo and signature in minutes." },
  { name: "Delhi Police SI", slug: "delhi-police-si", family: "Police", summary: "Prepare Delhi Police SI photo and signature with exact output specs." },
  { name: "UP Police", slug: "up-police", family: "Police", summary: "Resize UP Police photo and signature for form submission." },
  { name: "NDA", slug: "nda", family: "Defence", summary: "Prepare NDA photo and signature files without visiting a cyber cafe." },
  { name: "AFCAT", slug: "afcat", family: "Defence", summary: "Fix AFCAT photo and signature dimensions and file size quickly." },
  { name: "LIC AAO", slug: "lic-aao", family: "Insurance", summary: "Create LIC AAO photo and signature output that fits the portal rules." },
  { name: "GATE", slug: "gate", family: "Entrance", summary: "Prepare GATE photo and signature online with the correct format." },
];

export function getExamBySlug(slug) {
  return EXAM_PAGE_DATA.find((item) => item.slug === slug) || null;
}

export function getExamByName(name) {
  return EXAM_PAGE_DATA.find((item) => item.name === name) || null;
}
