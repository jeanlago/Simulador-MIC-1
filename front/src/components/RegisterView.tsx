import React from 'react';



function RegisterView({ registers }: { registers: Record<string, number> }) {
  return (
    <div style={{ marginTop: 30 }}>
      <h2>Registradores</h2>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        {Object.entries(registers).map(([name, value]) => (
          <div key={name}>
            <strong>{name}:</strong> {value}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RegisterView;
