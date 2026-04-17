"use client";

import { useEffect, useState } from "react";

export function ScrollProgress({ targetId }: { targetId: string }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const element = document.getElementById(targetId);
      if (!element) return;

      const windowScroll = window.scrollY;
      const elementTop = element.offsetTop;
      const elementHeight = element.scrollHeight;
      const windowHeight = window.innerHeight;

      // Calculate how much of the element has been scrolled past
      // We subtract windowHeight to finish the bar when the bottom of the form hits the bottom of the screen
      const totalScroll = elementHeight - (windowHeight - elementTop);
      const currentScroll = windowScroll - elementTop;

      if (currentScroll <= 0) {
        setProgress(0);
      } else if (currentScroll >= totalScroll) {
        setProgress(100);
      } else {
        setProgress((currentScroll / totalScroll) * 100);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [targetId]);

  return (
    <div className="sticky top-0 z-20 w-full bg-white/50 backdrop-blur-sm">
      <div
        className="h-1 bg-[#6f63ff] transition-all duration-150 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="flex justify-between px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-[#98a2b3]">
        <span>Application Progress</span>
        <span>{Math.round(progress)}%</span>
      </div>
    </div>
  );
}
