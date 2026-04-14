import { useMemo } from 'react';
import PlotComponent from 'react-plotly.js';

const Plot = PlotComponent.default || PlotComponent;

export default function UmapViewer({ data, onSelectAtoms, viewMode = "umap", densityMode = "image" }) {
  
  const plotData = useMemo(() => {
    if (!data || !data.features) return null;
    const isStats = viewMode === "stats";

    return [{
      type: 'scattergl',
      mode: 'markers',
      x: data.features.map(f => {
        if (!isStats) return f.x || 0;
        return densityMode === "patch" ? (f.patch_density || 0) : (f.density || 0);
      }),
      y: data.features.map(f => isStats ? (f.avg_act || 0) : (f.y || 0)),
      text: data.features.map(f => (
        `ID: ${f.id}<br>` +
        `Label: ${f.top_activations?.[0]?.metadata?.label || 'Unknown'}<br>` +
        `Image Dens: ${((f.density || 0) * 100).toFixed(2)}%<br>` +
        `Patch Dens: ${((f.patch_density || 0) * 100).toFixed(4)}%`
      )),
      hoverinfo: 'text',
      marker: {
        size: data.features.map(f => Math.max(5, (f.norm || 1) * 2.5)),
        color: data.features.map(f => f.cluster || 0),
        colorscale: 'Turbo',
        opacity: 0.7,
      }
    }];
  }, [data, viewMode, densityMode]);

  const handleSelection = (event) => {
    if (!event || !event.points || event.points.length === 0) return;
    const selected = event.points.map(p => {
       const idx = p.pointIndex !== undefined ? p.pointIndex : p.pointNumber;
       return data.features[idx];
    }).filter(Boolean);

    if (selected.length > 0) {
      onSelectAtoms(selected);
    }
  };

  if (!data) return <div className="h-full w-full flex items-center justify-center text-gray-400 font-bold bg-white">Loading GPU Latent Space...</div>;

  const isStats = viewMode === "stats";
  const xAxisTitle = densityMode === "patch" 
    ? 'True Sparsity (Patch Level - Log Scale)' 
    : 'Feature Prevalence (Image Level - Log Scale)';

  return (
    <div className="w-full h-full relative bg-white">
      <Plot
        data={plotData}
        layout={{
          autosize: true,
          margin: isStats ? { l: 80, r: 40, t: 40, b: 80 } : { l: 0, r: 0, t: 0, b: 0 },
          hovermode: 'closest',
          dragmode: 'lasso',
          xaxis: { 
            visible: isStats, 
            type: isStats ? 'log' : 'linear', 
            title: { text: xAxisTitle, font: { size: 11, color: '#999' } },
            gridcolor: '#f3f4f6'
          },
          yaxis: { 
            visible: isStats, 
            title: { text: 'Avg Activation Strength', font: { size: 11, color: '#999' } },
            gridcolor: '#f3f4f6'
          },
          uirevision: `${viewMode}-${densityMode}` 
        }}
        useResizeHandler={true}
        style={{ width: '100%', height: '100%' }}
        onSelected={handleSelection}
        onClick={handleSelection}
        onDeselect={() => onSelectAtoms([])}
        config={{ displayModeBar: false, scrollZoom: true }}
      />
    </div>
  );
}