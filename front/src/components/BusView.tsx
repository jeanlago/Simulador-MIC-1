// BusView.tsx
import React from 'react';

interface BusViewProps {
  source?: string;
  destination?: string;
  enabled: boolean;
}

const BusView: React.FC<BusViewProps> = ({ source, destination, enabled }) => {
  if (!enabled) return null;

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Visualização do Barramento</h2>
      <svg width="100%" height="200" style={{ border: '1px solid #ccc' }}>
        {/* Barramento principal */}
        <line x1="50" y1="100" x2="750" y2="100" stroke="black" strokeWidth="4" />

        {/* Fonte */}
        {source && (
          <text x="50" y="80" fill="green">Fonte: {source}</text>
        )}

        {/* Destino */}
        {destination && (
          <text x="650" y="80" fill="red">Destino: {destination}</text>
        )}

        {/* Seta representando movimento */}
        {source && destination && (
          <polygon points="720,90 740,100 720,110" fill="red" />
        )}

        {/* ALU visual */}
        <rect x="350" y="60" width="100" height="80" fill="#f4f4f4" stroke="black" strokeWidth="2" rx="10" />
        <text x="400" y="105" textAnchor="middle" fill="black" fontWeight="bold">ULA</text>
      </svg>
    </div>
  );
};

export default BusView;
