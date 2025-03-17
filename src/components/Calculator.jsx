"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Calculator = ({
  geometry,
  updateTxLineParams,
  calculatorInputs,
  updateCalculatorInputs,
}) => {
  {
    /*const [params, setParams] = useState({
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
    stripWidth: 1.0, // For microstrip
    substrateHeight: 0.5, // For microstrip
  });*/
  }
  const params = calculatorInputs;
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
      "stripWidth",
      "substrateHeight",
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
    let R, L, G, C;
    let characteristicImpedance, propagationConstant, phaseVelocity, wavelength;
    let effectivePermittivity; // For microstrip

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

          // Calculate propagation parameters
          const alpha = (R / 2) * Math.sqrt(C / L) + (G / 2) * Math.sqrt(L / C);
          const beta = omega * Math.sqrt(L * C);
          propagationConstant = { real: alpha, imag: beta };
          phaseVelocity = c / Math.sqrt(numericParams.permittivity);
          wavelength = phaseVelocity / f;
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

          // Calculate propagation parameters
          const alpha = (R / 2) * Math.sqrt(C / L) + (G / 2) * Math.sqrt(L / C);
          const beta = omega * Math.sqrt(L * C);
          propagationConstant = { real: alpha, imag: beta };
          phaseVelocity = c / Math.sqrt(numericParams.permittivity);
          wavelength = phaseVelocity / f;
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

          // Calculate propagation parameters
          const alpha = (R / 2) * Math.sqrt(C / L) + (G / 2) * Math.sqrt(L / C);
          const beta = omega * Math.sqrt(L * C);
          propagationConstant = { real: alpha, imag: beta };
          phaseVelocity = c / Math.sqrt(numericParams.permittivity);
          wavelength = phaseVelocity / f;
          break;
        }
        case "microstrip": {
          // Calculate effective permittivity
          const w = numericParams.stripWidth * 1e-3; // Convert mm to m
          const h = numericParams.substrateHeight * 1e-3; // Convert mm to m
          const er = numericParams.permittivity;

          const s = w / h; // width-to-thickness ratio
          const x = Math.pow((er - 0.9) / (er + 3), 0.05);
          const y =
            1 +
            0.02 *
              Math.log(
                (Math.pow(s, 4) + 3.7e-4 * s * s) / (Math.pow(s, 4) + 0.43)
              ) +
            0.05 * Math.log(1 + 1.7e-4 * Math.pow(s, 3));

          // Basic effective permittivity (low frequency)
          let effectivePermittivity =
            (er + 1) / 2 + ((er - 1) / 2) * Math.pow(1 + 10 / s, -x * y);

          // Calculate t parameter for impedance formula
          const t = Math.pow(30.67 / s, 0.75);

          // First calculate a preliminary Z₀ using the low-frequency εeff
          const prelimZ0 =
            (60 / Math.sqrt(effectivePermittivity)) *
            Math.log(
              (6 + (2 * Math.PI - 6) * Math.exp(-t)) / s +
                Math.sqrt(1 + 4 / Math.pow(s, 2))
            );

          // Rename G to dispersionFactor to avoid conflict with conductance G
          const dispersionFactor = 0.6 + 0.009 * prelimZ0;
          const fp = prelimZ0 / (2 * mu0 * h) / 1e9; // Convert to GHz

          // Apply frequency-dependent correction for high frequencies
          if (f > 2e9) {
            // Only apply for frequencies > 2 GHz
            // Apply the frequency dispersion formula
            const fGHz = f / 1e9; // Convert Hz to GHz
            effectivePermittivity =
              er -
              (er - effectivePermittivity) /
                (1 + dispersionFactor * Math.pow(fGHz / fp, 2));
          }

          characteristicImpedance =
            (60 / Math.sqrt(effectivePermittivity)) *
            Math.log(
              (6 + (2 * Math.PI - 6) * Math.exp(-t)) / s +
                Math.sqrt(1 + 4 / Math.pow(s, 2))
            );

          // For microstrip, R' and G' are approximately zero for most practical cases
          R = 0; // Approximation for ideal conductor
          G = 0; // Approximation for ideal dielectric

          // Calculate C' and L' using relationships
          C = Math.sqrt(effectivePermittivity) / (characteristicImpedance * c);
          L = characteristicImpedance * characteristicImpedance * C;

          // ADD THESE CALCULATIONS after L and C
          // Calculate propagation parameters
          phaseVelocity = c / Math.sqrt(effectivePermittivity);
          const beta = omega / phaseVelocity;
          propagationConstant = { real: 0, imag: beta }; // Assuming lossless
          wavelength = phaseVelocity / f;

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

      // Prepare the parameters to update
      const paramsToUpdate = {
        characteristicImpedance,
        propagationConstant,
        phaseVelocity,
        wavelength,
        frequency: f,
        conductivity: sigma,
        lineParams: {
          resistance: R,
          inductance: L,
          conductance: G,
          capacitance: C,
        },
      };

      // Add microstrip-specific parameters if needed
      if (geometry === "microstrip") {
        paramsToUpdate.effectivePermittivity = effectivePermittivity;
        paramsToUpdate.microstripParams = {
          stripWidth: numericParams.stripWidth,
          substrateHeight: numericParams.substrateHeight,
          permittivity: numericParams.permittivity,
          frequencyDispersionApplied: f > 2e9, // Flag to indicate if dispersion was applied
        };
      }

      updateTxLineParams(paramsToUpdate);
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

    // Use the updateCalculatorInputs function from props
    updateCalculatorInputs({ [name]: normalizedValue });
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
      case "microstrip":
        return (
          <>
            {renderInputField(
              "stripWidth",
              "Strip Width (mm)",
              params.stripWidth
            )}
            {renderInputField(
              "substrateHeight",
              "Substrate Height (mm)",
              params.substrateHeight
            )}
            {renderInputField(
              "permittivity",
              "Relative Permittivity (εᵣ)",
              params.permittivity
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
            viewBox="0 0 400 300"
            className="w-full h-auto"
          >
            {/* Outer circle */}
            <circle
              cx="200"
              cy="150"
              r="120"
              fill="#374151"
              stroke="#9CA3AF"
              strokeWidth="3"
            />
            {/* Inner circle */}
            <circle
              cx="200"
              cy="150"
              r="50"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="3"
            />
            {/* Outer radius line */}
            <line
              x1="200"
              y1="150"
              x2="200"
              y2="30"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6"
            />
            <text
              x="200"
              y="20"
              textAnchor="middle"
              fontSize="16"
              fill="#D1D5DB"
            >
              outer radius
            </text>
            {/* Inner radius line */}
            <line
              x1="200"
              y1="150"
              x2="250"
              y2="150"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6"
            />
            <text
              x="225"
              y="140"
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
            viewBox="0 0 400 300"
            className="w-full h-auto"
          >
            {/* Left wire */}
            <circle
              cx="120"
              cy="150"
              r="40"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="3"
            />
            {/* Right wire */}
            <circle
              cx="280"
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
              x="200"
              y="130"
              textAnchor="middle"
              fontSize="16"
              fill="#D1D5DB"
            >
              wire spacing
            </text>
            {/* Radius line (left wire) */}
            <line
              x1="120"
              y1="110"
              x2="120"
              y2="150"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6"
            />
            <text
              x="90"
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
            viewBox="0 0 400 300"
            className="w-full h-auto"
          >
            {/* Top plate */}
            <rect
              x="50"
              y="80"
              width="300"
              height="20"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="3"
            />
            {/* Bottom plate */}
            <rect
              x="50"
              y="180"
              width="300"
              height="20"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="3"
            />
            {/* Spacing line */}
            <line
              x1="40"
              y1="100"
              x2="40"
              y2="180"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6"
            />
            <text
              x="25"
              y="140"
              textAnchor="middle"
              fontSize="16"
              fill="#D1D5DB"
            >
              spacing
            </text>
            {/* Width line */}
            <line
              x1="50"
              y1="60"
              x2="350"
              y2="60"
              stroke="#9CA3AF"
              strokeWidth="2"
              strokeDasharray="6"
            />
            <text
              x="200"
              y="50"
              textAnchor="middle"
              fontSize="16"
              fill="#D1D5DB"
            >
              width
            </text>
          </svg>
        );

      case "microstrip":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 400 300"
            className="w-full h-auto"
          >
            {/* Ground plane */}
            <rect
              x="50"
              y="220"
              width="300"
              height="10"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="2"
            />

            {/* Dielectric substrate */}
            <rect
              x="50"
              y="170"
              width="300"
              height="50"
              fill="#D1FAE5"
              fillOpacity="0.6"
              stroke="#9CA3AF"
              strokeWidth="2"
            />

            {/* Microstrip conductor */}
            <rect
              x="150"
              y="160"
              width="100"
              height="10"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="2"
            />

            {/* Width label */}
            <line
              x1="150"
              y1="140"
              x2="250"
              y2="140"
              stroke="#EC4899"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            <text
              x="200"
              y="130"
              textAnchor="middle"
              fill="#EC4899"
              fontSize="14"
            >
              w = {params.stripWidth} mm
            </text>

            {/* Height label */}
            <line
              x1="380"
              y1="170"
              x2="380"
              y2="220"
              stroke="#EC4899"
              strokeWidth="1"
              strokeDasharray="5,5"
            />
            <text x="370" y="195" textAnchor="end" fill="#EC4899" fontSize="14">
              h = {params.substrateHeight} mm
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
            {geometry !== "microstrip" &&
              renderInputField(
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
