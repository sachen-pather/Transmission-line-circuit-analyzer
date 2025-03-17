// components/NavTabs.jsx
const NavTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="bg-gray-800 p-2 rounded-t-lg mb-4">
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

export default NavTabs;
