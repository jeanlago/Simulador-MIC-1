import { Request, Response } from 'express';
import { MIC1Service } from '../../mic1/mic1Service';


const processorSessions: Map<string, MIC1Service> = new Map();


function getProcessorSession(sessionId: string): MIC1Service {
  if (!processorSessions.has(sessionId)) {
    processorSessions.set(sessionId, new MIC1Service());
  }
  return processorSessions.get(sessionId)!;
}

export const mic1Controller = {
  
  createSession: (req: Request, res: Response) => {
    const sessionId = Date.now().toString(36) + Math.random().toString(36);
    const service = new MIC1Service();
    processorSessions.set(sessionId, service);
    
    res.json({
      success: true,
      sessionId,
      message: 'New MIC-1 processor session created',
    });
  },

  
  parseProgram: (req: Request, res: Response) => {
    const { sessionId, program } = req.body;
    
    if (!sessionId || !program) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId or program',
      });
    }
    
    const service = getProcessorSession(sessionId);
    const result = service.parseProgram(program);
    
    res.json({
      success: result.valid,
      errors: result.errors,
      program: result.program,
    });
  },

  
  loadProgram: (req: Request, res: Response) => {
    const { sessionId, program } = req.body;
    
    if (!sessionId || !program) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId or program',
      });
    }
    
    const service = getProcessorSession(sessionId);
    const result = service.loadProgram(program);
    
    res.json(result);
  },

  
  execute: (req: Request, res: Response) => {
    const { sessionId, stepMode = false } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId',
      });
    }
    
    const service = getProcessorSession(sessionId);
    const result = service.execute(stepMode);
    
    res.json({
      ...result,
      debugInfo: service.getDebugInfo(),
    });
  },

  
  step: (req: Request, res: Response) => {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId',
      });
    }
    
    const service = getProcessorSession(sessionId);
    const result = service.step();
    
    res.json({
      ...result,
      debugInfo: service.getDebugInfo(),
    });
  },

  
  continue: (req: Request, res: Response) => {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId',
      });
    }
    
    const service = getProcessorSession(sessionId);
    const result = service.continue();
    
    res.json({
      ...result,
      debugInfo: service.getDebugInfo(),
    });
  },

  
  reset: (req: Request, res: Response) => {
    const { sessionId } = req.body;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId',
      });
    }
    
    const service = getProcessorSession(sessionId);
    service.reset();
    
    res.json({
      success: true,
      message: 'Processor reset successfully',
      state: service.getState(),
    });
  },

  
  getState: (req: Request, res: Response) => {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId',
      });
    }
    
    const service = getProcessorSession(sessionId);
    
    res.json({
      success: true,
      state: service.getState(),
      debugInfo: service.getDebugInfo(),
    });
  },

  
  getMemory: (req: Request, res: Response) => {
    const { sessionId } = req.params;
    const { startAddress = 0, length = 16 } = req.query;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId',
      });
    }
    
    const service = getProcessorSession(sessionId);
    const memory = service.getMemoryDump(Number(startAddress), Number(length));
    
    res.json({
      success: true,
      startAddress: Number(startAddress),
      memory,
    });
  },

  
  setBreakpoint: (req: Request, res: Response) => {
    const { sessionId, line } = req.body;
    
    if (!sessionId || line === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId or line',
      });
    }
    
    const service = getProcessorSession(sessionId);
    service.setBreakpoint(line);
    
    res.json({
      success: true,
      message: `Breakpoint set at line ${line}`,
      debugInfo: service.getDebugInfo(),
    });
  },

  
  removeBreakpoint: (req: Request, res: Response) => {
    const { sessionId, line } = req.body;
    
    if (!sessionId || line === undefined) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId or line',
      });
    }
    
    const service = getProcessorSession(sessionId);
    service.removeBreakpoint(line);
    
    res.json({
      success: true,
      message: `Breakpoint removed from line ${line}`,
      debugInfo: service.getDebugInfo(),
    });
  },

  
  toBinary: (req: Request, res: Response) => {
    const { sessionId, program } = req.body;
    
    if (!sessionId || !program) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId or program',
      });
    }
    
    const service = getProcessorSession(sessionId);
    const binaryInstructions = service.programToBinary(program);
    
    res.json({
      success: true,
      binary: binaryInstructions,
    });
  },

  
  getStateReport: (req: Request, res: Response) => {
    const { sessionId } = req.params;
    
    if (!sessionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing sessionId',
      });
    }
    
    const service = getProcessorSession(sessionId);
    const report = service.getStateReport();
    
    res.json({
      success: true,
      report,
    });
  },

  
  cleanupSessions: () => {
    
    const oneHourAgo = Date.now() - (60 * 60 * 1000);
    const sessionsToRemove: string[] = [];
    
    processorSessions.forEach((_, sessionId) => {
      const timestamp = parseInt(sessionId.substring(0, 8), 36);
      if (timestamp < oneHourAgo) {
        sessionsToRemove.push(sessionId);
      }
    });
    
    sessionsToRemove.forEach(sessionId => {
      processorSessions.delete(sessionId);
    });
  },
}; 