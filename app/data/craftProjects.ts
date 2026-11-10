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
    model: { path: "/models/dynamo.obj", cameraZ: 3.8, cameraY: 0, scale: 1.6 },
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
    model: { path: "/models/Transistor.fbx", cameraZ: 80, cameraY: -30 },
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
    model: { path: "/models/mask.obj", cameraZ: 6, cameraY: 3, scale: 1.5 },
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
    model: { path: "/models/Gesture.fbx", cameraZ: 10, cameraY: 0 },
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
    model: { path: "/models/Handheld.fbx", cameraZ: 100, cameraY: -10 },
    links: [
      {
        label: "Report",
        url: "https://drive.google.com/file/d/18XjOOtjTWs_L05xXd1XclnCL-5F6Ao8k/view",
      },
    ],
  },
  {
    slug: "intern-medallion",
    title: "Intern LED Medallion",
    year: "2024",
    summary:
      "A Bluetooth-controlled LED medallion for the 2024 HKSTP intern cohort: a KiCad-drawn, manufactured ESP32 board inside a FreeCAD chassis printed in resin and metal.",
    tags: ["Electronics", "PCB", "BLE", "3D printing"],
    art: "grid",
    model: {
      path: "/models/medallion.stl",
      cameraZ: 30,
      cameraY: -8,
      wireframe: false,
      scale: 0.1,
      initialRotation: 3.14159,
    },
    details: [
      "A 63mm circular board designed in KiCad around an ESP32-WROOM-32E and a TLC59116 16-channel LED driver, then manufactured for the 2024 HKSTP summer intern cohort.",
      "The chassis was modelled in FreeCAD and 3D printed in resin and metal. Firmware drives the display over I2C; a Flutter BLE app switches between appreciation and clock screens, with brightness and blink control.",
      "The viewer uses the full-assembly STL exported from the FreeCAD model.",
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
    model: { path: "/models/SpaceDef.fbx", cameraZ: 26, cameraY: 0 },
    links: [{ label: "Play", url: "https://lefinno.itch.io/space-saver" }],
  },
];

export function getCraftProject(slug: string): CraftProject | undefined {
  return craftProjects.find((project) => project.slug === slug);
}
