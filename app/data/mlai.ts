import type { IconType } from "react-icons";
import {
  SiTensorflow,
  SiOpencv,
  SiPytorch,
  SiScikitlearn,
  SiMediapipe,
  SiHuggingface,
} from "react-icons/si";

export interface MlCapability {
  id: string;
  label: string;
  useCase: string;
  color: string;
  icon: IconType;
}

export const ML_CAPABILITIES: MlCapability[] = [
  {
    id: "tensorflow",
    label: "TensorFlow / Keras",
    useCase: "Model training & deployment",
    color: "#ff6f00",
    icon: SiTensorflow,
  },
  {
    id: "opencv",
    label: "Computer Vision (OpenCV)",
    useCase: "Image processing & detection",
    color: "#4ade80",
    icon: SiOpencv,
  },
  {
    id: "pytorch",
    label: "PyTorch",
    useCase: "Research & experimentation",
    color: "#ee4c2c",
    icon: SiPytorch,
  },
  {
    id: "sklearn",
    label: "scikit-learn",
    useCase: "Classical ML & feature engineering",
    color: "#f7931e",
    icon: SiScikitlearn,
  },
  {
    id: "mediapipe",
    label: "MediaPipe",
    useCase: "Real-time pose & hand tracking",
    color: "#00a6a6",
    icon: SiMediapipe,
  },
  {
    id: "huggingface",
    label: "Hugging Face / LLMs",
    useCase: "NLP, transformers & fine-tuning",
    color: "#ffd21e",
    icon: SiHuggingface,
  },
];
