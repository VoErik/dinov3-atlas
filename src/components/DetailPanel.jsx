import { useState } from 'react';
import { Activity, Info, Eye, EyeOff } from 'lucide-react';

export default function DetailPanel({ atoms, densityMode = "image" }) {
  const [showHeatmaps, setShowHeatmaps] = useState(true);
  const atom = atoms ? atoms[0] : null;

  if (!atom) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-white">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4 border border-gray-100">
          <Info size={32} />
        </div>
        <p className="font-medium text-gray-600">No feature selected</p>
        <p className="text-xs mt-2">Click a dot on the map or use the lasso tool to inspect features.</p>
      </div>
    );
  }

  const isPatchMode = densityMode === "patch";
  const displayDensity = isPatchMode ? (atom.patch_density || 0) : (atom.density || 0);
  const densityTitle = isPatchMode ? "Patch Sparsity" : "Image Prevalence";
  const densityFormat = isPatchMode ? 4 : 2;

  const safeAvgAct = atom.avg_act || 0;
  const topActs = atom.top_activations || [];

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
            <Activity className="text-blue-500" size={20} /> Feature #{atom.id}
          </h2>
          <button 
            onClick={() => setShowHeatmaps(!showHeatmaps)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
          >
            {showHeatmaps ? <Eye size={20} /> : <EyeOff size={20} />}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 transition-colors">
            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">{densityTitle}</div>
            <div className="text-sm font-mono font-bold">{(displayDensity * 100).toFixed(densityFormat)}%</div>
          </div>
          <div className="bg-gray-50 p-3 rounded-lg border border-gray-100">
            <div className="text-[10px] text-gray-400 uppercase font-bold mb-1">Avg Strength</div>
            <div className="text-sm font-mono font-bold">{safeAvgAct.toFixed(2)}</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-2">Top Activations</h3>
        <div className="grid grid-cols-2 gap-3">
          {topActs.map((act, idx) => {
            const safeVal = act.activation_value || 0;
            return (
              <div key={idx} className="group relative aspect-square bg-black rounded-xl overflow-hidden shadow-sm border border-gray-200">
                <img 
                  src={`/${act.base_image}`} 
                  className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${showHeatmaps ? 'brightness-50' : 'brightness-100'}`}
                  alt="Base"
                />
                {showHeatmaps && act.heatmap_image && (
                  <img 
                    src={`/${act.heatmap_image}`} 
                    className="absolute inset-0 w-full h-full object-cover mix-blend-screen"
                    alt="Heatmap"
                  />
                )}
                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-md backdrop-blur-md font-mono border border-white/20">
                  {safeVal.toFixed(1)}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}