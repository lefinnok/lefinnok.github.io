import { useState, useEffect, useCallback, useRef } from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Link } from "react-router";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";

const FONT = "'Fira Code', monospace";

export interface ShowcaseSlide {
  content: React.ReactNode;
  tagline: string;
  linkTo: string;
}

interface Props {
  slides: ShowcaseSlide[];
  interval?: number;
}

const SLIDE_HEIGHT = 280;
const TRANSITION_MS = 600;

export function HeroShowcase({ slides, interval = 7000 }: Props) {
  const [current, setCurrent] = useState(0);
  const [hovered, setHovered] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval>>(undefined);

  const count = slides.length;

  const goTo = useCallback(
    (index: number) => {
      setCurrent(((index % count) + count) % count);
    },
    [count]
  );

  // Auto-advance
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % count);
    }, interval);
    return () => clearInterval(timerRef.current);
  }, [count, interval]);

  // Reset timer on manual navigation
  const navigate = useCallback(
    (index: number) => {
      clearInterval(timerRef.current);
      goTo(index);
      timerRef.current = setInterval(() => {
        setCurrent((c) => (c + 1) % count);
      }, interval);
    },
    [goTo, count, interval]
  );

  const trackY = -current * SLIDE_HEIGHT;

  return (
    <Box
      sx={{ position: "relative", width: "100%" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Slide viewport with edge fade */}
      <Box
        sx={{
          height: SLIDE_HEIGHT + 60,
          overflow: "hidden",
          maskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent 0%, black 12%, black 88%, transparent 100%)",
        }}
      >
        {/* Track */}
        <Box
          sx={{
            transform: `translateY(${trackY + 30}px)`,
            transition: `transform ${TRANSITION_MS}ms cubic-bezier(0.4, 0, 0.2, 1)`,
          }}
        >
          {slides.map((slide, i) => (
            <Box
              key={i}
              component={Link}
              to={slide.linkTo}
              sx={{
                display: "block",
                height: SLIDE_HEIGHT,
                textDecoration: "none",
                color: "inherit",
                opacity: i === current ? 1 : 0.3,
                transform: i === current ? "scale(1)" : "scale(0.96)",
                transition: `opacity ${TRANSITION_MS}ms ease, transform ${TRANSITION_MS}ms ease`,
                cursor: "pointer",
              }}
            >
              <Box
                sx={{
                  width: "100%",
                  height: "100%",
                  overflow: "hidden",
                  maskImage:
                    "radial-gradient(ellipse 90% 85% at center, black 40%, transparent 100%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 90% 85% at center, black 40%, transparent 100%)",
                }}
              >
                {slide.content}
              </Box>
            </Box>
          ))}
        </Box>
      </Box>

      {/* Tagline — crossfade */}
      <Box sx={{ height: 28, position: "relative", mt: 1 }}>
        {slides.map((slide, i) => (
          <Typography
            key={i}
            variant="body2"
            sx={{
              position: "absolute",
              inset: 0,
              fontFamily: FONT,
              fontSize: "0.72rem",
              color: "text.secondary",
              textAlign: "center",
              opacity: i === current ? 1 : 0,
              transition: `opacity ${TRANSITION_MS}ms ease`,
              pointerEvents: "none",
            }}
          >
            {slide.tagline}
          </Typography>
        ))}
      </Box>

      {/* Controls — overlaid INSIDE the container (right edge) */}
      <Box
        sx={{
          position: "absolute",
          right: 8,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 0.5,
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.3s ease",
          pointerEvents: hovered ? "auto" : "none",
          zIndex: 2,
        }}
      >
        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            navigate(current - 1);
          }}
          sx={{
            color: "text.secondary",
            bgcolor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            "&:hover": { color: "text.primary", bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <KeyboardArrowUpIcon fontSize="small" />
        </IconButton>

        {/* Dots */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 0.75,
            py: 0.5,
          }}
        >
          {slides.map((_, i) => (
            <Box
              key={i}
              onClick={(e) => {
                e.preventDefault();
                navigate(i);
              }}
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                bgcolor: i === current ? "text.primary" : "text.secondary",
                opacity: i === current ? 1 : 0.4,
                cursor: "pointer",
                transition: "all 0.3s ease",
                "&:hover": { opacity: 1 },
              }}
            />
          ))}
        </Box>

        <IconButton
          size="small"
          onClick={(e) => {
            e.preventDefault();
            navigate(current + 1);
          }}
          sx={{
            color: "text.secondary",
            bgcolor: "rgba(0,0,0,0.5)",
            backdropFilter: "blur(4px)",
            "&:hover": { color: "text.primary", bgcolor: "rgba(0,0,0,0.7)" },
          }}
        >
          <KeyboardArrowDownIcon fontSize="small" />
        </IconButton>
      </Box>
    </Box>
  );
}
