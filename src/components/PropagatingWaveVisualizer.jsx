// PropagatingWaveVisualizer.jsx
"use client";
import { useEffect, useRef, useState } from "react";

const PropagatingWaveVisualizer = ({ txLineParams, reflectionCoefficient }) => {
  const canvasRef = useRef(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Toggle animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  // Animation effect
  useEffect(() => {
    if (isAnimating) {
      const animate = () => {
        setAnimationFrame((prev) => (prev + 1) % 100);
        animationRef.current = requestAnimationFrame(animate);
      };

      animationRef.current = requestAnimationFrame(animate);
      return () => {
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      };
    }
  }, [isAnimating]);

  // Drawing logic
  useEffect(() => {
    if (!canvasRef.current || !txLineParams || !reflectionCoefficient) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = "#4B5563";
    ctx.beginPath();
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Time factor for animation (0 to 2π)
    const time = ((animationFrame % 100) / 100) * 2 * Math.PI;

    // Parameters
    const wavelength = txLineParams.wavelength * 1000; // Convert to mm for visualization
    const gamma = reflectionCoefficient?.magnitude || 0;
    const theta = reflectionCoefficient?.angle
      ? (reflectionCoefficient.angle * Math.PI) / 180
      : 0;
    const beta = (2 * Math.PI) / wavelength;

    // Draw incident wave
    ctx.beginPath();
    ctx.strokeStyle = "#10B981"; // Green for incident wave
    ctx.lineWidth = 2;

    for (let x = 0; x < width; x++) {
      const d = (x / width) * wavelength * 2; // Scale to show 2 wavelengths

      // Incident wave: cos(ωt - βd)
      const incidentY = Math.cos(time - beta * d);
      const y = height / 2 - incidentY * (height / 4);

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw reflected wave if there's reflection
    if (gamma > 0.01) {
      // Only draw if reflection is significant
      ctx.beginPath();
      ctx.strokeStyle = "#EC4899"; // Pink for reflected wave
      ctx.lineWidth = 2;

      for (let x = 0; x < width; x++) {
        const d = (x / width) * wavelength * 2;

        // Reflected wave: |Γ|cos(ωt + βd - θ)
        const reflectedY = gamma * Math.cos(time + beta * d - theta);
        const y = height / 2 - reflectedY * (height / 4);

        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();
    }

    // Draw resulting wave (sum of incident and reflected)
    ctx.beginPath();
    ctx.strokeStyle = "#3B82F6"; // Blue for total wave
    ctx.lineWidth = 2;

    for (let x = 0; x < width; x++) {
      const d = (x / width) * wavelength * 2;

      // Total wave: cos(ωt - βd) + |Γ|cos(ωt + βd - θ)
      const incidentY = Math.cos(time - beta * d);
      const reflectedY = gamma * Math.cos(time + beta * d - theta);
      const totalY = incidentY + reflectedY;

      const y = height / 2 - totalY * (height / 4);

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Add direction arrows
    // Incident wave arrow
    ctx.beginPath();
    ctx.fillStyle = "#10B981";
    ctx.moveTo(width - 20, height / 2 - 30);
    ctx.lineTo(width - 10, height / 2 - 25);
    ctx.lineTo(width - 20, height / 2 - 20);
    ctx.fill();

    // Reflected wave arrow (if applicable)
    if (gamma > 0.01) {
      ctx.beginPath();
      ctx.fillStyle = "#EC4899";
      ctx.moveTo(20, height / 2 + 20);
      ctx.lineTo(10, height / 2 + 25);
      ctx.lineTo(20, height / 2 + 30);
      ctx.fill();
    }

    // Add labels
  }, [txLineParams, reflectionCoefficient, animationFrame]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Propagating Waves</h2>
        <button
          onClick={toggleAnimation}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          {isAnimating ? "Pause" : "Animate"}
        </button>
      </div>
      <canvas
        ref={canvasRef}
        width={600}
        height={200}
        className="w-full h-auto bg-gray-900 rounded"
      />
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">Incident Wave</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-pink-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">Reflected Wave</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">Total Wave</span>
        </div>
      </div>
      <div className="text-sm text-gray-400 mt-2">
        <p>
          The visualization shows waves propagating on the transmission line.
          The green wave represents the incident wave traveling toward the load,
          while the pink wave (if visible) shows the reflected wave traveling
          back toward the source. Their superposition forms the blue total wave.
        </p>

        <div className="mt-4 bg-gray-900 p-3 rounded-lg">
          <p className="font-semibold mb-2">Wave Equations:</p>
          <p className="mb-2">Incident Wave: V₁(d,t) = cos(ωt - βd)</p>
          <p className="mb-2">Reflected Wave: V₂(d,t) = |Γ|cos(ωt + βd - θ)</p>
          <p>Total Wave: V(d,t) = V₁(d,t) + V₂(d,t)</p>
        </div>

        <div className="mt-4">
          <p className="font-semibold mb-1">What This Shows:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>
              <span className="text-green-400">Incident wave</span> travels in
              the +d direction (source to load) with phase velocity v
              <sub>p</sub> = ω/β
            </li>
            <li>
              <span className="text-pink-400">Reflected wave</span> travels in
              the -d direction (load to source) with amplitude determined by the
              reflection coefficient Γ = |Γ|∠θ
            </li>
            <li>
              <span className="text-blue-400">Total wave</span> is the
              instantaneous sum of both waves, which forms a pattern that moves
              along the line
            </li>
            <li>When |Γ| = 0 (perfect match), only the incident wave exists</li>
            <li>
              When |Γ| = 1 (complete reflection), the incident and reflected
              waves have equal amplitude, forming a standing wave pattern
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PropagatingWaveVisualizer;
