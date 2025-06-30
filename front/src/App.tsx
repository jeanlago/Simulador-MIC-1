import React, {
  useState, useEffect, useCallback, useContext,
} from 'react';

import {
  Accordion, AccordionSummary, AccordionDetails,
  Paper, Box, Stack, Button, TextField, Typography,
  IconButton,
} from '@mui/material';
import ExpandMoreIcon  from '@mui/icons-material/ExpandMore';
import DarkModeIcon    from '@mui/icons-material/DarkMode';
import LightModeIcon   from '@mui/icons-material/LightMode';

import HistoryView           from './components/HistoryView';
import RegisterView          from './components/RegisterView';
import MemoryView            from './components/MemoryView';
import ALUView               from './components/ALUView';
import MicroInstructionView  from './components/MicroInstructionView';
import BusView               from './components/BusView';
import OptionsDrawer         from './components/OptionsDrawer';
import WelcomeModal          from './components/WelcomeModal';
import TutorialGuide, { TutorialStep } from './components/TutorialGuide';
import {
  createSession, loadProgram, getHistory, getProcessorState,
  stepExecution, HistoryEntry,
} from './services/mic1Api';
import { ColorModeContext } from './theme';   // <<— contexto de tema
import { useTheme } from '@mui/material/styles';

/* util simples para “pausar” */
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const tutorialSteps: TutorialStep[] = [
    {
      selector: '#program-editor-section',
      title: '1. Editor de Programa',
      content: 'Aqui você escreve seu código em linguagem de montagem do MIC-1. Experimente com as instruções da documentação.',
    },
    {
      selector: '#session-button',
      title: '2. Crie uma Sessão',
      content: 'Tudo começa aqui! Clique neste botão para iniciar um novo ambiente de simulação limpo.',
    },
    {
      selector: '#execute-button',
      title: '3. Carregar e Executar',
      content: 'Após escrever seu código e criar uma sessão, use este botão para executar o programa inteiro de uma vez.',
    },
    {
      selector: '#step-button',
      title: '4. Executar Passo a Passo',
      content: 'Para uma análise detalhada, use este botão. Ele executa uma única microinstrução por vez.',
    },
    {
      selector: '#microinstruction-view',
      title: '5. Última Microinstrução',
      content: 'Este campo mostra a microinstrução exata que o processador acabou de executar. Essencial para entender o controle de baixo nível.',
    },
    {
      selector: '#registers-view',
      title: '6. Registradores',
      content: 'Visualize o estado de todos os registradores importantes como o PC (Program Counter) e AC (Acumulador) em tempo real. Seus valores mudam a cada passo.',
    },
    {
      selector: '#bus-view',
      title: '7. Visualizador do Barramento',
      content: 'Esta área mostra visualmente a transferência de dados entre os componentes da CPU a cada passo da execução.',
    },
    {
      selector: '#history-view',
      title: '8. Histórico de Microinstruções',
      content: 'Toda microinstrução executada é registrada aqui. É uma ferramenta poderosa para depurar seu código e entender o fluxo de controle interno.',
    },
  ];


export default function App() {
  /* ---------- tema claro/escuro ---------- */
  const theme = useTheme();
  const { mode, toggleColorMode } = useContext(ColorModeContext);
  const isDark = mode === 'dark';

  /* ---------- estado da aplicação -------- */
  const [recordHistory, setRecordHistory] = useState(true);
  const [history, setHistory]   = useState<HistoryEntry[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [programText, setProgramText] = useState(
    'LOCO 10\nSTOD 100\nLODD 100\nADDD 100',
  );
  const [state, setState] = useState<any>(null);

  /* opções de visualização */
  const [fastMode, setFastMode]                         = useState(false);
  const [didacticMode, setDidacticMode]                 = useState(false);
  const [showRegisters,        setShowRegisters]        = useState(true);
  const [showMemory,           setShowMemory]           = useState(true);
  const [highlightMAR,         setHighlightMAR]         = useState(true);
  const [showALU,              setShowALU]              = useState(true);
  const [showMicroInstruction, setShowMicroInstruction] = useState(true);
  const [showBus,              setShowBus]              = useState(true);

  const [programFinished, setProgramFinished] = useState(false);
  const [isRunning,       setIsRunning]       = useState(false);

  /* modal / tutorial */
  const [showWelcomeModal,  setShowWelcomeModal]  = useState(false);
  const [isTutorialActive,  setIsTutorialActive]  = useState(false);
  const [tutorialKey,       setTutorialKey]       = useState(0);

  /* opções de visualização */
  const options = {
    showRegisters, showMemory, highlightMAR, showALU,
    showMicroInstruction, showBus, recordHistory,
    fastMode, didacticMode
  };

  /* exibe modal de boas-vindas apenas na 1ª vez */
  useEffect(() => {
    if (!localStorage.getItem('mic1-hasSeenWelcome')) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleDeclineAll     = () => { localStorage.setItem('mic1-hasSeenWelcome', 'true'); setShowWelcomeModal(false); };
  const handleStartTutorial  = () => { localStorage.setItem('mic1-hasSeenWelcome', 'true'); setShowWelcomeModal(false); setIsTutorialActive(true); };
  const handleCompleteTutorial = () => setIsTutorialActive(false);
  const handleRepeatTutorial   = () => { setTutorialKey(k => k + 1); setIsTutorialActive(true); };

  /* toggle genérico vindo do drawer */
  const toggleOption = (key: keyof typeof options) => {
    if (key === 'fastMode') {
      setFastMode(prev => {
        const newVal = !prev;
        if (newVal) setDidacticMode(false);
        return newVal;
      });
    } else if (key === 'didacticMode') {
      setDidacticMode(prev => {
        const newVal = !prev;
        if (newVal) setFastMode(false);
        return newVal;
      });
    } else {
      const setters = {
        showRegisters: setShowRegisters,
        showMemory: setShowMemory,
        highlightMAR: setHighlightMAR,
        showALU: setShowALU,
        showMicroInstruction: setShowMicroInstruction,
        showBus: setShowBus,
        recordHistory: setRecordHistory,
      };
      setters[key](prev => !prev);
    }
  };



  const refreshHistory = async () => {
    if (sessionId && recordHistory) setHistory(await getHistory(sessionId));
  };

  const handleCreateSession = async () => {
    const id = await createSession();
    setSessionId(id);
    setProgramFinished(false);
  };

  /* consulta estado atual da CPU (registradores, barramento etc.) */
  const fetchState = useCallback(async () => {
    if (!sessionId) return;
    const { state: procState } = await getProcessorState(sessionId);
    setState(procState);
  }, [sessionId]);

  useEffect(() => { fetchState(); }, [sessionId, fetchState]);

  /* ------------------- executar programa por completo ------------------ */
  const handleLoadAndExecute = async () => {
    if (!sessionId) return;
    setIsRunning(true);
    setProgramFinished(false);

    const instructions = programText.split('\n').map(l => l.trim()).filter(Boolean);
    await loadProgram(sessionId, instructions);

    let halted = false;
    while (!halted) {
      const step = await stepExecution(sessionId);
      await refreshHistory();
      await fetchState();

      halted = !step.success && step.error === 'Fim do programa';

      let drawMs = 700;
      if (fastMode) drawMs = 200;
      else if (didacticMode) drawMs = 3000;

      if (!halted) await sleep(drawMs + 100);
    }

    setProgramFinished(true);
    setIsRunning(false);
  };


  /* -------------------------- passo a passo ---------------------------- */
  const handleStep = async () => {
    if (!sessionId || programFinished) return;

    /* carrega o código caso ainda não esteja na memória */
    if (state?.memory?.[0] === 0) {
      const instructions = programText.split('\n').map(l => l.trim()).filter(Boolean);
      await loadProgram(sessionId, instructions);
    }

    const result = await stepExecution(sessionId);
    await refreshHistory();
    await fetchState();

    if (!result.success && result.error === 'Fim do programa') {
      setProgramFinished(true);
    }
  };
  const animationSpeed = fastMode ? 200 : didacticMode ? 2000 : 800;

  return (
    <Box sx={{ p: 2 }}>
      {/* ---------- botão de tema fixo ----------- */}
      <IconButton
        onClick={toggleColorMode}
        sx={{ position: 'fixed', top: 16, right: 16, zIndex: 1300 }}
        aria-label="Alternar tema claro/escuro"
      >
        {isDark ? <LightModeIcon /> : <DarkModeIcon />}
      </IconButton>

      {/* ---------- modais / guias ----------- */}
      <WelcomeModal
        open={showWelcomeModal}
        onDecline={handleDeclineAll}
        onStartTutorial={handleStartTutorial}
      />
      <TutorialGuide
        key={tutorialKey}
        steps={tutorialSteps}
        isActive={isTutorialActive}
        onComplete={handleCompleteTutorial}
      />

      {/* ---------- menu (hambúrguer) ----------- */}
      <OptionsDrawer
        options={options}
        onToggle={toggleOption}
        onRepeatTutorial={handleRepeatTutorial}
        isRunning={isRunning}
      />

      {/* ---------- layout principal ----------- */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mx: 'auto', maxWidth: 1200, mt: 2 }}>
        {/* ------------- coluna esquerda ------------- */}
        <Box sx={{ width: 320, mr: 3, mt: 8 }}>
          {/* editor de programa */}
          <Box id="program-editor-section">
            <Typography variant="h6" mb={1}>Programa MIC-1</Typography>
            <TextField
              multiline minRows={10} maxRows={10} fullWidth
              value={programText}
              onChange={e => setProgramText(e.target.value)}
              placeholder={'LOCO 10\nSTOD 100\nLODD 100\nADDD 100'}
              sx={{ fontFamily: 'monospace' }}
            />
          </Box>

          {/* botões */}
          <Stack direction="column" spacing={1} mt={2}>
            <Button
              id="session-button"
              variant="contained"
              onClick={handleCreateSession}
              sx={{
                backgroundColor: theme.palette.primary.dark,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                  opacity: 0.9,
                },
              }}
            >
              Criar Sessão
            </Button>
            <Button
            id="execute-button"
            variant="contained"
            onClick={handleLoadAndExecute}
            disabled={!sessionId || isRunning}
            sx={{
              backgroundColor: theme.palette.primary.dark,
              '&:hover': {
                backgroundColor: theme.palette.primary.dark,
                opacity: 0.9,
              },
            }}
          >
              Carregar e Executar
            </Button>
            <Button
              id="step-button"
              variant="outlined"
              onClick={handleStep}
              disabled={!sessionId || programFinished || isRunning}
            >
              Executar Passo
            </Button>
          </Stack>

          {/* última micro-instrução */}
          {showMicroInstruction && (
            <Box id="microinstruction-view" mt={2}>
              <MicroInstructionView
                microInstruction={state?.lastMicroInstruction ?? 'Nenhuma instrução ainda'}
                enabled={showMicroInstruction}
              />
            </Box>
          )}

          {/* registradores */}
          {showRegisters && (
            <Box id="registers-view" mt={2}>
              <Typography variant="h6" mb={1}>Registradores</Typography>
              {state?.registers ? (
                <RegisterView registers={state.registers} />
              ) : (
                <Paper
                  variant="outlined"
                  sx={{ p: 2, textAlign: 'center', minHeight: 180,
                       display: 'flex', alignItems: 'center', justifyContent: 'center',
                       borderColor: 'divider', borderStyle: 'dashed' }}
                >
                  <Typography variant="body2" color="text.secondary">
                    Os registradores aparecerão aqui após criar uma sessão.
                  </Typography>
                </Paper>
              )}
            </Box>
          )}
        </Box>

        {/* ------------- coluna direita ------------- */}
        <Box sx={{ flexGrow: 1, maxWidth: 1000 }}>
          <Typography variant="h4" textAlign="center" mb={2}>
            MIC-1 Simulador
          </Typography>

          {/* memória */}
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

          {/* histórico */}
          <Box id="history-view" sx={{ mt: 2 }}>
            {history.length > 0 ? (
              <Accordion defaultExpanded={false}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Histórico de Micro-instruções</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box sx={{ maxHeight: 300, overflowY: 'auto' }}>
                    <HistoryView entries={history} />
                  </Box>
                </AccordionDetails>
              </Accordion>
            ) : (
              <Paper
                variant="outlined"
                sx={{ p: 2, textAlign: 'center', minHeight: 80,
                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                     borderColor: 'divider', borderStyle: 'dashed' }}
              >
                <Typography variant="body2" color="text.secondary">
                  O histórico de microinstruções do programa aparecerá aqui.
                </Typography>
              </Paper>
            )}
          </Box>

          {/* ALU */}
          {showALU && (
            <Box id="alu-view" mt={2}>
              <ALUView
                aluOperation={state?.aluOperation ?? 'UNKNOWN'}
                inputA={state?.aluInputs?.A}
                inputB={state?.aluInputs?.B}
                output={state?.aluResult}
                enabled={showALU}
              />
            </Box>
          )}

          {/* barramento */}
          {showBus && (
            <Box id="bus-view" mt={2}>
              <Typography variant="h6" mb={1} textAlign="center">
                Barramento
              </Typography>
                <BusView
                  source={state?.bus?.from}
                  destination={state?.bus?.to}
                  enabled={showBus}
                  drawMs={animationSpeed}
                />
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}
