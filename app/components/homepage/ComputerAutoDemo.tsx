import { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";
import { createInitialState, stepCpu } from "~/components/demos/8bit-computer/engine/cpu";
import { assemble } from "~/components/demos/8bit-computer/engine/assembler";
import { PROGRAMS_16 } from "~/components/demos/8bit-computer/engine/programs";
import { ArchitectureSvg } from "~/components/demos/8bit-computer/views/ArchitectureSvg";
import type { CpuState } from "~/components/demos/8bit-computer/engine/types";

const STEP_MS = 800;
const PROGRAM = PROGRAMS_16[1]; // "Count Up"

function buildInitialState(): CpuState {
  const { program } = assemble(PROGRAM.source, PROGRAM.ramSize);
  return createInitialState(program, PROGRAM.ramSize);
}

export default function ComputerAutoDemo() {
  const [cpu, setCpu] = useState<CpuState>(buildInitialState);

  const noop = useCallback(() => {}, []);

  useEffect(() => {
    const id = setInterval(() => {
      setCpu((prev) => {
        if (prev.halted) return buildInitialState();
        return stepCpu(prev);
      });
    }, STEP_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        pointerEvents: "none",
      }}
    >
      <ArchitectureSvg
        cpu={cpu}
        selectedModule={null}
        onSelectModule={noop}
      />
    </Box>
  );
}
