import type { CraftProject } from "~/lib/content";

export const craftProjects: CraftProject[] = [
  {
    slug: "eccentricity",
    title: "Eccentricity",
    year: "2026",
    summary:
      "Steampunk engineering roguelike. Jam prototype to Steam release, with a data pipeline, tests and a repeatable release process.",
    tags: ["Commercial", "Godot", "Steam"],
    art: "arch",
    links: [{ label: "Case study", url: "/craft/eccentricity" }],
  },
  {
    slug: "8-bit-computer",
    title: "8-bit Transistor Computer",
    year: "2020",
    summary:
      "A working computer from discrete transistor logic: an original 11-transistor adder, a custom instruction set and a browser simulator.",
    tags: ["Hardware", "Systems"],
    art: "grid",
    demo: "TransistorSimulator",
  },
  {
    slug: "binmin",
    title: "Binmin",
    year: "2026",
    summary:
      "A colour-swap rhythm game built in three days for Global Game Jam 2026, with 38 scenes and a browser build.",
    tags: ["Jam", "Rhythm"],
    art: "waves",
    links: [{ label: "Play", url: "https://lefinno.itch.io/binmin" }],
  },
  {
    slug: "gesture-recognition",
    title: "Gesture Recognition",
    year: "2020, 2022",
    summary:
      "A gesture recogniser that needs no training data, deployed in an interactive projection-mapping installation.",
    tags: ["Computer vision", "Installation"],
    art: "connector",
    demo: "GestureRecognitionDemo",
  },
  {
    slug: "retro-handheld",
    title: "Retro Handheld",
    year: "2022",
    summary:
      "A handheld console built from scratch: custom PCB, embedded firmware and a 3D-printed enclosure.",
    tags: ["PCB", "Firmware"],
    art: "arch",
    links: [
      {
        label: "Report",
        url: "https://drive.google.com/file/d/18XjOOtjTWs_L05xXd1XclnCL-5F6Ao8k/view",
      },
    ],
  },
  {
    slug: "space-saver",
    title: "Space Saver",
    year: "2018",
    summary:
      "The first game I shipped: a Ludum Dare shooter built in high school, including models, music and sound.",
    tags: ["Jam", "Unity"],
    art: "waves",
    links: [{ label: "Play", url: "https://lefinno.itch.io/space-saver" }],
  },
];

export function getCraftProject(slug: string): CraftProject | undefined {
  return craftProjects.find((project) => project.slug === slug);
}
