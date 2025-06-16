/*  ------------------------------------------------------------------
 *  MIC-1 – núcleo do simulador (CPU + memória + histórico de passos)
 *  ------------------------------------------------------------------ */
import {
  ProcessorState,
  MIC1Instruction,
  ExecutionResult,
  Instruction,
  HistoryEntry,
} from '../types/mic1.types';
import { parseInstruction } from '../utils/binary.utils';

export class MIC1Processor {
  /* ---------------------------------------------------- propriedades */
  private state:   ProcessorState;
  private history: HistoryEntry[] = [];

  private static readonly MEMORY_SIZE = 4096;
  private static readonly STACK_BASE  = 4095;

  /* -------------------------------------------------------- construtor */
  constructor() { this.state = this.initState(); }

  /* ------------------------------------------------ inicialização ---- */
  private initState(): ProcessorState {
    return {
      registers : { PC:0, AC:0, SP:4095, IR:0, TIR:0, MAR:0, MBR:0 },
      memory    : new Array<number>(MIC1Processor.MEMORY_SIZE).fill(0),
      stack     : [],
      running   : false,
      cycleCount: 0,

      /* depuração / visualização */
      aluOperation        : 'IDLE',
      aluInputs           : { A:0, B:0 },
      aluResult           : 0,
      lastMicroInstruction: '',
      bus                 : { from:'', to:'' },
    };
  }

  reset(): void {
    this.state   = this.initState();
    this.history = [];
  }

  /* ---------------------------------------------- carregar programa -- */
  loadProgram(lines: string[], startAddr = 0): void {
    let addr = startAddr;
    for (const line of lines) {
      if (!line.trim()) continue;
      const { instruction, operand } = parseInstruction(line);
      this.state.memory[addr++] = this.encodeForMem(instruction, operand);
    }
  }

  /* -------------------------------------- encode / decode auxiliares */
  private encodeForMem(inst: Instruction, op = 0): number {
    const base: Record<Instruction, number> = {
      [Instruction.LODD]: 0x0000, [Instruction.STOD]: 0x1000,
      [Instruction.ADDD]: 0x2000, [Instruction.SUBD]: 0x3000,
      [Instruction.JPOS]: 0x4000, [Instruction.JZER]: 0x5000,
      [Instruction.JUMP]: 0x6000, [Instruction.LOCO]: 0x7000,
      [Instruction.LODL]: 0x8000, [Instruction.STOL]: 0x9000,
      [Instruction.ADDL]: 0xA000, [Instruction.SUBL]: 0xB000,
      [Instruction.JNEG]: 0xC000, [Instruction.JNZE]: 0xD000,
      [Instruction.CALL]: 0xE000,
      /* extended 0xF --- */
      [Instruction.PSHI]: 0xF000, [Instruction.POPI]: 0xF100,
      [Instruction.PUSH]: 0xF200, [Instruction.POP] : 0xF300,
      [Instruction.RETN]: 0xF400, [Instruction.SWAP]: 0xF500,
      [Instruction.INSP]: 0xFC00, [Instruction.DESP]: 0xFE00,
    };
    return base[inst] | (op & 0x0FFF);
  }

  private decodeInstruction(word: number): MIC1Instruction {
    const opMain  = (word >>> 12) & 0xF;
    const operand =  word & 0x0FFF;

    /* mapa de 4 bits → Instruction */
    const main: Record<number, Instruction> = {
      0x0: Instruction.LODD, 0x1: Instruction.STOD,
      0x2: Instruction.ADDD, 0x3: Instruction.SUBD,
      0x4: Instruction.JPOS, 0x5: Instruction.JZER,
      0x6: Instruction.JUMP, 0x7: Instruction.LOCO,
      0x8: Instruction.LODL, 0x9: Instruction.STOL,
      0xA: Instruction.ADDL, 0xB: Instruction.SUBL,
      0xC: Instruction.JNEG, 0xD: Instruction.JNZE,
      0xE: Instruction.CALL, 0xF: this.decodeExtended(word),
    };
    return { opcode: main[opMain] ?? Instruction.LODD, operand };
  }

  private decodeExtended(word: number): Instruction {
    const ext = (word >>> 8) & 0xF;
    switch (ext) {
      case 0x0: return Instruction.PSHI;
      case 0x1: return Instruction.POPI;
      case 0x2: return Instruction.PUSH;
      case 0x3: return Instruction.POP;
      case 0x4: return Instruction.RETN;
      case 0x5: return Instruction.SWAP;
      case 0xC: return Instruction.INSP;
      case 0xE: return Instruction.DESP;
      default : return Instruction.LODD;
    }
  }

  /* ------------------------------------------ execução de 1 instrução */
  private execute(inst: MIC1Instruction): void {
    const { opcode, operand = 0 } = inst;

    /* reset visual */
    this.state.bus = { from:'MBR', to:'IR' };
    this.setALU('IDLE',0,0,0);

    /* ------------------------ switch macro-instruções ---------------- */
    switch (opcode) {
      /* --- MOVIMENTAÇÃO --- */
      case Instruction.LODD: {
        const v = this.state.memory[operand];
        this.state.registers.AC = v;
        this.setALU('MOV', v, 0, v);
        this.state.bus = { from:`MEM[${operand}]`, to:'AC' };
        break;
      }
      case Instruction.STOD: {
        const v = this.state.registers.AC;
        this.state.memory[operand] = v;
        this.setALU('MOV', v, 0, v);
        break;
      }
      case Instruction.LOCO: {
        this.state.registers.AC = operand;
        this.setALU('MOV', operand, 0, operand);
        break;
      }
      /* --- ARITMÉTICA --- */
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
      /* --- CONTROLE DE FLUXO (exemplos) --- */
      case Instruction.JUMP:  this.state.registers.PC = operand - 1; break;
      case Instruction.JPOS:  if (this.state.registers.AC >  0) this.state.registers.PC = operand - 1; break;
      case Instruction.JZER:  if (this.state.registers.AC === 0) this.state.registers.PC = operand - 1; break;
      /* demais casos … */
      default: break;
    }

    /* texto + histórico */
    this.state.lastMicroInstruction =
      operand ? `${Instruction[opcode]} ${operand}` : Instruction[opcode];

    this.history.push({
      cycle: this.state.cycleCount,
      micro: this.state.lastMicroInstruction,
      bus  : { ...this.state.bus },
    });
  }

  /* ----------------------------------------------------- step / run -- */
  step(): ExecutionResult {
    try {
      if (this.state.registers.PC >= MIC1Processor.MEMORY_SIZE)
        return { success:false, state:this.state, error:'PC out of bounds' };

      /* FETCH */
      this.state.registers.IR = this.state.memory[this.state.registers.PC];
      if (this.state.registers.IR === 0)
        return { success:false, state:this.state, error:'Fim do programa' };

      /* DECODE + EXECUTE */
      this.execute(this.decodeInstruction(this.state.registers.IR));

      this.state.registers.PC++;
      this.state.cycleCount++;
      return { success:true, state:this.state };
    } catch (e) {
      return {
        success:false,
        state  :this.state,
        error  :e instanceof Error ? e.message : 'Unknown error',
      };
    }
  }

  run(maxCycles = 10_000): ExecutionResult {
    this.state.running = true;
    for (let i = 0; i < maxCycles; i++) {
      const r = this.step();
      if (!r.success) { this.state.running = false; return r; }
    }
    this.state.running = false;
    return { success:false, state:this.state, error:'Max cycles exceeded' };
  }

  /* ------------------------------------------------ getters / helpers */
  getState   = (): ProcessorState => JSON.parse(JSON.stringify(this.state));
  getHistory = (): HistoryEntry[] => [...this.history];

  setMemory(addr:number,val:number){ if(addr>=0&&addr<MIC1Processor.MEMORY_SIZE) this.state.memory[addr]=val; }
  getMemory(addr:number){ return addr>=0&&addr<MIC1Processor.MEMORY_SIZE ? this.state.memory[addr] : 0; }

  private push(v:number){ this.state.registers.SP--; this.state.memory[this.state.registers.SP]=v; }
  private pop():number { const v=this.state.memory[this.state.registers.SP]; this.state.registers.SP++; return v; }

  private setALU(op:string,a:number,b:number,r:number){
    this.state.aluOperation = op;
    this.state.aluInputs    = {A:a,B:b};
    this.state.aluResult    = r;
  }
}
