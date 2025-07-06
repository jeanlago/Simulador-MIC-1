import swaggerJSDoc from 'swagger-jsdoc';
import { swaggerTranslations, Language } from './swagger.translations';

export const createSwaggerConfig = (lang: Language = 'en') => {
  const t = swaggerTranslations[lang];

  const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: t.info.title,
      version: '1.0.0',
      description: t.info.description,
      contact: {
        name: t.info.contact.name,
        email: t.info.contact.email,
      },
      license: {
        name: t.info.license.name,
        url: t.info.license.url,
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: t.servers.development,
      },
      {
        url: 'https://api.mic1-simulator.com',
        description: t.servers.production,
      },
    ],
    components: {
      schemas: {
        SessionResponse: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: t.schemas.sessionResponse.success,
            },
            sessionId: {
              type: 'string',
              description: t.schemas.sessionResponse.sessionId,
              example: 'l7j8k9m0n1',
            },
            message: {
              type: 'string',
              description: t.schemas.sessionResponse.message,
            },
          },
          required: ['success', 'sessionId'],
        },
        Registers: {
          type: 'object',
          properties: {
            PC: {
              type: 'integer',
              description: t.schemas.registers.PC,
              example: 0,
            },
            AC: {
              type: 'integer',
              description: t.schemas.registers.AC,
              example: 0,
            },
            SP: {
              type: 'integer',
              description: t.schemas.registers.SP,
              example: 4095,
            },
            IR: {
              type: 'integer',
              description: t.schemas.registers.IR,
              example: 0,
            },
            TIR: {
              type: 'integer',
              description: t.schemas.registers.TIR,
              example: 0,
            },
            MAR: {
              type: 'integer',
              description: t.schemas.registers.MAR,
              example: 0,
            },
            MBR: {
              type: 'integer',
              description: t.schemas.registers.MBR,
              example: 0,
            },
          },
          required: ['PC', 'AC', 'SP', 'IR', 'TIR', 'MAR', 'MBR'],
        },
        ProcessorState: {
          type: 'object',
          properties: {
            registers: {
              $ref: '#/components/schemas/Registers',
            },
            memory: {
              type: 'array',
              items: {
                type: 'integer',
              },
              description: t.schemas.processorState.memory,
            },
            stack: {
              type: 'array',
              items: {
                type: 'integer',
              },
              description: t.schemas.processorState.stack,
            },
            running: {
              type: 'boolean',
              description: t.schemas.processorState.running,
            },
            cycleCount: {
              type: 'integer',
              description: t.schemas.processorState.cycleCount,
            },
            lastInstruction: {
              $ref: '#/components/schemas/MIC1Instruction',
            },
          },
          required: ['registers', 'memory', 'stack', 'running', 'cycleCount'],
        },
        MIC1Instruction: {
          type: 'object',
          properties: {
            opcode: {
              type: 'string',
              enum: [
                'LODD', 'STOD', 'ADDD', 'SUBD', 'JPOS', 'JZER', 'JUMP', 'LOCO',
                'LODL', 'STOL', 'ADDL', 'SUBL', 'JNEG', 'JNZE', 'CALL', 'PSHI',
                'POPI', 'PUSH', 'POP', 'RETN', 'SWAP', 'INSP', 'DESP'
              ],
              description: t.schemas.instruction.opcode,
            },
            operand: {
              type: 'integer',
              description: t.schemas.instruction.operand,
            },
            address: {
              type: 'integer',
              description: t.schemas.instruction.address,
            },
          },
          required: ['opcode'],
        },
        Breakpoint: {
          type: 'object',
          properties: {
            line: {
              type: 'integer',
              description: t.schemas.breakpoint.line,
            },
            enabled: {
              type: 'boolean',
              description: t.schemas.breakpoint.enabled,
            },
          },
          required: ['line', 'enabled'],
        },
        DebugInfo: {
          type: 'object',
          properties: {
            currentLine: {
              type: 'integer',
              description: t.schemas.debugInfo.currentLine,
            },
            breakpoints: {
              type: 'array',
              items: {
                $ref: '#/components/schemas/Breakpoint',
              },
              description: t.schemas.debugInfo.breakpoints,
            },
            stepMode: {
              type: 'boolean',
              description: t.schemas.debugInfo.stepMode,
            },
          },
          required: ['currentLine', 'breakpoints', 'stepMode'],
        },
        Program: {
          type: 'object',
          properties: {
            instructions: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: t.schemas.program.instructions,
              example: ['LOCO 10', 'STOD 100', 'HALT'],
            },
            data: {
              type: 'object',
              additionalProperties: {
                type: 'integer',
              },
              description: t.schemas.program.data,
            },
          },
          required: ['instructions'],
        },
        ExecutionResult: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: t.schemas.executionResult.success,
            },
            state: {
              $ref: '#/components/schemas/ProcessorState',
            },
            error: {
              type: 'string',
              description: t.schemas.executionResult.error,
            },
            output: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: t.schemas.executionResult.output,
            },
            debugInfo: {
              $ref: '#/components/schemas/DebugInfo',
            },
          },
          required: ['success'],
        },
        MemoryDump: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: t.schemas.memoryDump.success,
            },
            startAddress: {
              type: 'integer',
              description: t.schemas.memoryDump.startAddress,
            },
            memory: {
              type: 'array',
              items: {
                type: 'integer',
              },
              description: t.schemas.memoryDump.memory,
            },
          },
          required: ['success', 'startAddress', 'memory'],
        },
        BinaryResult: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: t.schemas.binaryResult.success,
            },
            binary: {
              type: 'array',
              items: {
                type: 'string',
              },
              description: t.schemas.binaryResult.binary,
            },
          },
          required: ['success', 'binary'],
        },
        StateReport: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              description: t.schemas.stateReport.success,
            },
            report: {
              type: 'string',
              description: t.schemas.stateReport.report,
            },
          },
          required: ['success', 'report'],
        },
        Error: {
          type: 'object',
          properties: {
            success: {
              type: 'boolean',
              example: false,
              description: t.schemas.error.success,
            },
            error: {
              type: 'string',
              description: t.schemas.error.error,
            },
            message: {
              type: 'string',
              description: t.schemas.error.message,
            },
          },
          required: ['success', 'error'],
        },
        HealthCheck: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'healthy',
              description: t.schemas.healthCheck.status,
            },
            service: {
              type: 'string',
              example: 'MIC-1 Processor Backend',
              description: t.schemas.healthCheck.service,
            },
            timestamp: {
              type: 'string',
              format: 'date-time',
              description: t.schemas.healthCheck.timestamp,
            },
          },
          required: ['status', 'service', 'timestamp'],
        },
      },
    },
    tags: [
      {
        name: t.tags.health.name,
        description: t.tags.health.description,
      },
      {
        name: t.tags.session.name,
        description: t.tags.session.description,
      },
      {
        name: t.tags.program.name,
        description: t.tags.program.description,
      },
      {
        name: t.tags.execution.name,
        description: t.tags.execution.description,
      },
      {
        name: t.tags.state.name,
        description: t.tags.state.description,
      },
      {
        name: t.tags.debugging.name,
        description: t.tags.debugging.description,
      },
      {
        name: t.tags.utilities.name,
        description: t.tags.utilities.description,
      },
    ],
    paths: {
      '/health': {
        get: {
          tags: [t.tags.health.name],
          summary: t.endpoints.health.summary,
          description: t.endpoints.health.description,
          responses: {
            '200': {
              description: t.endpoints.health.responses[200],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/HealthCheck',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/session': {
        post: {
          tags: [t.tags.session.name],
          summary: t.endpoints.session.summary,
          description: t.endpoints.session.description,
          responses: {
            '200': {
              description: t.endpoints.session.responses[200],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/SessionResponse',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/load': {
        post: {
          tags: [t.tags.program.name],
          summary: t.endpoints.load.summary,
          description: t.endpoints.load.description,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: {
                      type: 'string',
                      description: t.schemas.sessionResponse.sessionId,
                    },
                    program: {
                      $ref: '#/components/schemas/Program',
                    },
                  },
                  required: ['sessionId', 'program'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: t.endpoints.load.responses[200],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ExecutionResult',
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.load.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/execute': {
        post: {
          tags: [t.tags.execution.name],
          summary: t.endpoints.execute.summary,
          description: t.endpoints.execute.description,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: {
                      type: 'string',
                      description: t.schemas.sessionResponse.sessionId,
                    },
                    stepMode: {
                      type: 'boolean',
                      description: t.schemas.debugInfo.stepMode,
                      default: false,
                    },
                  },
                  required: ['sessionId'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: t.endpoints.execute.responses[200],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ExecutionResult',
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.execute.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/step': {
        post: {
          tags: [t.tags.execution.name],
          summary: t.endpoints.step.summary,
          description: t.endpoints.step.description,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: {
                      type: 'string',
                      description: t.schemas.sessionResponse.sessionId,
                    },
                  },
                  required: ['sessionId'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: t.endpoints.step.responses[200],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ExecutionResult',
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.step.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/continue': {
        post: {
          tags: [t.tags.execution.name],
          summary: t.endpoints.continue.summary,
          description: t.endpoints.continue.description,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: {
                      type: 'string',
                      description: t.schemas.sessionResponse.sessionId,
                    },
                  },
                  required: ['sessionId'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: t.endpoints.continue.responses[200],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/ExecutionResult',
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.continue.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/reset': {
        post: {
          tags: [t.tags.execution.name],
          summary: t.endpoints.reset.summary,
          description: t.endpoints.reset.description,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: {
                      type: 'string',
                      description: t.schemas.sessionResponse.sessionId,
                    },
                  },
                  required: ['sessionId'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: t.endpoints.reset.responses[200],
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                      },
                      state: {
                        $ref: '#/components/schemas/ProcessorState',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.reset.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/state/{sessionId}': {
        get: {
          tags: [t.tags.state.name],
          summary: t.endpoints.getState.summary,
          description: t.endpoints.getState.description,
          parameters: [
            {
              name: 'sessionId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
              description: t.schemas.sessionResponse.sessionId,
            },
          ],
          responses: {
            '200': {
              description: t.endpoints.getState.responses[200],
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                      },
                      state: {
                        $ref: '#/components/schemas/ProcessorState',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.getState.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/memory/{sessionId}': {
        get: {
          tags: [t.tags.state.name],
          summary: t.endpoints.getMemory.summary,
          description: t.endpoints.getMemory.description,
          parameters: [
            {
              name: 'sessionId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
              description: t.schemas.sessionResponse.sessionId,
            },
            {
              name: 'startAddress',
              in: 'query',
              required: false,
              schema: {
                type: 'integer',
                default: 0,
              },
              description: t.schemas.memoryDump.startAddress,
            },
            {
              name: 'length',
              in: 'query',
              required: false,
              schema: {
                type: 'integer',
                default: 16,
              },
              description: 'Número de palavras a serem lidas',
            },
          ],
          responses: {
            '200': {
              description: t.endpoints.getMemory.responses[200],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/MemoryDump',
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.getMemory.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/report/{sessionId}': {
        get: {
          tags: [t.tags.state.name],
          summary: t.endpoints.getReport.summary,
          description: t.endpoints.getReport.description,
          parameters: [
            {
              name: 'sessionId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
              description: t.schemas.sessionResponse.sessionId,
            },
          ],
          responses: {
            '200': {
              description: t.endpoints.getReport.responses[200],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/StateReport',
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.getReport.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/history/{sessionId}': {
        get: {
          tags: [t.tags.state.name],
          summary: t.endpoints.getHistory.summary,
          description: t.endpoints.getHistory.description,
          parameters: [
            {
              name: 'sessionId',
              in: 'path',
              required: true,
              schema: {
                type: 'string',
              },
              description: t.schemas.sessionResponse.sessionId,
            },
          ],
          responses: {
            '200': {
              description: t.endpoints.getHistory.responses[200],
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                      },
                      history: {
                        type: 'array',
                        items: {
                          type: 'object',
                          properties: {
                            cycle: {
                              type: 'integer',
                            },
                            micro: {
                              type: 'string',
                            },
                            bus: {
                              type: 'object',
                              properties: {
                                from: {
                                  type: 'string',
                                },
                                to: {
                                  type: 'string',
                                },
                              },
                            },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.getHistory.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/breakpoint/set': {
        post: {
          tags: [t.tags.debugging.name],
          summary: t.endpoints.setBreakpoint.summary,
          description: t.endpoints.setBreakpoint.description,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: {
                      type: 'string',
                      description: t.schemas.sessionResponse.sessionId,
                    },
                    line: {
                      type: 'integer',
                      description: t.schemas.breakpoint.line,
                    },
                  },
                  required: ['sessionId', 'line'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: t.endpoints.setBreakpoint.responses[200],
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.setBreakpoint.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/breakpoint/remove': {
        post: {
          tags: [t.tags.debugging.name],
          summary: t.endpoints.removeBreakpoint.summary,
          description: t.endpoints.removeBreakpoint.description,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    sessionId: {
                      type: 'string',
                      description: t.schemas.sessionResponse.sessionId,
                    },
                    line: {
                      type: 'integer',
                      description: t.schemas.breakpoint.line,
                    },
                  },
                  required: ['sessionId', 'line'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: t.endpoints.removeBreakpoint.responses[200],
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      success: {
                        type: 'boolean',
                      },
                    },
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.removeBreakpoint.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
      '/api/mic1/binary': {
        post: {
          tags: [t.tags.utilities.name],
          summary: t.endpoints.binary.summary,
          description: t.endpoints.binary.description,
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    program: {
                      $ref: '#/components/schemas/Program',
                    },
                  },
                  required: ['program'],
                },
              },
            },
          },
          responses: {
            '200': {
              description: t.endpoints.binary.responses[200],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/BinaryResult',
                  },
                },
              },
            },
            '400': {
              description: t.endpoints.binary.responses[400],
              content: {
                'application/json': {
                  schema: {
                    $ref: '#/components/schemas/Error',
                  },
                },
              },
            },
          },
        },
      },
    },
  };

  const options = {
    definition: swaggerDefinition,
    apis: [],
  };

  return swaggerJSDoc(options);
};

// Exports para compatibilidade
export const swaggerSpecEn = createSwaggerConfig('en');
export const swaggerSpecPt = createSwaggerConfig('pt');
export const swaggerSpec = swaggerSpecEn; // padrão mantém inglês 