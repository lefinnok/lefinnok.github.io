import type { Config } from "@react-router/dev/config";
import { caseStudies } from "./app/data/caseStudies";
import { craftProjects } from "./app/data/craftProjects";

const caseSlugs = caseStudies.map(
  (study) => `/${study.track}/case/${study.slug}`,
);

// Eccentricity has a case study; its project route redirects there and is not
// prerendered, to avoid two indexable pages for the same content.
const craftSlugs = craftProjects
  .filter((project) => project.slug !== "eccentricity")
  .map((project) => `/craft/${project.slug}`);

export default {
  ssr: false,
  prerender: [
    "/",
    "/engineering",
    "/craft",
    "/about",
    "/contact",
    "/projects",
    ...caseSlugs,
    ...craftSlugs,
  ],
} satisfies Config;
