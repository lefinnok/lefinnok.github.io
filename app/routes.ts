import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("projects", "routes/projects.tsx"),
  route("projects/:slug", "routes/project-detail.tsx"),
  route("about", "routes/about.tsx"),
  route("dev/effects", "routes/dev-effects.tsx"),
] satisfies RouteConfig;
