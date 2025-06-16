import { useState } from 'react';
import {
  Drawer, IconButton, List, ListItem, ListItemButton,
  ListItemIcon, ListItemText, Checkbox, Box, Divider
} from '@mui/material';
import MenuIcon  from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
  options: {
    showRegisters: boolean;
    showMemory: boolean;
    highlightMAR: boolean;
    showALU: boolean;
    showMicroInstruction: boolean;
    showBus: boolean;
    recordHistory: boolean;        //  ←  ADICIONADO
  };
  onToggle: (key: keyof Props['options']) => void;
}

export default function OptionsDrawer({ options, onToggle }: Props) {
  const [open, setOpen] = useState(false);
  const toggle = () => setOpen(!open);

  const items = [
    { key: 'showRegisters',        label: 'Mostrar Registradores' },
    { key: 'showMemory',           label: 'Mostrar Memória' },
    { key: 'highlightMAR',         label: 'Destacar MAR' },
    { key: 'showALU',              label: 'Mostrar ALU' },
    { key: 'showMicroInstruction', label: 'Mostrar Microinstrução' },
    { key: 'showBus',              label: 'Mostrar Barramento' },
    { key: 'recordHistory',        label: 'Guardar Histórico' },   // novo
  ] as const;

  return (
    <>
      {!open && (
        <IconButton
          onClick={toggle}
          sx={{ position: 'fixed', top: 16, left: 16, zIndex: 1201 }}
          size="large"
        >
          <MenuIcon />
        </IconButton>
      )}

      <Drawer anchor="left" open={open} onClose={toggle} PaperProps={{ sx: { width: 280 } }}>
        {/* cabeçalho com “X” */}
        <Box sx={{ display:'flex', alignItems:'center', height:56, pl:2 }}>
          <IconButton onClick={toggle} sx={{ ml:-1.38 }}>
            <CloseIcon />
          </IconButton>
        </Box>
        <Divider />

        {/* lista */}
        <List disablePadding>
          {items.map(({ key, label }) => (
            <ListItem key={key} disablePadding>
              <ListItemButton dense onClick={() => onToggle(key)}>
                <ListItemIcon sx={{ minWidth: 40 }}>
                  <Checkbox
                    edge="start"
                    checked={options[key]}
                    onClick={e => e.stopPropagation()}
                    onChange={() => onToggle(key)}
                  />
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
