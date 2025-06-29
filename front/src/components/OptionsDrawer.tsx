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
  };
  onToggle: (key: keyof Props['options']) => void;
  onRepeatTutorial: () => void;
};

export default function OptionsDrawer({ options, onToggle, onRepeatTutorial }: Props) {
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
      <Drawer anchor="left" open={open} onClose={toggle} PaperProps={{ sx: { width: 280 } }}>
        <Box sx={{ display:'flex', alignItems:'center', justifyContent: 'space-between', height:56, pl:2, pr: 1 }}>
          <Typography variant="h6">Opções</Typography>
          <IconButton onClick={toggle}><CloseIcon /></IconButton>
        </Box>
        <Divider />
        <List dense>
          <ListItemButton onClick={() => handleButtonClick(onRepeatTutorial)}>
            <ListItemIcon sx={{ minWidth: 40 }}><HelpOutlineIcon /></ListItemIcon>
            <ListItemText primary="Repetir Tutorial" />
          </ListItemButton>
        </List>
        <Divider />
        <List dense>
          {items.map(({ key, label }) => (
            <ListItem key={key} disablePadding>
              <ListItemButton onClick={() => onToggle(key)}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Checkbox edge="start" checked={options[key]} disableRipple />
                </ListItemIcon>
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
    </>
  );
}