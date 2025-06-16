// App.tsx
import { Accordion, AccordionSummary, AccordionDetails } from '@mui/material';
import HistoryView from './components/HistoryView';
import { getHistory, HistoryEntry } from './services/mic1Api';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import React, { useState, useEffect } from 'react';
import {
  createSession,
  loadProgram,
  executeProgram,
  getProcessorState,
  stepExecution,
} from './services/mic1Api';

import RegisterView from './components/RegisterView';
import MemoryView from './components/MemoryView';
import ALUView from './components/ALUView';
import MicroInstructionView from './components/MicroInstructionView';
import BusView from './components/BusView';
import OptionsDrawer from './components/OptionsDrawer';

import {
  Box,
  Stack,
  Button,
  TextField,
  Typography,
} from '@mui/material';

export default function App() {
  // -------------------- estado --------------------
  const [recordHistory, setRecordHistory] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [programText, setProgramText] = useState(
    'LOCO 10\nSTOD 100\nLODD 100\nADDD 100'
  );
  const [state, setState] = useState<any>(null);

  const [showRegisters, setShowRegisters] = useState(true);
  const [showMemory, setShowMemory] = useState(true);
  const [highlightMAR, setHighlightMAR] = useState(true);
  const [showALU, setShowALU] = useState(true);
  const [showMicroInstruction, setShowMicroInstruction] = useState(true);
  const [showBus, setShowBus] = useState(true);
  const [programFinished, setProgramFinished] = useState(false);

  // agrupado para o Drawer
  const options = {
    showRegisters,
    showMemory,
    highlightMAR,
    showALU,
    showMicroInstruction,
    showBus,
    recordHistory,
  };

  // -------------------- helpers --------------------
  const toggleOption = (key: keyof typeof options) => {
    const setters: Record<string, React.Dispatch<React.SetStateAction<boolean>>> = {
      showRegisters: setShowRegisters,
      showMemory: setShowMemory,
      highlightMAR: setHighlightMAR,
      showALU: setShowALU,
      showMicroInstruction: setShowMicroInstruction,
      showBus: setShowBus,
      recordHistory: setRecordHistory,
    };

    setters[key](prev => !prev);

    if (key === 'recordHistory' && recordHistory) {
      setHistory([]);
    }
  };

  const refreshHistory = async () => {
    if (!sessionId || !recordHistory) return;
    setHistory(await getHistory(sessionId));
  };


  {recordHistory && history.length > 0 && (
    <Accordion /* …como antes… */> … </Accordion>
  )}

  const handleCreateSession = async () => {
    const id = await createSession();
    setSessionId(id);
    setProgramFinished(false);      // ← aqui
  };

  const fetchState = async () => {
    if (!sessionId) return;
    const { state: procState } = await getProcessorState(sessionId);
    setState(procState);
  };

  useEffect(() => {
    fetchState();
  }, [sessionId]);

  const handleLoadAndExecute = async () => {
    if (!sessionId) return;

    const instructions = programText
      .split('\n')
      .map(l => l.trim())
      .filter(Boolean);

    await loadProgram(sessionId, instructions);
    await executeProgram(sessionId);
    await refreshHistory();
    setProgramFinished(false);
    fetchState();
  };

  const handleStep = async () => {
    if (!sessionId || programFinished) return;

    if (state?.memory?.[0] === 0) {
      const instructions = programText
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

      await loadProgram(sessionId, instructions);
    }

    const result = await stepExecution(sessionId);
    await refreshHistory();
    const { state: procState } = await getProcessorState(sessionId);
    setState(procState);

    if (!result.success && result.error === 'Fim do programa') {
      setProgramFinished(true);
    }
  };


 // -------------------- UI --------------------
  return (
    /* ---------- CASCA EXTERNA ---------- */
    <Box sx={{ p: 2 /* padding geral */ }}>
      <OptionsDrawer options={options} onToggle={toggleOption} />

      {/* ---------- CONTAINER CENTRALIZADO ---------- */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center', // centraliza colunas
          mx: 'auto',               // margem auto L/R
          maxWidth: 1200,           // largura máx. do bloco central
          mt: 2                     // afasta do topo
        }}
      >
        {/* ---------- COLUNA ESQUERDA ---------- */}
        <Box sx={{ width: 320, mr: 3 /* espaço entre colunas */, mt: 8 }}>
          {/* título + editor + botões + microinstr. + registradores */}
          <Typography variant="h6" mb={1}>
            Programa MIC-1
          </Typography>

          <TextField
            multiline
            minRows={10}
            fullWidth
            value={programText}
            onChange={e => setProgramText(e.target.value)}
            placeholder={'LOCO 10\nSTOD 100\nLODD 100\nADDD 100'}
            sx={{ fontFamily: 'monospace' }}
          />

          {/* botões */}
          <Stack direction="column" spacing={1} mt={2}>
            <Button variant="contained" onClick={handleCreateSession}>
              Criar Sessão
            </Button>
            <Button
              variant="contained"
              onClick={handleLoadAndExecute}
              disabled={!sessionId}
            >
              Carregar e Executar
            </Button>
            <Button
              variant="outlined"
              onClick={handleStep}
              disabled={!sessionId || programFinished}
            >
              Executar Passo
            </Button>
          </Stack>

          {/* última microinstrução */}
          {showMicroInstruction && (
            <Box mt={2}>
              <MicroInstructionView
                microInstruction={state?.lastMicroInstruction ?? 'Nenhuma instrução ainda'}
                enabled={showMicroInstruction}
              />
            </Box>
          )}

          {/* registradores */}
          {showRegisters && state?.registers && (
            <Box mt={2}>
              <RegisterView registers={state.registers} />
            </Box>
          )}
        </Box>

        {/* ---------- COLUNA DIREITA ---------- */}
        <Box sx={{ flexGrow: 1, maxWidth: 1000 }}>
          <Typography variant="h4" textAlign="center" mb={2}>
            MIC-1 Simulador
          </Typography>

          {/* memória em accordion */}
          {showMemory && state?.memory && (
            <Accordion defaultExpanded={false}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Memória (4096 palavras)</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  <MemoryView
                    memory={state.memory}
                    highlightMAR={highlightMAR ? state.registers?.MAR : undefined}
                  />
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {history.length > 0 && (
            <Accordion defaultExpanded={false} sx={{ mt: 2 }}>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Histórico de Micro-instruções</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                  <HistoryView entries={history} />
                </Box>
              </AccordionDetails>
            </Accordion>
          )}

          {/* ALU */}
          {showALU && (
            <ALUView
              aluOperation={state?.aluOperation ?? 'UNKNOWN'}
              inputA={state?.aluInputs?.A}
              inputB={state?.aluInputs?.B}
              output={state?.aluResult}
              enabled={showALU}
            />
          )}

          {/* Barramento */}
          {showBus && (
            <BusView
              source={state?.bus?.from}
              destination={state?.bus?.to}
              enabled={showBus}
            />
          )}
        </Box>
      </Box>
    </Box>
    );

  }
