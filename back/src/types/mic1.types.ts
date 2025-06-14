
export enum Instruction {
  LODD = 'LODD', 
  STOD = 'STOD', 
  ADDD = 'ADDD', 
  SUBD = 'SUBD', 
  JPOS = 'JPOS', 
  JZER = 'JZER', 
  JUMP = 'JUMP', 
  LOCO = 'LOCO', 
  LODL = 'LODL', 
  STOL = 'STOL', 
  ADDL = 'ADDL', 
  SUBL = 'SUBL', 
  JNEG = 'JNEG', 
  JNZE = 'JNZE', 
  CALL = 'CALL', 
  PSHI = 'PSHI', 
  POPI = 'POPI', 
  PUSH = 'PUSH', 
  POP = 'POP',   
  RETN = 'RETN', 
  SWAP = 'SWAP', 
  INSP = 'INSP', 
  DESP = 'DESP', 
}


export interface MIC1Instruction {
  opcode: Instruction;
  operand?: number;
  address?: number;
}


export interface Registers {
  PC: number;  
  AC: number;  
  SP: number;  
  IR: number;  
  TIR: number; 
  MAR: number; 
  MBR: number; 
}


export interface ProcessorState {
  /* --- estado principal --- */
  registers: Registers;
  memory: number[];
  stack: number[];
  running: boolean;
  cycleCount: number;

  /* --- ALU --- */
  aluOperation: string;
  aluInputs: { A: number; B: number };
  aluResult: number;

  /* --- micro-instruções --- */
  lastInstruction?: MIC1Instruction;      // ← voltou, opcional
  lastMicroInstruction: string;

  /* --- barramento (opcional) --- */
  bus?: { from: string; to: string };     // ← só UMA vez, sem duplicar
}



export interface ExecutionResult {
  success: boolean;
  state: ProcessorState;
  error?: string;
  output?: string[];
}


export interface Program {
  instructions: string[];
  data?: { [address: number]: number };
}


export interface Breakpoint {
  line: number;
  enabled: boolean;
}


export interface DebugInfo {
  currentLine: number;
  breakpoints: Breakpoint[];
  stepMode: boolean;
} 