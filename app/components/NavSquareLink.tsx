import { Box, Typography } from "@mui/material";
import { NavLink } from "react-router";

interface NavSquareLinkProps {
  to: string;
  label: string;
  isActive: boolean;
}

export function NavSquareLink({ to, label, isActive }: NavSquareLinkProps) {
  return (
    <Box
      sx={{
        position: "relative",
        overflow: "hidden",
        "&:hover .swipe-fill": {
          transform: "translateX(0)",
        },
      }}
    >
      {/* Swipe fill background */}
      <Box
        className="swipe-fill"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          bgcolor: "#ffffff",
          transform: isActive ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.25s ease-out",
          pointerEvents: "none",
          mixBlendMode: "difference",
        }}
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
