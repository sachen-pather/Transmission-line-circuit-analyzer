"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const CircuitProperties = ({ txLineParams, circuitProps, setCircuitProps }) => {
  const [loadType, setLoadType] = useState("complex");

  // Handle input changes for line length
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    // Always store the raw text value
    setCircuitProps({
      ...circuitProps,
      [`${name}Text`]: value,
    });

    if (value === "") {
      setCircuitProps((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    } else {
      const numericValue = value.replace(",", ".");
      const parsedValue = parseFloat(numericValue);

      if (!isNaN(parsedValue)) {
        setCircuitProps((prev) => ({
          ...prev,
          [name]: parsedValue,
        }));
      }
    }
  };

  // Handle load type changes
  const handleLoadTypeChange = (type) => {
    setLoadType(type);
    if (type === "short") {
      setCircuitProps({
        ...circuitProps,
        loadImpedance: { real: 0, imag: 0 },
      });
    } else if (type === "open") {
      setCircuitProps({
        ...circuitProps,
        loadImpedance: { real: 1e6, imag: 0 },
      });
    }
  };

  // Calculate circuit properties
  // Calculate circuit properties
  useEffect(() => {
    if (
      txLineParams &&
      txLineParams.characteristicImpedance &&
      circuitProps.lineLength !== undefined &&
      circuitProps.loadImpedance.real !== undefined &&
      circuitProps.loadImpedance.imag !== undefined
    ) {
      const Z0 = txLineParams.characteristicImpedance;
      const ZL = circuitProps.loadImpedance;
      const gamma = txLineParams.propagationConstant || { real: 0, imag: 0 };
      const d = circuitProps.lineLength;
      const alpha = gamma.real; // Attenuation constant (Np/m)
      const beta = gamma.imag; // Phase constant (rad/m)

      let reflectionCoefficient, vswr, waveImpedance;

      try {
        // Reflection coefficient calculation: Γ = (ZL - Z0) / (ZL + Z0)
        const refNumReal = ZL.real - Z0;
        const refNumImag = ZL.imag;
        const refDenReal = ZL.real + Z0;
        const refDenImag = ZL.imag;
        const denMagSquaredRef =
          refDenReal * refDenReal + refDenImag * refDenImag;

        // Avoid division by zero
        const gammaReal =
          denMagSquaredRef > 0.00001
            ? (refNumReal * refDenReal + refNumImag * refDenImag) /
              denMagSquaredRef
            : 0;
        const gammaImag =
          denMagSquaredRef > 0.00001
            ? (refNumImag * refDenReal - refNumReal * refDenImag) /
              denMagSquaredRef
            : 0;

        // Calculate magnitude and angle of reflection coefficient
        const magnitude = Math.sqrt(
          gammaReal * gammaReal + gammaImag * gammaImag
        );
        const angle = (Math.atan2(gammaImag, gammaReal) * 180) / Math.PI;
        reflectionCoefficient = { magnitude, angle };

        // VSWR calculation: S = (1 + |Γ|) / (1 - |Γ|)
        const epsilon = 0.000001; // Small value to avoid division by zero
        vswr = (1 + magnitude) / Math.max(1 - magnitude, epsilon);

        // Wave impedance calculation
        const gammaDReal = alpha * d;
        const gammaDImag = beta * d;
        const sinhReal = Math.sinh(gammaDReal);
        const coshReal = Math.cosh(gammaDReal);
        const sinImag = Math.sin(gammaDImag);
        const cosImag = Math.cos(gammaDImag);

        if (loadType === "short") {
          // Z(d) = Z₀ * tanh(γd) for short circuit
          const numReal = sinhReal * cosImag;
          const numImag = coshReal * sinImag;
          const denReal = coshReal * cosImag;
          const denImag = sinhReal * sinImag;
          const denMagSq = denReal * denReal + denImag * denImag;
          waveImpedance = {
            real:
              denMagSq > 0.00001
                ? (Z0 * (numReal * denReal + numImag * denImag)) / denMagSq
                : 0,
            imag:
              denMagSq > 0.00001
                ? (Z0 * (numImag * denReal - numReal * denImag)) / denMagSq
                : 0,
          };
        } else if (loadType === "open") {
          // Z(d) = Z₀ * coth(γd) for open circuit
          const numReal = coshReal * cosImag;
          const numImag = -sinhReal * sinImag;
          const denReal = coshReal * cosImag;
          const denImag = sinhReal * sinImag;
          const denMagSq = denReal * denReal + denImag * denImag;
          waveImpedance = {
            real:
              denMagSq > 0.00001
                ? (Z0 * (numReal * denReal + numImag * denImag)) / denMagSq
                : 1e6, // Large value for open circuit edge case
            imag:
              denMagSq > 0.00001
                ? (Z0 * (numImag * denReal - numReal * denImag)) / denMagSq
                : 0,
          };
        } else {
          // Complex load: Z(d) = Z₀ * (1 + Γe^(-2γd)) / (1 - Γe^(-2γd))
          const expMag = Math.exp(-2 * alpha * d);
          const expReal = expMag * Math.cos(-2 * beta * d); // Corrected sign for e^(-j2βd)
          const expImag = expMag * Math.sin(-2 * beta * d);
          const gammaExpReal = gammaReal * expReal - gammaImag * expImag;
          const gammaExpImag = gammaReal * expImag + gammaImag * expReal;

          const waveNumReal = 1 + gammaExpReal;
          const waveNumImag = gammaExpImag;
          const waveDenReal = 1 - gammaExpReal;
          const waveDenImag = -gammaExpImag;
          const denMagSquaredWave =
            waveDenReal * waveDenReal + waveDenImag * waveDenImag;

          waveImpedance = {
            real:
              denMagSquaredWave > 0.00001
                ? (Z0 *
                    (waveNumReal * waveDenReal + waveNumImag * waveDenImag)) /
                  denMagSquaredWave
                : waveDenReal > 0
                ? 1e6
                : -1e6,
            imag:
              denMagSquaredWave > 0.00001
                ? (Z0 *
                    (waveNumImag * waveDenReal - waveNumReal * waveDenImag)) /
                  denMagSquaredWave
                : 0,
          };
        }

        setCircuitProps((prev) => ({
          ...prev,
          reflectionCoefficient,
          vswr,
          waveImpedance,
        }));
      } catch (error) {
        console.error("Error calculating circuit properties:", error);
        setCircuitProps((prev) => ({
          ...prev,
          reflectionCoefficient: null,
          vswr: null,
          waveImpedance: null,
        }));
      }
    }
  }, [
    txLineParams,
    circuitProps.loadImpedance,
    circuitProps.lineLength,
    setCircuitProps,
    loadType,
  ]);

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
            type="text"
            id="lineLength"
            name="lineLength"
            value={circuitProps.lineLengthText || circuitProps.lineLength || ""}
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
              type="text"
              value={
                circuitProps.loadImpedance.realText !== undefined
                  ? circuitProps.loadImpedance.realText
                  : circuitProps.loadImpedance.real !== undefined
                  ? circuitProps.loadImpedance.real
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                setCircuitProps({
                  ...circuitProps,
                  loadImpedance: {
                    ...circuitProps.loadImpedance,
                    realText: value,
                  },
                });
                if (value === "") {
                  setCircuitProps((prev) => ({
                    ...prev,
                    loadImpedance: {
                      ...prev.loadImpedance,
                      real: undefined,
                    },
                  }));
                } else {
                  const numericValue = value.replace(",", ".");
                  const parsedValue = parseFloat(numericValue);
                  if (!isNaN(parsedValue)) {
                    setCircuitProps((prev) => ({
                      ...prev,
                      loadImpedance: {
                        ...prev.loadImpedance,
                        real: parsedValue,
                      },
                    }));
                  }
                }
              }}
              className="bg-gray-700 text-white px-4 py-2 rounded-md w-24"
            />
            <span className="text-white">+</span>
            <input
              type="text"
              value={
                circuitProps.loadImpedance.imagText !== undefined
                  ? circuitProps.loadImpedance.imagText
                  : circuitProps.loadImpedance.imag !== undefined
                  ? circuitProps.loadImpedance.imag
                  : ""
              }
              onChange={(e) => {
                const value = e.target.value;
                setCircuitProps({
                  ...circuitProps,
                  loadImpedance: {
                    ...circuitProps.loadImpedance,
                    imagText: value,
                  },
                });
                if (value === "") {
                  setCircuitProps((prev) => ({
                    ...prev,
                    loadImpedance: {
                      ...prev.loadImpedance,
                      imag: undefined,
                    },
                  }));
                } else {
                  const numericValue = value.replace(",", ".");
                  const parsedValue = parseFloat(numericValue);
                  if (!isNaN(parsedValue)) {
                    setCircuitProps((prev) => ({
                      ...prev,
                      loadImpedance: {
                        ...prev.loadImpedance,
                        imag: parsedValue,
                      },
                    }));
                  }
                }
              }}
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
