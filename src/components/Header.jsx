"use client";
import { motion } from "framer-motion";

const Header = () => {
  return (
    <header className="bg-gray-800 py-6">
      <div className="container mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl font-bold text-center text-blue-400"
        >
          Transmission Line Analyzer
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="text-center text-gray-400 mt-2"
        >
          Analyze basic transmission line structures and circuits
        </motion.p>
      </div>
    </header>
  );
};

export default Header;
