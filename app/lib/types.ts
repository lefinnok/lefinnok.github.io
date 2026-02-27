export interface ProjectLink {
  label: string;
  url: string;
  type: "github" | "demo" | "report" | "external" | "play";
}

export interface ProjectModelConfig {
  path: string;
  cameraZ: number;
  cameraY: number;
  scale?: number;
}

export interface Project {
  slug: string;
  title: string;
  shortDescription: string;
  longDescription: string;
  tags: string[];
  date: string;
  sortOrder: number;
  featured: boolean;
  ongoing: boolean;
  links: ProjectLink[];
  model?: ProjectModelConfig;
  hasInteractiveDemo: boolean;
  demoComponentName?: string;
  itchEmbed?: {
    id: number;
    title: string;
    url: string;
  };
  steamAppId?: number;
}

export type SkillCategory =
  | "languages-frameworks"
  | "hardware-embedded"
  | "ai-ml-cv"
  | "gamedev-creative"
  | "management-leadership"
  | "business-finance";

export interface Skill {
  name: string;
  proficiency: number;
  icon?: string;
  yearsUsed?: number;
  hasDemo: boolean;
  demoComponentName?: string;
}

export interface SkillGroup {
  id: SkillCategory;
  label: string;
  description: string;
  icon: string;
  skills: Skill[];
}

export interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export interface Bio {
  name: string;
  title: string;
  summary: string;
  paragraphs: string[];
  socialLinks: SocialLink[];
}
