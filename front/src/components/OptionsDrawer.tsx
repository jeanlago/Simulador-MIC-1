import { useState } from 'react';
import {
  Drawer, IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Checkbox, Box, Divider, Typography
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';

type Props = {
  options: {
    showRegisters: boolean;
    showMemory: boolean;
    highlightMAR: boolean;
    showALU: boolean;
    showMicroInstruction: boolean;
    showBus: boolean;
    recordHistory: boolean;
    fastMode: boolean;
    didacticMode: boolean;
  };
  isRunning: boolean;
  onToggle: (key: keyof Props['options']) => void;
  onRepeatTutorial: () => void;
};


export default function OptionsDrawer({ options, isRunning, onToggle, onRepeatTutorial }: Props) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);

  const items = [
    { key: 'showRegisters',        label: 'Mostrar Registradores' },
    { key: 'showMemory',           label: 'Mostrar Memória' },
    { key: 'highlightMAR',         label: 'Destacar MAR' },
    { key: 'showALU',              label: 'Mostrar ALU' },
    { key: 'showMicroInstruction', label: 'Mostrar Microinstrução' },
    { key: 'showBus',              label: 'Mostrar Barramento' },
    { key: 'recordHistory',        label: 'Guardar Histórico' },
    { key: 'fastMode',             label: 'Modo Rápido' },
    { key: 'didacticMode',         label: 'Modo Didático' },
  ] as const;

  const handleButtonClick = (action: () => void) => {
    action();
    toggle(); // Fecha o menu ao clicar
  };

  return (
    <>
      {!open && (
        <IconButton onClick={toggle} sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1201 }} size="large">
          <MenuIcon />
        </IconButton>
      )}
      <Drawer anchor="left" open={open} onClose={toggle} PaperProps={{ sx: { width: 280, display: 'flex', flexDirection: 'column' } }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent: 'space-between', height:56, pl:2, pr: 1 }}>
          <Typography variant="h6">Opções</Typography>
          <IconButton onClick={toggle}><CloseIcon /></IconButton>
        </Box>
        <Divider />
        <Box sx={{ flex: 1, overflowY: 'auto' }}>
          <List dense>
            {items.map(({ key, label }) => {
              const disable = isRunning && (key === 'fastMode' || key === 'didacticMode');
              return (
                <ListItem key={key} disablePadding>
                  <ListItemButton onClick={() => onToggle(key)} disabled={disable}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Checkbox edge="start" checked={options[key]} disableRipple disabled={disable} />
                    </ListItemIcon>
                    <ListItemText primary={label} />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
        </Box>
        <Divider />
        <Box>
          <List dense>
            <ListItemButton onClick={() => handleButtonClick(onRepeatTutorial)}>
              <ListItemIcon sx={{ minWidth: 40 }}><HelpOutlineIcon /></ListItemIcon>
              <ListItemText primary="Repetir Tutorial" />
            </ListItemButton>
          </List>
        </Box>
      </Drawer>
    </>
  );
}
