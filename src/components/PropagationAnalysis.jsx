"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const PropagationAnalysis = ({ txLineParams }) => {
  const [lossyParams, setLossyParams] = useState({
    alpha: null, // attenuation constant
    beta: null, // phase constant
    attenuationDb: null, // attenuation in dB/m
  });

  useEffect(() => {
    if (!txLineParams || !txLineParams.lineParams) return;

    // Extract parameters
    const { resistance, inductance, conductance, capacitance } =
      txLineParams.lineParams;

    if (!resistance || !inductance || !conductance || !capacitance) return;

    // Calculate parameters for lossy line using low-loss approximation
    // Alpha = (R'/2Z₀) + (G'Z₀/2)
    const Z0 = txLineParams.characteristicImpedance;
    const alpha = resistance / (2 * Z0) + (conductance * Z0) / 2;

    // Beta from the phase constant
    const beta = txLineParams.propagationConstant.imag;

    // Calculate attenuation in dB/m
    const attenuationDb = 8.686 * alpha; // 8.686 = 20*log10(e)

    setLossyParams({
      alpha,
      beta,
      attenuationDb,
    });
  }, [txLineParams]);

  if (!txLineParams || !txLineParams.lineParams) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Wave Propagation Analysis</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Attenuation & Phase
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-gray-400">Attenuation Constant (α):</div>
            <div>
              {lossyParams.alpha
                ? `${lossyParams.alpha.toExponential(4)} Np/m`
                : "N/A"}
            </div>

            <div className="text-gray-400">Phase Constant (β):</div>
            <div>
              {lossyParams.beta
                ? `${lossyParams.beta.toFixed(4)} rad/m`
                : "N/A"}
            </div>

            <div className="text-gray-400">Attenuation:</div>
            <div>
              {lossyParams.attenuationDb
                ? `${lossyParams.attenuationDb.toFixed(4)} dB/m`
                : "N/A"}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-green-400 mb-2">
            Frequency Effects
          </h3>
          <div className="text-sm text-gray-300">
            <p className="mb-2">
              For frequency f = {txLineParams.frequency || "N/A"} Hz:
            </p>
            <ul className="list-disc list-inside pl-2">
              <li>
                Skin depth:{" "}
                {txLineParams.lineParams
                  ? `${(
                      1 /
                      Math.sqrt(
                        Math.PI *
                          (txLineParams.frequency * 1e6) *
                          4e-7 *
                          Math.PI *
                          txLineParams.conductivity
                      )
                    ).toExponential(3)} m`
                  : "N/A"}
              </li>
              <li>
                Wavelength: {txLineParams.wavelength?.toFixed(4) || "N/A"} m
              </li>
              <li>
                Wave impedance:{" "}
                {txLineParams.characteristicImpedance?.toFixed(2) || "N/A"} Ω
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mt-6 text-sm text-gray-400">
        <h3 className="text-lg font-semibold mb-2">Key Formulas</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">Propagation Constant:</p>
            <p>γ = α + jβ = √((R' + jωL')(G' + jωC'))</p>
          </div>
          <div>
            <p className="font-semibold">Characteristic Impedance:</p>
            <p>Z₀ = √((R' + jωL')/(G' + jωC'))</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default PropagationAnalysis;
