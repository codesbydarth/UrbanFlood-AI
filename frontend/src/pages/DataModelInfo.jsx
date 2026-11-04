import React, { useState } from 'react';
import {
  FileText,
  Sliders,
  Cpu,
  Layers,
  Database,
  ShieldAlert,
  Download,
  Code2,
  CheckCircle2,
  HelpCircle,
  ExternalLink,
  Activity,
  Terminal
} from 'lucide-react';
import RiskBadge from '../components/RiskBadge';
import FeatureContributionBar from '../components/FeatureContributionBar';
import { calculateCustomRisk } from '../services/api';

export default function DataModelInfo({ selectedCity }) {
  // Live Custom Risk Calculator Test State
  const [testInput, setTestInput] = useState({
    city: selectedCity,
    rainfall_mm: 80,
    elevation_m: selectedCity.toLowerCase() === 'bengaluru' ? 870 : 4.0,
    slope_deg: 0.8,
    water_dist_m: 90,
    impervious_ratio: 0.90,
    drainage_capacity_score: 2.2,
    historical_incidents: 12,
    tide_height_m: ['mumbai', 'chennai'].includes(selectedCity.toLowerCase()) ? 4.3 : 0.0,
  });

  const [testResult, setTestResult] = useState(null);
  const [calculating, setCalculating] = useState(false);

  React.useEffect(() => {
    setTestInput(prev => ({
      ...prev,
      city: selectedCity,
      elevation_m: selectedCity.toLowerCase() === 'bengaluru' ? 870 : 4.0,
      tide_height_m: ['mumbai', 'chennai'].includes(selectedCity.toLowerCase()) ? 4.3 : 0.0,
    }));
  }, [selectedCity]);

  const handleTestCalculate = async (e) => {
    e.preventDefault();
    setCalculating(true);
    try {
      const res = await calculateCustomRisk(testInput);
      setTestResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setCalculating(false);
    }
  };

  const handleDownloadGeoJSON = () => {
    window.open('/api/data/export?format=geojson', '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      
      {/* Header */}
      <div className="border-b border-navy-800 pb-5">
        <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono mb-1">
          <FileText className="w-4 h-4" />
          <span className="uppercase tracking-widest font-bold">Scientific Methodology & Architecture</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Explainable Flood Risk Index & ML Pipeline
        </h1>
        <p className="text-xs text-slate-400 mt-1 max-w-3xl">
          UrbanFlood AI replaces opaque black-box predictions with an explainable multi-criteria hydrological model (MCDA) calibrated to Indian urban drainage geometries and prepared for XGBoost ML integration.
        </p>
      </div>

      {/* Prominent Hackathon Disclaimer Alert Box */}
      <div className="bg-amber-950/40 border border-amber-600/40 p-5 rounded-2xl flex items-start space-x-3.5">
        <ShieldAlert className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="text-xs space-y-1">
          <h3 className="font-bold text-amber-300 font-mono text-sm uppercase">
            Hackathon Prototype Transparency & Simulated Data Disclosure
          </h3>
          <p className="text-amber-200/90 leading-relaxed">
            This platform is an interactive engineering prototype. All real-time telemetry, rainfall accumulation figures, and ward waterlogging measurements shown across this dashboard are <strong>hydrologically simulated proxies</strong> based on elevation models (DEM), OpenStreetMap canal vectors, and historical flood frequencies.
          </p>
          <p className="text-amber-300/80 text-[11px] font-mono">
            *Never claim that simulated information is live rainfall, real flood measurements, or validated AI predictions. Official flood warnings are issued solely by the IMD, NDMA, BBMP, BMC, and GCC.
          </p>
        </div>
      </div>

      {/* 2-Column: Weights Breakdown & Live Interactive Test Bench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Mathematical Model & Weights */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-750 p-6 rounded-2xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span>Multi-Criteria Decision Analysis (MCDA) Weights</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Calibrated weights representing hydrologic hazard factors:
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: 'Rainfall Load & Accumulation', weight: '28%', desc: 'Non-linear logistic curve modeling surface ponding thresholds (30mm, 65mm, 115mm+ cloudburst).' },
              { label: 'Topographic Elevation Deficit', weight: '16%', desc: 'Normalized depression depth below city ward mean (identifies natural saucer bowls).' },
              { label: 'Primary Drain & Waterbody Proximity', weight: '16%', desc: 'Distance to Rajakaluves, Mithi river, or lakes susceptible to bank overtopping and surcharge.' },
              { label: 'Stormwater Drainage Capacity Deficit', weight: '12%', desc: 'Inversely proportional to drain cross-section diameter and silt blockage index (0-10).' },
              { label: 'Impervious Surface Built-up Ratio', weight: '12%', desc: 'Rational Method runoff coefficient C (concrete reflects 90% water vs 20% soil infiltration).' },
              { label: 'Surface Terrain Slope Gradient', weight: '10%', desc: 'Flat slopes (< 1.5°) prevent gravity runoff flow and sustain long-duration pooling.' },
              { label: 'Historical Recurrence Booster', weight: '6%', desc: 'Empirical waterlogging incident frequency logged across past 5 monsoon cycles.' },
            ].map((item, idx) => (
              <div key={idx} className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-white">{item.label}</span>
                  <span className="font-mono font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {item.weight}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="bg-navy-950 p-3 rounded-xl border border-navy-800 text-[11px] space-y-1">
            <div className="flex items-center justify-between font-mono font-bold">
              <span className="text-slate-300">Total Normalized Baseline Weight:</span>
              <span className="text-teal-400">100.0% (28+16+16+12+12+10+6)</span>
            </div>
            <div className="flex items-center justify-between font-mono text-[10px] text-slate-400">
              <span>Coastal Spring Tide Lock Mode:</span>
              <span className="text-cyan-400">100.0% (Rain 25, Elev 14, Water 15, Tide 10, Drain 10, Imp 10, Slope 8, Hist 8)</span>
            </div>
          </div>

          <div className="pt-2 border-t border-navy-800 flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400">Export GeoJSON Hotspot Layer:</span>
            <button
              onClick={handleDownloadGeoJSON}
              className="bg-navy-850 hover:bg-navy-800 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download GeoJSON</span>
            </button>
          </div>
        </div>

        {/* Right Column: Live Interactive Risk Index Test Bench */}
        <div className="lg:col-span-6 bg-navy-900 border border-navy-750 p-6 rounded-2xl space-y-5">
          <div>
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-teal-400" />
              <span>Interactive Risk Engine Simulator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Test custom micro-topographic parameters directly against the backend risk engine.
            </p>
          </div>

          <form onSubmit={handleTestCalculate} className="space-y-3.5 text-xs">
            
            {/* Sliders */}
            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">Rainfall Accumulation (mm):</span>
                <span className="text-cyan-400 font-bold">{testInput.rainfall_mm} mm</span>
              </div>
              <input
                type="range"
                min="0"
                max="160"
                step="5"
                value={testInput.rainfall_mm}
                onChange={(e) => setTestInput({ ...testInput, rainfall_mm: Number(e.target.value) })}
                className="w-full accent-cyan-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">Elevation (m above MSL):</span>
                <span className="text-indigo-400 font-bold">{testInput.elevation_m} m</span>
              </div>
              <input
                type="range"
                min="0"
                max="950"
                step="5"
                value={testInput.elevation_m}
                onChange={(e) => setTestInput({ ...testInput, elevation_m: Number(e.target.value) })}
                className="w-full accent-indigo-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">Distance to Primary Drain / Canal (m):</span>
                <span className="text-teal-400 font-bold">{testInput.water_dist_m} m</span>
              </div>
              <input
                type="range"
                min="20"
                max="1500"
                step="20"
                value={testInput.water_dist_m}
                onChange={(e) => setTestInput({ ...testInput, water_dist_m: Number(e.target.value) })}
                className="w-full accent-teal-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">Impervious Built-up Fraction (%):</span>
                <span className="text-rose-400 font-bold">{Math.round(testInput.impervious_ratio * 100)}%</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.99"
                step="0.05"
                value={testInput.impervious_ratio}
                onChange={(e) => setTestInput({ ...testInput, impervious_ratio: Number(e.target.value) })}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between font-mono mb-1">
                <span className="text-slate-400">Drainage Capacity Rating (0-10):</span>
                <span className="text-amber-400 font-bold">{testInput.drainage_capacity_score}/10</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={testInput.drainage_capacity_score}
                onChange={(e) => setTestInput({ ...testInput, drainage_capacity_score: Number(e.target.value) })}
                className="w-full accent-amber-500 cursor-pointer"
              />
            </div>

            <button
              type="submit"
              disabled={calculating}
              className="w-full bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center space-x-2"
            >
              {calculating ? (
                <span>Calculating Explainable FRI...</span>
              ) : (
                <>
                  <Activity className="w-4 h-4" />
                  <span>Execute Explainable Risk Inference</span>
                </>
              )}
            </button>
          </form>

          {/* Test Engine Result Box */}
          {testResult && (
            <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-mono">Calculated Flood Risk Index</div>
                  <div className="text-2xl font-mono font-bold text-white">
                    {testResult.risk_score} <span className="text-xs text-slate-500 font-normal">/ 100</span>
                  </div>
                </div>
                <RiskBadge level={testResult.risk_level} score={testResult.risk_score} size="md" />
              </div>

              <div className="text-xs text-slate-300">
                <strong>Projected Street Water Depth:</strong>{' '}
                <span className="text-amber-400 font-mono font-bold">{testResult.flood_depth_estimate_cm} cm</span>{' '}
                • Inundation Probability: <span className="text-cyan-400 font-mono font-bold">{Math.round(testResult.inundation_prob * 100)}%</span>
              </div>

              <FeatureContributionBar
                contributions={testResult.feature_contributions}
                showHeader={true}
              />
            </div>
          )}

        </div>

      </div>

      {/* Future XGBoost ML Architecture Road Map */}
      <div className="bg-navy-900 border border-navy-750 p-6 rounded-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-navy-800">
          <div className="flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-white uppercase tracking-wider font-mono">
              Future XGBoost & LightGBM Machine Learning Integration
            </h2>
          </div>
          <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
            Model Swappable API Architecture
          </span>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          The operational inference engine uses calibrated <strong>Weighted Feature Contributions (MCDA)</strong> where individual hydrologic weights sum to 100%. The backend is designed with a model-swappable boundary so this MCDA heuristic can be directly replaced by an <code>xgboost.Booster</code> or <code>LightGBM</code> regressor with true <strong>SHAP (SHapley Additive exPlanations)</strong> extracted via <code>shap.TreeExplainer</code> once trained on IoT depth sensors and Sentinel-1 SAR inundation imagery.
        </p>

        {/* Code Snippet Box */}
        <div className="bg-navy-950 p-4 rounded-xl border border-navy-800 font-mono text-xs text-slate-300 overflow-x-auto space-y-2">
          <div className="text-slate-500 text-[11px]">// Python XGBoost Model Inference Contract (backend/app/risk_engine.py)</div>
          <pre className="text-cyan-300">
{`import xgboost as xgb
import shap

# Load pre-trained model artifact
model = xgb.Booster()
model.load_model("models/urbanflood_xgboost_v2.json")
explainer = shap.TreeExplainer(model)

def predict_xgboost_ready(inp: FloodRiskInput) -> RiskPrediction:
    features = [[
        inp.rainfall_mm, inp.elevation_m, inp.slope_deg, 
        inp.water_dist_m, inp.impervious_ratio, 
        inp.drainage_capacity_score, inp.historical_incidents,
        inp.tide_height_m or 0.0
    ]]
    pred_risk = float(model.predict(xgb.DMatrix(features))[0])
    shap_values = explainer.shap_values(features)[0]
    # Return explainable contributions directly to frontend UI
    return build_prediction_response(pred_risk, shap_values)`}
          </pre>
        </div>
      </div>

    </div>
  );
}
