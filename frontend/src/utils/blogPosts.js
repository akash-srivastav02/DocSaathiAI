export const BLOG_POSTS = [
  {
    slug: "compress-image-to-20kb-guide",
    category: "Image Guide",
    title: "How to Compress an Image to 20KB for Exam and Government Forms",
    summary: "A practical guide for reducing image size to 20KB without breaking readability for exam and document uploads.",
    date: "2026-05-04",
    readTime: "5 min read",
    keywords: "compress image to 20kb, image size reducer for exams, photo upload size 20kb",
    ctaLabel: "Open 20KB Image Tool",
    ctaRoute: "/utility/compress-image-to-20kb",
    intro:
      "Students often get stuck when a portal asks for a very small image size. This guide explains what to check before reducing a file and how to reach the limit without making the photo unusable.",
    sections: [
      {
        heading: "When 20KB usually appears",
        paragraphs: [
          "This size limit is common in older government portals, admit card forms, and document verification steps where upload bandwidth is restricted.",
          "The safest approach is to start with a clear source image and then reduce dimensions and quality carefully instead of crushing a blurry screenshot.",
        ],
      },
      {
        heading: "Best way to avoid quality loss",
        paragraphs: [
          "Use a centered photo, good lighting, and a plain background. Cleaner inputs compress better.",
          "If a website only says 20KB, always check whether it also requires a pixel dimension range. File size alone is not enough.",
        ],
      },
      {
        heading: "What to do on FormFixer",
        paragraphs: [
          "Open the exact 20KB utility page, upload the image, preview the result, and download once the output stays readable.",
          "If the first image becomes too soft, try a cleaner source photo or switch to the exam-specific tool first and then fine-tune size.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can every image be reduced to 20KB cleanly?",
        a: "No. Very noisy or high-detail images may need dimension changes before they can reach 20KB cleanly.",
      },
      {
        q: "Should I use a screenshot for 20KB uploads?",
        a: "Only if the screenshot is already sharp. Original files usually compress better than screenshots.",
      },
    ],
  },
  {
    slug: "compress-pdf-to-200kb-guide",
    category: "PDF Guide",
    title: "How to Compress a PDF to 200KB for Online Applications",
    summary: "Learn when 200KB PDF limits appear, what affects compression, and how to get a cleaner upload-ready file.",
    date: "2026-05-04",
    readTime: "5 min read",
    keywords: "compress pdf to 200kb, reduce pdf size for form upload, pdf upload limit",
    ctaLabel: "Open 200KB PDF Tool",
    ctaRoute: "/utility/compress-pdf-to-200kb",
    intro:
      "PDF limits are common for certificates, declarations, and scanned proofs. The challenge is that not all PDFs compress the same way.",
    sections: [
      {
        heading: "Why some PDFs barely shrink",
        paragraphs: [
          "Text-based PDFs are already efficient, so they may not reduce much further.",
          "Scanned image-heavy PDFs usually shrink more because image downsampling and recompression can remove extra weight.",
        ],
      },
      {
        heading: "Before uploading a scanned PDF",
        paragraphs: [
          "Use a flat scan, crop empty margins, and avoid multiple duplicate pages. Those small improvements help compression a lot.",
          "If the portal accepts JPG, sometimes scanning a single page cleanly and rebuilding the PDF gives a better result than compressing a messy original.",
        ],
      },
      {
        heading: "Best workflow on FormFixer",
        paragraphs: [
          "Upload the file into the 200KB PDF page, preview the reduced version, and verify that text remains readable before downloading.",
          "If the file still cannot reach 200KB, the source may already be near its practical minimum size.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can every PDF go below 200KB?",
        a: "No. Some PDFs are already optimized or contain content that cannot be reduced much without making them unreadable.",
      },
      {
        q: "Are scanned PDFs easier to shrink?",
        a: "Yes, in many cases image-heavy scanned PDFs compress more than already-digital text PDFs.",
      },
    ],
  },
  {
    slug: "merge-pdf-online-guide",
    category: "PDF Guide",
    title: "How to Merge PDF Files Online Without Breaking Page Order",
    summary: "A simple guide for combining certificates, forms, and proofs into one PDF in the correct order.",
    date: "2026-05-04",
    readTime: "4 min read",
    keywords: "merge pdf online, combine pdf pages, merge certificates into one pdf",
    ctaLabel: "Open Merge PDF",
    ctaRoute: "/pdf/merge",
    intro:
      "When a portal asks for one final document, merging PDFs in the right order matters more than people expect.",
    sections: [
      {
        heading: "Where merge mistakes happen",
        paragraphs: [
          "Users often upload the right files but in the wrong sequence. That leads to rejection or confusion during verification.",
          "Before merging, rename or mentally order files such as application form, ID proof, marksheet, and declaration.",
        ],
      },
      {
        heading: "Keep the final file practical",
        paragraphs: [
          "If the merged PDF becomes too large, compress it after merging instead of compressing each file separately first.",
          "Merging first helps you see the real final size that the portal will receive.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I compress before or after merging?",
        a: "Usually after merging, because the final upload limit applies to the completed combined file.",
      },
    ],
  },
  {
    slug: "split-pdf-online-guide",
    category: "PDF Guide",
    title: "How to Split Specific Pages From a PDF for Form Uploads",
    summary: "Extract only the needed pages from a large PDF before uploading to a college or government portal.",
    date: "2026-05-04",
    readTime: "4 min read",
    keywords: "split pdf online, extract pages from pdf, upload selected pages only",
    ctaLabel: "Open Split PDF",
    ctaRoute: "/pdf/split",
    intro:
      "Sometimes only one page of a larger PDF is needed. Splitting avoids unnecessary upload size and keeps the submission cleaner.",
    sections: [
      {
        heading: "Best use cases",
        paragraphs: [
          "Extracting one marksheet page, one ID page, or selected pages from a multi-page certificate bundle.",
          "Removing unrelated pages can also reduce the final file size significantly before upload.",
        ],
      },
      {
        heading: "Use page ranges carefully",
        paragraphs: [
          "Always double-check page numbers before exporting. A single wrong range can produce the wrong file even if the split process succeeds.",
          "If the portal wants multiple pages together, extract the exact range and then compress only the result if needed.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I extract non-consecutive pages?",
        a: "Yes. You can use page lists such as 1,3,5-7 if the tool supports range parsing.",
      },
    ],
  },
  {
    slug: "convert-png-webp-heic-to-jpg-guide",
    category: "Image Guide",
    title: "How to Convert PNG, WEBP, HEIC, or JFIF to JPG for Upload Forms",
    summary: "Many exam and office portals still prefer JPG. This guide explains when conversion is required and how to do it cleanly.",
    date: "2026-05-04",
    readTime: "5 min read",
    keywords: "png to jpg online, webp to jpg, heic to jpg, jfif to jpg",
    ctaLabel: "Open Image Converter",
    ctaRoute: "/tool/imgconvert",
    intro:
      "Modern phones save photos in formats that many older portals do not accept. JPG is still the safest upload format for many official websites.",
    sections: [
      {
        heading: "Why JPG still matters",
        paragraphs: [
          "JPG is widely supported by government portals, job forms, and student upload systems.",
          "Even when a website says image upload, the backend may silently reject WEBP or HEIC files.",
        ],
      },
      {
        heading: "When PDF also needs conversion",
        paragraphs: [
          "Sometimes users only have a one-page PDF scan and need an image output. In that case, converting the first PDF page to JPG is the fastest practical fix.",
          "After conversion, the image can be resized, compressed, or merged depending on the next step.",
        ],
      },
    ],
    faqs: [
      {
        q: "Will converting to JPG reduce transparency?",
        a: "Yes. JPG does not support transparency, so transparent areas are flattened into a solid background.",
      },
    ],
  },
  {
    slug: "ssc-cgl-photo-signature-size-guide",
    category: "Exam Guide",
    title: "SSC CGL Photo and Signature Resize Guide for Online Form Upload",
    summary: "A practical SSC CGL upload guide covering photo size, signature size, and common rejection mistakes.",
    date: "2026-05-04",
    readTime: "6 min read",
    keywords: "ssc cgl photo resize, ssc cgl signature resize, ssc cgl photo size",
    ctaLabel: "Open SSC CGL Guide",
    ctaRoute: "/exam/ssc-cgl",
    intro:
      "SSC uploads are sensitive to both dimensions and file size. A clean source file saves time and reduces failed upload attempts.",
    sections: [
      {
        heading: "Common SSC upload mistakes",
        paragraphs: [
          "Low-light photos, cropped social-media pictures, and oversized signatures create the most repeated issues.",
          "Even when the file uploads, a poor source can still create a visually weak final image.",
        ],
      },
      {
        heading: "Safer preparation workflow",
        paragraphs: [
          "Use the exam-specific photo and signature tools instead of manually guessing width, height, and KB targets.",
          "If you later need one combined file, move to the merger tool only after both files are already valid individually.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I resize manually for SSC CGL?",
        a: "Manual resizing is possible, but the exam-specific tool is safer because it starts from the expected SSC flow.",
      },
    ],
  },
  {
    slug: "upsc-cds-photo-signature-guide",
    category: "Exam Guide",
    title: "UPSC CDS Photo Resize and Signature Guide for the Application Form",
    summary: "A focused guide on preparing UPSC CDS photo and signature files before the final upload window.",
    date: "2026-05-04",
    readTime: "5 min read",
    keywords: "upsc cds photo resize, upsc cds signature size, cds photo upload guide",
    ctaLabel: "Open UPSC CDS Guide",
    ctaRoute: "/exam/upsc-cds",
    intro:
      "UPSC applicants often need cleaner source files because higher photo limits still do not fix bad framing or dark backgrounds.",
    sections: [
      {
        heading: "What matters most for CDS photos",
        paragraphs: [
          "A front-facing, clear, recent photo with visible facial features works far better than a low-resolution crop.",
          "If the background is messy, start with a cleaner original photo instead of forcing repeated compression.",
        ],
      },
      {
        heading: "How to avoid last-minute retries",
        paragraphs: [
          "Prepare the photo and signature before the final day. Most upload stress happens when users discover size problems at the last moment.",
          "Use the exam page as a checklist so you do not switch between multiple sites and guessed sizes.",
        ],
      },
    ],
    faqs: [
      {
        q: "Can I use the same photo for multiple UPSC forms?",
        a: "Usually yes if it remains within each form's requirements, but always recheck the latest portal instructions.",
      },
    ],
  },
  {
    slug: "passport-photo-sheet-print-guide",
    category: "Printing Guide",
    title: "How to Create a Passport Photo Sheet for Print at Home or a Shop",
    summary: "Arrange multiple passport-size copies on one sheet for print, cutting, and document submission.",
    date: "2026-05-04",
    readTime: "5 min read",
    keywords: "passport photo sheet maker, multiple passport photos on one page, print passport photo sheet",
    ctaLabel: "Open Passport Sheet Maker",
    ctaRoute: "/tool/passport-sheet",
    intro:
      "A photo sheet is useful when you need several copies for forms, ID cards, coaching records, or document sets.",
    sections: [
      {
        heading: "Choose the right print layout",
        paragraphs: [
          "A4 works well for more copies, while 4x6 can be practical for small photo print jobs.",
          "Cut guides help if you plan to trim the sheet manually after printing.",
        ],
      },
      {
        heading: "Why this tool matters for traffic too",
        paragraphs: [
          "Passport photo sheet queries have stable demand because they are not limited to one exam season.",
          "This makes the tool useful for both aspirants and general document users.",
        ],
      },
    ],
    faqs: [
      {
        q: "How many copies should I place on one sheet?",
        a: "It depends on the print size and your need. Common options are 4, 6, 8, or 12 copies.",
      },
    ],
  },
  {
    slug: "signature-cleaner-guide",
    category: "Signature Guide",
    title: "How to Clean a Signature Image for Online Form Uploads",
    summary: "Remove gray background noise, trim margins, and prepare a clearer signature file before resizing.",
    date: "2026-05-04",
    readTime: "4 min read",
    keywords: "signature cleaner online, clean signature image, black signature upload",
    ctaLabel: "Open Signature Cleaner",
    ctaRoute: "/tool/sigclean",
    intro:
      "A poor signature scan causes more trouble than many users expect. Cleaning first often makes the final resize easier and sharper.",
    sections: [
      {
        heading: "What a cleaner signature helps with",
        paragraphs: [
          "Less gray background, tighter crop, and better contrast for upload previews.",
          "A cleaner input also reduces file weight more predictably during final export.",
        ],
      },
      {
        heading: "When to resize after cleaning",
        paragraphs: [
          "If the signature image is noisy, clean it first and resize second.",
          "If the signature is already sharp and only too large, direct resize may be enough.",
        ],
      },
    ],
    faqs: [
      {
        q: "Does cleaning replace signature resizing?",
        a: "No. Cleaning improves clarity, while resize adjusts dimensions and file size.",
      },
    ],
  },
  {
    slug: "images-to-pdf-guide",
    category: "PDF Guide",
    title: "How to Combine Images Into One PDF for Form and Document Uploads",
    summary: "Turn multiple JPG, PNG, or WEBP files into one PDF in the correct order for submission.",
    date: "2026-05-04",
    readTime: "4 min read",
    keywords: "images to pdf online, jpg to pdf for documents, combine images into one pdf",
    ctaLabel: "Open Images to PDF",
    ctaRoute: "/pdf/image-to-pdf",
    intro:
      "This is one of the most common document tasks when a portal accepts one PDF but your files are still separate images.",
    sections: [
      {
        heading: "Best use cases",
        paragraphs: [
          "Joining front and back scans, multiple certificates, or a group of mobile photos into one PDF.",
          "Keeping the order correct matters, especially for KYC, verification, and admission flows.",
        ],
      },
      {
        heading: "Before final download",
        paragraphs: [
          "Check orientation, page order, and whether the resulting PDF needs compression afterward.",
          "If the portal has a tight limit, convert first and compress the final PDF second.",
        ],
      },
    ],
    faqs: [
      {
        q: "Should I combine all images first or compress each image separately?",
        a: "Usually combine first, then evaluate the final PDF size before doing extra compression.",
      },
    ],
  },
];

export const BLOG_POST_MAP = Object.fromEntries(BLOG_POSTS.map((post) => [post.slug, post]));

export function getBlogPostBySlug(slug) {
  return BLOG_POST_MAP[slug] || null;
}
