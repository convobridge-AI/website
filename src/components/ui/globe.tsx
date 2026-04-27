import { useEffect, useRef } from "react";
import createGlobe from "cobe";
import { cn } from "@/lib/utils";

export function Globe({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    if (!canvasRef.current) return;

    const globe = createGlobe(canvasRef.current, {
      devicePixelRatio: 2,
      width: 600 * 2,
      height: 600 * 2,
      phi: 0,
      theta: 0,
      dark: 0,
      diffuse: 1.2,
      mapSamples: 16000,
      mapBrightness: 6,
      baseColor: [1, 1, 1],
      markerColor: [0.1, 0.25, 0.85],
      glowColor: [1, 1, 1],
      markers: [
        // Nilgiri / Coimbatore / Kochi area (India)
        { location: [11.0168, 76.9558], size: 0.1 },
        // Dubai / UAE
        { location: [25.2048, 55.2708], size: 0.05 },
        // Riyadh / KSA
        { location: [24.7136, 46.6753], size: 0.05 },
        // London
        { location: [51.5074, -0.1278], size: 0.05 },
        // New York
        { location: [40.7128, -74.006], size: 0.05 },
      ],
      onRender: (state) => {
        // This called on every render
        // State will be an empty object, return updated values.
        state.phi = phi;
        phi += 0.01;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: 600, height: 600, maxWidth: "100%", aspectRatio: 1 }}
      className={cn("mx-auto", className)}
    />
  );
}
