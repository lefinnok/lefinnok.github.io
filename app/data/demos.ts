export type DemoTone = "ink" | "paper";

export interface DemoEntry {
  slug: string;
  title: string;
  kicker: string;
  description: string;
  tone: DemoTone;
  component?: string;
  href?: string;
  related?: { label: string; url: string };
  tags: string[];
}

export const demos: DemoEntry[] = [
  {
    slug: "cpu-simulator",
    title: "8-bit CPU simulator",
    kicker: "Simulation",
    description:
      "A computer built from discrete transistor logic. Step the microcode, run a program, edit assembly and watch the bus.",
    tone: "ink",
    component: "TransistorSimulator",
    related: { label: "The build", url: "/craft/8-bit-computer" },
    tags: ["CPU", "Assembly", "Hardware"],
  },
  {
    slug: "gesture-recognition",
    title: "Gesture recognition",
    kicker: "Computer vision",
    description:
      "One reference image, no training. The recogniser compares hand graphs by their Laplacian spectra, live from a webcam.",
    tone: "ink",
    component: "GestureRecognitionDemo",
    related: { label: "The project", url: "/craft/gesture-recognition" },
    tags: ["Vision", "MediaPipe", "Graphs"],
  },
  {
    slug: "uml-generator",
    title: "UML generator",
    kicker: "Language models",
    description:
      "Describe a system in natural language and iterate with a model until the class diagram matches what you meant.",
    tone: "ink",
    component: "UmlGeneratorDemo",
    related: { label: "Engineering", url: "/engineering" },
    tags: ["LLM", "Diagrams", "Product"],
  },
  {
    slug: "ml-playground",
    title: "ML playground",
    kicker: "Machine learning",
    description:
      "Draw a digit and classify it, or train a small classifier and watch the decision boundary move as it learns.",
    tone: "ink",
    component: "MlPlaygroundDemo",
    related: { label: "Craft", url: "/craft" },
    tags: ["TensorFlow", "Training", "Digits"],
  },
  {
    slug: "cnn-visualiser",
    title: "CNN visualiser",
    kicker: "Machine learning",
    description:
      "A convolutional network reading digits in three dimensions: layers, weights, activations and the decision.",
    tone: "ink",
    component: "CnnDemo",
    related: { label: "Craft", url: "/craft" },
    tags: ["CNN", "Three.js", "Inference"],
  },
  {
    slug: "service-architecture",
    title: "Service architecture",
    kicker: "Diagram",
    description:
      "The architecture I reach for: typed clients, a gateway, service boundaries and a build path, with each module tied to a language.",
    tone: "ink",
    component: "LanguagesDiagram",
    related: { label: "Engineering", url: "/engineering" },
    tags: ["Systems", "Go", "Rust"],
  },
  {
    slug: "hardware-pipeline",
    title: "Hardware pipeline",
    kicker: "Diagram",
    description:
      "From schematic to firmware to assembly, with the tools I actually use at each stage and where the branches rejoin.",
    tone: "ink",
    component: "HardwarePipelineDiagram",
    related: { label: "Craft", url: "/craft" },
    tags: ["PCB", "Firmware", "Fabrication"],
  },
  {
    slug: "3d-models",
    title: "3D model gallery",
    kicker: "3D",
    description:
      "Wireframe models from the projects: the Eccentricity dynamo, the transistor computer, the handheld, Binmin's mask and more.",
    tone: "ink",
    href: "/craft",
    related: { label: "Browse the craft pages", url: "/craft" },
    tags: ["Three.js", "Models", "Projects"],
  },
];

export function getDemo(slug: string): DemoEntry | undefined {
  return demos.find((demo) => demo.slug === slug);
}
