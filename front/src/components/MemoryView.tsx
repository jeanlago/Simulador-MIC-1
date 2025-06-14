import React from 'react';

interface Props {
  memory: number[];
  highlightMAR?: number;
}

const MemoryView: React.FC<Props> = ({ memory, highlightMAR }) => {
  return (
    <div style={{ marginTop: 30 }}>
      <h2>Memória (RAM)</h2>
      <table style={{ width: '100%', fontFamily: 'monospace', fontSize: 14 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left' }}>Endereço</th>
            <th style={{ textAlign: 'left' }}>Valor</th>
          </tr>
        </thead>
        <tbody>
          {memory.map((value, index) => (
            <tr key={index} style={{ backgroundColor: highlightMAR === index ? '#ffe599' : 'transparent' }}>
              <td>{index}</td>
              <td>{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default MemoryView;
