"use client";
import { motion } from "framer-motion";

const LumpedElementModel = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-6"
    >
      <h2 className="text-2xl font-semibold mb-4">Lumped Element Model</h2>
      <div className="mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 400 200"
          className="w-full h-auto"
        >
          <rect x="0" y="0" width="400" height="200" fill="#1F2937" />
          <line
            x1="50"
            y1="50"
            x2="350"
            y2="50"
            stroke="#60A5FA"
            strokeWidth="2"
          />
          <line
            x1="50"
            y1="150"
            x2="350"
            y2="150"
            stroke="#60A5FA"
            strokeWidth="2"
          />

          {/* R and L components */}
          <circle cx="100" cy="50" r="5" fill="#F87171" />
          <text x="100" y="35" textAnchor="middle" fill="#F87171" fontSize="14">
            R
          </text>
          <path
            d="M130 35 Q140 50 150 35 Q160 20 170 35"
            stroke="#F87171"
            strokeWidth="2"
            fill="none"
          />
          <text x="150" y="15" textAnchor="middle" fill="#F87171" fontSize="14">
            L
          </text>

          {/* G and C components */}
          <line
            x1="250"
            y1="50"
            x2="250"
            y2="150"
            stroke="#34D399"
            strokeWidth="2"
          />
          <circle cx="250" cy="100" r="5" fill="#34D399" />
          <text x="240" y="100" textAnchor="end" fill="#34D399" fontSize="14">
            G
          </text>
          <path
            d="M280 70 L300 70 M290 70 L290 130 L310 130"
            stroke="#34D399"
            strokeWidth="2"
            fill="none"
          />
          <text x="320" y="100" textAnchor="start" fill="#34D399" fontSize="14">
            C
          </text>
        </svg>
      </div>
      <p className="text-sm text-gray-300 mb-2">
        The lumped element model represents a transmission line as distributed
        components of resistance (R), inductance (L), conductance (G), and
        capacitance (C) per unit length.
      </p>
      <ul className="list-disc list-inside text-sm text-gray-300">
        <li>
          <strong>R:</strong> Series resistance per unit length (Ω/m)
        </li>
        <li>
          <strong>L:</strong> Series inductance per unit length (H/m)
        </li>
        <li>
          <strong>G:</strong> Shunt conductance per unit length (S/m)
        </li>
        <li>
          <strong>C:</strong> Shunt capacitance per unit length (F/m)
        </li>
      </ul>
    </motion.div>
  );
};

export default LumpedElementModel;
