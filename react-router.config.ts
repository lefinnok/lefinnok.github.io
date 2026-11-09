import type { Config } from "@react-router/dev/config";

const caseSlugs = [
  "/engineering/case/pdss",
  "/engineering/case/ggjhk-platform",
  "/craft/case/eccentricity",
];

const craftSlugs = [
  "/craft/eccentricity",
  "/craft/8-bit-computer",
  "/craft/binmin",
  "/craft/gesture-recognition",
  "/craft/retro-handheld",
  "/craft/space-saver",
];

export default {
  ssr: false,
  prerender: [
    "/",
    "/engineering",
    "/craft",
    "/about",
    "/contact",
    ...caseSlugs,
    ...craftSlugs,
  ],
} satisfies Config;
