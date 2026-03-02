// ── Language Domains (color groupings) ──────────────────────────

export interface LanguageDomain {
  id: string;
  label: string;
  useCase: string;
  color: string;
}

export const LANGUAGE_DOMAINS: LanguageDomain[] = [
  {
    id: "react-ts",
    label: "React / TypeScript",
    useCase: "Frontend & UI",
    color: "#38bdf8",
  },
  {
    id: "go",
    label: "Go",
    useCase: "General Services",
    color: "#00e5ff",
  },
  {
    id: "rust",
    label: "Rust",
    useCase: "Critical Services",
    color: "#f97316",
  },
  {
    id: "python",
    label: "Python",
    useCase: "Scripting & ML",
    color: "#4ade80",
  },
  {
    id: "cpp",
    label: "C / C++",
    useCase: "Firmware & Algorithms",
    color: "#a78bfa",
  },
  {
    id: "gdscript",
    label: "GDScript / C#",
    useCase: "Game Development",
    color: "#f472b6",
  },
];

// Quick lookup: domainId → domain
export const DOMAIN_MAP = Object.fromEntries(
  LANGUAGE_DOMAINS.map((d) => [d.id, d])
) as Record<string, LanguageDomain>;

// ── Architecture Modules (boxes in the SVG) ─────────────────────

export interface ArchModule {
  id: string;
  label: string;
  sublabel?: string;
  domainId: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export const ARCH_MODULES: ArchModule[] = [
  // Client tier
  {
    id: "web-dashboard",
    label: "Web Dashboard",
    sublabel: "React + TS",
    domainId: "react-ts",
    x: 60, y: 40, w: 150, h: 56,
  },
  {
    id: "admin-panel",
    label: "Admin Panel",
    sublabel: "React + TS",
    domainId: "react-ts",
    x: 240, y: 40, w: 150, h: 56,
  },
  {
    id: "game-client",
    label: "Game Client",
    sublabel: "GDScript + C#",
    domainId: "gdscript",
    x: 640, y: 40, w: 150, h: 56,
  },

  // Gateway tier
  {
    id: "api-gateway",
    label: "API Gateway",
    sublabel: "Go",
    domainId: "go",
    x: 240, y: 150, w: 150, h: 56,
  },

  // Services tier
  {
    id: "auth-service",
    label: "Auth Service",
    sublabel: "Rust",
    domainId: "rust",
    x: 60, y: 260, w: 150, h: 56,
  },
  {
    id: "payment-service",
    label: "Payment Service",
    sublabel: "Rust",
    domainId: "rust",
    x: 240, y: 260, w: 150, h: 56,
  },
  {
    id: "game-server",
    label: "Game Server",
    sublabel: "Go",
    domainId: "go",
    x: 500, y: 260, w: 150, h: 56,
  },

  // Data / Hardware tier
  {
    id: "data-pipeline",
    label: "Data Pipeline",
    sublabel: "Python",
    domainId: "python",
    x: 60, y: 380, w: 150, h: 56,
  },
  {
    id: "ml-recommender",
    label: "ML Recommender",
    sublabel: "Python",
    domainId: "python",
    x: 240, y: 380, w: 150, h: 56,
  },
  {
    id: "build-scripts",
    label: "Build & Tooling",
    sublabel: "Python",
    domainId: "python",
    x: 420, y: 380, w: 150, h: 56,
  },
  {
    id: "firmware-controller",
    label: "IoT Controller",
    sublabel: "C / C++",
    domainId: "cpp",
    x: 640, y: 380, w: 150, h: 56,
  },
];

// Quick lookup: moduleId → module
export const MODULE_MAP = Object.fromEntries(
  ARCH_MODULES.map((m) => [m.id, m])
) as Record<string, ArchModule>;

// ── Connections (data flow arrows) ──────────────────────────────

export interface ArchConnection {
  from: string;
  to: string;
  label?: string;
}

export const ARCH_CONNECTIONS: ArchConnection[] = [
  // Client → Gateway
  { from: "web-dashboard", to: "api-gateway", label: "REST" },
  { from: "admin-panel", to: "api-gateway", label: "REST" },

  // Gateway → Services
  { from: "api-gateway", to: "auth-service", label: "gRPC" },
  { from: "api-gateway", to: "payment-service", label: "gRPC" },
  { from: "api-gateway", to: "game-server", label: "gRPC" },

  // Game client → Game server direct
  { from: "game-client", to: "game-server", label: "WebSocket" },

  // Services → Data
  { from: "auth-service", to: "data-pipeline" },
  { from: "payment-service", to: "data-pipeline" },
  { from: "game-server", to: "ml-recommender" },
  { from: "data-pipeline", to: "ml-recommender" },

  // Game server → firmware
  { from: "game-server", to: "firmware-controller", label: "MQTT" },

  // Build scripts → services (deploy)
  { from: "build-scripts", to: "auth-service" },
  { from: "build-scripts", to: "game-server" },
];

// ── Tier labels ─────────────────────────────────────────────────

export const TIER_LABELS = [
  { label: "CLIENTS", y: 68 },
  { label: "GATEWAY", y: 178 },
  { label: "SERVICES", y: 288 },
  { label: "DATA / INFRA", y: 408 },
] as const;

export const TIER_LINES = [120, 230, 350] as const;
