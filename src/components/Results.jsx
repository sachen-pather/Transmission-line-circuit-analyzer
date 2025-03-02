"use client";
import { motion } from "framer-motion";

const Results = ({ txLineParams }) => {
  const formatExponential = (value) => {
    if (value === null || value === undefined || isNaN(value)) return "N/A";

    const absValue = Math.abs(value);
    if (absValue < 1e-6 || absValue >= 1e6) {
      return value.toExponential(3); // 3 decimal places for clarity
    } else if (absValue < 0.1 || absValue >= 100) {
      return value.toExponential(3); // Expand range for readability
    } else {
      return value.toFixed(4); // 4 decimal places for typical values
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Calculated Parameters</h2>

      <div className="mb-4">
        <h3 className="text-lg font-semibold text-blue-400 mb-2">
          Lumped Element Parameters
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-gray-400">Resistance (R'):</div>
          <div>
            {txLineParams?.lineParams?.resistance
              ? `${formatExponential(txLineParams.lineParams.resistance)} Ω/m`
              : "N/A"}
          </div>

          <div className="text-gray-400">Inductance (L'):</div>
          <div>
            {txLineParams?.lineParams?.inductance
              ? `${formatExponential(txLineParams.lineParams.inductance)} H/m`
              : "N/A"}
          </div>

          <div className="text-gray-400">Conductance (G'):</div>
          <div>
            {txLineParams?.lineParams?.conductance
              ? `${formatExponential(txLineParams.lineParams.conductance)} S/m`
              : "N/A"}
          </div>

          <div className="text-gray-400">Capacitance (C'):</div>
          <div>
            {txLineParams?.lineParams?.capacitance
              ? `${formatExponential(txLineParams.lineParams.capacitance)} F/m`
              : "N/A"}
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-blue-400 mb-2">
          Wave Propagation Parameters
        </h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="text-gray-400">Characteristic Impedance:</div>
          <div>
            {txLineParams.characteristicImpedance?.toFixed(2) || "N/A"} Ω
          </div>

          <div className="text-gray-400">Propagation Constant:</div>
          <div>
            {txLineParams.propagationConstant
              ? `${txLineParams.propagationConstant.real.toFixed(
                  4
                )} + j${txLineParams.propagationConstant.imag.toFixed(4)} rad/m`
              : "N/A"}
          </div>

          <div className="text-gray-400">Phase Velocity:</div>
          <div>{txLineParams.phaseVelocity?.toExponential(3) || "N/A"} m/s</div>

          <div className="text-gray-400">Wavelength:</div>
          <div>{txLineParams.wavelength?.toFixed(4) || "N/A"} m</div>
        </div>
      </div>

      <div className="mt-4 text-sm text-gray-400">
        <p className="mb-1">Key Relationships:</p>
        <ul className="list-disc list-inside pl-2">
          <li>L'C' = μϵ (all TEM lines)</li>
          <li>G'/C' = σ/ϵ (all TEM lines)</li>
          <li>Z₀ = √(L'/C') (lossless line)</li>
          <li>γ = √((R'+jωL')(G'+jωC')) (general case)</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default Results;
