import { Navigate } from "react-router";

export default function LegacyProjectsRedirect() {
  return <Navigate to="/engineering" replace />;
}
