import {
  AppBar,
  Toolbar,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { NavLink, useLocation } from "react-router";
import { useState } from "react";
import { NavSquareLink } from "./NavSquareLink";

const NAV_ITEMS = [
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "About", to: "/about" },
];

export function Navbar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  return (
    <>
      <AppBar
        position="sticky"
        sx={{
          bgcolor: "rgba(10, 10, 10, 0.85)",
          backdropFilter: "blur(12px)",
          borderBottom: 1,
          borderColor: "divider",
        }}
      >
        <Toolbar sx={{ maxWidth: 1200, mx: "auto", width: "100%" }}>
          <Box sx={{ flex: "0 0 auto" }}>
            <NavLink to="/" style={{ textDecoration: "none" }}>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: '"Fira Code", monospace',
                  fontWeight: 600,
                  color: "text.primary",
                  letterSpacing: "-0.02em",
                }}
              >
                LEFINNO KWOK
              </Typography>
            </NavLink>
          </Box>

          {!isMobile && (
            <>
              <Box
                sx={{
                  display: "flex",
                  gap: 0.5,
                  justifyContent: "center",
                  flex: 1,
                }}
              >
                {NAV_ITEMS.map((item) => (
                  <NavSquareLink
                    key={item.to}
                    to={item.to}
                    label={item.label}
                    isActive={isActive(item.to)}
                  />
                ))}
              </Box>
              <Box sx={{ flex: "0 0 auto", width: 160 }} />
            </>
          )}

          {isMobile && (
            <Box sx={{ ml: "auto" }}>
              <IconButton
                onClick={() => setDrawerOpen(true)}
                aria-label="Open menu"
                sx={{ color: "text.primary" }}
              >
                <MenuIcon />
              </IconButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: { bgcolor: "background.default" },
        }}
      >
        <List sx={{ width: 250, pt: 2 }}>
          {NAV_ITEMS.map((item) => (
            <ListItemButton
              key={item.to}
              component={NavLink}
              to={item.to}
              onClick={() => setDrawerOpen(false)}
            >
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontFamily: '"Fira Code", monospace',
                }}
              />
            </ListItemButton>
          ))}
        </List>
      </Drawer>
    </>
  );
}
