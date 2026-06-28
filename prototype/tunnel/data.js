// data.js — Project data for the tunnel portfolio

export const HERO_PROJECTS = [
  {
    id: '001',
    title: '8-BIT TRANSISTOR COMPUTER',
    blurb: 'An 11-transistor full-adder computer with a custom instruction set.',
    year: '2020',
    domain: 'HARDWARE',
    detail: 'Understanding computation by building it from scratch. This project involved designing and soldering an 11-transistor full-adder circuit, writing a custom instruction set architecture, and stepping through binary arithmetic by hand. A deep dive into how logic gates, ALUs, and instruction decoders actually work at the physical level.',
    tags: ['TRANSISTORS', 'ISA', 'DIGITAL LOGIC', 'SOLDERING'],
    links: [
      { label: 'GITHUB', url: 'https://github.com/lefinnok' },
    ],
  },
  {
    id: '002',
    title: 'GESTURE RECOGNITION',
    blurb: 'Graph-comparison algorithm for hand and full-body gesture recognition.',
    year: '2022',
    domain: 'CV \u00B7 ART',
    detail: 'A graph-comparison algorithm that maps skeletal joint data into a normalized graph structure, then scores similarity against stored gesture templates. Applied in interactive art installations where visitors trigger visuals and soundscapes with full-body poses.',
    tags: ['MEDIAPIPE', 'GRAPH MATCHING', 'INTERACTIVE ART', 'PYTHON'],
    links: [
      { label: 'GITHUB', url: 'https://github.com/lefinnok' },
    ],
  },
  {
    id: '003',
    title: 'UML DIAGRAM GENERATOR',
    blurb: 'A web app that drafts UML class diagrams from natural-language prompts.',
    year: '2025',
    domain: 'WEB \u00B7 LLM',
    detail: 'Describe your system in plain English and get a UML class diagram back. The app parses natural-language descriptions, identifies classes, attributes, methods, and relationships, then renders an editable diagram. Iterative refinement via follow-up prompts. Built with React and backed by LLM inference.',
    tags: ['REACT', 'LLM', 'UML', 'DIAGRAMMING'],
    links: [
      { label: 'GITHUB', url: 'https://github.com/lefinnok' },
    ],
  },
  {
    id: '004',
    title: 'ML PLAYGROUND',
    blurb: 'Interactive neural network training, digit recognition, and decision boundaries.',
    year: '2025',
    domain: 'AI \u00B7 ML',
    detail: 'A browser-based machine learning playground featuring real-time neural network training visualization, a hand-drawn digit recognizer (MNIST, 96.9% accuracy), and interactive decision boundary plots. All inference runs client-side via TensorFlow.js. No data leaves the browser.',
    tags: ['TENSORFLOW.JS', 'MNIST', 'VISUALIZATION', 'REACT'],
    links: [
      { label: 'LIVE DEMO', url: 'https://lefinnok.github.io' },
      { label: 'GITHUB', url: 'https://github.com/lefinnok' },
    ],
  },
];

export const ARCHIVE_PROJECTS = [
  {
    id: '005',
    title: 'ECCENTRICITY',
    blurb: 'Steampunk strategy roguelike about building the ultimate power grid.',
    year: '2025',
    domain: 'GAMES \u00B7 ONGOING',
  },
  {
    id: '006',
    title: 'NASS OCELLI',
    blurb: 'Compact CV framework for drone surveying, mapping, and reverse-AR.',
    year: '2023',
    domain: 'CV \u00B7 IOT',
  },
  {
    id: '007',
    title: 'RETRO HANDHELD',
    blurb: 'A handheld from scratch — microcontrollers, custom PCB, 3D-printed shell, bespoke OS.',
    year: '2022',
    domain: 'HARDWARE \u00B7 EMBEDDED',
  },
  {
    id: '008',
    title: '[LD42] SPACE SAVER',
    blurb: 'Game jam entry, summer of high school. Self-composed soundtrack.',
    year: '2018',
    domain: 'GAMES \u00B7 JAM',
  },
  {
    id: '009',
    title: 'BINMIN',
    blurb: 'Smart waste classification system using computer vision and embedded hardware.',
    year: '2021',
    domain: 'CV \u00B7 HARDWARE',
  },
];
