export const TOOL_CATEGORIES = [
  {
    id: "exam-tools",
    title: "Exam Tools",
    items: [
      { id: "passport-sheet", label: "Passport Photo Sheet", route: "/tool/passport-sheet", icon: "PS", desc: "Print multiple passport copies on one page", live: true, accent: "#a855f7" },
      { id: "ssc-cgl-tool", label: "SSC CGL Requirements", route: "/exam/ssc-cgl", icon: "SSC", desc: "Photo, signature and size guide", live: true, accent: "#60a5fa" },
      { id: "upsc-cds-tool", label: "UPSC CDS Requirements", route: "/exam/upsc-cds", icon: "UPSC", desc: "Exact image specs and checklist", live: true, accent: "#f59e0b" },
      { id: "neet-ug-tool", label: "NEET UG Requirements", route: "/exam/neet-ug", icon: "NEET", desc: "Upload rules and photo guidance", live: true, accent: "#22c55e" },
      { id: "jee-main-tool", label: "JEE Main Requirements", route: "/exam/jee-main", icon: "JEE", desc: "Portal image specs and guide", live: true, accent: "#8b5cf6" },
    ],
  },
  {
    id: "exam-pages",
    title: "Popular Exams",
    items: [
      { id: "ssc-cgl", label: "SSC CGL Photo & Signature", route: "/exam/ssc-cgl", icon: "SSC", desc: "3.5x4.5cm • 50KB", live: true, accent: "#60a5fa" },
      { id: "ssc-chsl", label: "SSC CHSL Photo & Signature", route: "/exam/ssc-chsl", icon: "CHSL", desc: "Ready upload requirements", live: true, accent: "#38bdf8" },
      { id: "upsc-cds", label: "UPSC CDS Photo Resize", route: "/exam/upsc-cds", icon: "UPSC", desc: "350x350px • 300KB", live: true, accent: "#f59e0b" },
      { id: "neet-ug", label: "NEET UG Photo Resize", route: "/exam/neet-ug", icon: "NEET", desc: "3.5x4.5cm • 200KB", live: true, accent: "#22c55e" },
      { id: "jee-main", label: "JEE Main Photo Size", route: "/exam/jee-main", icon: "JEE", desc: "3.5x4.5cm • 200KB", live: true, accent: "#8b5cf6" },
      { id: "ibps-clerk", label: "IBPS Clerk Photo & Signature", route: "/exam/ibps-clerk", icon: "IBPS", desc: "Bank exam upload guide", live: true, accent: "#06b6d4" },
    ],
  },
];

export const HOME_SECTIONS = [
  {
    id: "exam-quick-access",
    title: "Exam Quick Access",
    subtitle: "Start with exam-focused pages and print-ready utilities.",
    viewAllLabel: "All Exam Tools",
    viewAllRoute: "/all-tools",
    items: TOOL_CATEGORIES[0].items,
  },
  {
    id: "popular-exams",
    title: "Popular Exams",
    subtitle: "Photo and signature pages with exact specs.",
    items: TOOL_CATEGORIES[1].items,
  },
];

export function getCatalogTool(toolId) {
  for (const category of TOOL_CATEGORIES) {
    const match = category.items.find((item) => item.id === toolId);
    if (match) return { ...match, category: category.title };
  }
  return null;
}
