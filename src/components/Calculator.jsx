"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const Calculator = ({ geometry, updateTxLineParams }) => {
  const [params, setParams] = useState({
    frequency: 1000,
    permittivity: 1.0,
    innerRadius: 0.5,
    outerRadius: 2.0,
    wireRadius: 1.0,
    wireSpacing: 10.0,
    plateWidth: 20.0,
    plateSpacing: 2.0,
  });

  useEffect(() => {
    // Calculate the transmission line parameters based on the geometry
    calculateTxLineParams();
  }, [params, geometry, updateTxLineParams]);

  const calculateTxLineParams = () => {
    let characteristicImpedance, propagationConstant, phaseVelocity, wavelength;
    const c = 3e8; // Speed of light in m/s
    const mu0 = 4 * Math.PI * 1e-7; // Permeability of free space
    const epsilon0 = 8.854e-12; // Permittivity of free space
    const epsilon = params.permittivity * epsilon0;

    // Convert MHz to Hz
    const f = params.frequency * 1e6;
    const omega = 2 * Math.PI * f;

    // Calculate parameters based on geometry
    switch (geometry) {
      case "coaxial":
        // Z0 = (60/sqrt(εr)) * ln(b/a)
        characteristicImpedance =
          (60 / Math.sqrt(params.permittivity)) *
          Math.log(params.outerRadius / params.innerRadius);
        break;

      case "twoWire":
        // Z0 = (120/sqrt(εr)) * ln(D/d)
        const ratio = params.wireSpacing / (2 * params.wireRadius);
        characteristicImpedance =
          (120 / Math.sqrt(params.permittivity)) * Math.log(ratio);
        break;

      case "parallelPlate":
        // Z0 = (η0 * d) / (w * sqrt(εr))
        // where η0 = 377 Ω (impedance of free space)
        characteristicImpedance =
          (377 * params.plateSpacing) /
          (params.plateWidth * Math.sqrt(params.permittivity));
        break;
    }

    // Calculate other parameters
    phaseVelocity = c / Math.sqrt(params.permittivity);
    wavelength = phaseVelocity / f;
    propagationConstant = {
      real: 0, // Alpha (attenuation constant) - zero for lossless line
      imag: omega / phaseVelocity, // Beta (phase constant)
    };

    // Update the transmission line parameters
    updateTxLineParams({
      characteristicImpedance,
      propagationConstant,
      phaseVelocity,
      wavelength,
    });
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setParams({ ...params, [name]: Number.parseFloat(value) });
  };

  const renderInputField = (name, label, value) => (
    <div className="flex flex-col">
      <label htmlFor={name} className="text-sm text-gray-400 mb-1">
        {label}
      </label>
      <input
        type="number"
        id={name}
        name={name}
        value={value}
        onChange={handleInputChange}
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
            viewBox="0 0 300 200"
            className="w-full h-auto"
          >
            <circle
              cx="150"
              cy="100"
              r="80"
              fill="#374151"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <circle
              cx="150"
              cy="100"
              r="30"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <line
              x1="150"
              y1="20"
              x2="230"
              y2="100"
              stroke="#9CA3AF"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <text
              x="190"
              y="60"
              textAnchor="middle"
              fontSize="12"
              fill="#D1D5DB"
            >
              outer radius
            </text>
            <line
              x1="150"
              y1="100"
              x2="180"
              y2="100"
              stroke="#9CA3AF"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <text
              x="165"
              y="95"
              textAnchor="middle"
              fontSize="12"
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
            viewBox="0 0 300 200"
            className="w-full h-auto"
          >
            <circle
              cx="100"
              cy="100"
              r="20"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <circle
              cx="200"
              cy="100"
              r="20"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <line
              x1="100"
              y1="100"
              x2="200"
              y2="100"
              stroke="#9CA3AF"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <text
              x="150"
              y="90"
              textAnchor="middle"
              fontSize="12"
              fill="#D1D5DB"
            >
              wire spacing
            </text>
            <line
              x1="100"
              y1="80"
              x2="100"
              y2="100"
              stroke="#9CA3AF"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <text
              x="80"
              y="90"
              textAnchor="middle"
              fontSize="12"
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
            viewBox="0 0 300 200"
            className="w-full h-auto"
          >
            <rect
              x="50"
              y="70"
              width="200"
              height="10"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <rect
              x="50"
              y="120"
              width="200"
              height="10"
              fill="#6B7280"
              stroke="#9CA3AF"
              strokeWidth="2"
            />
            <line
              x1="40"
              y1="80"
              x2="40"
              y2="120"
              stroke="#9CA3AF"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <text
              x="25"
              y="100"
              textAnchor="middle"
              fontSize="12"
              fill="#D1D5DB"
            >
              spacing
            </text>
            <line
              x1="50"
              y1="60"
              x2="250"
              y2="60"
              stroke="#9CA3AF"
              strokeWidth="1"
              strokeDasharray="4"
            />
            <text
              x="150"
              y="50"
              textAnchor="middle"
              fontSize="12"
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
            {renderInputField("frequency", "Frequency (MHz)", params.frequency)}
            {renderInputField(
              "permittivity",
              "Relative Permittivity (εᵣ)",
              params.permittivity
            )}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition-colors"
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
