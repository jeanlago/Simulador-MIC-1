// components/ALUView.tsx
import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface ALUViewProps {
  aluOperation?: string;
  inputA?: number;
  inputB?: number;
  output?: number;
  enabled: boolean;
}

const ALUView: React.FC<ALUViewProps> = ({
  aluOperation = 'N/A',
  inputA,
  inputB,
  output,
  enabled,
}) => {
  const theme = useTheme();

  // Se o usuário ocultar a ALU nas opções
  if (!enabled) return null;

  const labelStyle = { fontFamily: 'monospace' as const };

  return (
    <Box mt={3}>
      <Typography variant="subtitle1" gutterBottom>
        ALU
      </Typography>

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor:
            theme.palette.mode === 'dark'
              ? theme.palette.grey[900]
              : theme.palette.grey[100],
        }}
      >
        <Typography component="div">
          Operação:&nbsp;<strong>{aluOperation}</strong>
        </Typography>
        <Typography component="div">
          A:&nbsp;<span style={labelStyle}>{inputA ?? '??'}</span>
        </Typography>
        <Typography component="div">
          B:&nbsp;<span style={labelStyle}>{inputB ?? '??'}</span>
        </Typography>
        <Typography component="div">
          Resultado:&nbsp;<span style={labelStyle}>{output ?? '??'}</span>
        </Typography>
      </Box>
    </Box>
  );
};

export default ALUView;
