"use client";
import { motion } from "framer-motion";

const Results = ({ txLineParams }) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Calculated Parameters</h2>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="text-gray-400">Characteristic Impedance:</div>
        <div>{txLineParams.characteristicImpedance?.toFixed(1) || "N/A"} Ω</div>
        <div className="text-gray-400">Propagation Constant:</div>
        <div>
          {txLineParams.propagationConstant
            ? `${txLineParams.propagationConstant.real.toFixed(
                2
              )} + j${txLineParams.propagationConstant.imag.toFixed(2)} rad/m`
            : "N/A"}
        </div>
        <div className="text-gray-400">Phase Velocity:</div>
        <div>{txLineParams.phaseVelocity?.toExponential(2) || "N/A"} m/s</div>
        <div className="text-gray-400">Wavelength:</div>
        <div>{txLineParams.wavelength?.toFixed(3) || "N/A"} m</div>
      </div>
    </motion.div>
  );
};

export default Results;
