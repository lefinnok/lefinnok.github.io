import type { MetaDescriptor } from "react-router";

export const SITE_URL = "https://www.lefinnokwok.com";
export const SITE_NAME = "Lefinno Kwok";
export const OG_IMAGE = `${SITE_URL}/og-image.png`;
export const DEFAULT_DESCRIPTION =
  "Portfolio of Lefinno Kwok: AI systems, integration and research on one side, games, hardware and interactive work on the other.";

export function pageMeta({
  title,
  description = DEFAULT_DESCRIPTION,
  path,
}: {
  title: string;
  description?: string;
  path: string;
}): MetaDescriptor[] {
  const url = `${SITE_URL}${path}`;
  return [
    { title },
    { name: "description", content: description },
    { name: "theme-color", content: "#F2EFE9" },
    { tagName: "link", rel: "canonical", href: url },
    { property: "og:type", content: "website" },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: OG_IMAGE },
    { property: "og:image:width", content: "1200" },
    { property: "og:image:height", content: "630" },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:image", content: OG_IMAGE },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
  ];
}
