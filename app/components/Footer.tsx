import { Box, Container, Typography, Stack } from "@mui/material";
import { Link } from "react-router";

const FOOTER_LINKS = [
  { label: "Home", to: "/" },
  { label: "Projects", to: "/projects" },
  { label: "About", to: "/about" },
];

export function Footer() {
  return (
    <Box
      component="footer"
      sx={{
        borderTop: 1,
        borderColor: "divider",
        py: 4,
        mt: "auto",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "center", sm: "flex-start" }}
          spacing={3}
        >
          <Box>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mb: 1, fontFamily: '"Fira Code", monospace' }}
            >
              Lefinno Kwok
            </Typography>
            <Stack direction="row" spacing={2}>
              {FOOTER_LINKS.map((link) => (
                <Typography
                  key={link.to}
                  component={Link}
                  to={link.to}
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    textDecoration: "none",
                    "&:hover": { color: "text.primary" },
                  }}
                >
                  {link.label}
                </Typography>
              ))}
            </Stack>
          </Box>

          <Typography variant="body2" color="text.secondary">
            &copy; {new Date().getFullYear()} Lefinno Kwok
          </Typography>
        </Stack>
      </Container>
    </Box>
  );
}
