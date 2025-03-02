"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Header from "./components/Header";
import LumpedElementModel from "./components/LumpedElementModel";
import GeometrySelector from "./components/GeometrySelector";
import Calculator from "./components/Calculator";
import CircuitProperties from "./components/CircuitProperties";
import Results from "./components/Results";
import PropagationAnalysis from "./components/PropagationAnalysis";
import Footer from "./components/Footer";
import StandingWave from "./components/StandingWave";

const App = () => {
  const [selectedGeometry, setSelectedGeometry] = useState("coaxial");
  const [txLineParams, setTxLineParams] = useState({
    characteristicImpedance: null,
    propagationConstant: null,
    phaseVelocity: null,
    wavelength: null,
    frequency: null,
    conductivity: null,
    lineParams: {
      resistance: null,
      inductance: null,
      conductance: null,
      capacitance: null,
    },
  });
  const [circuitProps, setCircuitProps] = useState({
    lineLength: 0.1,
    loadImpedance: { real: 50, imag: 0 },
    reflectionCoefficient: null,
    vswr: null,
    waveImpedance: null,
  });

  const updateTxLineParams = (newParams) => {
    setTxLineParams({
      ...txLineParams,
      ...newParams,
      frequency: newParams.frequency,
      conductivity: newParams.conductivity,
    });
  };

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
          <div className="mb-6">
            <GeometrySelector
              selectedGeometry={selectedGeometry}
              onGeometryChange={setSelectedGeometry}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            <Calculator
              geometry={selectedGeometry}
              updateTxLineParams={updateTxLineParams}
            />
            <CircuitProperties
              txLineParams={txLineParams}
              circuitProps={circuitProps}
              setCircuitProps={setCircuitProps}
            />
          </div>

          <div className="mb-6">
            <LumpedElementModel />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-6">
            <Results txLineParams={txLineParams} />
            <PropagationAnalysis txLineParams={txLineParams} />
          </div>

          {circuitProps.reflectionCoefficient && txLineParams.wavelength && (
            <div>
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
