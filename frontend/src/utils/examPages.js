const FAMILY_DETAILS = {
  SSC: {
    overview:
      "SSC exams usually require a recent passport-style photo, clear signature, and strict file-size compliance during the online form process.",
    eligibility:
      "Eligibility usually depends on post type, age limit, category relaxation, and minimum education such as 10th, 12th, or graduation.",
    documents: [
      "Recent passport-style photo with front-facing pose",
      "Black-ink signature on white paper",
      "Aadhaar, ID proof, and category certificates if applicable",
      "10th, 12th, or graduation details as required by the post",
    ],
    syllabus: [
      "General Intelligence and Reasoning",
      "General Awareness",
      "Quantitative Aptitude",
      "English Language or Hindi Language depending on exam stage",
    ],
  },
  Banking: {
    overview:
      "Banking exams usually require a recent photo, signature, and sometimes handwritten declaration or thumb impression in exact format.",
    eligibility:
      "Eligibility usually includes graduation, age criteria, category relaxations, and nationality rules defined in the official notification.",
    documents: [
      "Recent passport-style photo",
      "Black-ink signature",
      "Graduation details and ID proof",
      "Handwritten declaration or thumb impression if asked in the form",
    ],
    syllabus: [
      "Reasoning Ability",
      "Quantitative Aptitude",
      "English Language",
      "General, Economy, and Banking Awareness",
      "Computer Awareness for some exams",
    ],
  },
  Railway: {
    overview:
      "Railway exams often reject uploads for incorrect dimensions, face visibility issues, or oversized files, so exact formatting matters a lot.",
    eligibility:
      "Eligibility usually depends on post group, education level, medical standards, and age bracket mentioned in the recruitment notice.",
    documents: [
      "Recent passport-style photo",
      "Signature in black ink on white paper",
      "Educational certificates and ID proof",
      "Category, EWS, or domicile certificates where required",
    ],
    syllabus: [
      "Mathematics",
      "General Intelligence and Reasoning",
      "General Science",
      "General Awareness and Current Affairs",
    ],
  },
  Entrance: {
    overview:
      "Entrance exam portals often require larger photo ranges but still expect a clear face, plain background, readable signature, and correct aspect ratio.",
    eligibility:
      "Eligibility usually depends on class qualification, subject combination, minimum percentage, attempt rules, and category-specific criteria.",
    documents: [
      "Recent candidate photograph",
      "Signature image",
      "Class 10 or 12 details and certificates",
      "Category, PwD, or reservation proof where applicable",
    ],
    syllabus: [
      "Subject-based syllabus from official brochure",
      "Physics, Chemistry, and Mathematics or Biology where relevant",
      "Aptitude, language, or domain subjects depending on exam",
    ],
  },
  UPSC: {
    overview:
      "UPSC-related forms need a clear recent photo and signature, and many aspirants face upload issues because of random lighting, dark faces, or oversized files.",
    eligibility:
      "Eligibility generally includes age criteria, category relaxation, nationality, educational qualification, and attempt limits from the official notice.",
    documents: [
      "Recent passport-style photo with clear face",
      "Black-ink signature",
      "Graduation or equivalent details where required",
      "Photo ID and category certificates if applicable",
    ],
    syllabus: [
      "General Studies subjects from official notification",
      "Reasoning, English, and current affairs where relevant",
      "Subject-specific papers depending on exam type",
    ],
  },
  Police: {
    overview:
      "Police recruitment forms usually need upload-ready photo and signature files, and portals often reject files for unclear face, low light, or wrong crop.",
    eligibility:
      "Eligibility usually depends on age, education, physical standards, category relaxation, and domicile rules from the official recruitment notice.",
    documents: [
      "Recent front-facing photo",
      "Signature in black ink",
      "ID proof and educational details",
      "Category, domicile, or reservation documents where required",
    ],
    syllabus: [
      "General Knowledge",
      "Reasoning",
      "Mathematics or Numerical Ability",
      "Current Affairs and law-related basics for some posts",
    ],
  },
  Defence: {
    overview:
      "Defence forms often require strict photo and signature formatting, and aspirants should avoid low-light or casual photos that reduce face clarity.",
    eligibility:
      "Eligibility usually includes age band, education level, nationality, physical standards, and category-specific rules mentioned in the notification.",
    documents: [
      "Recent passport-style photo",
      "Signature image",
      "Educational details and ID proof",
      "Category and special claim certificates if applicable",
    ],
    syllabus: [
      "Mathematics or numerical ability",
      "Reasoning and general ability",
      "English",
      "General Knowledge and current affairs",
    ],
  },
  Insurance: {
    overview:
      "Insurance sector exams usually need standard upload-ready photo and signature files similar to banking forms.",
    eligibility:
      "Eligibility usually includes graduation, age criteria, category relaxation, and official identity details.",
    documents: [
      "Recent passport-style photo",
      "Black-ink signature",
      "Graduation details and ID proof",
      "Category certificates if applicable",
    ],
    syllabus: [
      "Reasoning",
      "Quantitative Aptitude",
      "English Language",
      "General Awareness and insurance awareness",
    ],
  },
};

const COMMON_UPLOAD_TIPS = [
  "Use a recent, front-facing passport-style photo with your full face clearly visible.",
  "Stand against a plain light wall if possible. Avoid textured, damaged, or crowded backgrounds.",
  "Use daylight or a bright front light. Avoid dim rooms, shadows on face, and backlight from windows.",
  "Keep camera straight at eye level. Do not upload selfies with tilted angle or heavy crop.",
  "Do not use group photos, screenshots, social-media photos, or pictures where face is too small.",
];

const COMMON_PHOTO_WARNINGS = [
  "Dark face or low-light image can make final result look dull even after resizing.",
  "Messy wall, shadows, or cluttered background can affect the clean white-background output.",
  "Very small or far-away face reduces quality after resize and compression.",
];

const COMMON_REJECTION_REASONS = [
  "Face too dark, blurry, or too small inside the frame",
  "Wrong photo size, wrong aspect ratio, or file size above portal limit",
  "Signature not on white paper or not written in black ink",
  "Background too messy, textured, or shadow-heavy",
];

const COMMON_FORM_STEPS = [
  "Read the official notification first and note the photo, signature, and document rules.",
  "Prepare photo and signature in the correct size before opening the application portal.",
  "Keep ID proof, category certificates, and education details ready while filling the form.",
  "Download and save the final processed files on your device after checking preview.",
];

const COMMON_FAQS = [
  {
    q: "Can I upload a selfie or casual photo?",
    a: "Only if the face is front-facing, well lit, recent, and clearly visible. Casual, far-away, or cropped social-media photos often fail after resize.",
  },
  {
    q: "Why does my final photo still look weak sometimes?",
    a: "If the original photo is dark, low-resolution, noisy, or taken against a messy wall, the final result will also be limited. Better source photo gives better output.",
  },
  {
    q: "Should I use mobile camera or studio photo?",
    a: "A good mobile camera photo in bright front light and plain background usually works well. Studio photo is optional, not mandatory.",
  },
];

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
].map((exam) => {
  const details = FAMILY_DETAILS[exam.family] || FAMILY_DETAILS.Entrance;
  return {
    ...exam,
    seoTitle: `${exam.name} photo resize, signature resize, eligibility and syllabus`,
    seoDescription: `Resize ${exam.name} photo and signature online, check eligibility, syllabus, document list, and common upload rules in one FormFixer guide.`,
    searchIntent: `${exam.name} photo resize online`,
    overview: details.overview,
    eligibility: details.eligibility,
    documents: details.documents,
    syllabus: details.syllabus,
    uploadTips: COMMON_UPLOAD_TIPS,
    uploadWarnings: COMMON_PHOTO_WARNINGS,
    rejectionReasons: COMMON_REJECTION_REASONS,
    formSteps: COMMON_FORM_STEPS,
    faqs: COMMON_FAQS,
  };
});

export function getExamBySlug(slug) {
  return EXAM_PAGE_DATA.find((item) => item.slug === slug) || null;
}

export function getExamByName(name) {
  return EXAM_PAGE_DATA.find((item) => item.name === name) || null;
}
