import type { SkillGroup } from "~/lib/types";

export const skillGroups: SkillGroup[] = [
  {
    id: "languages-frameworks",
    label: "Languages & Frameworks",
    description: "Core programming languages and web/application frameworks",
    icon: "Code",
    skills: [
      { name: "TypeScript / JavaScript", proficiency: 90, hasDemo: false },
      { name: "Python", proficiency: 85, hasDemo: false },
      { name: "C / C++", proficiency: 75, hasDemo: false },
      { name: "C#", proficiency: 70, hasDemo: false },
      { name: "React", proficiency: 85, hasDemo: false },
      { name: "Node.js", proficiency: 80, hasDemo: false },
    ],
  },
  {
    id: "hardware-embedded",
    label: "Hardware & Embedded",
    description: "PCB design, microcontrollers, low-level systems, and IoT",
    icon: "Memory",
    skills: [
      { name: "PCB Design", proficiency: 70, hasDemo: false },
      { name: "ESP32 / Arduino", proficiency: 80, hasDemo: false },
      { name: "Computer Architecture", proficiency: 75, hasDemo: false },
      { name: "Embedded C/C++", proficiency: 70, hasDemo: false },
      { name: "IoT Systems", proficiency: 65, hasDemo: false },
    ],
  },
  {
    id: "ai-ml-cv",
    label: "AI / ML & Computer Vision",
    description: "Machine learning, NLP, LLMs, and computer vision applications",
    icon: "Psychology",
    skills: [
      { name: "Computer Vision (OpenCV)", proficiency: 80, hasDemo: false },
      { name: "MediaPipe", proficiency: 75, hasDemo: false },
      { name: "NLP / LLMs", proficiency: 70, hasDemo: false },
      { name: "Machine Learning", proficiency: 65, hasDemo: false },
    ],
  },
  {
    id: "gamedev-creative",
    label: "Game Dev & Creative",
    description: "Game development, 3D modeling, music, and creative coding",
    icon: "SportsEsports",
    skills: [
      { name: "Unity / C#", proficiency: 70, hasDemo: false },
      { name: "3D Modeling", proficiency: 60, hasDemo: false },
      { name: "Game Design", proficiency: 75, hasDemo: false },
      { name: "Music Composition", proficiency: 55, hasDemo: false },
      { name: "Three.js", proficiency: 65, hasDemo: false },
    ],
  },
  {
    id: "management-leadership",
    label: "Management & Leadership",
    description: "Project management, team leadership, and organizational skills",
    icon: "Groups",
    skills: [
      { name: "Project Management", proficiency: 80, hasDemo: false },
      { name: "Team Leadership", proficiency: 75, hasDemo: false },
      { name: "Agile / Scrum", proficiency: 70, hasDemo: false },
      { name: "Mentorship", proficiency: 70, hasDemo: false },
    ],
  },
  {
    id: "business-finance",
    label: "Business & Finance",
    description: "Business strategy, financial literacy, and entrepreneurship",
    icon: "Business",
    skills: [
      { name: "Business Strategy", proficiency: 65, hasDemo: false },
      { name: "Financial Literacy", proficiency: 60, hasDemo: false },
      { name: "Entrepreneurship", proficiency: 70, hasDemo: false },
    ],
  },
];
