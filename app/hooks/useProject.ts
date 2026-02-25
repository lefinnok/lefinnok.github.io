import { projects } from "~/data/projects";
import type { Project } from "~/lib/types";

export function useProject(slug: string): { project: Project | null } {
  const project = projects.find((p) => p.slug === slug) ?? null;
  return { project };
}
