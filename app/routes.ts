import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("engineering", "routes/engineering.tsx"),
  route("engineering/case/:slug", "routes/case-study.tsx", { id: "engineering-case" }),
  route("craft", "routes/craft.tsx"),
  route("craft/case/:slug", "routes/case-study.tsx", { id: "craft-case" }),
  route("craft/:slug", "routes/craft-project.tsx"),
  route("demos", "routes/demos.tsx"),
  route("demos/:slug", "routes/demo-detail.tsx", { id: "demo-detail" }),
  route("about", "routes/about.tsx"),
  route("contact", "routes/contact.tsx"),
  route("projects", "routes/projects.tsx"),
  route("projects/:slug", "routes/project-detail.tsx"),
] satisfies RouteConfig;
