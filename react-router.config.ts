import type { Config } from "@react-router/dev/config";

export default {
  ssr: false,
  prerender: [
    "/",
    "/projects",
    "/projects/uml-diagram-generator",
    "/projects/nass-ocelli",
    "/projects/8-bit-transistor-computer",
    "/projects/gesture-recognition",
    "/projects/ld42-space-saver",
    "/projects/ld58-eccentricity",
    "/projects/ggj26-binmin",
    "/projects/retro-handheld",
    "/about",
  ],
} satisfies Config;
