interface LineArtProps {
  variant: "waves" | "arch" | "grid" | "connector";
  className?: string;
}

export function LineArt({ variant, className = "line-art" }: LineArtProps) {
  if (variant === "waves") {
    return (
      <svg className={className} viewBox="0 0 600 420" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
        <path d="M-20 330 C 90 300, 140 360, 230 340 S 380 270, 470 300 S 560 350, 640 320" />
        <path d="M-20 360 C 80 330, 150 390, 240 370 S 400 300, 490 330 S 570 380, 640 350" />
        <path d="M-20 390 C 70 360, 160 420, 250 400 S 410 330, 500 360 S 580 410, 640 380" />
        <path d="M-20 300 C 100 270, 150 330, 240 310 S 390 240, 480 270 S 560 320, 640 290" strokeOpacity=".5" />
        <circle cx="230" cy="340" r="5" fill="currentColor" stroke="none" />
        <circle cx="470" cy="300" r="5" fill="var(--accent)" stroke="none" />
      </svg>
    );
  }

  if (variant === "arch") {
    return (
      <svg className={className} viewBox="0 0 600 420" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
        <path d="M60 380 L60 240 L120 200 L180 240 L180 380" />
        <path d="M220 380 L220 180 L290 140 L360 180 L360 380" />
        <path d="M400 380 L400 260 L450 230 L500 260 L500 380" />
        <path d="M60 240 L120 280 L180 240 M220 180 L290 220 L360 180 M400 260 L450 290 L500 260" strokeOpacity=".6" />
        <circle cx="290" cy="220" r="5" fill="var(--accent)" stroke="none" />
      </svg>
    );
  }

  if (variant === "grid") {
    return (
      <svg className={className} viewBox="0 0 600 420" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
        <path d="M40 60 H200 V180 H40 Z" />
        <path d="M220 60 H380 V180 H220 Z" />
        <path d="M400 60 H560 V180 H400 Z" />
        <path d="M40 220 H200 V360 H40 Z" />
        <path d="M220 220 H560 V360 H220 Z" />
        <path d="M200 120 H220 M380 120 H400 M120 180 V220 M390 180 V220" strokeOpacity=".6" />
        <circle cx="470" cy="120" r="5" fill="var(--accent)" stroke="none" />
      </svg>
    );
  }

  return (
    <svg className={className} viewBox="0 0 600 420" fill="none" stroke="currentColor" strokeWidth="1.1" aria-hidden="true">
      <circle cx="120" cy="120" r="34" />
      <circle cx="330" cy="90" r="24" />
      <circle cx="470" cy="240" r="40" />
      <circle cx="200" cy="320" r="28" />
      <circle cx="390" cy="360" r="18" />
      <path d="M120 120 L330 90 L470 240 L200 320 Z" strokeOpacity=".5" />
      <path d="M330 90 L200 320 M470 240 L390 360 L200 320" strokeOpacity=".5" />
      <circle cx="330" cy="90" r="4" fill="var(--accent)" stroke="none" />
      <circle cx="470" cy="240" r="4" fill="var(--accent)" stroke="none" />
    </svg>
  );
}
