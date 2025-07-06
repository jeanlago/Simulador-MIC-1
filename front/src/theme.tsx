import React, {
  createContext, useMemo, useState, ReactNode, FC
} from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

type ColorMode = 'light' | 'dark';

interface ColorModeCtx {
  mode: ColorMode;
  toggleColorMode: () => void;
}

export const ColorModeContext = createContext<ColorModeCtx>({
  mode: 'light',
  toggleColorMode: () => {},
});

export const ColorModeProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ColorMode>('light');

  const colorMode = useMemo<ColorModeCtx>(
    () => ({
      mode,
      toggleColorMode: () =>
        setMode(prev => (prev === 'light' ? 'dark' : 'light')),
    }),
    [mode],
  );

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: '#1976d2',
            dark: '#115293',
          },
        },
      }),
    [mode],
  );

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ColorModeContext.Provider>
  );
};
