import { useState, useRef, useCallback } from "react";
import {
  Box,
  IconButton,
  Stack,
  Typography,
  Tooltip,
} from "@mui/material";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import CenterFocusStrongIcon from "@mui/icons-material/CenterFocusStrong";
import DownloadIcon from "@mui/icons-material/Download";
import CodeIcon from "@mui/icons-material/Code";
import ImageIcon from "@mui/icons-material/Image";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import { plantumlSvgUrl, plantumlPngUrl } from "../engine/plantumlEncoding";

interface DiagramPanelProps {
  encodedDiagram: string | null;
  onToggleCodeView: () => void;
  showingCode: boolean;
}

export function DiagramPanel({
  encodedDiagram,
  onToggleCodeView,
  showingCode,
}: DiagramPanelProps) {
  const [zoom, setZoom] = useState(1);
  const [imgError, setImgError] = useState(false);
  const [imgLoading, setImgLoading] = useState(false);
  const prevEncoded = useRef<string | null>(null);

  // Reset error state when diagram changes
  if (encodedDiagram !== prevEncoded.current) {
    prevEncoded.current = encodedDiagram;
    if (encodedDiagram) {
      setImgError(false);
      setImgLoading(true);
    }
  }

  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.25, 4));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.25, 0.25));
  const handleReset = () => setZoom(1);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!encodedDiagram || !e.ctrlKey) return;
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.1 : 0.1;
      setZoom((z) => Math.max(0.25, Math.min(4, z + delta)));
    },
    [encodedDiagram],
  );

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
      {/* Toolbar */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ flexShrink: 0, pb: 0.5 }}
      >
        <Stack direction="row" spacing={0.25} alignItems="center">
          <Tooltip title="Zoom in" arrow>
            <IconButton size="small" onClick={handleZoomIn} disabled={!encodedDiagram}>
              <ZoomInIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Typography
            variant="caption"
            sx={{ fontFamily: "'Fira Code', monospace", fontSize: 10, minWidth: 32, textAlign: "center" }}
          >
            {Math.round(zoom * 100)}%
          </Typography>
          <Tooltip title="Zoom out" arrow>
            <IconButton size="small" onClick={handleZoomOut} disabled={!encodedDiagram}>
              <ZoomOutIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Reset zoom" arrow>
            <IconButton size="small" onClick={handleReset} disabled={!encodedDiagram}>
              <CenterFocusStrongIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        </Stack>

        <Stack direction="row" spacing={0.25}>
          <Tooltip title="Download SVG" arrow>
            <IconButton
              size="small"
              onClick={() => encodedDiagram && window.open(plantumlSvgUrl(encodedDiagram), "_blank")}
              disabled={!encodedDiagram}
            >
              <DownloadIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open PNG" arrow>
            <IconButton
              size="small"
              onClick={() => encodedDiagram && window.open(plantumlPngUrl(encodedDiagram), "_blank")}
              disabled={!encodedDiagram}
            >
              <ImageIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title="Open in PlantUML editor" arrow>
            <IconButton
              size="small"
              onClick={() =>
                encodedDiagram && window.open(`https://www.plantuml.com/plantuml/uml/${encodedDiagram}`, "_blank")
              }
              disabled={!encodedDiagram}
            >
              <OpenInNewIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
          <Tooltip title={showingCode ? "Show diagram" : "Show code"} arrow>
            <IconButton size="small" onClick={onToggleCodeView}>
              <CodeIcon sx={{ fontSize: 16, color: showingCode ? "#f97316" : undefined }} />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      {/* Diagram viewport — scrollable, image at natural size */}
      <Box
        onWheel={handleWheel}
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: "auto",
          bgcolor: "#111",
          borderRadius: 1,
          border: "1px solid",
          borderColor: "divider",
          display: "flex",
          alignItems: encodedDiagram ? "flex-start" : "center",
          justifyContent: "center",
          p: encodedDiagram ? 2 : 0,
          "&::-webkit-scrollbar": { width: 6, height: 6 },
          "&::-webkit-scrollbar-thumb": { bgcolor: "rgba(255,255,255,0.15)", borderRadius: 3 },
        }}
      >
        {encodedDiagram && !imgError ? (
          <img
            src={plantumlPngUrl(encodedDiagram)}
            alt="UML Diagram"
            onError={() => { setImgError(true); setImgLoading(false); }}
            onLoad={() => setImgLoading(false)}
            draggable={false}
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              maxWidth: "none",
              userSelect: "none",
              opacity: imgLoading ? 0.3 : 1,
              transition: "opacity 0.2s",
            }}
          />
        ) : encodedDiagram && imgError ? (
          <Typography variant="caption" color="error" sx={{ textAlign: "center", px: 2 }}>
            Failed to render diagram. The PlantUML code may have syntax errors.
          </Typography>
        ) : (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ fontStyle: "italic", textAlign: "center", px: 2 }}
          >
            Your diagram will appear here
          </Typography>
        )}
      </Box>
    </Box>
  );
}
