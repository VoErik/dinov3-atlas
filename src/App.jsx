import { useState, useEffect, useMemo } from 'react';
import WarningModal from './components/WarningModal';
import UmapViewer from './components/UmapViewer';
import DetailPanel from './components/DetailPanel';
import GalleryView from './components/GalleryView';
import { Search, Layers, ChevronDown, BarChart2, Map } from 'lucide-react';

export default function App() {
  const [acceptedWarning, setAcceptedWarning] = useState(false);
  const [currentLayer, setCurrentLayer] = useState(9);
  const [selectedAtoms, setSelectedAtoms] = useState([]);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  
  const [viewMode, setViewMode] = useState("umap"); 
  const [densityMode, setDensityMode] = useState("image");
  
  const [searchQuery, setSearchQuery] = useState("");
  const [globalIndex, setGlobalIndex] = useState([]);
  const [layerData, setLayerData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('/data/global_index.json')
      .then(async res => {
        const text = await res.text();
        if (text.trim().startsWith('<')) throw new Error("Index missing");
        return JSON.parse(text.replace(/:\s*NaN/g, ': 0').replace(/:\s*-?Infinity/g, ': 0'));
      })
      .then(data => setGlobalIndex(Array.isArray(data) ? data : []))
      .catch(() => setGlobalIndex([]));
  }, []);

  useEffect(() => {
    setLayerData(null);
    setSelectedAtoms([]); 
    setError(null);

    fetch(`/data/ui_data_layer_${currentLayer}.json`)
      .then(async res => {
        const text = await res.text();
        if (text.trim().startsWith('<')) throw new Error(`Layer file missing!`);
        try {
          return JSON.parse(text.replace(/:\s*NaN/g, ': 0').replace(/:\s*-?Infinity/g, ': 0'));
        } catch (e) {
          throw new Error(`JSON format is corrupted: ${e.message}`);
        }
      })
      .then(data => setLayerData(data))
      .catch(err => setError(err.message));
  }, [currentLayer]);

  const searchResults = useMemo(() => {
    if (!globalIndex || globalIndex.length === 0) return [];
    const q = searchQuery.trim().toLowerCase();
    const isNumeric = /^\d+$/.test(q);
    if (q.length === 0 || (!isNumeric && q.length < 2)) return [];

    return globalIndex
      .filter(item => (item.label?.toLowerCase().includes(q) || item.id?.toString() === q))
      .sort((a, b) => (b.a || 0) - (a.a || 0))
      .slice(0, 10);
  }, [searchQuery, globalIndex]);

  const jumpToFeature = (feature) => {
    setSearchQuery("");
    if (feature.l !== currentLayer) {
      setCurrentLayer(feature.l);
      window._pendingSelectId = feature.id;
    } else if (layerData && layerData.features) {
      const atom = layerData.features.find(f => f.id === feature.id);
      if (atom) setSelectedAtoms([atom]);
    }
  };

  useEffect(() => {
    if (layerData && layerData.features && window._pendingSelectId !== undefined) {
      const atom = layerData.features.find(f => f.id === window._pendingSelectId);
      if (atom) setSelectedAtoms([atom]);
      delete window._pendingSelectId;
    }
  }, [layerData]);

  if (!acceptedWarning) return <WarningModal onAccept={() => setAcceptedWarning(true)} />;

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100 font-sans overflow-hidden text-gray-900">
      <header className="h-16 flex items-center justify-between px-6 bg-white border-b shadow-sm z-30 shrink-0">
        <div className="flex items-center gap-6">
          <h2 className="font-bold text-xl tracking-tight">DINOv3 Atlas</h2>
          
          <div className="flex items-center gap-2">
            <div className="flex bg-gray-100 p-1 rounded-full border border-gray-200">
              <button 
                onClick={() => setViewMode("umap")}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-full transition ${viewMode === 'umap' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Map size={14} /> UMAP
              </button>
              <button 
                onClick={() => setViewMode("stats")}
                className={`flex items-center gap-2 px-4 py-1.5 text-xs font-bold rounded-full transition ${viewMode === 'stats' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <BarChart2 size={14} /> STATS
              </button>
            </div>

            {/* DENSITY SUB-TOGGLE: Only visible in Stats mode */}
            {viewMode === "stats" && (
              <div className="flex bg-blue-50 p-1 rounded-full border border-blue-100 animate-in fade-in zoom-in duration-200">
                <button 
                  onClick={() => setDensityMode("image")}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition uppercase tracking-wider ${densityMode === 'image' ? 'bg-blue-500 text-white shadow-sm' : 'text-blue-600 hover:bg-blue-100'}`}
                >
                  Image
                </button>
                <button 
                  onClick={() => setDensityMode("patch")}
                  className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition uppercase tracking-wider ${densityMode === 'patch' ? 'bg-blue-500 text-white shadow-sm' : 'text-blue-600 hover:bg-blue-100'}`}
                >
                  Patch
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          {/* ... Search Bar ... */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search concepts or ID..." 
              className="w-80 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
            />
            {searchResults.length > 0 && (
              <div className="absolute top-12 left-0 w-full bg-white border border-gray-100 rounded-2xl shadow-2xl z-50 overflow-hidden py-2">
                {searchResults.map((res, i) => (
                  <button key={i} onClick={() => jumpToFeature(res)} className="w-full text-left px-4 py-2.5 hover:bg-blue-50 flex items-center justify-between transition-colors">
                    <div className="flex flex-col">
                       <span className="text-sm font-bold text-gray-800">{res.label || "Unknown"}</span>
                       <span className="text-[10px] text-gray-500 uppercase">ID {res.id} • Str: {(res.a || 0).toFixed(1)}</span>
                    </div>
                    <span className="text-[10px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-bold">Layer {res.l}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ... Layer Selector ... */}
          <div className="relative">
            <button onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50 transition font-bold text-sm">
              <Layers size={16} className="text-blue-500" /> Layer {currentLayer} <ChevronDown size={14} className="text-gray-400" />
            </button>
            {isLayerMenuOpen && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-100 rounded-xl shadow-xl z-50 py-1 overflow-hidden">
                {[7, 8, 9, 10].map(l => (
                  <button key={l} onClick={() => {setCurrentLayer(l); setIsLayerMenuOpen(false)}} className={`w-full text-left px-4 py-2 text-sm ${currentLayer === l ? 'bg-blue-50 text-blue-600 font-bold' : 'hover:bg-gray-50'}`}>Layer {l}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1 flex overflow-hidden relative">
        <div className="flex flex-row w-full h-full">
          <section className="flex-1 relative bg-white border-r border-gray-200">
            {error ? (
              <div className="h-full flex flex-col items-center justify-center text-red-500 p-8 text-center bg-gray-50">
                <div className="font-bold text-lg mb-2">Failed to load layer</div>
                <div className="text-sm font-mono bg-white p-4 rounded-lg border border-red-200 shadow-sm max-w-xl break-words text-left">
                  {error}
                </div>
              </div>
            ) : (
              <UmapViewer 
                key={currentLayer} 
                data={layerData} 
                viewMode={viewMode} 
                densityMode={densityMode}
                onSelectAtoms={setSelectedAtoms} 
              />
            )}
          </section>
          <aside className="w-96 bg-gray-50 overflow-hidden shrink-0">
            <DetailPanel atoms={selectedAtoms.length === 1 ? selectedAtoms : []} densityMode={densityMode} />
          </aside>
        </div>
        {selectedAtoms.length > 1 && <GalleryView atoms={selectedAtoms} onBack={() => setSelectedAtoms([])} />}
      </main>
    </div>
  );
}