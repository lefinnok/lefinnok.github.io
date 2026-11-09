import { Navigate } from "react-router";

export const meta = () => [
  { title: "Redirecting | Lefinno Kwok" },
  { name: "robots", content: "noindex" },
  { httpEquiv: "refresh", content: "0; url=/engineering" },
];

export default function LegacyProjectsRedirect() {
  return <Navigate to="/engineering" replace />;
}
