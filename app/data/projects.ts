import type { Project } from "~/lib/types";

export const projects: Project[] = [
  {
    slug: "uml-diagram-generator",
    title: "UML Diagram Generator",
    shortDescription:
      "A web application that assists users in drawing UML class diagrams using natural language prompts.",
    longDescription:
      "A web application that assists users in drawing UML class diagrams using natural language prompts. The application uses an iterative user-driven approach to allow users to work collaboratively with large language models to generate diagrams tailored to their specific needs. Through comprehensive testing, we identified optimal configurations for different kinds of applications and use cases.",
    tags: [
      "natural-language-processing",
      "llm",
      "javascript",
      "react",
      "diagram-generation",
      "web-application",
      "uml",
      "software-engineering",
    ],
    date: "Q1 2025",
    sortOrder: 1,
    featured: true,
    ongoing: true,
    links: [
      {
        label: "Visit Project",
        url: "https://hku202425fyp24050-rcexv.kinsta.app/",
        type: "demo",
      },
    ],
    model: { path: "/models/uml_generator.fbx", cameraZ: 60, cameraY: 0 },
    hasInteractiveDemo: false,
  },
  {
    slug: "nass-ocelli",
    title: "[NASS] Ocelli",
    shortDescription:
      "A small and robust platform and framework for employing computer vision on surveying, location mapping, and reverse-AR applications.",
    longDescription:
      "A small and robust platform and framework for employing computer vision on surveying, location mapping, and reverse-ar applications. Currently in development for the NASS Drone project.",
    tags: [
      "computer-vision",
      "embedded-development",
      "machine-learning",
      "IOT",
      "opencv",
      "mediapipe",
      "python",
      "c++",
    ],
    date: "Late 2023",
    sortOrder: 2,
    featured: false,
    ongoing: false,
    links: [
      {
        label: "NASS Instagram",
        url: "https://www.instagram.com/nasshku/",
        type: "external",
      },
    ],
    model: { path: "/models/Ocelli.fbx", cameraZ: 60, cameraY: -6 },
    hasInteractiveDemo: false,
  },
  {
    slug: "8-bit-transistor-computer",
    title: "8-bit Transistor Computer",
    shortDescription:
      "A practice and passion project exploring basic low level computer architecture.",
    longDescription:
      "A practice and passion project for exploring basic low level computer architecture during the spring and summers of 2020. A detailed project report can be found below.",
    tags: [
      "computer-architecture",
      "low-level-computing",
      "instruction-set",
      "electronics",
      "11-T-full-adder",
    ],
    date: "Early-Mid 2020",
    sortOrder: 3,
    featured: false,
    ongoing: false,
    links: [
      {
        label: "Project Report",
        url: "https://drive.google.com/drive/folders/14p-HwvDzRF4q1wWnCwneI4SFRlhN_Nqr?usp=sharing",
        type: "report",
      },
    ],
    model: { path: "/models/Transistor.fbx", cameraZ: 80, cameraY: -30 },
    hasInteractiveDemo: true,
    demoComponentName: "TransistorSimulator",
  },
  {
    slug: "gesture-recognition",
    title: "Gesture Recognition",
    shortDescription:
      "A gesture recognition algorithm utilizing graph comparison methods, applied to interactive arts.",
    longDescription:
      "A gesture recognition algorithm first developed as a practice project, utilizing some graph comparison method from various academic sources, transposing them into python. Later it was applied to an interactive arts project and altered to accept full body gesture recognition.",
    tags: [
      "computer-vision",
      "python",
      "single-reference",
      "quick-deployment",
      "art-application",
      "hand-recognition",
      "body-recognition",
    ],
    date: "Late 2020, Late 2022",
    sortOrder: 4,
    featured: false,
    ongoing: false,
    links: [
      {
        label: "GitHub",
        url: "https://github.com/lefinnok/Hand-Recognition",
        type: "github",
      },
      {
        label: "Model Credit",
        url: "https://sketchfab.com/3d-models/hand-low-poly-d6c802a74a174c8c805deb20186d1877",
        type: "external",
      },
    ],
    model: { path: "/models/Gesture.fbx", cameraZ: 10, cameraY: 0 },
    hasInteractiveDemo: true,
    demoComponentName: "GestureRecognitionDemo",
  },
  {
    slug: "ld42-space-saver",
    title: "[LD42] Space Saver",
    shortDescription:
      "A game jam game developed during high school for Ludum Dare 42.",
    longDescription:
      "One of my earliest projects, a game jam game developed in the middle of high school. A lot was learned on the go, and new concepts and ideas were introduced. The memories are certainly fond.",
    tags: [
      "game-development",
      "game-design",
      "3d-modeling",
      "music-composition",
      "sound-design",
      "c-sharp",
    ],
    date: "August 2018",
    sortOrder: 5,
    featured: false,
    ongoing: false,
    links: [
      {
        label: "Project Listing",
        url: "https://ldjam.com/events/ludum-dare/42/space-saver",
        type: "external",
      },
      {
        label: "Code Base",
        url: "https://drive.google.com/drive/folders/1nNS5bGq2mdb4g2cjW25cR6dOHNJ3b7N_?usp=sharing",
        type: "report",
      },
      {
        label: "Play the Game",
        url: "https://lefinno.itch.io/space-saver",
        type: "play",
      },
    ],
    model: { path: "/models/SpaceDef.fbx", cameraZ: 26, cameraY: 0 },
    hasInteractiveDemo: false,
  },
  {
    slug: "retro-handheld",
    title: "Retro Handheld",
    shortDescription:
      "A retro style handheld device built from scratch with microcontrollers and custom PCB.",
    longDescription:
      "A final year project, developing a retro style handheld device from scratch with microcontrollers and other electronic components, mounted on a custom made pcb.",
    tags: [
      "pcb-design",
      "systems-design",
      "software-engineering",
      "operating-systems",
      "embedded-development",
      "3d-printing",
      "c++",
      "esp32",
      "product-design",
    ],
    date: "Early 2022",
    sortOrder: 6,
    featured: false,
    ongoing: false,
    links: [
      {
        label: "Project Report",
        url: "https://drive.google.com/file/d/18XjOOtjTWs_L05xXd1XclnCL-5F6Ao8k/view?usp=sharing",
        type: "report",
      },
    ],
    model: { path: "/models/Handheld.fbx", cameraZ: 100, cameraY: -10 },
    hasInteractiveDemo: false,
  },
];
