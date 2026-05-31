import { useRef, useEffect } from "react";

/**
 * useFadeIn — aplica la clase "visible" al elemento cuando entra en el viewport.
 * Usa IntersectionObserver para animar secciones al hacer scroll.
 */
export function useFadeIn() {
  const ref = useRef();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("visible");
          obs.unobserve(el);
        }
      },
      { threshold: 0.1 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return ref;
}
