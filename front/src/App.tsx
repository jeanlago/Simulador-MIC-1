// App.tsx
import React, { useState } from 'react';
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

function App() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [programText, setProgramText] = useState('LOCO 10\nSTOD 100\nLODD 100\nADDD 100');
  const [state, setState] = useState<any>(null);

  const [showRegisters, setShowRegisters] = useState(true);
  const [showMemory, setShowMemory] = useState(true);
  const [highlightMAR, setHighlightMAR] = useState(true);
  const [showALU, setShowALU] = useState(true);
  const [showMicroInstruction, setShowMicroInstruction] = useState(true);
  const [showBus, setShowBus] = useState(true);

  const handleCreateSession = async () => {
    const id = await createSession();
    setSessionId(id);
  };

  React.useEffect(() => {
    const fetchState = async () => {
      if (sessionId) {
        const { state: procState } = await getProcessorState(sessionId);
        console.log('[STATE RECEBIDO]', procState);   // ← copie esse log completo
        setState(procState);
      }
    };
    fetchState();
  }, [sessionId]);

  const handleLoadAndExecute = async () => {
  if (!sessionId) return;

  const instructions = programText
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);

  await loadProgram(sessionId, instructions);
  await executeProgram(sessionId);

  const { state: procState } = await getProcessorState(sessionId);
  setState(procState);          // ✅ agora guarda só o objeto que os componentes usam
  };

  const handleStep = async () => {
    if (!sessionId) return;

    await stepExecution(sessionId);

    const { state: procState } = await getProcessorState(sessionId);
    setState(procState);          // idem
  };

  return (
    <div style={{ padding: 20, maxWidth: 800, margin: 'auto' }}>
      <h1>MIC-1 Simulador</h1>
      <button onClick={handleCreateSession}>Criar Sessão</button>

      <div style={{ marginTop: 20 }}>
        <textarea
          rows={8}
          value={programText}
          onChange={(e) => setProgramText(e.target.value)}
          style={{ width: '100%', fontFamily: 'monospace' }}
        />
        <div style={{ marginTop: 10 }}>
          <button onClick={handleLoadAndExecute} disabled={!sessionId}>
            Carregar e Executar
          </button>
          <button onClick={handleStep} disabled={!sessionId} style={{ marginLeft: 10 }}>
            Executar Passo
          </button>
        </div>
      </div>

      <div style={{ marginTop: 20 }}>
        <label>
          <input type="checkbox" checked={showRegisters} onChange={() => setShowRegisters(!showRegisters)} /> Mostrar Registradores
        </label>
        <br />
        <label>
          <input type="checkbox" checked={showMemory} onChange={() => setShowMemory(!showMemory)} /> Mostrar Memória
        </label>
        <br />
        <label>
          <input type="checkbox" checked={highlightMAR} onChange={() => setHighlightMAR(!highlightMAR)} /> Destacar MAR na Memória
        </label>
        <br />
        <label>
          <input type="checkbox" checked={showALU} onChange={() => setShowALU(!showALU)} /> Mostrar ALU
        </label>
        <br />
        <label>
          <input type="checkbox" checked={showMicroInstruction} onChange={() => setShowMicroInstruction(!showMicroInstruction)} /> Mostrar Última Microinstrução
        </label>
        <br />
        <label>
          <input type="checkbox" checked={showBus} onChange={() => setShowBus(!showBus)} /> Mostrar Visualização Gráfica (Barramento)
        </label>
      </div>

      {showRegisters && state?.registers && <RegisterView registers={state.registers} />}
      {showMemory && state?.memory && (
        <MemoryView memory={state.memory.slice(0, 32)} highlightMAR={highlightMAR ? state.registers?.MAR : undefined} />
      )}
      {showALU && (
        <ALUView
          aluOperation={state?.aluOperation || 'UNKNOWN'}
          inputA={state?.aluInputs?.A}
          inputB={state?.aluInputs?.B}
          output={state?.aluResult}
          enabled={showALU}
        />
      )}
      {showMicroInstruction && (
        <MicroInstructionView
          microInstruction={state?.lastMicroInstruction || 'Nenhuma instrução ainda'}
          enabled={showMicroInstruction}
        />
      )}
      {showBus && (
        <BusView
          source={state?.bus?.from || undefined}
          destination={state?.bus?.to || undefined}
          enabled={showBus}
        />
      )}
    </div>
  );
}

export default App;