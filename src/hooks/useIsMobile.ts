"use client";

import { useEffect, useState } from "react";

function matches(breakpoint: number) {
  return (
    typeof window !== "undefined" &&
    window.matchMedia(`(max-width: ${breakpoint - 1}px)`).matches
  );
}

/** True on phone-width screens (below Tailwind's md breakpoint, 768px). */
export function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(() => matches(breakpoint));

  useEffect(() => {
    const query = window.matchMedia(`(max-width: ${breakpoint - 1}px)`);
    const update = () => setIsMobile(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, [breakpoint]);

  return isMobile;
}