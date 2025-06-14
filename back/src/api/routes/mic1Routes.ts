import { Router } from 'express';
import { mic1Controller } from '../controllers/mic1Controller';

const router = Router();


router.post('/session', mic1Controller.createSession);


router.post('/parse', mic1Controller.parseProgram);
router.post('/load', mic1Controller.loadProgram);
router.post('/execute', mic1Controller.execute);


router.post('/step', mic1Controller.step);
router.post('/continue', mic1Controller.continue);
router.post('/reset', mic1Controller.reset);


router.get('/state/:sessionId', mic1Controller.getState);
router.get('/memory/:sessionId', mic1Controller.getMemory);
router.get('/report/:sessionId', mic1Controller.getStateReport);


router.post('/breakpoint/set', mic1Controller.setBreakpoint);
router.post('/breakpoint/remove', mic1Controller.removeBreakpoint);


router.post('/binary', mic1Controller.toBinary);

export default router;