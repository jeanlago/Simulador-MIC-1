import React, { useState, useLayoutEffect, useRef } from 'react';

// --- 1. CONFIGURAÇÃO DO LAYOUT ---
// Adicionamos uma coluna para o novo bloco de Memória
const CONFIG = {
  SVG_WIDTH: 900, // Aumentado para caber a nova coluna
  SVG_HEIGHT: 350,
  CELL_SPACING_X: 160,
  CELL_SPACING_Y: 120,
  GRID_COLS: 5, // Aumentado de 4 para 5
  GRID_ROWS: 2,
  BLOCK_WIDTH: 100,
  BLOCK_HEIGHT: 50,
  BUS_Y_OFFSET: -20,
};

// --- 2. DEFINIÇÃO LÓGICA DOS COMPONENTES ---
// Adicionado o componente 'MEM' no grid
const COMPONENTS_LAYOUT: Record<string, { name: string; gridPos: [number, number] }> = {
  MEM:  { name: 'Memory', gridPos: [0, 0] }, // ✅ Novo Bloco
  AC:   { name: 'AC',   gridPos: [1, 0] },
  MAR:  { name: 'MAR',  gridPos: [2, 0] },
  IR:   { name: 'IR',   gridPos: [3, 0] },
  PC:   { name: 'PC',   gridPos: [4, 0] },
  ALUa: { name: 'ALUa', gridPos: [1, 1] },
  ALUb: { name: 'ALUb', gridPos: [2, 1] },
  ALUo: { name: 'ALUo', gridPos: [3, 1] },
  MBR:  { name: 'MBR',  gridPos: [4, 1] },
};

// --- 3. CÁLCULOS AUTOMÁTICOS DE POSIÇÃO E ROTAS (SEM ALTERAÇÃO NA LÓGICA) ---
const GRID_TOTAL_WIDTH = (CONFIG.GRID_COLS - 1) * CONFIG.CELL_SPACING_X;
const GRID_TOTAL_HEIGHT = (CONFIG.GRID_ROWS - 1) * CONFIG.CELL_SPACING_Y;
const PADDING_X = (CONFIG.SVG_WIDTH - GRID_TOTAL_WIDTH) / 2;
const PADDING_Y = (CONFIG.SVG_HEIGHT - GRID_TOTAL_HEIGHT) / 2;
const BUS_Y = CONFIG.SVG_HEIGHT / 2 + CONFIG.BUS_Y_OFFSET;

const COMPONENTS = Object.fromEntries(
  Object.entries(COMPONENTS_LAYOUT).map(([key, { name, gridPos }]) => {
    const [col, row] = gridPos;
    const x = PADDING_X + col * CONFIG.CELL_SPACING_X;
    const y = PADDING_Y + row * CONFIG.CELL_SPACING_Y;
    const pinY = y + (row === 0 ? CONFIG.BLOCK_HEIGHT / 2 : -CONFIG.BLOCK_HEIGHT / 2);
    return [key, { name, x, y, pinY }];
  })
);

const PATHS: Record<string, Record<string, [number, number][]>> = {};
for (const sourceKey in COMPONENTS) {
  PATHS[sourceKey] = {};
  for (const destKey in COMPONENTS) {
    if (sourceKey === destKey) continue;
    const source = COMPONENTS[sourceKey];
    const dest = COMPONENTS[destKey];
    PATHS[sourceKey][destKey] = [
      [source.x, source.pinY], [source.x, BUS_Y],
      [dest.x, BUS_Y], [dest.x, dest.pinY],
    ];
  }
}

// --- 4. COMPONENTE REACT ---
const defaultColor = '#fcfcfc';
const wireColor    = '#9e9e9e';
const sourceColor  = '#ffc107';
const pulseColor   = '#e53935';
const arrivalColor = '#43a047';
const ANIMATION_DURATION = 800;

export default function BusView({ source: sourceProp, destination: destProp, enabled }: { source?: string; destination?: string; enabled: boolean; }) {
  const activePathRef = useRef<SVGPolylineElement>(null);
  const [pathLength, setPathLength] = useState(0);
  const [hasArrived, setHasArrived] = useState(false);

  // ✅ LÓGICA PARA INTERPRETAR ACESSOS À MEMÓRIA
  let memoryAddress: string | null = null;
  
  const parseKey = (key?: string) => {
    if (key?.startsWith('MEM[')) {
      memoryAddress = key.substring(4, key.length - 1); // Extrai o endereço, ex: "100"
      return 'MEM'; // Normaliza a chave para o nosso componente 'MEM'
    }
    return key;
  };

  const sourceKey = parseKey(sourceProp);
  const destKey = parseKey(destProp);

  const pathExists = sourceKey && destKey && PATHS[sourceKey]?.[destKey];
  const busy = !!pathExists;

  useLayoutEffect(() => {
    if (busy && activePathRef.current) {
      setPathLength(activePathRef.current.getTotalLength());
      setHasArrived(false);
      const timer = setTimeout(() => setHasArrived(true), ANIMATION_DURATION);
      return () => clearTimeout(timer);
    }
  }, [sourceKey, destKey, busy]);

  if (!enabled) return null;

  const baseWires = Object.values(PATHS).flatMap(m =>
    Object.values(m).map(pts => (
      <polyline key={pts.map(p => p.join()).join('-')} points={pts.map(p => p.join(',')).join(' ')}
        fill="none" stroke={wireColor} strokeWidth="3" />
    ))
  );

  const activePulse = busy && (
    <polyline ref={activePathRef} points={pathExists.map(p => p.join(',')).join(' ')}
      fill="none" stroke={pulseColor} strokeWidth="5" strokeLinecap="round"
      strokeDasharray={pathLength} strokeDashoffset={pathLength}
      style={{ animation: `draw-pulse ${ANIMATION_DURATION}ms linear` }} />
  );

  const blocks = Object.entries(COMPONENTS).map(([key, { name, x, y }]) => {
  const isSource = key === sourceKey && busy;
  const isDest = key === destKey && hasArrived;
  
  // ✅ PASSO 1: Determina se o bloco está ativo (seja como origem ou destino)
  const isActive = isSource || isDest;

  const fillColor = isDest ? arrivalColor : (isSource ? sourceColor : defaultColor);
  
  // ✅ PASSO 2: Define a cor do texto com base no estado 'isActive'
  const textColor = isActive ? '#FFFFFF' : '#0d47a1'; // Branco se ativo, azul escuro se inativo
  const memoryTextColor = isActive ? '#FFFFFF' : '#424242'; // Cor para o texto do endereço de memória

  const isMemoryActive = memoryAddress && (key === sourceKey || (key === destKey && hasArrived));

  return (
    <g key={name} transform={`translate(${x}, ${y})`}>
      <rect x={-CONFIG.BLOCK_WIDTH / 2} y={-CONFIG.BLOCK_HEIGHT / 2}
        width={CONFIG.BLOCK_WIDTH} height={CONFIG.BLOCK_HEIGHT}
        fill={fillColor} stroke="#616161" rx="4" style={{ transition: 'fill 200ms' }} />
      
      <text
        x="0" y="0"
        textAnchor="middle"
        fontFamily="Montserrat, sans-serif"
        fontSize="14"
        // ✅ PASSO 3: Aplica a cor de texto dinâmica
        fill={textColor}
        fontWeight="bold"
      >
        {name}
      </text>
      
      {isMemoryActive && (
        <text
          x="0" y="15"
          textAnchor="middle"
          fontFamily="Montserrat, sans-serif"
          fontSize="10"
          // ✅ PASSO 3: Aplica a cor de texto dinâmica
          fill={memoryTextColor}
          fontWeight="400"
        >
          @{memoryAddress}
        </text>
      )}
    </g>
  );
});
  return (
    <svg width={CONFIG.SVG_WIDTH} height={CONFIG.SVG_HEIGHT} style={{ border: '1px solid #ddd', backgroundColor: '#fdfdfd', borderRadius: '8px' }}>
      <style>{`@keyframes draw-pulse { to { stroke-dashoffset: 0; } }`}</style>
      <line x1="0" y1={BUS_Y} x2={CONFIG.SVG_WIDTH} y2={BUS_Y} stroke={wireColor} strokeWidth="5" />
      {baseWires}
      {activePulse}
      {blocks}
    </svg>
  );
}