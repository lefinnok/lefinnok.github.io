import { Navigate, useParams } from "react-router";

const MAP: Record<string, string> = {
  "uml-diagram-generator": "/engineering",
  "nass-ocelli": "/engineering",
  "8-bit-transistor-computer": "/craft/8-bit-computer",
  "gesture-recognition": "/craft/gesture-recognition",
  "ld42-space-saver": "/craft/space-saver",
  "ld58-eccentricity": "/craft/eccentricity",
  "ggj26-binmin": "/craft/binmin",
  "retro-handheld": "/craft/retro-handheld",
};

export default function LegacyProjectRedirect() {
  const { slug } = useParams();
  return <Navigate to={MAP[slug ?? ""] ?? "/craft"} replace />;
}
