import { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, Activity } from 'lucide-react';

export default function GalleryView({ atoms, onBack }) {
  const [showHeatmaps, setShowHeatmaps] = useState(true);

  if (!atoms || atoms.length === 0) return null;

  return (
    <div className="w-full h-full flex flex-col bg-gray-100 absolute inset-0 z-20">
      
      {/* Top Action Bar */}
      <div className="h-16 px-6 bg-white border-b flex items-center justify-between shrink-0 shadow-sm">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex items-center gap-2 text-gray-600 hover:text-black font-medium"
          >
            <ArrowLeft size={20} />
            Back to Map
          </button>
          <div className="h-6 w-px bg-gray-300"></div>
          <h2 className="font-bold text-xl text-gray-800">
            Comparing {atoms.length} Features
          </h2>
        </div>

        <button 
          onClick={() => setShowHeatmaps(!showHeatmaps)}
          className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-bold transition-colors ${
            showHeatmaps 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          }`}
        >
          {showHeatmaps ? <Eye size={18} /> : <EyeOff size={18} />}
          {showHeatmaps ? 'Hide All Heatmaps' : 'Show All Heatmaps'}
        </button>
      </div>

      {/* Massive Scrollable Grid for Features */}
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {atoms.map((atom) => {
          const safeDensity = atom.density || 0;
          const safeNorm = atom.norm || 1;
          const safeCluster = atom.cluster || 0;

          return (
            <div key={atom.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
              
              {/* Feature Header */}
              <div className="bg-gray-50 border-b px-6 py-4 flex items-center justify-between">
                <h3 className="font-bold text-lg text-gray-800 flex items-center gap-2">
                  <Activity className="text-blue-500" size={20} />
                  Feature #{atom.id}
                </h3>
                <div className="flex gap-6 text-sm text-gray-600">
                  <span><strong>Cluster:</strong> {safeCluster}</span>
                  <span><strong>Density:</strong> {(safeDensity * 100).toFixed(2)}%</span>
                  <span><strong>Norm:</strong> {safeNorm.toFixed(2)}</span>
                </div>
              </div>

              {/* Wide Image Grid */}
              <div className="p-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-8 gap-4">
                {(atom.top_activations || []).map((act, idx) => {
                  const safeActVal = act.activation_value || 0;

                  return (
                    <div key={idx} className="flex flex-col gap-1">
                      
                      <div className="relative aspect-square rounded-md overflow-hidden bg-black shadow-inner">
                        <img 
                          src={`/${act.base_image}`} 
                          alt={`Base ${idx}`}
                          className={`absolute inset-0 w-full h-full object-cover transition-all duration-300 ${
                            showHeatmaps ? 'brightness-50 grayscale-[30%]' : 'brightness-100'
                          }`}
                          loading="lazy"
                        />
                        {showHeatmaps && act.heatmap_image && (
                          <img 
                            src={`/${act.heatmap_image}`} 
                            alt={`Heatmap ${idx}`}
                            className="absolute inset-0 w-full h-full object-cover transition-opacity duration-300 opacity-100"
                            loading="lazy"
                          />
                        )}
                        <div className="absolute bottom-1 right-1 bg-black/80 text-white text-[11px] font-mono px-1.5 py-0.5 rounded backdrop-blur-sm">
                          {safeActVal.toFixed(1)}
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-500 truncate text-center mt-1">
                        {act.metadata?.label || `ID: ${act.dataset_idx || 'Unknown'}`}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}