import {
  ProcessorState,
  Registers,
  MIC1Instruction,
  ExecutionResult,
  Instruction
} from '../types/mic1.types';
import { parseInstruction } from '../utils/binary.utils';

export class MIC1Processor {
  private state: ProcessorState;
  private readonly MEMORY_SIZE = 4096;
  private readonly STACK_BASE = 4095;

  constructor() {
    this.state = this.initializeState();
  }

  private initializeState(): ProcessorState {
    return {
      registers: {
        PC: 0,
        AC: 0,
        SP: 4095,
        IR: 0,
        TIR: 0,
        MAR: 0,
        MBR: 0,
      },
      memory: new Array(this.MEMORY_SIZE).fill(0),
      stack: [],
      running: false,
      cycleCount: 0,

      // NOVOS ------------------------------
      aluOperation: 'IDLE',
      aluInputs: { A: 0, B: 0 },
      aluResult: 0,
      lastMicroInstruction: '',
      bus: { from: '', to: '' },
    };

  }

  reset(): void {
    this.state = this.initializeState();
  }

  loadProgram(program: string[], startAddress: number = 0): void {
    let address = startAddress;

    for (const line of program) {
      if (line.trim() === '') continue;

      try {
        const { instruction, operand } = parseInstruction(line);
        this.state.memory[address] = this.encodeInstructionForMemory(instruction, operand);
        address++;
      } catch (error) {
        throw new Error(`Error loading instruction at address ${address}: ${error}`);
      }
    }
  }

  private encodeInstructionForMemory(instruction: Instruction, operand?: number): number {
    const opcodeMap: { [key in Instruction]: number } = {
      [Instruction.LODD]: 0x0000,
      [Instruction.STOD]: 0x1000,
      [Instruction.ADDD]: 0x2000,
      [Instruction.SUBD]: 0x3000,
      [Instruction.JPOS]: 0x4000,
      [Instruction.JZER]: 0x5000,
      [Instruction.JUMP]: 0x6000,
      [Instruction.LOCO]: 0x7000,
      [Instruction.LODL]: 0x8000,
      [Instruction.STOL]: 0x9000,
      [Instruction.ADDL]: 0xA000,
      [Instruction.SUBL]: 0xB000,
      [Instruction.JNEG]: 0xC000,
      [Instruction.JNZE]: 0xD000,
      [Instruction.CALL]: 0xE000,
      [Instruction.PSHI]: 0xF000,
      [Instruction.POPI]: 0xF100,
      [Instruction.PUSH]: 0xF200,
      [Instruction.POP]: 0xF300,
      [Instruction.RETN]: 0xF400,
      [Instruction.SWAP]: 0xF500,
      [Instruction.INSP]: 0xFC00,
      [Instruction.DESP]: 0xFE00,
    };

    const opcode = opcodeMap[instruction];
    return opcode | (operand || 0);
  }

  private decodeInstruction(encoded: number): MIC1Instruction {
    const opcode = (encoded & 0xF000) >> 12;
    const operand = encoded & 0x0FFF;

    const instructionMap: { [key: number]: Instruction } = {
      0x0: Instruction.LODD,
      0x1: Instruction.STOD,
      0x2: Instruction.ADDD,
      0x3: Instruction.SUBD,
      0x4: Instruction.JPOS,
      0x5: Instruction.JZER,
      0x6: Instruction.JUMP,
      0x7: Instruction.LOCO,
      0x8: Instruction.LODL,
      0x9: Instruction.STOL,
      0xA: Instruction.ADDL,
      0xB: Instruction.SUBL,
      0xC: Instruction.JNEG,
      0xD: Instruction.JNZE,
      0xE: Instruction.CALL,
      0xF: this.decodeExtendedInstruction(encoded),
    };

    return {
      opcode: instructionMap[opcode] || Instruction.LODD,
      operand: operand,
    };
  }

  private decodeExtendedInstruction(encoded: number): Instruction {
    const extended = (encoded & 0x0F00) >> 8;
    switch (extended) {
      case 0x0: return Instruction.PSHI;
      case 0x1: return Instruction.POPI;
      case 0x2: return Instruction.PUSH;
      case 0x3: return Instruction.POP;
      case 0x4: return Instruction.RETN;
      case 0x5: return Instruction.SWAP;
      case 0xC: return Instruction.INSP;
      case 0xE: return Instruction.DESP;
      default: return Instruction.LODD;
    }
  }

  private executeInstruction(instruction: MIC1Instruction): void {
  const { opcode, operand = 0 } = instruction;
  this.state.bus = { from: 'MBR', to: 'IR' };

  /* --- valor-padrão antes de cada instrução --- */
  this.setALU('IDLE', 0, 0, 0);
  console.log('[BACK-ALU]', this.state.aluOperation);

  switch (opcode) {

    /* ========== MOVIMENTAÇÃO DE DADOS ========== */
    case Instruction.LODD: {
    const value = this.state.memory[operand];
    this.state.registers.AC = value;
    this.setALU('MOV', value, 0, value);
    this.state.bus = { from: `MEM[${operand}]`, to: 'AC' };
    break;
  }

    case Instruction.STOD: {
      const value = this.state.registers.AC;
      this.state.memory[operand] = value;
      this.setALU('MOV', value, 0, value);
      break;
    }

    case Instruction.LOCO: {
      this.state.registers.AC = operand;
      this.setALU('MOV', operand, 0, operand);
      break;
    }

    case Instruction.LODL: {
      const addr = this.state.registers.SP + operand;
      const value = this.state.memory[addr];
      this.state.registers.AC = value;
      this.setALU('MOV', value, 0, value);
      break;
    }

    case Instruction.STOL: {
      const addr = this.state.registers.SP + operand;
      const value = this.state.registers.AC;
      this.state.memory[addr] = value;
      this.setALU('MOV', value, 0, value);
      break;
    }

    /* ========== OPERAÇÕES ARITMÉTICAS ========== */
    case Instruction.ADDD: {
      const a = this.state.registers.AC;
      const b = this.state.memory[operand];
      const r = a + b;
      this.state.registers.AC = r;
      this.setALU('ADD', a, b, r);
      break;
    }

    case Instruction.SUBD: {
      const a = this.state.registers.AC;
      const b = this.state.memory[operand];
      const r = a - b;
      this.state.registers.AC = r;
      this.setALU('SUB', a, b, r);
      break;
    }

    case Instruction.ADDL: {
      const addr = this.state.registers.SP + operand;
      const a = this.state.registers.AC;
      const b = this.state.memory[addr];
      const r = a + b;
      this.state.registers.AC = r;
      this.setALU('ADD', a, b, r);
      break;
    }

    case Instruction.SUBL: {
      const addr = this.state.registers.SP + operand;
      const a = this.state.registers.AC;
      const b = this.state.memory[addr];
      const r = a - b;
      this.state.registers.AC = r;
      this.setALU('SUB', a, b, r);
      break;
    }

    /* ========== DESVIO / CONTROLE DE FLUXO ========== */
    case Instruction.JPOS:
      if (this.state.registers.AC > 0) this.state.registers.PC = operand - 1;
      break;

    case Instruction.JZER:
      if (this.state.registers.AC === 0) this.state.registers.PC = operand - 1;
      break;

    case Instruction.JNEG:
      if (this.state.registers.AC < 0) this.state.registers.PC = operand - 1;
      break;

    case Instruction.JNZE:
      if (this.state.registers.AC !== 0) this.state.registers.PC = operand - 1;
      break;

    case Instruction.JUMP:
      this.state.registers.PC = operand - 1;
      break;

    case Instruction.CALL:
      this.push(this.state.registers.PC + 1);
      this.state.registers.PC = operand - 1;
      break;

    case Instruction.RETN:
      this.state.registers.PC = this.pop() - 1;
      break;

    /* ========== PILHA ========== */
    case Instruction.PUSH:
      this.push(this.state.registers.AC);
      break;

    case Instruction.POP:
      this.state.registers.AC = this.pop();
      break;

    case Instruction.SWAP: {
      const top = this.pop();
      const second = this.pop();
      this.push(top);
      this.push(second);
      break;
    }

    case Instruction.INSP:
      this.state.registers.SP += operand;
      break;

    case Instruction.DESP:
      this.state.registers.SP -= operand;
      break;

    /* ========== INSTRUÇÕES NÃO IMPLEMENTADAS ========== */
    case Instruction.PSHI:
    case Instruction.POPI:
      /* sem efeito no momento */
      break;

    default:
      break;
  }

  /* -------- grava a microinstrução textual para o frontend -------- */
  this.state.lastMicroInstruction =
    operand !== undefined && operand !== 0
      ? `${Instruction[opcode]} ${operand}`
      : Instruction[opcode];

    console.log('[DEBUG BACK]', {
    aluOperation: this.state.aluOperation,
    lastMicroInstruction: this.state.lastMicroInstruction,
    });
  }

  private push(value: number): void {
    this.state.registers.SP--;
    this.state.memory[this.state.registers.SP] = value;
    this.state.stack.push(value);
  }

  private pop(): number {
    if (this.state.registers.SP >= this.STACK_BASE) {
      throw new Error('Stack underflow');
    }
    const value = this.state.memory[this.state.registers.SP];
    this.state.registers.SP++;
    this.state.stack.pop();
    return value;
  }

  step(): ExecutionResult {
    try {
      if (this.state.registers.PC >= this.MEMORY_SIZE) {
        return {
          success: false,
          state: this.state,
          error: 'Program counter out of bounds',
        };
      }

      this.state.registers.IR = this.state.memory[this.state.registers.PC];

      const instruction = this.decodeInstruction(this.state.registers.IR);

      this.executeInstruction(instruction);

      this.state.registers.PC++;
      this.state.cycleCount++;

      console.log('ALU=', this.state.aluOperation,
                  'MICRO=', this.state.lastMicroInstruction);
      return {
        success: true,
        state: this.state,
      };
    } catch (error) {
      return {
        success: false,
        state: this.state,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  run(maxCycles: number = 10000): ExecutionResult {
    this.state.running = true;
    let cycles = 0;

    while (this.state.running && cycles < maxCycles) {
      const result = this.step();

      if (!result.success) {
        this.state.running = false;
        return result;
      }

      if (this.state.memory[this.state.registers.PC] === 0) {
        this.state.running = false;
        break;
      }

      cycles++;
    }

    this.state.running = false;

    if (cycles >= maxCycles) {
      return {
        success: false,
        state: this.state,
        error: `Maximum cycle count (${maxCycles}) exceeded`,
      };
    }

    return {
      success: true,
      state: this.state,
    };
  }

  getState(): ProcessorState {
    return JSON.parse(JSON.stringify(this.state));  // cópia profunda
  }

  setMemory(address: number, value: number): void {
    if (address >= 0 && address < this.MEMORY_SIZE) {
      this.state.memory[address] = value;
    }
  }

  getMemory(address: number): number {
    if (address >= 0 && address < this.MEMORY_SIZE) {
      return this.state.memory[address];
    }
    return 0;
  }

  private setALU(op: string, a: number, b: number, r: number) {
    this.state.aluOperation = op;
    this.state.aluInputs    = { A: a, B: b };
    this.state.aluResult    = r;
  }

}
