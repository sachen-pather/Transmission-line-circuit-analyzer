"use client";
import { motion } from "framer-motion";

const GeometrySelector = ({ selectedGeometry, onGeometryChange }) => {
  const geometries = [
    { id: "coaxial", name: "Coaxial" },
    { id: "twoWire", name: "Two-Wire" },
    { id: "parallelPlate", name: "Parallel-Plate" },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6 mb-8">
      <h2 className="text-2xl font-semibold mb-4">
        Transmission Line Geometry
      </h2>
      <div className="flex space-x-4">
        {geometries.map((geometry) => (
          <motion.button
            key={geometry.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`px-4 py-2 rounded-md transition-colors ${
              selectedGeometry === geometry.id
                ? "bg-blue-500 text-white"
                : "bg-gray-700 text-gray-300 hover:bg-gray-600"
            }`}
            onClick={() => onGeometryChange(geometry.id)}
          >
            {geometry.name}
          </motion.button>
        ))}
      </div>
    </div>
  );
};

export default GeometrySelector;
