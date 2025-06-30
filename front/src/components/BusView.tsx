import React, { useState, useLayoutEffect } from 'react';
import { useTheme } from '@mui/material/styles';

const PATH_LENGTH_CACHE = new Map<string, number>();

function calcAndCacheLength(pts: [number, number][]) {
  const key = pts.map(p => p.join()).join('-');
  if (PATH_LENGTH_CACHE.has(key)) return PATH_LENGTH_CACHE.get(key)!;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', '0');
  svg.setAttribute('height', '0');
  svg.style.position = 'absolute';
  svg.style.opacity = '0';

  const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
  tmp.setAttribute('points', pts.map(p => p.join(',')).join(' '));
  svg.appendChild(tmp);
  document.body.appendChild(svg);

  const len = tmp.getTotalLength();
  document.body.removeChild(svg);
  PATH_LENGTH_CACHE.set(key, len);
  return len;
}

const CONFIG = { SVG_WIDTH: 900, SVG_HEIGHT: 350, CELL_SPACING_X: 160, CELL_SPACING_Y: 120,
  GRID_COLS: 5, GRID_ROWS: 2, BLOCK_WIDTH: 100, BLOCK_HEIGHT: 50, BUS_Y_OFFSET: -20 };

const COMPONENTS_LAYOUT: Record<string, { name: string; gridPos: [number, number] }> = {
  MEM: { name: 'Memory', gridPos: [0, 0] }, IMM: { name: 'IMM', gridPos: [0, 1] },
  AC: { name: 'AC', gridPos: [1, 0] }, MAR: { name: 'MAR', gridPos: [2, 0] },
  IR: { name: 'IR', gridPos: [3, 0] }, PC: { name: 'PC', gridPos: [4, 0] },
  ALUa: { name: 'ALUa', gridPos: [1, 1] }, ALUb: { name: 'ALUb', gridPos: [2, 1] },
  ALUo: { name: 'ALUo', gridPos: [3, 1] }, MBR: { name: 'MBR', gridPos: [4, 1] },
};

const GRID_TOTAL_WIDTH = (CONFIG.GRID_COLS - 1) * CONFIG.CELL_SPACING_X;
const GRID_TOTAL_HEIGHT = (CONFIG.GRID_ROWS - 1) * CONFIG.CELL_SPACING_Y;
const PADDING_X = (CONFIG.SVG_WIDTH - GRID_TOTAL_WIDTH) / 2;
const PADDING_Y = (CONFIG.SVG_HEIGHT - GRID_TOTAL_HEIGHT) / 2;
const BUS_Y = CONFIG.SVG_HEIGHT / 2 + CONFIG.BUS_Y_OFFSET;

const COMPONENTS = Object.fromEntries(
  Object.entries(COMPONENTS_LAYOUT).map(([k, { name, gridPos }]) => {
    const [col, row] = gridPos;
    const x = PADDING_X + col * CONFIG.CELL_SPACING_X;
    const y = PADDING_Y + row * CONFIG.CELL_SPACING_Y;
    const pinY = y + (row === 0 ? CONFIG.BLOCK_HEIGHT / 2 : -CONFIG.BLOCK_HEIGHT / 2);
    return [k, { name, x, y, pinY }];
  })
);

const PATHS: Record<string, Record<string, [number, number][]>> = {};
for (const s in COMPONENTS) {
  PATHS[s] = {};
  for (const d in COMPONENTS) {
    if (s !== d) {
      const src = COMPONENTS[s], dst = COMPONENTS[d];
      PATHS[s][d] = [[src.x, src.pinY], [src.x, BUS_Y], [dst.x, BUS_Y], [dst.x, dst.pinY]];
    }
  }
}

const wireColor = '#9e9e9e', sourceColor = '#ffc107', pulseColor = '#e53935', arrivalColor = '#43a047';

type Pulse = { id: number, points: [number, number][], len: number };

export default function BusView({
  source: sourceProp, destination: destProp, enabled, drawMs = 1000
}: {
  source?: string; destination?: string; enabled: boolean; drawMs?: number;
}) {
  const theme = useTheme();
  const [pulses, setPulses] = useState<Pulse[]>([]);

  let memoryAddress: string | null = null;
  const parseKey = (k?: string) => {
    if (!k) return k;
    if (k.startsWith('MEM[')) { memoryAddress = k.slice(4, -1); return 'MEM'; }
    if (k.startsWith('ALU-')) return `ALU${k.slice(-1)}`;
    return k;
  };
  const sourceKey = parseKey(sourceProp);
  const destKey = parseKey(destProp);

  useLayoutEffect(() => {
    const path = sourceKey && destKey && PATHS[sourceKey]?.[destKey];
    if (!path) return;

    const len = calcAndCacheLength(path);
    const id = Date.now();
    setPulses(p => [...p, { id, points: path, len }]);

    const t = setTimeout(() => {
      setPulses(p => p.filter(pl => pl.id !== id));
    }, drawMs + 200);
    return () => clearTimeout(t);
  }, [sourceKey, destKey]);

  if (!enabled) return null;

  const baseWires = Object.values(PATHS).flatMap(m =>
    Object.values(m).map(pts => (
      <polyline key={pts.map(p => p.join()).join('-')}
                points={pts.map(p => p.join(',')).join(' ')}
                fill="none" stroke={wireColor} strokeWidth="3" />
    ))
  );

  const pulseLines = pulses.map(p => {
    const visibleLen = p.len * 0.2;
    return (
      <g key={p.id}>
        <polyline
          points={p.points.map(pt => pt.join(',')).join(' ')}
          fill="none" stroke={pulseColor} strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={`${visibleLen} ${p.len}`}
          strokeDashoffset="0"
          style={{
            animation: `move-${p.id} ${drawMs}ms linear forwards`
          }}
        />
        <style>
          {`@keyframes move-${p.id} { to { stroke-dashoffset: -${p.len}; } }`}
        </style>
      </g>
    );
  });

  const blocks = Object.entries(COMPONENTS).map(([k, { name, x, y }]) => {
    const isSource = k === sourceKey, isDest = k === destKey;
    const fillColor = isDest ? arrivalColor : (isSource ? sourceColor : theme.palette.background.paper);
    const textColor = isSource || isDest ? '#fff' : theme.palette.text.primary;
    const memColor = isSource || isDest ? '#fff' : theme.palette.text.secondary;
    return (
      <g key={name} transform={`translate(${x},${y})`}>
        <rect x={-CONFIG.BLOCK_WIDTH/2} y={-CONFIG.BLOCK_HEIGHT/2}
              width={CONFIG.BLOCK_WIDTH} height={CONFIG.BLOCK_HEIGHT}
              fill={fillColor} stroke="#616161" rx="4"
              style={{ transition: 'fill 200ms' }} />
        <text x="0" y="0" textAnchor="middle"
              fontFamily="Montserrat, sans-serif" fontSize="14"
              fontWeight="bold" fill={textColor}>
          {name}
        </text>
        {memoryAddress && k === 'MEM' && (
          <text x="0" y="15" textAnchor="middle"
                fontFamily="Montserrat, sans-serif" fontSize="10"
                fill={memColor}>
            @{memoryAddress}
          </text>
        )}
      </g>
    );
  });

  return (
    <svg width={CONFIG.SVG_WIDTH} height={CONFIG.SVG_HEIGHT}
         style={{ border:'1px solid #ddd', background:theme.palette.background.default, borderRadius:8 }}>
      <line x1="0" y1={BUS_Y} x2={CONFIG.SVG_WIDTH} y2={BUS_Y}
            stroke={wireColor} strokeWidth="5" />
      {baseWires}
      {pulseLines}
      {blocks}
    </svg>
  );
}
