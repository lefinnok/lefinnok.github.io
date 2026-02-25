import { Box, Typography, Collapse, IconButton } from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { useEffect, useRef, useState } from "react";

interface SkillVisualProps {
  name: string;
  proficiency: number;
}

export function SkillVisual({ name, proficiency }: SkillVisualProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reducedMotion) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <Box ref={ref} sx={{ mb: 0.5 }}>
      <Box
        onClick={() => setExpanded(!expanded)}
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          cursor: "pointer",
          py: 0.5,
          borderRadius: 1,
          "&:hover": { bgcolor: "rgba(255,255,255,0.03)" },
        }}
      >
        <Box sx={{ flex: 1 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              mb: 0.5,
            }}
          >
            <Typography variant="body2">{name}</Typography>
            <Typography variant="body2" color="text.secondary">
              {proficiency}%
            </Typography>
          </Box>
          <Box
            sx={{
              height: 4,
              bgcolor: "rgba(255,255,255,0.08)",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                height: "100%",
                width: visible ? `${proficiency}%` : "0%",
                bgcolor: proficiency >= 80 ? "text.primary" : "text.secondary",
                borderRadius: 2,
                transition: "width 0.8s ease-out",
              }}
            />
          </Box>
        </Box>
        <IconButton
          size="small"
          sx={{
            transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s ease",
            color: "text.secondary",
            p: 0.25,
          }}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(!expanded);
          }}
          aria-label={expanded ? "Collapse" : "Expand"}
        >
          <ExpandMoreIcon fontSize="small" />
        </IconButton>
      </Box>

      <Collapse in={expanded}>
        <Box
          sx={{
            pl: 1,
            py: 1,
            ml: 1,
            borderLeft: "1px solid",
            borderColor: "divider",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            More details coming soon.
          </Typography>
        </Box>
      </Collapse>
    </Box>
  );
}
