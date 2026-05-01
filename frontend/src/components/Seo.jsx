import { useEffect } from "react";

const ensureTag = (selector, createTag) => {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = createTag();
    document.head.appendChild(node);
  }
  return node;
};

const setMeta = (attr, key, value) => {
  const selector = `meta[${attr}="${key}"]`;
  const node = ensureTag(selector, () => {
    const meta = document.createElement("meta");
    meta.setAttribute(attr, key);
    return meta;
  });
  node.setAttribute("content", value);
};

export default function Seo({ title, description, canonical, keywords, type = "website", ldJson = [] }) {
  useEffect(() => {
    if (title) {
      document.title = title;
      setMeta("property", "og:title", title);
      setMeta("name", "twitter:title", title);
    }

    if (description) {
      setMeta("name", "description", description);
      setMeta("property", "og:description", description);
      setMeta("name", "twitter:description", description);
    }

    if (keywords) {
      setMeta("name", "keywords", keywords);
    }

    setMeta("property", "og:type", type);
    setMeta("name", "robots", "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1");

    if (canonical) {
      const link = ensureTag('link[rel="canonical"]', () => {
        const el = document.createElement("link");
        el.setAttribute("rel", "canonical");
        return el;
      });
      link.setAttribute("href", canonical);
      setMeta("property", "og:url", canonical);
    }

    const scriptIds = [];
    ldJson
      .filter(Boolean)
      .forEach((entry, index) => {
        const id = `ff-seo-jsonld-${index}`;
        scriptIds.push(id);
        const script = ensureTag(`script[data-ff-seo="${id}"]`, () => {
          const el = document.createElement("script");
          el.type = "application/ld+json";
          el.dataset.ffSeo = id;
          return el;
        });
        script.textContent = JSON.stringify(entry);
      });

    return () => {
      scriptIds.forEach((id) => {
        const node = document.head.querySelector(`script[data-ff-seo="${id}"]`);
        if (node) node.remove();
      });
    };
  }, [canonical, description, keywords, ldJson, title, type]);

  return null;
}
