import { projects } from "~/data/projects";
import type { Project } from "~/lib/types";

export function useProjects(): { projects: Project[] } {
  return {
    projects: [...projects].sort((a, b) => a.sortOrder - b.sortOrder),
  };
}
