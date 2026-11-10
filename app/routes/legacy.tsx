import { Navigate, useLocation } from "react-router";

export const meta = () => [
  { title: "Redirecting | Lefinno Kwok" },
  { name: "robots", content: "noindex" },
  { httpEquiv: "refresh", content: "0; url=/#engineering" },
];

function target(pathname: string): string {
  if (pathname.startsWith("/engineering/case/") || pathname.startsWith("/craft/case/")) {
    return `/#case-${pathname.split("/").pop()}`;
  }
  if (pathname.startsWith("/demos/")) {
    return `/#demo-${pathname.split("/").pop()}`;
  }
  if (pathname.startsWith("/craft/")) {
    const slug = pathname.split("/").pop();
    return slug === "eccentricity" ? "/#case-eccentricity" : `/#project-${slug}`;
  }
  if (pathname.startsWith("/projects/")) {
    const slug = pathname.split("/").pop();
    const map: Record<string, string> = {
      "ld58-eccentricity": "/#case-eccentricity",
      "8-bit-transistor-computer": "/#project-8-bit-computer",
      "gesture-recognition": "/#project-gesture-recognition",
      "ggj26-binmin": "/#project-binmin",
      "ld42-space-saver": "/#project-space-saver",
      "retro-handheld": "/#project-retro-handheld",
    };
    return map[slug ?? ""] ?? "/#engineering";
  }
  if (pathname === "/craft") return "/#craft";
  if (pathname === "/demos") return "/#systems";
  if (pathname === "/about") return "/#about";
  if (pathname === "/contact") return "/#contact";
  if (pathname === "/engineering" || pathname === "/projects") return "/#engineering";
  return "/#engineering";
}

export default function LegacyRedirect() {
  const { pathname } = useLocation();
  return <Navigate to={target(pathname)} replace />;
}
