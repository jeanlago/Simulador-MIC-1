import React from 'react';

interface Props {
  source?: string;
  destination?: string;
  enabled: boolean;
}

type Pt = [number, number];

/* pontos absolutos (x,y) dos “pinos” de cada bloco */
const PINS: Record<string, Pt> = {
  AC:  [ 90,  50],
  ALUa:[150,  70],   // entrada A da ALU
  ALUb:[150, 130],   // entrada B
  ALUo:[210, 100],   // saída da ALU
  MAR: [270,  50],
  MBR: [270, 150],
  IR:  [430,  50],
  PC:  [430, 150],
};

/* rotas pré-traçadas: from → to → lista de pontos */
const PATHS: Record<string, Record<string, Pt[]>> = {
  AC: {
    ALUa: [PINS.AC, [120, 50], [120, 70], PINS.ALUa],
    MAR:  [PINS.AC, [90, 100], [270, 100], [270, 50], PINS.MAR],
    IR:   [PINS.AC, [90, 100], [430, 100], [430, 50], PINS.IR],
    // …adicione as outras
  },
  ALUo: {
    IR:   [PINS.ALUo, [430, 100], [430, 50], PINS.IR],
    MBR:  [PINS.ALUo, [270, 100], [270, 150], PINS.MBR],
  },
  // …
};

const gray   = '#9e9e9e';
const red    = '#e53935';
const green  = '#43a047';

export default function BusView({ source, destination, enabled }: Props) {
  if (!enabled) return null;

  const busy = source && destination && PATHS[source!]?.[destination!];

  /* linhas cinza (todos os fios “apagados”) */
  const baseWires = Object.values(PATHS).flatMap(m =>
    Object.values(m).map(pts => (
      <polyline
        key={pts.map(p => p.join()).join('-')}
        points={pts.map(p => p.join(',')).join(' ')}
        fill="none"
        stroke={gray}
        strokeWidth="3"
      />
    ))
  );

  /* linha colorida do ciclo atual */
  const activeWire = busy && (
    <polyline
      points={PATHS[source!][destination!].map(p => p.join(',')).join(' ')}
      fill="none"
      stroke={red}
      strokeWidth="5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  );

  /* fio de chegada em verde por cima da parte final */
  const destLeg = busy && (
    <line
      x1={PINS[destination!][0]} y1={PINS[destination!][1]}
      x2={PINS[destination!][0]} y2={PINS[destination!][1] - 15}
      stroke={green}
      strokeWidth="5"
      strokeLinecap="round"
    />
  );

  /* blocos */
  const blocks = Object.entries(PINS).map(([name, [x, y]]) => (
    <g key={name}>
      <rect x={x-40} y={y-20} width="80" height="40" fill="#fcfcfc" stroke="#616161"/>
      <text x={x} y={y+5} textAnchor="middle" fontFamily="monospace" fontSize="13">{name}</text>
    </g>
  ));

  return (
    <svg width="520" height="200" style={{ border:'1px solid #bbb', marginTop:32 }}>
      {baseWires}
      {activeWire}
      {destLeg}
      {blocks}
    </svg>
  );
}
