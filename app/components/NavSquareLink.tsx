import { Box, Typography } from "@mui/material";
import { NavLink } from "react-router";
import { useEffect, useRef, useState, useCallback } from "react";
import { NavSquareGrid } from "./NavSquareGrid";

interface NavSquareLinkProps {
  to: string;
  label: string;
  isActive: boolean;
}

export function NavSquareLink({ to, label, isActive }: NavSquareLinkProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hovered, setHovered] = useState(false);
  const [canHover, setCanHover] = useState(false);

  useEffect(() => {
    setCanHover(window.matchMedia("(hover: hover)").matches);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new ResizeObserver(() => {
      setDimensions({
        width: el.offsetWidth,
        height: el.offsetHeight,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const handleMouseEnter = useCallback(() => {
    if (canHover && !isActive) setHovered(true);
  }, [canHover, isActive]);

  const handleMouseLeave = useCallback(() => {
    if (canHover) setHovered(false);
  }, [canHover]);

  const showGrid = isActive || hovered;

  return (
    <Box
      ref={containerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      sx={{
        position: "relative",
        overflow: "hidden",
      }}
    >
      <NavSquareGrid
        active={showGrid}
        width={dimensions.width}
        height={dimensions.height}
      />
      <Typography
        component={NavLink}
        to={to}
        variant="body2"
        sx={{
          position: "relative",
          zIndex: 1,
          display: "block",
          px: 2,
          py: 1,
          textDecoration: "none",
          color: "text.secondary",
          fontFamily: '"Fira Code", monospace',
          fontSize: "0.85rem",
          fontWeight: 500,
          transition: "color 0.15s ease",
          mixBlendMode: "difference",
          "&.active": { color: "text.primary" },
        }}
      >
        {label}
      </Typography>
    </Box>
  );
}
