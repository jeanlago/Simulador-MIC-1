import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api/mic1';

export const createSession = async (): Promise<string> => {
  const response = await axios.post(`${BASE_URL}/session`);
  return response.data.sessionId;
};

export const loadProgram = async (sessionId: string, instructions: string[]) => {
  await axios.post(`${BASE_URL}/load`, {
    sessionId,
    program: {
      instructions,
      data: {},
    },
  });
};

export interface ProcessorState {
  /* principais */
  registers: Record<string, number>;
  memory: number[];

  /* ALU */
  aluOperation: string;
  aluInputs: { A: number; B: number };
  aluResult: number;

  /* Micro-instrução */
  lastMicroInstruction: string;

  /* Barramento (opcional) */
  bus?: { from: string; to: string };
}

export interface StateResponse {
  success: boolean;
  state: ProcessorState;
  debugInfo: any;
}

export const getProcessorState = async (sessionId: string): Promise<StateResponse> => {
  const { data } = await axios.get<StateResponse>(`${BASE_URL}/state/${sessionId}`);
  return data;        // <= retorna { success, state, debugInfo }
};

export const executeProgram = async (sessionId: string): Promise<void> => {
  console.log('[DEBUG] Executando programa na sessão:', sessionId);
  const response = await axios.post(`${BASE_URL}/execute`, { sessionId });
  console.log('[DEBUG] Resultado da execução:', response.data);
};


export const stepExecution = async (sessionId: string): Promise<void> => {
  await axios.post(`${BASE_URL}/step`, { sessionId });
};
