/*  ------------------------------------------------------------------
 *  MIC‑1 – núcleo do simulador (CPU + memória + histórico de passos)
 *  ------------------------------------------------------------------ */
import {
  ProcessorState,
  MIC1Instruction,
  ExecutionResult,
  Instruction,
  HistoryEntry,
} from '../types/mic1.types';


export class MIC1Processor {
  /* ---------------------------------------------------------------- */
  private state: ProcessorState;
  private history: HistoryEntry[] = [];
  private sign12(x: number) {
    return (x & 0x800) ? (x | 0xFFFFF000) : x;
  }


  private static readonly MEMORY_SIZE = 4096;
  private static readonly STACK_BASE = 4095;

  constructor() {
    this.state = this.initState();
  }

  /* ---------------------------- INIT / RESET ---------------------- */
  private initState(): ProcessorState {
    return {
      registers: {
        PC: 0,
        AC: 0,
        SP: MIC1Processor.STACK_BASE,
        IR: 0,
        TIR: 0,
        MAR: 0,
        MBR: 0,
      },
      memory: new Array<number>(MIC1Processor.MEMORY_SIZE).fill(0),
      stack: [],
      running: false,
      cycleCount: 0,

      /* ALU visual */
      aluOperation: 'IDLE',
      aluInputs: { A: 0, B: 0 },
      aluResult: 0,

      /* depuração */
      lastInstruction: undefined,
      lastMicroInstruction: '',
      bus: { from: '', to: '' },
    } as ProcessorState;
  }

  reset(): void {
    this.state = this.initState();
    this.history = [];
  }

  /* ---------------------------- LOAD ------------------------------ */
  loadProgram(lines: string[], startAddr = 0): void {
    let addr = startAddr;
    for (const line of lines) {
      if (!line.trim()) continue;
      const { instruction, operand } = this.parse(line);
      this.state.memory[addr++] = this.encodeForMem(instruction, operand);
    }
    /* HALT */
    this.state.memory[addr] = 0;
  }

  /* ---------------------- ENCODE / DECODE ------------------------- */
  private encodeForMem(inst: Instruction, op = 0): number {
    const base: Record<Instruction, number> = {
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
      /* família 0xF */
      [Instruction.PSHI]: 0xF000,
      [Instruction.POPI]: 0xF100,
      [Instruction.PUSH]: 0xF200,
      [Instruction.POP]: 0xF300,
      [Instruction.RETN]: 0xF400,
      [Instruction.SWAP]: 0xF500,
      [Instruction.INSP]: 0xFC00,
      [Instruction.DESP]: 0xFE00,
    };
    return base[inst] | (op & 0x0fff);
  }

  /** decodifica palavra de 16 bits */
  private decode(word: number): MIC1Instruction {
    const opMain = (word >>> 12) & 0xf;
    const op12 = word & 0x0fff;

    const mapping: Record<number, Instruction> = {
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
      0xa: Instruction.ADDL,
      0xb: Instruction.SUBL,
      0xc: Instruction.JNEG,
      0xd: Instruction.JNZE,
      0xe: Instruction.CALL,
    };

    if (opMain !== 0xF) {
      const opcode = mapping[opMain];
      const operand =
        opcode === Instruction.LOCO
          ? this.sign12(op12)   // <-- chama o método da classe
          : op12;

      return { opcode, operand };
    }
    return this.decodeExtended(word);
  }

  /** decodifica instruções 0xFxxx (8 bits de operando) */
  private decodeExtended(word: number): MIC1Instruction {
    const sub = (word >>> 8) & 0xf;
    const op8 = word & 0x00ff;
    switch (sub) {
      case 0x0:
        return { opcode: Instruction.PSHI, operand: op8 };
      case 0x1:
        return { opcode: Instruction.POPI, operand: op8 };
      case 0x2:
        return { opcode: Instruction.PUSH, operand: op8 };
      case 0x3:
        return { opcode: Instruction.POP, operand: op8 };
      case 0x4:
        return { opcode: Instruction.RETN };
      case 0x5:
        return { opcode: Instruction.SWAP, operand: op8 };
      case 0xc:
        return { opcode: Instruction.INSP, operand: op8 };
      case 0xe:
        return { opcode: Instruction.DESP, operand: op8 };
      default:
        return { opcode: Instruction.LODD, operand: op8 };
    }
  }

  /* --------------------- HELPERS VISUAIS ------------------------- */
  private setALU(op: string, a: number, b: number, r: number) {
    this.state.aluOperation = op;
    this.state.aluInputs = { A: a, B: b };
    this.state.aluResult = r;
  }

  private setBus(from: string, to: string) {
    this.state.bus = { from, to };
  }

  /* ------------------------- EXECUTE ------------------------------ */
  private execute(inst: MIC1Instruction): void {
    const { opcode, operand = 0 } = inst;
    this.state.lastInstruction = inst;

    /* reset visual */
    this.setBus('', '');
    this.setALU('IDLE', 0, 0, 0);

    switch (opcode) {
      /* ------------ MOVIMENTAÇÃO ------------ */
      case Instruction.LODD: {
        const v = this.state.memory[operand];
        this.state.registers.AC = v;
        this.setALU('MOV', v, 0, v);
        this.setBus(`MEM[${operand}]`, 'AC');
        break;
      }
      case Instruction.STOD: {
        const v = this.state.registers.AC;
        this.state.memory[operand] = v;
        this.setALU('MOV', v, 0, v);
        this.setBus('AC', `MEM[${operand}]`);
        break;
      }
      case Instruction.LOCO: {
        this.state.registers.AC = operand;
        this.setALU('MOV', operand, 0, operand);
        this.setBus('IMM', 'AC');
        break;
      }

      /* ------------ LOCAL (SP+offset) ------------ */
      case Instruction.LODL: {
        const addr = this.state.registers.SP + operand;
        const v = this.state.memory[addr];
        this.state.registers.AC = v;
        this.setALU('MOV', v, 0, v);
        this.setBus(`MEM[${addr}]`, 'AC');
        break;
      }
      case Instruction.STOL: {
        const addr = this.state.registers.SP + operand;
        this.state.memory[addr] = this.state.registers.AC;
        this.setALU('MOV', this.state.registers.AC, 0, this.state.registers.AC);
        this.setBus('AC', `MEM[${addr}]`);
        break;
      }

      /* ------------ ARITMÉTICA ------------ */
      case Instruction.ADDD:
      case Instruction.SUBD:
      case Instruction.ADDL:
      case Instruction.SUBL: {
        const isLocal = opcode === Instruction.ADDL || opcode === Instruction.SUBL;
        const addr = isLocal ? this.state.registers.SP + operand : operand;
        const b = this.state.memory[addr];
        const a = this.state.registers.AC;
        const r = opcode === Instruction.ADDD || opcode === Instruction.ADDL ? a + b : a - b;
        this.state.registers.AC = r;
        this.setALU(opcode.toString().slice(0, 3), a, b, r);
        this.setBus(`MEM[${addr}]`, 'ALU-b');
        break;
      }

      /* ------------ SALTOS ------------ */
      case Instruction.JUMP:
        this.state.registers.PC = operand - 1;
        break;
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

      /* ------------ PILHA & SUBROTINAS ------------ */
      case Instruction.CALL: {
        this.push(this.state.registers.PC);
        this.setBus('PC', `MEM[${this.state.registers.SP}]`);
        this.state.registers.PC = operand - 1;
        break;
      }
      case Instruction.RETN: {
        const ret = this.pop();
        this.setBus(`MEM[${this.state.registers.SP - 1}]`, 'PC');
        this.state.registers.PC = ret - 1;
        break;
      }

      case Instruction.PSHI: {
        const v = this.state.memory[operand];
        this.push(v);
        this.setBus(`MEM[${operand}]`, `MEM[${this.state.registers.SP}]`);
        break;
      }
      case Instruction.POPI: {
        const v = this.pop();
        this.state.memory[operand] = v;
        this.setBus(`MEM[${this.state.registers.SP - 1}]`, `MEM[${operand}]`);
        break;
      }
      case Instruction.PUSH: {
        this.push(operand);
        this.setBus('IMM', `MEM[${this.state.registers.SP}]`);
        break;
      }
      case Instruction.POP: {
        const v = this.pop();
        this.state.registers.AC = v;
        this.setBus(`MEM[${this.state.registers.SP - 1}]`, 'AC');
        break;
      }

      case Instruction.SWAP: {
        const temp = this.state.registers.AC;
        this.state.registers.AC = this.state.memory[operand];
        this.state.memory[operand] = temp;
        this.setALU('SWP', temp, 0, this.state.registers.AC);
        this.setBus(`MEM[${operand}]`, 'AC (troca)');
        break;
      }

      case Instruction.INSP: {
        this.state.registers.SP -= operand;
        this.setBus('SP', 'SP-');
        break;
      }
      case Instruction.DESP: {
        this.state.registers.SP += operand;
        this.setBus('SP', 'SP+');
        break;
      }

      default:
        break;
    }

    /* histórico */
    const mnem = operand ? `${Instruction[opcode]} ${operand}` : Instruction[opcode];
    this.state.lastMicroInstruction = mnem;
    this.history.push({ cycle: this.state.cycleCount, micro: mnem, bus: { ...this.state.bus } });
  }

  /* --------------------- STEP / RUN ------------------------------- */
  step(): ExecutionResult {
    try {
      if (this.state.registers.PC >= MIC1Processor.MEMORY_SIZE)
        return { success: false, state: this.state, error: 'PC out of bounds' };

      /* FETCH */
      this.state.registers.IR = this.state.memory[this.state.registers.PC];
      if (this.state.registers.IR === 0)
        return { success: false, state: this.state, error: 'Fim do programa' };

      /* EXEC */
      const inst = this.decode(this.state.registers.IR);
      this.execute(inst);

      this.state.registers.PC++;
      this.state.cycleCount++;
      return { success: true, state: this.state };
    } catch (e) {
      return { success: false, state: this.state, error: e instanceof Error ? e.message : 'Unknown error' };
    }
  }

  run(maxCycles = 10_000): ExecutionResult {
    this.state.running = true;
    for (let i = 0; i < maxCycles; i++) {
      const r = this.step();
      if (!r.success) {
        this.state.running = false;
        return r;
      }
    }
    this.state.running = false;
    return { success: false, state: this.state, error: 'Max cycles exceeded' };
  }

  /* ------------------- GETTERS / HELPERS -------------------------- */
  getState = (): ProcessorState => JSON.parse(JSON.stringify(this.state));
  getHistory = (): HistoryEntry[] => [...this.history];

  setMemory(addr: number, val: number) {
    if (addr >= 0 && addr < MIC1Processor.MEMORY_SIZE) this.state.memory[addr] = val;
  }
  getMemory(addr: number) {
    return addr >= 0 && addr < MIC1Processor.MEMORY_SIZE ? this.state.memory[addr] : 0;
  }

  private push(v: number) {
    this.state.registers.SP--;
    this.state.memory[this.state.registers.SP] = v;
  }
  private pop(): number {
    const v = this.state.memory[this.state.registers.SP];
    this.state.registers.SP++;
    return v;
  }

  private parse(line: string) {
    const [mn, op] = line.trim().split(/\s+/);
    return {
      instruction: Instruction[mn as keyof typeof Instruction],
      operand: op ? +op : 0,
    };
  }
}

/** Converte 12 bits em inteiro com sinal (-2048 .. +2047) */
  const sign12 = (x: number): number =>
    (x & 0x800) ? (x | 0xFFFFF000) : x;
