import React from 'react';

interface MicroInstructionViewProps {
  microInstruction: string;
  enabled: boolean;
}

const MicroInstructionView: React.FC<MicroInstructionViewProps> = ({ microInstruction, enabled }) => {
  if (!enabled) return null;

  return (
    <div style={{ marginTop: 30 }}>
      <h2>Última Microinstrução</h2>
      <div style={{ fontFamily: 'monospace', backgroundColor: '#282c34', color: '#61dafb', padding: 10, borderRadius: 5 }}>
        {microInstruction || 'Nenhuma instrução ainda.'}
      </div>
    </div>
  );
};

export default MicroInstructionView;
