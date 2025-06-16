import { Router } from 'express';
import { mic1Controller as c } from '../controllers/mic1Controller';

const r = Router();

/* sessão */
r.post('/session', c.createSession);

/* carregamento / execução */
r.post('/load',     c.loadProgram);
r.post('/execute',  c.execute);
r.post('/step',     c.step);
r.post('/continue', c.continue);
r.post('/reset',    c.reset);

/* consultas */
r.get('/state/:sessionId',    c.getState);
r.get('/memory/:sessionId',   c.getMemory);
r.get('/report/:sessionId',   c.getStateReport);
r.get('/history/:sessionId',  c.getHistory);

/* ferramentas */
r.post('/breakpoint/set',     c.setBreakpoint);
r.post('/breakpoint/remove',  c.removeBreakpoint);
r.post('/binary',             c.toBinary);

export default r;
