import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MIC-1 Processor Backend API',
    version: '1.0.0',
    description: 'A comprehensive REST API for simulating the MIC-1 processor architecture',
    contact: {
      name: 'API Support',
      email: 'support@mic1-simulator.com',
    },
    license: {
      name: 'MIT',
      url: 'https://opensource.org/licenses/MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://api.mic1-simulator.com',
      description: 'Production server',
    },
  ],
  components: {
    schemas: {
      SessionResponse: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Indicates if the operation was successful',
          },
          sessionId: {
            type: 'string',
            description: 'Unique session identifier',
            example: 'l7j8k9m0n1',
          },
          message: {
            type: 'string',
            description: 'Human-readable response message',
          },
        },
        required: ['success', 'sessionId'],
      },
      Registers: {
        type: 'object',
        properties: {
          PC: {
            type: 'integer',
            description: 'Program Counter',
            example: 0,
          },
          AC: {
            type: 'integer',
            description: 'Accumulator',
            example: 0,
          },
          SP: {
            type: 'integer',
            description: 'Stack Pointer',
            example: 4095,
          },
          IR: {
            type: 'integer',
            description: 'Instruction Register',
            example: 0,
          },
          TIR: {
            type: 'integer',
            description: 'Temporary Instruction Register',
            example: 0,
          },
          MAR: {
            type: 'integer',
            description: 'Memory Address Register',
            example: 0,
          },
          MBR: {
            type: 'integer',
            description: 'Memory Buffer Register',
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
            description: 'Memory array',
          },
          stack: {
            type: 'array',
            items: {
              type: 'integer',
            },
            description: 'Stack array',
          },
          running: {
            type: 'boolean',
            description: 'Whether the processor is currently running',
          },
          cycleCount: {
            type: 'integer',
            description: 'Number of execution cycles',
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
            description: 'MIC-1 instruction opcode',
          },
          operand: {
            type: 'integer',
            description: 'Instruction operand (optional)',
          },
          address: {
            type: 'integer',
            description: 'Memory address (optional)',
          },
        },
        required: ['opcode'],
      },
      Breakpoint: {
        type: 'object',
        properties: {
          line: {
            type: 'integer',
            description: 'Line number for the breakpoint',
          },
          enabled: {
            type: 'boolean',
            description: 'Whether the breakpoint is active',
          },
        },
        required: ['line', 'enabled'],
      },
      DebugInfo: {
        type: 'object',
        properties: {
          currentLine: {
            type: 'integer',
            description: 'Current execution line',
          },
          breakpoints: {
            type: 'array',
            items: {
              $ref: '#/components/schemas/Breakpoint',
            },
            description: 'List of active breakpoints',
          },
          stepMode: {
            type: 'boolean',
            description: 'Whether step mode is enabled',
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
            description: 'Array of assembly instructions',
            example: ['LOCO 10', 'STOD 100', 'HALT'],
          },
          data: {
            type: 'object',
            additionalProperties: {
              type: 'integer',
            },
            description: 'Optional data section with address-value pairs',
          },
        },
        required: ['instructions'],
      },
      ExecutionResult: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether the execution was successful',
          },
          state: {
            $ref: '#/components/schemas/ProcessorState',
          },
          error: {
            type: 'string',
            description: 'Error message if execution failed',
          },
          output: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Program output lines',
          },
          debugInfo: {
            $ref: '#/components/schemas/DebugInfo',
          },
        },
        required: ['success'],
      },
      ParseResult: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            description: 'Whether parsing was successful',
          },
          errors: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'List of parsing errors',
          },
          program: {
            $ref: '#/components/schemas/Program',
          },
        },
        required: ['success'],
      },
      MemoryDump: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
          startAddress: {
            type: 'integer',
            description: 'Starting memory address',
          },
          memory: {
            type: 'array',
            items: {
              type: 'integer',
            },
            description: 'Memory values from startAddress',
          },
        },
        required: ['success', 'startAddress', 'memory'],
      },
      BinaryResult: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
          binary: {
            type: 'array',
            items: {
              type: 'string',
            },
            description: 'Binary representation of instructions',
          },
        },
        required: ['success', 'binary'],
      },
      StateReport: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
          },
          report: {
            type: 'string',
            description: 'Detailed text report of processor state',
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
          },
          error: {
            type: 'string',
            description: 'Error message',
          },
          message: {
            type: 'string',
            description: 'Additional error details',
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
          },
          service: {
            type: 'string',
            example: 'MIC-1 Processor Backend',
          },
          timestamp: {
            type: 'string',
            format: 'date-time',
          },
        },
        required: ['status', 'service', 'timestamp'],
      },
    },
  },
  tags: [
    {
      name: 'Health',
      description: 'Service health endpoints',
    },
    {
      name: 'Session Management',
      description: 'Operations for managing processor sessions',
    },
    {
      name: 'Program Operations',
      description: 'Operations for parsing, loading, and executing programs',
    },
    {
      name: 'Execution Control',
      description: 'Operations for controlling program execution',
    },
    {
      name: 'State and Memory',
      description: 'Operations for viewing processor state and memory',
    },
    {
      name: 'Debugging',
      description: 'Operations for debugging programs',
    },
    {
      name: 'Utilities',
      description: 'Utility operations',
    },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Health'],
        summary: 'Check service health',
        description: 'Returns the health status of the MIC-1 processor backend service',
        responses: {
          '200': {
            description: 'Service is healthy',
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
        tags: ['Session Management'],
        summary: 'Create a new processor session',
        description: 'Creates a new MIC-1 processor session and returns a unique session ID',
        responses: {
          '200': {
            description: 'Session created successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SessionResponse',
                },
              },
            },
          },
          '500': {
            description: 'Internal server error',
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
    '/api/mic1/parse': {
      post: {
        tags: ['Program Operations'],
        summary: 'Parse and validate a program',
        description: 'Parses a MIC-1 assembly program and validates its syntax',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    description: 'Session identifier',
                  },
                  program: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'Array of assembly instructions',
                    example: ['LOCO 10', 'STOD 100', 'HALT'],
                  },
                },
                required: ['sessionId', 'program'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Program parsed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ParseResult',
                },
              },
            },
          },
          '400': {
            description: 'Missing required parameters',
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
    '/api/mic1/load': {
      post: {
        tags: ['Program Operations'],
        summary: 'Load a program into the processor',
        description: 'Loads a parsed program into the MIC-1 processor memory',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    description: 'Session identifier',
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
            description: 'Program loaded successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ExecutionResult',
                },
              },
            },
          },
          '400': {
            description: 'Missing required parameters',
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
        tags: ['Program Operations'],
        summary: 'Execute the loaded program',
        description: 'Executes the program loaded in the processor',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    description: 'Session identifier',
                  },
                  stepMode: {
                    type: 'boolean',
                    description: 'Whether to run in step mode',
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
            description: 'Program executed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ExecutionResult',
                },
              },
            },
          },
          '400': {
            description: 'Missing required parameters',
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
        tags: ['Execution Control'],
        summary: 'Execute one instruction',
        description: 'Executes a single instruction and returns the updated state',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    description: 'Session identifier',
                  },
                },
                required: ['sessionId'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Instruction executed successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ExecutionResult',
                },
              },
            },
          },
          '400': {
            description: 'Missing required parameters',
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
        tags: ['Execution Control'],
        summary: 'Continue execution',
        description: 'Continues execution from the current state until completion or breakpoint',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    description: 'Session identifier',
                  },
                },
                required: ['sessionId'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Execution continued successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ExecutionResult',
                },
              },
            },
          },
          '400': {
            description: 'Missing required parameters',
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
        tags: ['Execution Control'],
        summary: 'Reset the processor',
        description: 'Resets the processor to its initial state',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    description: 'Session identifier',
                  },
                },
                required: ['sessionId'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Processor reset successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    message: {
                      type: 'string',
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
            description: 'Missing required parameters',
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
        tags: ['State and Memory'],
        summary: 'Get current processor state',
        description: 'Returns the current state of the processor including registers and debug info',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Session identifier',
          },
        ],
        responses: {
          '200': {
            description: 'State retrieved successfully',
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
                    debugInfo: {
                      $ref: '#/components/schemas/DebugInfo',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing session ID',
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
        tags: ['State and Memory'],
        summary: 'Get memory dump',
        description: 'Returns a dump of processor memory from a specified address',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Session identifier',
          },
          {
            name: 'startAddress',
            in: 'query',
            required: false,
            schema: {
              type: 'integer',
              default: 0,
            },
            description: 'Starting memory address',
          },
          {
            name: 'length',
            in: 'query',
            required: false,
            schema: {
              type: 'integer',
              default: 16,
            },
            description: 'Number of memory locations to return',
          },
        ],
        responses: {
          '200': {
            description: 'Memory dump retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/MemoryDump',
                },
              },
            },
          },
          '400': {
            description: 'Missing session ID',
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
        tags: ['State and Memory'],
        summary: 'Get detailed state report',
        description: 'Returns a detailed text report of the processor state',
        parameters: [
          {
            name: 'sessionId',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
            },
            description: 'Session identifier',
          },
        ],
        responses: {
          '200': {
            description: 'State report retrieved successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/StateReport',
                },
              },
            },
          },
          '400': {
            description: 'Missing session ID',
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
        tags: ['Debugging'],
        summary: 'Set a breakpoint',
        description: 'Sets a breakpoint at the specified line number',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    description: 'Session identifier',
                  },
                  line: {
                    type: 'integer',
                    description: 'Line number to set breakpoint',
                  },
                },
                required: ['sessionId', 'line'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Breakpoint set successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    message: {
                      type: 'string',
                    },
                    debugInfo: {
                      $ref: '#/components/schemas/DebugInfo',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing required parameters',
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
        tags: ['Debugging'],
        summary: 'Remove a breakpoint',
        description: 'Removes a breakpoint from the specified line number',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    description: 'Session identifier',
                  },
                  line: {
                    type: 'integer',
                    description: 'Line number to remove breakpoint',
                  },
                },
                required: ['sessionId', 'line'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Breakpoint removed successfully',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: {
                      type: 'boolean',
                    },
                    message: {
                      type: 'string',
                    },
                    debugInfo: {
                      $ref: '#/components/schemas/DebugInfo',
                    },
                  },
                },
              },
            },
          },
          '400': {
            description: 'Missing required parameters',
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
        tags: ['Utilities'],
        summary: 'Convert program to binary',
        description: 'Converts a MIC-1 assembly program to its binary representation',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: {
                  sessionId: {
                    type: 'string',
                    description: 'Session identifier',
                  },
                  program: {
                    type: 'array',
                    items: {
                      type: 'string',
                    },
                    description: 'Array of assembly instructions',
                  },
                },
                required: ['sessionId', 'program'],
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Program converted to binary successfully',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/BinaryResult',
                },
              },
            },
          },
          '400': {
            description: 'Missing required parameters',
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

export const swaggerSpec = swaggerJSDoc(options); 
