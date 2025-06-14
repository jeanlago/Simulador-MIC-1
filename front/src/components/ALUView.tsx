import React from 'react';

interface ALUViewProps {
  aluOperation: string;
  inputA?: number;
  inputB?: number;
  output?: number;
  enabled: boolean;
}

const ALUView: React.FC<ALUViewProps> = ({ aluOperation, inputA, inputB, output, enabled }) => {
  if (!enabled) return null;

  return (
    <div style={{ marginTop: 30 }}>
      <h2>ALU</h2>
      <div style={{ fontFamily: 'monospace', backgroundColor: '#1f1f1f', color: '#fff', padding: 10, borderRadius: 5 }}>
        <div>Operação: <strong>{aluOperation || 'N/A'}</strong></div>
        <div>A: {inputA ?? '??'}</div>
        <div>B: {inputB ?? '??'}</div>
        <div>Resultado: {output ?? '??'}</div>
      </div>
    </div>
  );
};

export default ALUView;
