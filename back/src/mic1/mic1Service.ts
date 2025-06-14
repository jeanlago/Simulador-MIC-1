import { MIC1Processor } from './processor';
import { 
  Program, 
  ExecutionResult, 
  ProcessorState,
  DebugInfo,
  Breakpoint 
} from '../types/mic1.types';
import { parseInstruction, encodeInstruction } from '../utils/binary.utils';

export class MIC1Service {
  private processor: MIC1Processor;
  private debugInfo: DebugInfo;
  private programLines: string[];
  
  constructor() {
    this.processor = new MIC1Processor();
    this.debugInfo = {
      currentLine: 0,
      breakpoints: [],
      stepMode: false,
    };
    this.programLines = [];
  }

  // Parse and validate a program
  parseProgram(programText: string): { valid: boolean; errors: string[]; program?: Program } {
    const errors: string[] = [];
    const lines = programText.split('\n')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('#')); // Remove empty lines and comments

    const instructions: string[] = [];
    const data: { [address: number]: number } = {};

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Handle data declarations (format: .data address value)
      if (line.startsWith('.data')) {
        const parts = line.split(/\s+/);
        if (parts.length !== 3) {
          errors.push(`Line ${i + 1}: Invalid data declaration format`);
          continue;
        }
        
        const address = parseInt(parts[1], 10);
        const value = parseInt(parts[2], 10);
        
        if (isNaN(address) || isNaN(value)) {
          errors.push(`Line ${i + 1}: Invalid address or value in data declaration`);
          continue;
        }
        
        data[address] = value;
      } else {
        // Parse instruction
        try {
          parseInstruction(line);
          instructions.push(line);
        } catch (error) {
          errors.push(`Line ${i + 1}: ${error}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      program: errors.length === 0 ? { instructions, data } : undefined,
    };
  }

  // Load a program into the processor
  loadProgram(program: Program): { success: boolean; error?: string } {
    try {
      this.processor.reset();
      this.programLines = program.instructions;
      
      // Load instructions
      this.processor.loadProgram(program.instructions);
      
      // Load data into memory
      if (program.data) {
        for (const [address, value] of Object.entries(program.data)) {
          this.processor.setMemory(Number(address), value);
        }
      }
      
      // Reset debug info
      this.debugInfo = {
        currentLine: 0,
        breakpoints: [],
        stepMode: false,
      };
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error loading program',
      };
    }
  }

  // Execute the loaded program
  execute(stepMode: boolean = false): ExecutionResult {
    this.debugInfo.stepMode = stepMode;
    
    if (stepMode) {
      return this.processor.step();
    } else {
      return this.processor.run();
    }
  }

  // Step through one instruction
  step(): ExecutionResult {
    const result = this.processor.step();
    
    if (result.success) {
      this.debugInfo.currentLine++;
    }
    
    return result;
  }

  // Continue execution until breakpoint or completion
  continue(): ExecutionResult {
    let result: ExecutionResult = { success: true, state: this.processor.getState() };
    
    while (result.success) {
      result = this.processor.step();
      
      if (!result.success) {
        break;
      }
      
      this.debugInfo.currentLine++;
      
      // Check for breakpoint
      const breakpoint = this.debugInfo.breakpoints.find(
        bp => bp.line === this.debugInfo.currentLine && bp.enabled
      );
      
      if (breakpoint) {
        break;
      }
      
      // Check for program end
      if (this.processor.getState().memory[this.processor.getState().registers.PC] === 0) {
        break;
      }
    }
    
    return result;
  }

  // Set a breakpoint
  setBreakpoint(line: number): void {
    const existing = this.debugInfo.breakpoints.find(bp => bp.line === line);
    
    if (existing) {
      existing.enabled = true;
    } else {
      this.debugInfo.breakpoints.push({ line, enabled: true });
    }
  }

  // Remove a breakpoint
  removeBreakpoint(line: number): void {
    this.debugInfo.breakpoints = this.debugInfo.breakpoints.filter(bp => bp.line !== line);
  }

  // Toggle a breakpoint
  toggleBreakpoint(line: number): void {
    const existing = this.debugInfo.breakpoints.find(bp => bp.line === line);
    
    if (existing) {
      existing.enabled = !existing.enabled;
    } else {
      this.setBreakpoint(line);
    }
  }

  // Get current processor state
  getState(): ProcessorState {
    return this.processor.getState();
  }

  // Get debug information
  getDebugInfo(): DebugInfo {
    return { ...this.debugInfo };
  }

  // Reset the processor
  reset(): void {
    this.processor.reset();
    this.debugInfo.currentLine = 0;
  }

  // Get memory dump
  getMemoryDump(startAddress: number, length: number): number[] {
    const dump: number[] = [];
    
    for (let i = 0; i < length; i++) {
      dump.push(this.processor.getMemory(startAddress + i));
    }
    
    return dump;
  }

  // Convert program to binary representation
  programToBinary(program: Program): string[] {
    const binaryInstructions: string[] = [];
    
    for (const instruction of program.instructions) {
      try {
        const { instruction: inst, operand } = parseInstruction(instruction);
        const binary = encodeInstruction(inst, operand);
        binaryInstructions.push(binary);
      } catch (error) {
        binaryInstructions.push('ERROR');
      }
    }
    
    return binaryInstructions;
  }

  // Get a formatted state report
  getStateReport(): string {
    const state = this.processor.getState();
    const report: string[] = [];
    
    report.push('=== MIC-1 Processor State ===');
    report.push(`Cycle Count: ${state.cycleCount}`);
    report.push(`Running: ${state.running}`);
    report.push('');
    report.push('Registers:');
    report.push(`  PC: ${state.registers.PC}`);
    report.push(`  AC: ${state.registers.AC}`);
    report.push(`  SP: ${state.registers.SP}`);
    report.push(`  IR: 0x${state.registers.IR.toString(16).padStart(4, '0')}`);
    report.push('');
    
    if (state.lastInstruction) {
      report.push(`Last Instruction: ${state.lastInstruction.opcode} ${state.lastInstruction.operand || ''}`);
    }
    
    return report.join('\n');
  }
} 