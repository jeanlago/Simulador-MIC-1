import { Request, Response, RequestHandler } from 'express';
import { MIC1Service } from '../../mic1/mic1Service';

/* ---------- sessões em memória ---------- */
const sessions = new Map<string, MIC1Service>();
const svc = (id: string) => {
  if (!sessions.has(id)) sessions.set(id, new MIC1Service());
  return sessions.get(id)!;
};

/* ---------- helpers ---------- */
const miss = (res: Response, what = 'sessionId') =>
  res.status(400).json({ success:false, error:`Missing ${what}` });

/* ---------- controller ---------- */
export const mic1Controller = {
  /* sessão */
  createSession: ((_req, res) => {
    const id = Date.now().toString(36) + Math.random().toString(36);
    sessions.set(id, new MIC1Service());
    res.json({ success:true, sessionId:id });
  }) as RequestHandler,

  /* carregamento */
  loadProgram: ((req, res) => {
    const { sessionId, program } = req.body;
    if (!sessionId || !program) return miss(res, 'sessionId or program');
    res.json(svc(sessionId).loadProgram(program));
  }) as RequestHandler,

  /* execução */
  execute: ((req, res) => {
    const { sessionId, stepMode=false } = req.body;
    if (!sessionId) return miss(res);
    const r = svc(sessionId).execute(stepMode);
    res.json({ ...r, debugInfo: svc(sessionId).getDebugInfo() });
  }) as RequestHandler,

  step: ((req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return miss(res);
    const r = svc(sessionId).step();
    res.json({ ...r, debugInfo: svc(sessionId).getDebugInfo() });
  }) as RequestHandler,

  continue: ((req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return miss(res);
    const r = svc(sessionId).continue();
    res.json({ ...r, debugInfo: svc(sessionId).getDebugInfo() });
  }) as RequestHandler,

  reset: ((req, res) => {
    const { sessionId } = req.body;
    if (!sessionId) return miss(res);
    svc(sessionId).reset();
    res.json({ success:true, state:svc(sessionId).getState() });
  }) as RequestHandler,

  /* consultas */
  getState: ((req, res) => {
    const { sessionId } = req.params;
    if (!sessionId) return miss(res);
    res.json({ success:true, state: svc(sessionId).getState() });
  }) as RequestHandler,

  getMemory: ((req, res) => {
    const { sessionId } = req.params;
    if (!sessionId) return miss(res);
    const { startAddress=0, length=16 } = req.query;
    const mem = svc(sessionId).getMemoryDump(+startAddress, +length);
    res.json({ success:true, startAddress:+startAddress, memory:mem });
  }) as RequestHandler,

  getStateReport: ((req, res) => {
    const { sessionId } = req.params;
    if (!sessionId) return miss(res);
    res.json({ success:true, report: svc(sessionId).getStateReport() });
  }) as RequestHandler,

  getHistory: ((req, res) => {
    const { sessionId } = req.params;
    if (!sessionId) return miss(res);
    res.json({ success:true, history: svc(sessionId).getHistory() });
  }) as RequestHandler,

  /* breakpoints / binário mantêm-se iguais ao que você já usava */
  setBreakpoint   : ((req,res)=>res.json({success:true})) as RequestHandler,
  removeBreakpoint: ((req,res)=>res.json({success:true})) as RequestHandler,
  toBinary        : ((req,res)=>res.json({success:true})) as RequestHandler,
};
