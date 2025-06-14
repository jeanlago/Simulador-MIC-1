import { Instruction } from '../types/mic1.types';


export function instructionToBinary(instruction: Instruction): string {
  const opcodes: { [key in Instruction]: string } = {
    [Instruction.LODD]: '0000',
    [Instruction.STOD]: '0001',
    [Instruction.ADDD]: '0010',
    [Instruction.SUBD]: '0011',
    [Instruction.JPOS]: '0100',
    [Instruction.JZER]: '0101',
    [Instruction.JUMP]: '0110',
    [Instruction.LOCO]: '0111',
    [Instruction.LODL]: '1000',
    [Instruction.STOL]: '1001',
    [Instruction.ADDL]: '1010',
    [Instruction.SUBL]: '1011',
    [Instruction.JNEG]: '1100',
    [Instruction.JNZE]: '1101',
    [Instruction.CALL]: '1110',
    [Instruction.PSHI]: '1111000000000000',
    [Instruction.POPI]: '1111001000000000',
    [Instruction.PUSH]: '1111010000000000',
    [Instruction.POP]: '1111011000000000',
    [Instruction.RETN]: '1111100000000000',
    [Instruction.SWAP]: '1111101000000000',
    [Instruction.INSP]: '11111100',
    [Instruction.DESP]: '11111110',
  };

  return opcodes[instruction] || '';
}


export function intToBinary(value: number, bits: number): string {
  
  if (value < 0) {
    const maxValue = Math.pow(2, bits);
    value = maxValue + value;
  }
  
  return value.toString(2).padStart(bits, '0').slice(-bits);
}


export function binaryToInt(binary: string): number {
  return parseInt(binary, 2);
}


export function encodeInstruction(instruction: Instruction, operand?: number): string {
  const opcodeBinary = instructionToBinary(instruction);
  
  if (!operand && operand !== 0) {
    return opcodeBinary;
  }

  
  if (instruction === Instruction.INSP || instruction === Instruction.DESP) {
    return opcodeBinary + intToBinary(operand, 8);
  }
  
  
  const noOperandInstructions = [
    Instruction.PSHI, Instruction.POPI, Instruction.PUSH, 
    Instruction.POP, Instruction.RETN, Instruction.SWAP
  ];
  
  if (noOperandInstructions.includes(instruction)) {
    return opcodeBinary;
  }
  
  
  return opcodeBinary + intToBinary(operand, 12);
}


export function parseInstruction(line: string): { instruction: Instruction; operand?: number } {
  const parts = line.trim().split(/\s+/);
  const instructionName = parts[0].toUpperCase();
  
  if (!Object.values(Instruction).includes(instructionName as Instruction)) {
    throw new Error(`Unknown instruction: ${instructionName}`);
  }
  
  const instruction = instructionName as Instruction;
  const operand = parts.length > 1 ? parseInt(parts[1], 10) : undefined;
  
  if (parts.length > 1 && isNaN(operand!)) {
    throw new Error(`Invalid operand for ${instruction}: ${parts[1]}`);
  }
  
  return { instruction, operand };
}


export function toTwosComplement(value: number, bits: number): number {
  if (value >= 0) {
    return value;
  }
  return Math.pow(2, bits) + value;
}


export function fitsInBits(value: number, bits: number): boolean {
  const maxPositive = Math.pow(2, bits - 1) - 1;
  const maxNegative = -Math.pow(2, bits - 1);
  return value >= maxNegative && value <= maxPositive;
} 