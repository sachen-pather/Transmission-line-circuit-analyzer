"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import LumpedElementModel from "./components/LumpedElementModel";
import GeometrySelector from "./components/GeometrySelector";
import Calculator from "./components/Calculator";
import CircuitProperties from "./components/CircuitProperties";
import Results from "./components/Results";
import Footer from "./components/Footer";
import StandingWave from "./components/StandingWave";

const App = () => {
  const [selectedGeometry, setSelectedGeometry] = useState("coaxial");
  const [txLineParams, setTxLineParams] = useState({
    characteristicImpedance: null,
    propagationConstant: null,
    phaseVelocity: null,
    wavelength: null,
  });
  const [circuitProps, setCircuitProps] = useState({
    lineLength: 0.1,
    loadImpedance: { real: 50, imag: 0 },
    reflectionCoefficient: null,
    vswr: null,
    waveImpedance: null,
  });

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-grow flex flex-col"
        >
          <div className="mb-8">
            <GeometrySelector
              selectedGeometry={selectedGeometry}
              onGeometryChange={setSelectedGeometry}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <Calculator
              geometry={selectedGeometry}
              updateTxLineParams={setTxLineParams}
            />
            <CircuitProperties
              txLineParams={txLineParams}
              circuitProps={circuitProps}
              setCircuitProps={setCircuitProps}
            />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Results txLineParams={txLineParams} />
            <LumpedElementModel />
          </div>
          {circuitProps.reflectionCoefficient && txLineParams.wavelength && (
            <div className="mt-8">
              <StandingWave
                reflectionCoefficient={circuitProps.reflectionCoefficient}
                wavelength={txLineParams.wavelength}
              />
            </div>
          )}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
