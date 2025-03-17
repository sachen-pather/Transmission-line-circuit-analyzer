"use client";

import { useState, useEffect } from "react";
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
import PropagatingWaveVisualizer from "./components/PropagatingWaveVisualizer";
import FrequencyResponse from "./components/FrequencyResponse";

// NavTabs component for navigation
const NavTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-gray-800 p-2 rounded-t-lg mb-6">
      <div className="flex flex-wrap">
        <button
          className={`px-4 py-2 mr-2 rounded-t-lg ${
            activeTab === "calculator"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("calculator")}
        >
          Calculator
        </button>
        <button
          className={`px-4 py-2 mr-2 rounded-t-lg ${
            activeTab === "waves"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("waves")}
        >
          Wave Visualizations
        </button>
        <button
          className={`px-4 py-2 mr-2 rounded-t-lg ${
            activeTab === "frequency"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("frequency")}
        >
          Frequency Response
        </button>
        <button
          className={`px-4 py-2 rounded-t-lg ${
            activeTab === "model"
              ? "bg-blue-600 text-white"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
          onClick={() => setActiveTab("model")}
        >
          Lumped Element Model
        </button>
      </div>
    </div>
  );
};

const App = () => {
  // Add state for the active tab
  const [activeTab, setActiveTab] = useState("calculator");

  // Move calculator form values to App state
  const [calculatorInputs, setCalculatorInputs] = useState({
    frequency: 1000,
    permittivity: 1.0,
    permeability: 1.0,
    conductivity: 5.8e7, // Copper conductivity (S/m)
    dielectricConductivity: 0.0, // Dielectric conductivity (S/m)
    innerRadius: 0.5,
    outerRadius: 2.0,
    wireRadius: 1.0,
    wireSpacing: 10.0,
    plateWidth: 20.0,
    plateSpacing: 2.0,
    stripWidth: 1.0, // For microstrip
    substrateHeight: 0.5, // For microstrip
  });

  const [selectedGeometry, setSelectedGeometry] = useState("coaxial");
  const [txLineParams, setTxLineParams] = useState({
    characteristicImpedance: null,
    propagationConstant: null,
    phaseVelocity: null,
    wavelength: null,
    frequency: null,
    conductivity: null,
    effectivePermittivity: null, // For microstrip
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

  // Store microstrip-specific parameters
  const [microstripParams, setMicrostripParams] = useState({
    stripWidth: 1.0,
    substrateHeight: 0.5,
    permittivity: 4.4,
  });

  // Function to update calculator inputs
  const updateCalculatorInputs = (newInputs) => {
    setCalculatorInputs({
      ...calculatorInputs,
      ...newInputs,
    });
  };

  const updateTxLineParams = (newParams) => {
    setTxLineParams({
      ...txLineParams,
      ...newParams,
      frequency: newParams.frequency,
      conductivity: newParams.conductivity,
    });

    // Update microstrip params if provided
    if (newParams.microstripParams) {
      setMicrostripParams(newParams.microstripParams);
    }
  };

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case "calculator":
        return (
          <>
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
                calculatorInputs={calculatorInputs}
                updateCalculatorInputs={updateCalculatorInputs}
              />
              <CircuitProperties
                txLineParams={txLineParams}
                circuitProps={circuitProps}
                setCircuitProps={setCircuitProps}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-4">
              <Results txLineParams={txLineParams} />
              <PropagationAnalysis txLineParams={txLineParams} />
            </div>
          </>
        );

      case "waves":
        return circuitProps.reflectionCoefficient && txLineParams.wavelength ? (
          <>
            <div className="mb-8">
              <StandingWave
                reflectionCoefficient={circuitProps.reflectionCoefficient}
                wavelength={txLineParams.wavelength}
              />
            </div>

            <div className="mb-8">
              <PropagatingWaveVisualizer
                txLineParams={txLineParams}
                reflectionCoefficient={circuitProps.reflectionCoefficient}
              />
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p>
              No wave data available. Please calculate transmission line
              parameters first.
            </p>
            <button
              onClick={() => setActiveTab("calculator")}
              className="mt-4 px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Go to Calculator
            </button>
          </div>
        );

      case "frequency":
        return txLineParams.characteristicImpedance ? (
          <div className="mb-8">
            <FrequencyResponse
              txLineParams={txLineParams}
              geometryType={selectedGeometry}
              params={
                selectedGeometry === "microstrip" ? microstripParams : null
              }
            />
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-800 rounded-lg">
            <p>
              No frequency data available. Please calculate transmission line
              parameters first.
            </p>
            <button
              onClick={() => setActiveTab("calculator")}
              className="mt-4 px-6 py-2 bg-blue-600 rounded hover:bg-blue-700 transition-colors"
            >
              Go to Calculator
            </button>
          </div>
        );

      case "model":
        return (
          <div className="mb-8">
            <LumpedElementModel />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex flex-col">
        <NavTabs activeTab={activeTab} setActiveTab={setActiveTab} />

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex-grow flex flex-col"
        >
          {renderContent()}
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default App;
