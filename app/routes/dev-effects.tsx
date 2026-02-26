import { Container, Typography, Stack, Box } from "@mui/material";
import { MatrixLoader } from "~/components/MatrixLoader";

export default function DevEffects() {
  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Typography variant="h3" sx={{ mb: 1 }}>
        Effects Preview
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 6 }}>
        Dev page — preview loading animations and effects.
      </Typography>

      <Stack spacing={6}>
        {/* Sparse — default, used in InteractiveDemoSlot */}
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            Sparse (default) — Suspense fallback
          </Typography>
          <MatrixLoader message="Loading demo..." height={300} />
        </Box>

        {/* Normal density — used in camera viewport */}
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            Normal density — WASM loading
          </Typography>
          <MatrixLoader
            message="Initializing WASM..."
            height={300}
            density="normal"
          />
        </Box>

        {/* No message — used in FbxModelViewer */}
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            No message — model loading overlay
          </Typography>
          <MatrixLoader height={200} />
        </Box>

        {/* Small / compact */}
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ mb: 1, display: "block" }}>
            Compact
          </Typography>
          <MatrixLoader message="Loading..." height={120} width={400} />
        </Box>
      </Stack>
    </Container>
  );
}
