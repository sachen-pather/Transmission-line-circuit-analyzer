import { useEffect, useRef, useState } from "react";

const StandingWave = ({ reflectionCoefficient, wavelength }) => {
  const canvasRef = useRef(null);
  const [animationFrame, setAnimationFrame] = useState(0);
  const animationRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [markers, setMarkers] = useState([]);

  // Function to toggle animation
  const toggleAnimation = () => {
    setIsAnimating(!isAnimating);
  };

  // Find positions of voltage maxima and minima
  useEffect(() => {
    if (!reflectionCoefficient) return;

    const gamma = reflectionCoefficient.magnitude;
    const theta = (reflectionCoefficient.angle * Math.PI) / 180;
    const beta = (2 * Math.PI) / wavelength;

    const newMarkers = [];
    const width = 800; // Match canvas width

    // Calculate positions for multiple wavelengths
    const calculateEnvelope = (x) => {
      const d = (x / width) * wavelength * 2; // Scale x to cover 2 wavelengths
      return Math.sqrt(
        1 + gamma ** 2 + 2 * gamma * Math.cos(2 * beta * d - theta)
      );
    };

    // Find actual maxima and minima through sampling
    const samples = 800;
    const values = [];

    for (let i = 0; i < samples; i++) {
      values.push({
        x: i,
        value: calculateEnvelope(i),
      });
    }

    // Find local maxima
    for (let i = 1; i < samples - 1; i++) {
      if (
        values[i].value > values[i - 1].value &&
        values[i].value > values[i + 1].value
      ) {
        // This is a local maximum
        // Fine-tune with more samples in the neighborhood
        let maxX = values[i].x;
        let maxValue = values[i].value;

        for (let j = -5; j <= 5; j++) {
          const testX = values[i].x + j * 0.1;
          if (testX >= 0 && testX < samples) {
            const testValue = calculateEnvelope(testX);
            if (testValue > maxValue) {
              maxValue = testValue;
              maxX = testX;
            }
          }
        }

        // Only add if it's a significant peak (avoid small numerical artifacts)
        if (maxValue > 1.01) {
          newMarkers.push({
            x: maxX,
            type: "max",
            amplitude: maxValue,
            distanceFromLoad: ((maxX / width) * wavelength * 2).toFixed(2),
          });
        }
      }
    }

    // Find local minima
    for (let i = 1; i < samples - 1; i++) {
      if (
        values[i].value < values[i - 1].value &&
        values[i].value < values[i + 1].value
      ) {
        // This is a local minimum
        // Fine-tune with more samples in the neighborhood
        let minX = values[i].x;
        let minValue = values[i].value;

        for (let j = -5; j <= 5; j++) {
          const testX = values[i].x + j * 0.1;
          if (testX >= 0 && testX < samples) {
            const testValue = calculateEnvelope(testX);
            if (testValue < minValue) {
              minValue = testValue;
              minX = testX;
            }
          }
        }

        // Only add if it's a significant minimum (avoid small numerical artifacts)
        if (minValue < 0.99) {
          newMarkers.push({
            x: minX,
            type: "min",
            amplitude: minValue,
            distanceFromLoad: ((minX / width) * wavelength * 2).toFixed(2),
          });
        }
      }
    }

    setMarkers(newMarkers);
  }, [reflectionCoefficient, wavelength]);

  useEffect(() => {
    if (!canvasRef.current || !reflectionCoefficient) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = canvas.width;
    const height = canvas.height;

    ctx.clearRect(0, 0, width, height);

    // Draw y-axis tick marks and values
    ctx.strokeStyle = "#4B5563"; // Gray-600
    ctx.fillStyle = "#9CA3AF"; // Gray-400
    ctx.textAlign = "right";
    ctx.font = "10px Arial";

    // Max amplitude based on reflection coefficient
    const maxAmplitude = 1 + reflectionCoefficient.magnitude;
    const minAmplitude = 1 - reflectionCoefficient.magnitude;

    // Draw x-axis tick marks
    for (let i = 0; i < 9; i++) {
      const x = (i * width) / 8;
      ctx.beginPath();
      ctx.moveTo(x, height / 2 - 5);
      ctx.lineTo(x, height / 2 + 5);
      ctx.stroke();
    }

    // Extract reflection coefficient values
    const gamma = reflectionCoefficient.magnitude;
    const theta = (reflectionCoefficient.angle * Math.PI) / 180;
    const beta = (2 * Math.PI) / wavelength;

    // Draw center line
    ctx.beginPath();
    ctx.strokeStyle = "#9CA3AF";
    ctx.setLineDash([5, 5]);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw upper envelope
    ctx.beginPath();
    ctx.strokeStyle = "rgba(96, 165, 250, 0.5)"; // Lighter blue for envelope
    ctx.lineWidth = 1;

    for (let x = 0; x < width; x++) {
      const d = (x / width) * wavelength * 2; // Scale x to cover 2 wavelengths

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

    // Draw lower envelope
    ctx.beginPath();
    ctx.strokeStyle = "rgba(96, 165, 250, 0.5)";

    for (let x = 0; x < width; x++) {
      const d = (x / width) * wavelength * 2;

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

    // Draw actual waveform at a specific time
    ctx.beginPath();
    ctx.strokeStyle = "#3B82F6"; // Solid blue for actual wave
    ctx.lineWidth = 2;

    // Time factor for animation (0 to 2π)
    const time = ((animationFrame % 100) / 100) * 2 * Math.PI;

    for (let x = 0; x < width; x++) {
      const d = (x / width) * wavelength * 2;

      // Incident wave: cos(ωt - βd)
      const incidentWave = Math.cos(time - beta * d);

      // Reflected wave: |Γ|cos(ωt + βd - θ)
      const reflectedWave = gamma * Math.cos(time + beta * d - theta);

      // Superposition of incident and reflected waves
      const totalWave = incidentWave + reflectedWave;

      // Scale and position the wave
      const y = height / 2 - totalWave * (height / 4);

      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    // Draw markers for voltage maxima and minima
    markers.forEach((marker) => {
      // Handle the case for negative reflection coefficient (where the marker.amplitude could be negative)
      const signFactor = marker.amplitude >= 0 ? 1 : -1;
      const y =
        height / 2 - ((Math.abs(marker.amplitude) * height) / 4) * signFactor;

      // Draw vertical line marker
      ctx.beginPath();
      ctx.setLineDash([]);
      ctx.lineWidth = 1;

      if (marker.type === "max") {
        ctx.strokeStyle = "#22C55E"; // Green for voltage maxima
      } else {
        ctx.strokeStyle = "#EF4444"; // Red for voltage minima
      }

      ctx.moveTo(marker.x, height / 2);
      ctx.lineTo(marker.x, y);
      ctx.stroke();

      // Draw marker circle
      ctx.beginPath();
      ctx.fillStyle = marker.type === "max" ? "#22C55E" : "#EF4444";
      ctx.arc(marker.x, y, 5, 0, 2 * Math.PI);
      ctx.fill();

      // Draw text label
      ctx.fillStyle = "#FFFFFF";
      ctx.font = "12px Arial";
      ctx.textAlign = "center";
      ctx.fillText(marker.type === "max" ? "Max" : "Min", marker.x, y - 10);

      // Draw distance label (small)
      ctx.font = "10px Arial";
      ctx.fillStyle = "#9CA3AF";
      ctx.fillText(`d=${marker.distanceFromLoad}`, marker.x, height / 2 + 20);
    });
  }, [reflectionCoefficient, wavelength, animationFrame, markers]);

  // Animation loop
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

  return (
    <div className="bg-gray-800 rounded-lg p-6 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Standing Wave Pattern</h2>
        <div className="flex gap-2">
          <button
            onClick={toggleAnimation}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {isAnimating ? "Pause" : "Animate"}
          </button>
        </div>
      </div>
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={800}
          height={200}
          className="w-full h-auto bg-gray-900 rounded"
        />
        {/* X-axis label */}
        <div className="absolute bottom-0 left-0 right-0 text-center text-gray-300 text-sm -mb-6">
          Distance from Load (d)
        </div>
        {/* X-axis tick marks */}
        <div className="absolute bottom-0 left-0 right-0 flex justify-between px-4 text-xs text-gray-400">
          <span>d = 0</span>
          <span>d = λ/4</span>
          <span>d = λ/2</span>
          <span>d = 3λ/4</span>
          <span>d = λ</span>
          <span>d = 5λ/4</span>
          <span>d = 3λ/2</span>
          <span>d = 7λ/4</span>
          <span>d = 2λ</span>
        </div>
        {/* Y-axis label */}
        <div className="absolute top-0 bottom-0 left-0 flex items-center -ml-10">
          <div className="transform -rotate-90 text-gray-300 text-sm whitespace-nowrap">
            - |V(d)| -
          </div>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center">
          <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">Voltage Maxima</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">Voltage Minima</span>
        </div>
        <div className="flex items-center">
          <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>
          <span className="text-sm text-gray-300">Instantaneous Voltage</span>
        </div>
      </div>
      <div className="text-sm text-gray-400 mt-2">
        <p>
          The standing wave pattern shows voltage along the transmission line.
          The solid blue line represents the instantaneous voltage at a specific
          moment, while the lighter blue envelope shows the maximum amplitude
          range.
        </p>

        <div className="mt-4 bg-gray-900 p-3 rounded-lg">
          <p className="font-semibold mb-2">Standing Wave Equation:</p>
          <p className="mb-2">
            Voltage Magnitude: |V(d)| = |V₀⁺|·[(1 + |Γ|²) + 2|Γ|cos(2βd -
            θ)]^(1/2)
          </p>
          <p className="mb-2">Where:</p>
          <ul className="list-disc list-inside pl-4 space-y-1">
            <li>|V₀⁺| is the incident voltage amplitude (normalized to 1)</li>
            <li>β = 2π/λ is the phase constant</li>
            <li>d is the distance from the load</li>
            <li>Γ = |Γ|∠θ is the reflection coefficient</li>
          </ul>
        </div>

        <div className="mt-4">
          <p className="font-semibold mb-1">Key Characteristics:</p>
          <ul className="list-disc list-inside pl-2 space-y-1">
            <li>
              <span className="text-green-400">Voltage maxima</span> occur at
              positions where 2βd - θ = 2nπ (n = 0, 1, 2...)
            </li>
            <li>
              <span className="text-red-400">Voltage minima</span> occur at
              positions where 2βd - θ = (2n+1)π
            </li>
            <li>The distance between adjacent maxima or minima is λ/2</li>
            <li>
              The ratio of maximum to minimum voltage is the VSWR:
              (1+|Γ|)/(1-|Γ|)
            </li>
            <li>
              For a perfect match (|Γ| = 0), there is no standing wave pattern
            </li>
            <li>
              For a complete reflection (|Γ| = 1), the minima reach zero voltage
            </li>
          </ul>
        </div>

        <p className="mt-2">
          <strong>Standing Wave Parameters:</strong>
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
          <div>
            VSWR:{" "}
            {reflectionCoefficient
              ? (
                  (1 + reflectionCoefficient.magnitude) /
                  (1 - reflectionCoefficient.magnitude)
                ).toFixed(2)
              : "N/A"}
          </div>
          <div>
            |Γ|:{" "}
            {reflectionCoefficient
              ? reflectionCoefficient.magnitude.toFixed(2)
              : "N/A"}
          </div>
          <div>
            ∠Γ:{" "}
            {reflectionCoefficient
              ? reflectionCoefficient.angle.toFixed(0) + "°"
              : "N/A"}
          </div>
          <div>λ/2: {(wavelength / 2).toFixed(2)} units</div>
        </div>
      </div>
    </div>
  );
};

export default StandingWave;
