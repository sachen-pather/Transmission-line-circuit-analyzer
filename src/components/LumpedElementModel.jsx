"use client";
import { motion } from "framer-motion";

const LumpedElementModel = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="bg-gray-800 rounded-lg p-4"
    >
      <h2 className="text-xl font-semibold mb-2">Lumped Element Model</h2>
      <div className="mb-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 500 180"
          className="w-full h-auto"
        >
          <rect x="0" y="0" width="500" height="180" fill="#1F2937" />

          {/* Top horizontal line */}
          <line
            x1="50"
            y1="40"
            x2="150"
            y2="40"
            stroke="#60A5FA"
            strokeWidth="2"
          />

          <line
            x1="240"
            y1="40"
            x2="250"
            y2="40"
            stroke="#60A5FA"
            strokeWidth="2"
          />

          <line
            x1="330"
            y1="40"
            x2="450"
            y2="40"
            stroke="#60A5FA"
            strokeWidth="2"
          />

          {/* Bottom horizontal line */}
          <line
            x1="50"
            y1="140"
            x2="450"
            y2="140"
            stroke="#60A5FA"
            strokeWidth="2"
          />

          {/* Node markers */}
          <circle cx="120" cy="40" r="4" fill="#FF6B6B" />
          <circle cx="120" cy="140" r="4" fill="#FF6B6B" />
          <text x="120" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="12">
            Node N
          </text>
          <text x="120" y="35" textAnchor="middle" fill="#FFFFFF" fontSize="12">
            +
          </text>

          <circle cx="410" cy="40" r="4" fill="#FF6B6B" />
          <circle cx="410" cy="140" r="4" fill="#FF6B6B" />
          <text x="405" y="25" textAnchor="middle" fill="#FFFFFF" fontSize="12">
            Node N+1
          </text>
          <text x="410" y="35" textAnchor="middle" fill="#FFFFFF" fontSize="12">
            +
          </text>
          <text
            x="410"
            y="148"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="12"
          >
            _
          </text>
          <text
            x="120"
            y="148"
            textAnchor="middle"
            fill="#FFFFFF"
            fontSize="12"
          >
            _
          </text>

          {/* Series R component */}
          <path
            d="M140 40 L160 40 L165 30 L175 50 L185 30 L195 50 L205 30 L215 50 L220 40 L240 40"
            stroke="#F87171"
            strokeWidth="2"
            fill="none"
          />
          <text x="190" y="20" textAnchor="middle" fill="#F87171" fontSize="12">
            R'Δz
          </text>

          <circle cx="240" cy="40" r="3" fill="#F87171" />
          <circle cx="140" cy="40" r="3" fill="#F87171" />

          {/* Series L component */}
          <path
            d="M250 40 
               Q260 40 260 50 Q260 60 270 60 Q280 60 280 50 Q280 40 290 40 Q300 40 300 50 Q300 60 310 60 Q320 60 320 50 Q320 40 330 40
               L330 40"
            stroke="#F87171"
            strokeWidth="2"
            fill="none"
          />
          <text x="290" y="20" textAnchor="middle" fill="#F87171" fontSize="12">
            L'Δz
          </text>

          <circle cx="330" cy="40" r="3" fill="#F87171" />
          <circle cx="250" cy="40" r="3" fill="#F87171" />

          {/* Junction dot at the top of the shunt branch */}
          <circle cx="350" cy="40" r="3" fill="#34D399" />
          <circle cx="350" cy="90" r="3" fill="#34D399" />
          <circle cx="350" cy="120" r="3" fill="#34D399" />

          {/* Vertical connection to shunt elements */}
          <line
            x1="350"
            y1="40"
            x2="350"
            y2="90"
            stroke="#34D399"
            strokeWidth="2"
          />

          <line
            x1="350"
            y1="120"
            x2="350"
            y2="150"
            stroke="#34D399"
            strokeWidth="2"
          />

          {/* Shunt branch bounding box */}
          <rect
            x="300"
            y="65"
            width="100"
            height="70"
            stroke="#34D399"
            strokeWidth="1"
            strokeDasharray="3"
            fill="none"
            opacity="0.7"
          />

          {/* Horizontal lines to emphasize parallel connection */}
          <line
            x1="310"
            y1="90"
            x2="320"
            y2="90"
            stroke="#34D399"
            strokeWidth="2"
          />
          <line
            x1="310"
            y1="120"
            x2="390"
            y2="120"
            stroke="#34D399"
            strokeWidth="2"
          />

          {/* Shunt G component */}
          <path
            d="M320 90 L320 90 L322 80 L326 100 L330 80 L334 100 L336 90 L346 90"
            stroke="#34D399"
            strokeWidth="2"
            fill="none"
          />
          <line
            x1="310"
            y1="90"
            x2="310"
            y2="120"
            stroke="#34D399"
            strokeWidth="2"
          />
          <text x="318" y="80" textAnchor="middle" fill="#34D399" fontSize="12">
            G'Δz
          </text>

          {/* Shunt C component */}
          <path
            d="M390 90 L390 120"
            stroke="#34D399"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M380 90 L390 90"
            stroke="#34D399"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M350 90 L370 90"
            stroke="#34D399"
            strokeWidth="2"
            fill="none"
          />

          <path
            d="M365 120 L380 120"
            stroke="#34D399"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M370 80 L370 100"
            stroke="#34D399"
            strokeWidth="2"
            fill="none"
          />
          <path
            d="M378 80 L378 100"
            stroke="#34D399"
            strokeWidth="2"
            fill="none"
          />
          <text x="365" y="80" textAnchor="middle" fill="#34D399" fontSize="12">
            C'Δz
          </text>

          {/* Ground symbol at the bottom */}
          <line
            x1="350"
            y1="140"
            x2="350"
            y2="150"
            stroke="#60A5FA"
            strokeWidth="2"
          />
          <line
            x1="340"
            y1="150"
            x2="360"
            y2="150"
            stroke="#60A5FA"
            strokeWidth="2"
          />
          <line
            x1="342"
            y1="153"
            x2="358"
            y2="153"
            stroke="#60A5FA"
            strokeWidth="1"
          />
          <line
            x1="344"
            y1="156"
            x2="356"
            y2="156"
            stroke="#60A5FA"
            strokeWidth="1"
          />

          <line
            x1="410"
            y1="40"
            x2="410"
            y2="140"
            stroke="#9CA3AF"
            strokeWidth="1"
            strokeDasharray="4"
          />

          <line
            x1="120"
            y1="40"
            x2="120"
            y2="140"
            stroke="#9CA3AF"
            strokeWidth="1"
            strokeDasharray="4"
          />

          {/* Differential length indicator */}
          <line
            x1="120"
            y1="170"
            x2="410"
            y2="170"
            stroke="#9CA3AF"
            strokeWidth="1"
            strokeDasharray="4"
          />
          <line
            x1="120"
            y1="165"
            x2="120"
            y2="175"
            stroke="#9CA3AF"
            strokeWidth="1"
          />
          <line
            x1="410"
            y1="165"
            x2="410"
            y2="175"
            stroke="#9CA3AF"
            strokeWidth="1"
          />
          <text
            x="290"
            y="180"
            textAnchor="middle"
            fill="#9CA3AF"
            fontSize="12"
          >
            Δz
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-2 gap-1 text-xs text-gray-300">
        <div>
          <p className="mb-1">
            <strong>R'Δz:</strong> Series resistance (Ω)
          </p>
          <p className="mb-1">
            <strong>L'Δz:</strong> Series inductance (H)
          </p>
        </div>
        <div>
          <p className="mb-1">
            <strong>G'Δz:</strong> Shunt conductance (S)
          </p>
          <p className="mb-1">
            <strong>C'Δz:</strong> Shunt capacitance (F)
          </p>
        </div>
      </div>

      {/* Add the explanation section here */}
      <div className="bg-gray-700 rounded-lg p-4 mt-4 text-gray-200">
        <h3 className="text-lg font-semibold mb-3 text-blue-400">
          Understanding the Lumped Element Model
        </h3>

        <p className="mb-3">
          The lumped element model provides a bridge between circuit theory and
          electromagnetic theory by representing a differential section of a
          transmission line as a circuit with discrete components. This
          fundamental concept helps us understand wave propagation, standing
          waves, and power transfer along transmission lines.
        </p>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="text-md font-medium mb-2 text-green-400">
              Primary Line Parameters (per unit length)
            </h4>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>R'</strong>: Series resistance (Ω/m) - Represents
                combined resistance of both conductors
              </li>
              <li>
                <strong>L'</strong>: Series inductance (H/m) - Represents
                magnetic field energy storage
              </li>
              <li>
                <strong>G'</strong>: Shunt conductance (S/m) - Represents
                current flow between conductors
              </li>
              <li>
                <strong>C'</strong>: Shunt capacitance (F/m) - Represents
                electric field energy storage
              </li>
            </ul>
            <p className="mt-2 text-xs italic">
              For TEM transmission lines, L'C' = μϵ and G'/C' = σ/ϵ, where μ, ϵ,
              and σ are the permeability, permittivity, and conductivity of the
              insulating material.
            </p>
          </div>

          <div>
            <h4 className="text-md font-medium mb-2 text-blue-400">
              Key Equations
            </h4>
            <div className="bg-gray-800 p-3 rounded">
              <p className="mb-2">
                <strong>Characteristic Impedance (Z₀):</strong>
              </p>
              <p className="mb-1">For lossless line (R'=G'=0):</p>
              <p className="mb-3 ml-4">Z₀ = √(L'/C')</p>
              <p className="mb-1">For lossy line:</p>
              <p className="mb-3 ml-4">Z₀ = √((R'+jωL')/(G'+jωC'))</p>

              <p className="mb-2">
                <strong>Propagation Constant (γ):</strong>
              </p>
              <p className="mb-1">γ = α + jβ = √((R'+jωL')(G'+jωC'))</p>
              <p className="ml-4 mt-2">where:</p>
              <p className="ml-6">α = attenuation constant (Np/m)</p>
              <p className="ml-6">β = phase constant (rad/m)</p>
            </div>
          </div>
        </div>

        <h4 className="text-md font-medium mb-2 text-yellow-400">
          Telegrapher's Equations
        </h4>
        <div className="bg-gray-800 p-3 rounded mb-4">
          <p className="mb-2">
            The lumped element model leads to the telegrapher's equations:
          </p>
          <p className="mb-2">∂V/∂z = -(R'+jωL')I</p>
          <p className="mb-2">∂I/∂z = -(G'+jωC')V</p>
          <p className="mt-1">These combine to form wave equations:</p>
          <p className="mb-1">∂²V/∂z² - γ²V = 0</p>
          <p className="mb-1">∂²I/∂z² - γ²I = 0</p>
          <p className="italic text-gray-400 text-sm mt-2">
            These differential equations describe voltage and current wave
            propagation along the line
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-4 mb-4">
          <div className="bg-gray-800 p-3 rounded">
            <h4 className="text-md font-medium mb-2 text-orange-400">
              General Solution
            </h4>
            <p className="mb-2">
              The wave equations have solutions of the form:
            </p>
            <p className="mb-1">V(z) = V₀⁺e⁻ᵞᶻ + V₀⁻eᵞᶻ</p>
            <p className="mb-1">I(z) = (V₀⁺/Z₀)e⁻ᵞᶻ - (V₀⁻/Z₀)eᵞᶻ</p>
            <p className="mt-2 text-sm text-gray-400">
              These represent incident and reflected waves traveling in opposite
              directions
            </p>
          </div>

          <div className="bg-gray-800 p-3 rounded">
            <h4 className="text-md font-medium mb-2 text-purple-400">
              Wave Properties
            </h4>
            <p className="mb-1">
              <strong>Phase Velocity:</strong> vₚ = ω/β = 1/√(L'C')
            </p>
            <p className="mb-1">
              <strong>Wavelength:</strong> λ = 2π/β = 2π/(ω√(L'C'))
            </p>
            <p className="mb-1">
              <strong>Reflection Coefficient:</strong> Γ = (ZL-Z₀)/(ZL+Z₀)
            </p>
            <p className="mb-1">
              <strong>Standing Wave Ratio:</strong> S = (1+|Γ|)/(1-|Γ|)
            </p>
          </div>
        </div>

        <div className="border-t border-gray-600 pt-3">
          <h4 className="text-md font-medium mb-2 text-cyan-400">
            Special Cases
          </h4>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <p className="font-medium">Lossless Line (R'=G'=0):</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Z₀ = √(L'/C') (real)</li>
                <li>γ = jβ = jω√(L'C')</li>
                <li>α = 0 (no attenuation)</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">Matched Load (ZL=Z₀):</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Γ = 0 (no reflection)</li>
                <li>No standing waves</li>
                <li>Maximum power transfer</li>
              </ul>
            </div>
            <div>
              <p className="font-medium">Short/Open Circuit:</p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>|Γ| = 1 (total reflection)</li>
                <li>S = ∞ (infinite SWR)</li>
                <li>Input impedance is purely reactive</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-blue-900 bg-opacity-30 rounded border border-blue-700">
          <h4 className="text-sm font-semibold text-blue-300">
            When to Consider Transmission Line Effects
          </h4>
          <p className="text-xs mt-1">
            Transmission line effects become significant when the line length l
            is comparable to the wavelength λ. When l/λ ≥ 0.01, you should
            account for transmission line effects including phase delay and
            reflections. Below this threshold, ordinary circuit theory is
            usually sufficient.
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default LumpedElementModel;
