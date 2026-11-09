import { useEffect, useRef, useState } from "react";

/**
 * Mount heavy children only when they approach the viewport. A single-page
 * build otherwise mounts every demo and 3D viewer at once.
 */
export function LazyMount({
  children,
  rootMargin = "500px",
}: {
  children: React.ReactNode;
  rootMargin?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [rootMargin]);

  return <div ref={ref}>{visible ? children : null}</div>;
}
