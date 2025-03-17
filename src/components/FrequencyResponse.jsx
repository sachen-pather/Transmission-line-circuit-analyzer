import { useState, useEffect, useRef } from "react";

const FrequencyResponse = ({ txLineParams, geometryType, params }) => {
  const canvasRef = useRef(null);
  const [showDispersion, setShowDispersion] = useState(true);
  const [frequencyRange, setFrequencyRange] = useState({
    min: 0.1, // 10% of base frequency
    max: 10, // 10x base frequency
  });

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
    const baseFreq = txLineParams.frequency / 1e6 || 1000; // Convert Hz to MHz
    const points = [];
    const pointsNoDispersion = [];

    // Generate data points for frequency range
    const freqStart = baseFreq * frequencyRange.min;
    const freqEnd = baseFreq * frequencyRange.max;

    for (let f = freqStart; f <= freqEnd; f += (freqEnd - freqStart) / 100) {
      // Calculate Z0 for this frequency
      let z0, z0NoDispersion;

      switch (geometryType) {
        case "microstrip": {
          if (!params) break;

          // Recalculate microstrip Z0 for this frequency
          const w = params.stripWidth * 1e-3; // mm to m
          const h = params.substrateHeight * 1e-3; // mm to m
          const er = params.permittivity;

          const s = w / h; // width-to-height ratio
          const x = Math.pow((er - 0.9) / (er + 3), 0.05);
          const y =
            1 +
            0.02 *
              Math.log(
                (Math.pow(s, 4) + 3.7e-4 * s * s) / (Math.pow(s, 4) + 0.43)
              ) +
            0.05 * Math.log(1 + 1.7e-4 * Math.pow(s, 3));

          // Basic effective permittivity (no dispersion)
          const eeff_basic =
            (er + 1) / 2 + ((er - 1) / 2) * Math.pow(1 + 10 / s, -x * y);

          // Calculate Z0 without dispersion
          const t = Math.pow(30.67 / s, 0.75);
          z0NoDispersion =
            (60 / Math.sqrt(eeff_basic)) *
            Math.log(
              (6 + (2 * Math.PI - 6) * Math.exp(-t)) / s +
                Math.sqrt(1 + 4 / Math.pow(s, 2))
            );

          // Calculate Z0 with frequency dispersion
          if (showDispersion) {
            // Frequency-dependent effective permittivity
            const fGHz = f / 1000; // MHz to GHz
            const G = 0.6 + 0.009 * z0NoDispersion;
            const fp = z0NoDispersion / (2 * 4 * Math.PI * 1e-7 * h) / 1e9; // Convert to GHz

            // Only apply dispersion if frequency is high enough to matter
            if (fGHz > 1) {
              const eeff_f =
                er - (er - eeff_basic) / (1 + G * Math.pow(fGHz / fp, 2));
              z0 =
                (60 / Math.sqrt(eeff_f)) *
                Math.log(
                  (6 + (2 * Math.PI - 6) * Math.exp(-t)) / s +
                    Math.sqrt(1 + 4 / Math.pow(s, 2))
                );
            } else {
              z0 = z0NoDispersion;
            }
          } else {
            z0 = z0NoDispersion;
          }
          break;
        }
        case "coaxial": {
          // For coaxial, add minimal frequency dependence due to skin effect
          // (This is a simplified model - in reality, losses would be more complex)
          const baseZ0 = txLineParams.characteristicImpedance;
          const skinEffectFactor = 1 + 0.002 * Math.sqrt(f / baseFreq);
          z0 = baseZ0 * skinEffectFactor;
          z0NoDispersion = baseZ0;
          break;
        }
        default:
          // For other geometries use simplified calculation
          z0 = txLineParams.characteristicImpedance;
          z0NoDispersion = z0;
      }

      if (!isNaN(z0)) points.push({ freq: f, z0 });
      if (!isNaN(z0NoDispersion))
        pointsNoDispersion.push({ freq: f, z0: z0NoDispersion });
    }

    // Only proceed if we have points to plot
    if (points.length === 0) return;

    // Find min/max Z0 for scaling (include both sets of points)
    const allZ0Values = [
      ...points.map((p) => p.z0),
      ...pointsNoDispersion.map((p) => p.z0),
    ];
    const maxZ0 = Math.max(...allZ0Values) * 1.1;
    const minZ0 = Math.min(...allZ0Values) * 0.9;

    // Draw the curves - first the no-dispersion curve if needed
    if (showDispersion && geometryType === "microstrip") {
      ctx.beginPath();
      ctx.strokeStyle = "#9CA3AF"; // Gray for no-dispersion
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]); // Dashed line

      pointsNoDispersion.forEach((point, i) => {
        const x =
          50 +
          ((point.freq - freqStart) / (freqEnd - freqStart)) * (width - 80);
        const y =
          height - 30 - ((point.z0 - minZ0) / (maxZ0 - minZ0)) * (height - 60);

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      ctx.stroke();
      ctx.setLineDash([]); // Reset to solid line
    }

    // Draw the main curve
    ctx.beginPath();
    ctx.strokeStyle = "#3B82F6"; // Blue for main curve
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
    // X-axis ticks - log scale ticks
    const logScaleTicks = [
      freqStart,
      freqStart * Math.sqrt(freqEnd / freqStart), // Geometric middle
      freqEnd,
    ];

    if (frequencyRange.max / frequencyRange.min > 10) {
      // Add more ticks for wide frequency ranges
      logScaleTicks.splice(
        1,
        0,
        freqStart * Math.pow(freqEnd / freqStart, 0.25)
      );
      logScaleTicks.splice(
        3,
        0,
        freqStart * Math.pow(freqEnd / freqStart, 0.75)
      );
    }

    ctx.textAlign = "center";
    ctx.fillStyle = "#9CA3AF";

    logScaleTicks.forEach((freq) => {
      const x =
        50 + ((freq - freqStart) / (freqEnd - freqStart)) * (width - 80);
      ctx.beginPath();
      ctx.moveTo(x, height - 30);
      ctx.lineTo(x, height - 25);
      ctx.stroke();

      // Format frequency labels nicely
      let freqLabel;
      if (freq >= 1000) {
        freqLabel = (freq / 1000).toFixed(1) + "GHz";
      } else {
        freqLabel = freq.toFixed(0) + "MHz";
      }
      ctx.fillText(freqLabel, x, height - 15);
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
    const currentFreq = baseFreq;
    const currentX =
      50 + ((currentFreq - freqStart) / (freqEnd - freqStart)) * (width - 80);
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
      `${txLineParams.characteristicImpedance.toFixed(
        1
      )}Ω @ ${currentFreq.toFixed(0)}MHz`,
      currentX,
      currentY - 10
    );
  }, [txLineParams, params, geometryType, showDispersion, frequencyRange]);

  const handleDispersionToggle = () => {
    setShowDispersion(!showDispersion);
  };

  const setFrequencyRangePreset = (min, max) => {
    setFrequencyRange({ min, max });
  };

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Frequency Response</h2>
        <div className="flex gap-2">
          {geometryType === "microstrip" && (
            <button
              onClick={handleDispersionToggle}
              className={`px-3 py-1 text-sm rounded ${
                showDispersion
                  ? "bg-green-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              {showDispersion ? "Dispersion ON" : "Dispersion OFF"}
            </button>
          )}
          <div className="flex gap-1">
            <button
              onClick={() => setFrequencyRangePreset(0.5, 2)}
              className={`px-2 py-1 text-xs rounded ${
                frequencyRange.min === 0.5 && frequencyRange.max === 2
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              0.5-2x
            </button>
            <button
              onClick={() => setFrequencyRangePreset(0.1, 10)}
              className={`px-2 py-1 text-xs rounded ${
                frequencyRange.min === 0.1 && frequencyRange.max === 10
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              0.1-10x
            </button>
            <button
              onClick={() => setFrequencyRangePreset(0.01, 100)}
              className={`px-2 py-1 text-xs rounded ${
                frequencyRange.min === 0.01 && frequencyRange.max === 100
                  ? "bg-blue-600 text-white"
                  : "bg-gray-600 text-gray-300"
              }`}
            >
              0.01-100x
            </button>
          </div>
        </div>
      </div>
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
          {geometryType === "microstrip" && showDispersion && (
            <span>
              {" "}
              The dashed line shows the impedance without frequency dispersion
              effects.
            </span>
          )}
        </p>
        {geometryType === "microstrip" && (
          <p className="mt-2">
            <strong>Note:</strong> Microstrip lines exhibit significant
            frequency dispersion at higher frequencies due to their
            inhomogeneous dielectric environment causing changes in effective
            permittivity. This effect becomes more pronounced above 1 GHz and
            directly impacts characteristic impedance. In contrast, conventional
            transmission lines (coaxial, two-wire, and parallel-plate) maintain
            consistent impedance across frequency due to their homogeneous
            dielectric structure and pure TEM propagation mode, making them more
            predictable for broadband applications.
          </p>
        )}
      </div>
    </div>
  );
};

export default FrequencyResponse;
