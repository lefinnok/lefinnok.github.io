import type { Route } from "./+types/contact";
import { Container, Typography, Box, Button, Stack } from "@mui/material";
import { FiMail } from "react-icons/fi";
import { ScrollReveal } from "~/components/ScrollReveal";

export const meta: Route.MetaFunction = () => [
  { title: "Contact — Lefinno Kwok" },
];

export default function Contact() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <ScrollReveal>
        <Typography variant="h3" component="h1" sx={{ mb: 1 }}>
          Contact
        </Typography>
        <Typography
          variant="overline"
          color="text.secondary"
          display="block"
          sx={{ mb: 4, fontSize: "0.9rem" }}
        >
          Get in touch
        </Typography>
      </ScrollReveal>

      <ScrollReveal delay={100}>
        <Box
          sx={{
            p: 4,
            border: 1,
            borderColor: "divider",
            borderRadius: 2,
            textAlign: "center",
          }}
        >
          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 3, lineHeight: 1.8 }}
          >
            Feel free to reach out via email for collaboration, questions,
            or just to say hello. I'll get back to you as soon as I can.
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            justifyContent="center"
            alignItems="center"
          >
            <Button
              href="mailto:lefinnokwok@gmail.com"
              variant="contained"
              size="large"
              startIcon={<FiMail />}
              sx={{ fontFamily: "'Fira Code', monospace" }}
            >
              lefinnokwok@gmail.com
            </Button>
          </Stack>
        </Box>
      </ScrollReveal>
    </Container>
  );
}
