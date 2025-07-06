import React from 'react';
import { Box, Typography, useTheme } from '@mui/material';

interface Props {
  microInstruction?: string;
  enabled: boolean;
}

export default function MicroInstructionView({ microInstruction, enabled }: Props) {
  const theme = useTheme();
  if (!enabled) return null;

  const bg = theme.palette.mode === 'dark'
    ? theme.palette.grey[900]
    : theme.palette.grey[100];

  return (
    <Box mt={3}>
      <Typography variant="subtitle1" gutterBottom>
        Última Micro-instrução
      </Typography>

      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          fontFamily: 'monospace',
          bgcolor: bg,
          color: theme.palette.text.primary,
          minHeight: 40,
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {microInstruction || 'Nenhuma instrução ainda.'}
      </Box>
    </Box>
  );
}
