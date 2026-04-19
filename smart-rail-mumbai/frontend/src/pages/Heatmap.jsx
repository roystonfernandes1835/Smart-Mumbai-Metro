import React from 'react';

const Heatmap = () => {
  return (
    <div className="flex-1 w-full min-h-[900px] bg-brand-bg/50 rounded-2xl overflow-hidden border border-white/10 shadow-2xl relative">
      <iframe 
        src="http://localhost:8080" 
        className="w-full h-full border-none min-h-[900px]"
        title="Mumbai Metro Heatmap"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      />
    </div>
  );
};

export default Heatmap;
