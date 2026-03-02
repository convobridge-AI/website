import { useEffect, useState, useRef } from "react";

export function AnimatedCounter({ value, suffix = "" }: { value: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);
  const elementRef = useRef<HTMLSpanElement>(null);
  
  // Extract numeric part (e.g. "1,247" -> 1247)
  const numericValue = parseInt(value.replace(/[^0-9]/g, ""), 10);

  useEffect(() => {
    // Simple intersection observer to trigger animation only when visible
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          let start = 0;
          const duration = 2000; // 2s duration
          const increment = numericValue / (duration / 16); // 60fps

          const timer = setInterval(() => {
            start += increment;
            if (start >= numericValue) {
              setDisplayValue(numericValue);
              clearInterval(timer);
            } else {
              setDisplayValue(Math.floor(start));
            }
          }, 16);
          
          observer.disconnect(); // Only run once
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [numericValue]);

  return <span ref={elementRef}>{displayValue.toLocaleString()}{suffix}</span>;
}
