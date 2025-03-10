// Add to PropagationAnalysis.jsx or create new FrequencyResponse.jsx
import { useEffect, useRef } from "react";

const FrequencyResponse = ({ txLineParams, geometryType, params }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !txLineParams) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw axes
    ctx.strokeStyle = "#4B5563";
    ctx.beginPath();
    ctx.moveTo(50, 30);
    ctx.lineTo(50, height - 30);
    ctx.lineTo(width - 30, height - 30);
    ctx.stroke();

    // Y-axis label
    ctx.fillStyle = "#9CA3AF";
    ctx.font = "12px Arial";
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = "center";
    ctx.fillText("Impedance (Ω)", 0, 0);
    ctx.restore();

    // X-axis label
    ctx.textAlign = "center";
    ctx.fillText("Frequency (MHz)", width / 2, height - 10);

    // Calculate Z0 vs frequency data points
    const baseFreq = txLineParams.frequency || 1000; // MHz
    const points = [];

    // Generate data points for frequency range from 0.5x to 2x current frequency
    const freqStart = baseFreq * 0.5;
    const freqEnd = baseFreq * 2;

    for (let f = freqStart; f <= freqEnd; f += (freqEnd - freqStart) / 50) {
      // Calculate Z0 for this frequency
      let z0;

      switch (geometryType) {
        case "microstrip": {
          // Recalculate microstrip Z0 for this frequency
          const w = params.stripWidth * 1e-3;
          const h = params.substrateHeight * 1e-3;
          const er = params.permittivity;

          const s = w / h;
          const x = Math.pow((er - 0.9) / (er + 3), 0.05);
          const y =
            1 +
            0.02 *
              Math.log(
                (Math.pow(s, 4) + 3.7e-4 * s * s) / (Math.pow(s, 4) + 0.43)
              ) +
            0.05 * Math.log(1 + 1.7e-4 * Math.pow(s, 3));

          const eeff =
            (er + 1) / 2 + ((er - 1) / 2) * Math.pow(1 + 10 / s, -x * y);

          const t = Math.pow(30.67 / s, 0.75);
          z0 =
            (60 / Math.sqrt(eeff)) *
            Math.log(
              (6 + (2 * Math.PI - 6) * Math.exp(-t)) / s +
                Math.sqrt(1 + 4 / Math.pow(s, 2))
            );
          break;
        }
        default:
          // For other geometries use simplified calculation
          z0 = txLineParams.characteristicImpedance;
      }

      points.push({ freq: f, z0 });
    }

    // Find min/max Z0 for scaling
    const maxZ0 = Math.max(...points.map((p) => p.z0)) * 1.1;
    const minZ0 = Math.min(...points.map((p) => p.z0)) * 0.9;

    // Draw the curve
    ctx.beginPath();
    ctx.strokeStyle = "#3B82F6";
    ctx.lineWidth = 2;

    points.forEach((point, i) => {
      const x =
        50 + ((point.freq - freqStart) / (freqEnd - freqStart)) * (width - 80);
      const y =
        height - 30 - ((point.z0 - minZ0) / (maxZ0 - minZ0)) * (height - 60);

      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Add ticks and labels
    // X-axis ticks
    const freqTicks = [freqStart, baseFreq, freqEnd];
    ctx.textAlign = "center";
    ctx.fillStyle = "#9CA3AF";

    freqTicks.forEach((freq) => {
      const x =
        50 + ((freq - freqStart) / (freqEnd - freqStart)) * (width - 80);
      ctx.beginPath();
      ctx.moveTo(x, height - 30);
      ctx.lineTo(x, height - 25);
      ctx.stroke();
      ctx.fillText(freq.toFixed(0), x, height - 15);
    });

    // Y-axis ticks
    const z0Ticks = [minZ0, (maxZ0 + minZ0) / 2, maxZ0];
    ctx.textAlign = "right";

    z0Ticks.forEach((z0) => {
      const y = height - 30 - ((z0 - minZ0) / (maxZ0 - minZ0)) * (height - 60);
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(45, y);
      ctx.stroke();
      ctx.fillText(z0.toFixed(1), 40, y + 5);
    });

    // Mark current operating point
    const currentX =
      50 + ((baseFreq - freqStart) / (freqEnd - freqStart)) * (width - 80);
    const currentY =
      height -
      30 -
      ((txLineParams.characteristicImpedance - minZ0) / (maxZ0 - minZ0)) *
        (height - 60);

    ctx.beginPath();
    ctx.arc(currentX, currentY, 6, 0, 2 * Math.PI);
    ctx.fillStyle = "#EC4899";
    ctx.fill();

    // Add current operating point label
    ctx.fillStyle = "#FFFFFF";
    ctx.textAlign = "center";
    ctx.fillText(
      `${txLineParams.characteristicImpedance.toFixed(1)}Ω`,
      currentX,
      currentY - 10
    );
  }, [txLineParams, params, geometryType]);

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8">
      <h2 className="text-2xl font-semibold mb-4">Frequency Response</h2>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={600}
          height={300}
          className="w-full h-auto bg-gray-900 rounded"
        />
      </div>
      <div className="mt-4 text-sm text-gray-400">
        <p>
          The graph shows how the characteristic impedance (Z₀) changes with
          frequency for this transmission line configuration.
        </p>
      </div>
    </div>
  );
};

export default FrequencyResponse;
