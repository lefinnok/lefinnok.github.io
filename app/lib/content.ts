export type Track = "engineering" | "craft";

export type FigureKind =
  | "pipeline"
  | "evaluation"
  | "workspaces"
  | "commitgraph"
  | "architecture";

export interface Role {
  period: string;
  org: string;
  title: string;
  summary: string;
  tags?: string[];
}

export interface CaseSection {
  id: string;
  heading: string;
  paragraphs: string[];
  bullets?: string[];
  figure?: { kind: FigureKind; caption: string };
}

export interface CaseStudy {
  slug: string;
  track: Track;
  title: string;
  subtitle: string;
  lede: string;
  meta: { label: string; value: string }[];
  sections: CaseSection[];
  outcome: string[];
  links?: { label: string; url: string }[];
}

export interface CraftProject {
  slug: string;
  title: string;
  year: string;
  summary: string;
  tags: string[];
  art: "arch" | "waves" | "grid" | "connector";
  thumbnail?: string;
  model?: {
    path: string;
    cameraZ: number;
    cameraY: number;
    scale?: number;
    initialRotation?: number;
    wireframe?: boolean;
    label?: string;
    dimensions?: string;
  };
  details?: string[];
  links?: { label: string; url: string }[];
  demo?: string;
}
