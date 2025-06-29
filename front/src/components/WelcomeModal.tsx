import React, { useState } from 'react';
import { Modal, Box, Typography, Button, Stack } from '@mui/material';

interface Props {
  open: boolean;
  onDecline: () => void;
  onStartTutorial: () => void;
}

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  textAlign: 'center',
};

export default function WelcomeModal({ open, onDecline, onStartTutorial }: Props) {
  const [view, setView] = useState<'initial' | 'confirm_tutorial'>('initial');

  const handleInitialYes = () => {
    setView('confirm_tutorial');
  };
  
  const handleInitialNo = () => {
    onDecline();
  };

  const renderInitialView = () => (
    <>
      <Typography variant="h6" component="h2">
        Primeira vez usando o simulador?
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
        <Button variant="contained" onClick={handleInitialYes}>Sim</Button>
        <Button variant="outlined" onClick={handleInitialNo}>Não</Button>
      </Stack>
    </>
  );

  const renderConfirmTutorialView = () => (
    <>
      <Typography variant="h6" component="h2">
        Gostaria de um tour guiado?
      </Typography>
      <Typography sx={{ mt: 1 }}>
        Mostraremos as principais funcionalidades.
      </Typography>
      <Stack direction="row" spacing={2} justifyContent="center" mt={2}>
        <Button variant="contained" onClick={onStartTutorial}>Sim, por favor!</Button>
        <Button variant="outlined" onClick={onDecline}>Não, obrigado.</Button>
      </Stack>
    </>
  );

  return (
    <Modal open={open} onClose={onDecline}>
      <Box sx={style}>
        {view === 'initial' ? renderInitialView() : renderConfirmTutorialView()}
      </Box>
    </Modal>
  );
}