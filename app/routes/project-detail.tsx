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

export const meta = ({ params }: { params: { slug?: string } }) => {
  const to = MAP[params.slug ?? ""] ?? "/";
  return [
    { title: "Redirecting | Lefinno Kwok" },
    { name: "robots", content: "noindex" },
    { httpEquiv: "refresh", content: `0; url=${to}` },
  ];
};

export default function LegacyProjectRedirect() {
  const { slug } = useParams();
  return <Navigate to={MAP[slug ?? ""] ?? "/"} replace />;
}
