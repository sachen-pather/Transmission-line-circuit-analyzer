"use client";

import { useState } from "react";
import { motion } from "framer-motion";

const CircuitProperties = ({ txLineParams, circuitProps, setCircuitProps }) => {
  const [loadType, setLoadType] = useState("complex");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCircuitProps({ ...circuitProps, [name]: Number.parseFloat(value) });
  };

  const handleLoadTypeChange = (type) => {
    setLoadType(type);
    if (type === "short") {
      setCircuitProps({ ...circuitProps, loadImpedance: { real: 0, imag: 0 } });
    } else if (type === "open") {
      setCircuitProps({
        ...circuitProps,
        loadImpedance: { real: 1e6, imag: 0 },
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-2xl font-semibold mb-4">
        Transmission Line Circuit Properties
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="flex flex-col">
          <label htmlFor="lineLength" className="text-sm text-gray-400 mb-1">
            Line Length (m)
          </label>
          <input
            type="number"
            id="lineLength"
            name="lineLength"
            value={circuitProps.lineLength}
            onChange={handleInputChange}
            className="bg-gray-700 text-white px-4 py-2 rounded-md"
          />
        </div>
      </div>
      <div className="mb-4">
        <h3 className="text-lg font-semibold mb-2">Load Type</h3>
        <div className="flex space-x-4">
          <label className="flex items-center">
            <input
              type="radio"
              name="loadType"
              value="complex"
              checked={loadType === "complex"}
              onChange={() => handleLoadTypeChange("complex")}
              className="mr-2"
            />
            Complex Load
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="loadType"
              value="short"
              checked={loadType === "short"}
              onChange={() => handleLoadTypeChange("short")}
              className="mr-2"
            />
            Short Circuit
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              name="loadType"
              value="open"
              checked={loadType === "open"}
              onChange={() => handleLoadTypeChange("open")}
              className="mr-2"
            />
            Open Circuit
          </label>
        </div>
      </div>
      {loadType === "complex" && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">
            Complex Load Impedance (Ω)
          </h3>
          <div className="flex items-center space-x-2">
            <input
              type="number"
              value={circuitProps.loadImpedance.real}
              onChange={(e) =>
                setCircuitProps({
                  ...circuitProps,
                  loadImpedance: {
                    ...circuitProps.loadImpedance,
                    real: Number.parseFloat(e.target.value),
                  },
                })
              }
              className="bg-gray-700 text-white px-4 py-2 rounded-md w-24"
            />
            <span className="text-white">+</span>
            <input
              type="number"
              value={circuitProps.loadImpedance.imag}
              onChange={(e) =>
                setCircuitProps({
                  ...circuitProps,
                  loadImpedance: {
                    ...circuitProps.loadImpedance,
                    imag: Number.parseFloat(e.target.value),
                  },
                })
              }
              className="bg-gray-700 text-white px-4 py-2 rounded-md w-24"
            />
            <span className="text-white">j</span>
          </div>
        </div>
      )}
      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Circuit Results</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-400">Reflection Coefficient (Γ):</p>
            <p className="text-lg">
              {circuitProps.reflectionCoefficient
                ? `${circuitProps.reflectionCoefficient.magnitude.toFixed(
                    3
                  )} ∠ ${circuitProps.reflectionCoefficient.angle.toFixed(1)}°`
                : "N/A"}
            </p>
          </div>
          <div>
            <p className="text-gray-400">VSWR:</p>
            <p className="text-lg">{circuitProps.vswr?.toFixed(2) || "N/A"}</p>
          </div>
          <div>
            <p className="text-gray-400">Wave Impedance:</p>
            <p className="text-lg">
              {circuitProps.waveImpedance
                ? `${circuitProps.waveImpedance.real.toFixed(
                    1
                  )} + j${circuitProps.waveImpedance.imag.toFixed(1)} Ω`
                : "N/A"}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CircuitProperties;
