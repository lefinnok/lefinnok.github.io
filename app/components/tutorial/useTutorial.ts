import { useState, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router";

export interface TutorialStep {
  id: string;
  target?: string;
  title: string;
  content: string;
  placement?: "top" | "bottom" | "left" | "right";
  advance: "manual" | "auto";
  spotlightPadding?: number;
}

export function useTutorial(steps: TutorialStep[]) {
  const [active, setActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // Auto-start from ?tutorial=true
  useEffect(() => {
    if (searchParams.get("tutorial") === "true" && !active) {
      setActive(true);
      setStepIndex(0);
      // Remove the param so refreshing doesn't restart
      setSearchParams((prev) => {
        prev.delete("tutorial");
        return prev;
      }, { replace: true });
    }
  }, [searchParams, active, setSearchParams]);

  const start = useCallback(() => {
    setActive(true);
    setStepIndex(0);
  }, []);

  const next = useCallback(() => {
    setStepIndex((i) => {
      if (i >= steps.length - 1) {
        setActive(false);
        return 0;
      }
      return i + 1;
    });
  }, [steps.length]);

  const exit = useCallback(() => {
    setActive(false);
    setStepIndex(0);
  }, []);

  return {
    active,
    stepIndex,
    currentStep: active ? steps[stepIndex] : null,
    start,
    next,
    exit,
  };
}
