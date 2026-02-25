import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

import type { Route } from "./+types/root";
import { theme } from "./theme/theme";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import "./app.css";

export const meta: Route.MetaFunction = () => [
  { title: "Lefinno Kwok — Portfolio" },
  {
    name: "description",
    content:
      "Portfolio of Lefinno Kwok — developer and creator building things that bridge hardware and software.",
  },
  { name: "theme-color", content: "#0a0a0a" },
];

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fira+Code:wght@400;500&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Navbar />
        <Box component="main" sx={{ flex: 1 }}>
          <Outlet />
        </Box>
        <Footer />
      </Box>
    </ThemeProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <Box sx={{ pt: 8, px: 4, maxWidth: 800, mx: "auto" }}>
      <Typography variant="h2">{message}</Typography>
      <Typography variant="body1" sx={{ mt: 2 }}>
        {details}
      </Typography>
      {stack && (
        <Box
          component="pre"
          sx={{
            mt: 2,
            p: 2,
            overflow: "auto",
            bgcolor: "background.paper",
            borderRadius: 2,
          }}
        >
          <code>{stack}</code>
        </Box>
      )}
    </Box>
  );
}
