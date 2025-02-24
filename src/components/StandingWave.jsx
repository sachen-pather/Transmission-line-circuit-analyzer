import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

const StandingWave = ({ reflectionCoefficient, wavelength }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !reflectionCoefficient) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Standing wave pattern
    const gamma = reflectionCoefficient.magnitude;
    const theta = (reflectionCoefficient.angle * Math.PI) / 180;

    ctx.beginPath();
    ctx.strokeStyle = "#60A5FA";
    ctx.lineWidth = 2;

    // Draw standing wave envelope
    for (let x = 0; x < width; x++) {
      const d = (x / width) * wavelength * 2; // Scale x to cover 2 wavelengths
      const beta = (2 * Math.PI) / wavelength;

      // |V(d)| = |V₀⁺|[(1 + |Γ|²) + 2|Γ|cos(2βd - θ)]^(1/2)
      const amplitude = Math.sqrt(
        1 + gamma ** 2 + 2 * gamma * Math.cos(2 * beta * d - theta)
      );
      const y = height / 2 - (amplitude * height) / 4;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw the bottom envelope
    ctx.beginPath();
    ctx.strokeStyle = "#60A5FA";

    for (let x = 0; x < width; x++) {
      const d = (x / width) * wavelength * 2;
      const beta = (2 * Math.PI) / wavelength;

      const amplitude = Math.sqrt(
        1 + gamma ** 2 + 2 * gamma * Math.cos(2 * beta * d - theta)
      );
      const y = height / 2 + (amplitude * height) / 4;

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw center line
    ctx.beginPath();
    ctx.strokeStyle = "#9CA3AF";
    ctx.setLineDash([5, 5]);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [reflectionCoefficient, wavelength]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-semibold mb-4">Standing Wave Pattern</h2>
      <canvas
        ref={canvasRef}
        width={800}
        height={200}
        className="w-full h-auto bg-gray-900 rounded"
      />
      <div className="text-sm text-gray-400 mt-2">
        <p>
          The standing wave pattern shows voltage magnitude along the
          transmission line.
        </p>
        <p>
          VSWR:{" "}
          {reflectionCoefficient
            ? (
                (1 + reflectionCoefficient.magnitude) /
                (1 - reflectionCoefficient.magnitude)
              ).toFixed(2)
            : "N/A"}
        </p>
      </div>
    </div>
  );
};

export default StandingWave;
