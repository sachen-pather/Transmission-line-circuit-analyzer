"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Calculator = ({ geometry, updateTxLineParams }) => {
  const [params, setParams] = useState({
    frequency: 1000,
    permittivity: 1.0,
    permeability: 1.0,
    conductivity: 5.8e7, // Copper conductivity (S/m)
    dielectricConductivity: 0.0, // Dielectric conductivity (S/m)
    innerRadius: 0.5,
    outerRadius: 2.0,
    wireRadius: 1.0,
    wireSpacing: 10.0,
    plateWidth: 20.0,
    plateSpacing: 2.0,
  });

  const [lineParams, setLineParams] = useState({
    resistance: null, // R'
    inductance: null, // L'
    conductance: null, // G'
    capacitance: null, // C'
  });

  useEffect(() => {
    // Calculate the transmission line parameters based on the geometry
    calculateTxLineParams();
  }, [params, geometry]);

  const handleCalculate = () => {
    calculateTxLineParams();
  };
  const calculateTxLineParams = () => {
    // Convert string params to numbers with validation
    const numericParams = {};
    const requiredFields = [
      "frequency",
      "permittivity",
      "permeability",
      "conductivity",
      "dielectricConductivity",
      "innerRadius",
      "outerRadius",
      "wireRadius",
      "wireSpacing",
      "plateWidth",
      "plateSpacing",
    ];

    for (const key of Object.keys(params)) {
      const val = params[key];
      if (requiredFields.includes(key) && (val === "" || val === ".")) {
        numericParams[key] = 0; // Default for empty or "."
      } else {
        numericParams[key] = Number(val);
        if (isNaN(numericParams[key])) {
          console.error(`Invalid input for ${key}: "${val}"`);
          setLineParams({
            resistance: NaN,
            inductance: NaN,
            conductance: NaN,
            capacitance: NaN,
          });
          updateTxLineParams({
            characteristicImpedance: NaN,
            propagationConstant: { real: NaN, imag: NaN },
            phaseVelocity: NaN,
            wavelength: NaN,
            lineParams: {
              resistance: NaN,
              inductance: NaN,
              conductance: NaN,
              capacitance: NaN,
            },
          });
          return;
        }
      }
    }

    // Constants
    const c = 2.99792458e8; // Speed of light (m/s)
    const mu0 = 4 * Math.PI * 1e-7; // Permeability of free space (H/m)
    const epsilon0 = 8.85418782e-12; // Permittivity of free space (F/m)
    const mu_c = mu0; // Conductor permeability (assume non-magnetic)

    // Material properties
    const mu = numericParams.permeability * mu0; // Dielectric permeability
    const epsilon = numericParams.permittivity * epsilon0; // Dielectric permittivity
    const sigma = numericParams.conductivity; // Conductor conductivity (S/m)
    const sigmaD = numericParams.dielectricConductivity; // Dielectric conductivity (S/m)

    // Frequency in Hz
    const f = numericParams.frequency * 1e6;
    const omega = 2 * Math.PI * f;

    // Surface resistance Rs = √(π f μ_c / σ_c)
    const Rs = sigma > 0 ? Math.sqrt((Math.PI * f * mu_c) / sigma) : Infinity;

    // Transmission line parameters
    let R, L, G, C, characteristicImpedance;

    try {
      switch (geometry) {
        case "coaxial": {
          const a = numericParams.innerRadius * 1e-3;
          const b = numericParams.outerRadius * 1e-3;
          if (a <= 0 || b <= a) throw new Error("Invalid coaxial dimensions");
          const logTerm = Math.log(b / a);
          R =
            a > 0 && b > 0 ? (Rs / (2 * Math.PI)) * (1 / a + 1 / b) : Infinity;
          L = (mu / (2 * Math.PI)) * logTerm;
          G = (2 * Math.PI * sigmaD) / logTerm;
          C = (2 * Math.PI * epsilon) / logTerm;
          characteristicImpedance =
            (60 / Math.sqrt(numericParams.permittivity)) * logTerm;
          break;
        }
        case "twoWire": {
          const a = numericParams.wireRadius * 1e-3;
          const D = numericParams.wireSpacing * 1e-3;
          if (a <= 0 || D <= 2 * a)
            throw new Error("Invalid two-wire dimensions");
          const ratio = D / (2 * a);
          const logTerm = Math.log(ratio + Math.sqrt(ratio * ratio - 1));
          R = a > 0 ? Rs / (Math.PI * a) : Infinity;
          L = (mu / Math.PI) * logTerm;
          G = (Math.PI * sigmaD) / logTerm;
          C = (Math.PI * epsilon) / logTerm;
          characteristicImpedance =
            (120 / Math.sqrt(numericParams.permittivity)) * logTerm;
          break;
        }
        case "parallelPlate": {
          const w = numericParams.plateWidth * 1e-3;
          const h = numericParams.plateSpacing * 1e-3;
          if (w <= 0 || h <= 0)
            throw new Error("Invalid parallel-plate dimensions");
          R = (2 * Rs) / w;
          L = (mu * h) / w;
          G = (sigmaD * w) / h;
          C = (epsilon * w) / h;
          characteristicImpedance =
            (377 * h) / (w * Math.sqrt(numericParams.permittivity));
          break;
        }
        default:
          throw new Error("Unknown geometry");
      }

      // Update line parameters
      setLineParams({
        resistance: R,
        inductance: L,
        conductance: G,
        capacitance: C,
      });

      // Propagation parameters
      const alpha = (R / 2) * Math.sqrt(C / L) + (G / 2) * Math.sqrt(L / C);
      const beta = omega * Math.sqrt(L * C);
      const propagationConstant = { real: alpha, imag: beta };
      const phaseVelocity = c / Math.sqrt(numericParams.permittivity);
      const wavelength = phaseVelocity / f;

      updateTxLineParams({
        characteristicImpedance,
        propagationConstant,
        phaseVelocity,
        wavelength,
        lineParams: {
          resistance: R,
          inductance: L,
          conductance: G,
          capacitance: C,
        },
      });
    } catch (error) {
      console.error(`Calculation error: ${error.message}`);
      setLineParams({
        resistance: NaN,
        inductance: NaN,
        conductance: NaN,
        capacitance: NaN,
      });
      updateTxLineParams({
        characteristicImpedance: NaN,
        propagationConstant: { real: NaN, imag: NaN },
        phaseVelocity: NaN,
        wavelength: NaN,
        lineParams: {
          resistance: NaN,
          inductance: NaN,
          conductance: NaN,
          capacitance: NaN,
        },
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Normalize comma to decimal point for locale compatibility
    const normalizedValue = value.replace(",", ".");

    // Store as string, even for empty or partial inputs
    setParams({ ...params, [name]: normalizedValue });
  };

  const renderInputField = (name, label, value, placeholder = null) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm text-gray-400 mb-1">
        {label}
      </label>
      <input
        type="text"
        id={name}
        name={name}
        value={
          typeof value === "number" && Math.abs(value) < 0.0001 && value !== 0
            ? value.toExponential(6)
            : value
        }
        onChange={handleInputChange}
        placeholder={placeholder}
        className="bg-gray-700 text-white px-4 py-2 rounded-md"
      />
    </div>
  );

  const renderGeometryInputs = () => {
    switch (geometry) {
      case "coaxial":
        return (
          <>
            {renderInputField(
              "innerRadius",
              "Inner Conductor Radius (mm)",
              params.innerRadius
            )}
            {renderInputField(
              "outerRadius",
              "Outer Conductor Radius (mm)",
              params.outerRadius
            )}
          </>
        );
      case "twoWire":
        return (
          <>
            {renderInputField(
              "wireRadius",
              "Wire Radius (mm)",
              params.wireRadius
            )}
            {renderInputField(
              "wireSpacing",
              "Wire Spacing (mm)",
              params.wireSpacing
            )}
          </>
        );
      case "parallelPlate":
        return (
          <>
            {renderInputField(
              "plateWidth",
              "Plate Width (mm)",
              params.plateWidth
            )}
            {renderInputField(
              "plateSpacing",
              "Plate Spacing (mm)",
              params.plateSpacing
            )}
          </>
        );
      default:
        return null;
    }
  };

  const renderGeometryDiagram = () => {
    switch (geometry) {
      case "coaxial":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 300" // Increased from 300x200 to 400x300
            className="w-full h-auto"
          >
            {/* Outer circle */}
            <circle
              cx="200"
              cy="150"
              r="120" // Increased from 80
              fill="#374151"
              stroke="#9CA3AF"
              strokeWidth="3" // Slightly thicker stroke
            />
            {/* Inner circle */}
            <circle
              cx="200"
              cy="150"
              r="50" // Increased from 30
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="3"
            />
            {/* Outer radius line */}
            <line
              x1="200"
              y1="150" // Adjusted to fit larger canvas
              x2="200" // Extended to match larger radius
              y2="30"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6" // Larger dash for visibility
            />
            <text
              x="200" // Repositioned for larger diagram
              y="20" // Adjusted vertically
              textAnchor="middle"
              fontSize="16" // Increased from 12
              fill="#D1D5DB"
            >
              outer radius
            </text>
            {/* Inner radius line */}
            <line
              x1="200"
              y1="150"
              x2="250" // Extended to match larger inner circle
              y2="150"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6"
            />
            <text
              x="225" // Centered on longer line
              y="140" // Moved up slightly for clarity
              textAnchor="middle"
              fontSize="16"
              fill="#D1D5DB"
            >
              inner radius
            </text>
          </svg>
        );

      case "twoWire":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 300" // Increased from 220x200 to 400x300
            className="w-full h-auto"
          >
            {/* Left wire */}
            <circle
              cx="120" // Shifted left to use more space
              cy="150"
              r="40" // Increased from 20
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="3"
            />
            {/* Right wire */}
            <circle
              cx="280" // Shifted right for symmetry
              cy="150"
              r="40"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="3"
            />
            {/* Wire spacing line */}
            <line
              x1="120"
              y1="150"
              x2="280"
              y2="150"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6"
            />
            <text
              x="200" // Centered between larger circles
              y="130" // Moved up for better spacing
              textAnchor="middle"
              fontSize="16" // Increased from 12
              fill="#D1D5DB"
            >
              wire spacing
            </text>
            {/* Radius line (left wire) */}
            <line
              x1="120"
              y1="110" // Adjusted for larger circle
              x2="120"
              y2="150"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6"
            />
            <text
              x="90" // Shifted left to avoid overlap
              y="130"
              textAnchor="middle"
              fontSize="16"
              fill="#D1D5DB"
            >
              radius
            </text>
          </svg>
        );

      case "parallelPlate":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 300" // Increased from 300x200 to 400x300
            className="w-full h-auto"
          >
            {/* Top plate */}
            <rect
              x="50"
              y="80" // Adjusted slightly down
              width="300" // Increased from 200
              height="20" // Increased from 10
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="3"
            />
            {/* Bottom plate */}
            <rect
              x="50"
              y="180" // Increased spacing from 120
              width="300"
              height="20"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="3"
            />
            {/* Spacing line */}
            <line
              x1="40"
              y1="100" // Adjusted for thicker plate
              x2="40"
              y2="180"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6"
            />
            <text
              x="25"
              y="140" // Centered in larger gap
              textAnchor="middle"
              fontSize="16" // Increased from 12
              fill="#D1D5DB"
            >
              spacing
            </text>
            {/* Width line */}
            <line
              x1="50"
              y1="60" // Moved up for larger diagram
              x2="350" // Extended to match wider plate
              y2="60"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6"
            />
            <text
              x="200" // Centered on wider line
              y="50" // Adjusted up slightly
              textAnchor="middle"
              fontSize="16"
              fill="#D1D5DB"
            >
              width
            </text>
          </svg>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Calculator</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <div className="grid grid-cols-2 gap-4 mb-4">
            {renderGeometryInputs()}
            {renderInputField(
              "frequency",
              "Frequency (MHz)",
              params.frequency,
              "e.g., 2000 or 2e3"
            )}
            {renderInputField(
              "permittivity",
              "Relative Permittivity (εᵣ)",
              params.permittivity,
              "e.g., 2.6"
            )}
            {renderInputField(
              "permeability",
              "Relative Permeability (μᵣ)",
              params.permeability,
              "e.g., 1.0"
            )}
            {renderInputField(
              "conductivity",
              "Conductor Conductivity (S/m)",
              params.conductivity,
              "e.g., 5.8e7 for copper"
            )}
            {renderInputField(
              "dielectricConductivity",
              "Dielectric Conductivity (S/m)",
              params.dielectricConductivity,
              "e.g., 2e-6"
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
            onClick={handleCalculate}
          >
            Calculate Parameters
          </motion.button>
        </div>
        <div className="flex items-center justify-center">
          {renderGeometryDiagram()}
        </div>
      </div>
    </motion.div>
  );
};

export default Calculator;
