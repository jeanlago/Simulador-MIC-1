export const swaggerTranslations = {
  en: {
    info: {
      title: 'MIC-1 Processor Backend API',
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
    servers: {
      development: 'Development server',
      production: 'Production server',
    },
    tags: {
      health: {
        name: 'Health',
        description: 'Service health endpoints',
      },
      session: {
        name: 'Session Management',
        description: 'Operations for managing processor sessions',
      },
      program: {
        name: 'Program Operations',
        description: 'Operations for parsing, loading, and executing programs',
      },
      execution: {
        name: 'Execution Control',
        description: 'Operations for controlling program execution',
      },
      state: {
        name: 'State and Memory',
        description: 'Operations for viewing processor state and memory',
      },
      debugging: {
        name: 'Debugging',
        description: 'Operations for debugging programs',
      },
      utilities: {
        name: 'Utilities',
        description: 'Utility operations',
      },
    },
    schemas: {
      sessionResponse: {
        success: 'Indicates if the operation was successful',
        sessionId: 'Unique session identifier',
        message: 'Human-readable response message',
      },
      registers: {
        PC: 'Program Counter',
        AC: 'Accumulator',
        SP: 'Stack Pointer',
        IR: 'Instruction Register',
        TIR: 'Temporary Instruction Register',
        MAR: 'Memory Address Register',
        MBR: 'Memory Buffer Register',
      },
      processorState: {
        registers: 'Processor registers',
        memory: 'Memory array',
        stack: 'Stack array',
        running: 'Whether the processor is currently running',
        cycleCount: 'Number of execution cycles',
        lastInstruction: 'Last executed instruction',
      },
      instruction: {
        opcode: 'MIC-1 instruction opcode',
        operand: 'Instruction operand (optional)',
        address: 'Memory address (optional)',
      },
      breakpoint: {
        line: 'Line number for the breakpoint',
        enabled: 'Whether the breakpoint is active',
      },
      debugInfo: {
        currentLine: 'Current execution line',
        breakpoints: 'List of active breakpoints',
        stepMode: 'Whether step mode is enabled',
      },
      program: {
        instructions: 'Array of assembly instructions',
        data: 'Optional data section with address-value pairs',
      },
      executionResult: {
        success: 'Whether the execution was successful',
        state: 'Current processor state',
        error: 'Error message if execution failed',
        output: 'Program output lines',
        debugInfo: 'Debug information',
      },
      memoryDump: {
        success: 'Operation success status',
        startAddress: 'Starting memory address',
        memory: 'Memory values from startAddress',
      },
      binaryResult: {
        success: 'Operation success status',
        binary: 'Binary representation of instructions',
      },
      stateReport: {
        success: 'Operation success status',
        report: 'Detailed text report of processor state',
      },
      error: {
        success: 'Operation success status',
        error: 'Error message',
        message: 'Additional error details',
      },
      healthCheck: {
        status: 'Service health status',
        service: 'Service name',
        timestamp: 'Current timestamp',
      },
    },
    endpoints: {
      health: {
        summary: 'Check service health',
        description: 'Returns the health status of the MIC-1 processor backend service',
        responses: {
          200: 'Service is healthy',
        },
      },
      session: {
        summary: 'Create a new processor session',
        description: 'Creates a new MIC-1 processor session and returns a unique session ID',
        responses: {
          200: 'Session created successfully',
        },
      },
      load: {
        summary: 'Load program into processor',
        description: 'Loads a MIC-1 assembly program into the processor for execution',
        responses: {
          200: 'Program loaded successfully',
          400: 'Invalid program or missing session ID',
        },
      },
      execute: {
        summary: 'Execute loaded program',
        description: 'Executes the loaded program either in step mode or continuous mode',
        responses: {
          200: 'Program executed successfully',
          400: 'Missing session ID or execution error',
        },
      },
      step: {
        summary: 'Execute single instruction',
        description: 'Executes a single instruction and returns the updated processor state',
        responses: {
          200: 'Instruction executed successfully',
          400: 'Missing session ID or execution error',
        },
      },
      continue: {
        summary: 'Continue execution',
        description: 'Continues program execution until completion or breakpoint',
        responses: {
          200: 'Execution continued successfully',
          400: 'Missing session ID or execution error',
        },
      },
      reset: {
        summary: 'Reset processor',
        description: 'Resets the processor to its initial state',
        responses: {
          200: 'Processor reset successfully',
          400: 'Missing session ID',
        },
      },
      getState: {
        summary: 'Get processor state',
        description: 'Returns the current state of the processor including registers and memory',
        responses: {
          200: 'State retrieved successfully',
          400: 'Missing session ID',
        },
      },
      getMemory: {
        summary: 'Get memory dump',
        description: 'Returns a dump of memory contents from the specified address range',
        responses: {
          200: 'Memory dump retrieved successfully',
          400: 'Missing session ID',
        },
      },
      getReport: {
        summary: 'Get state report',
        description: 'Returns a detailed text report of the processor state',
        responses: {
          200: 'State report retrieved successfully',
          400: 'Missing session ID',
        },
      },
      getHistory: {
        summary: 'Get execution history',
        description: 'Returns the execution history including all performed operations',
        responses: {
          200: 'History retrieved successfully',
          400: 'Missing session ID',
        },
      },
      setBreakpoint: {
        summary: 'Set a breakpoint',
        description: 'Sets a breakpoint at the specified line number',
        responses: {
          200: 'Breakpoint set successfully',
          400: 'Missing required parameters',
        },
      },
      removeBreakpoint: {
        summary: 'Remove a breakpoint',
        description: 'Removes a breakpoint from the specified line number',
        responses: {
          200: 'Breakpoint removed successfully',
          400: 'Missing required parameters',
        },
      },
      binary: {
        summary: 'Convert program to binary',
        description: 'Converts a MIC-1 assembly program to its binary representation',
        responses: {
          200: 'Program converted to binary successfully',
          400: 'Missing required parameters',
        },
      },
    },
  },
  pt: {
    info: {
      title: 'API Backend do Processador MIC-1',
      description: 'Uma API REST abrangente para simular a arquitetura do processador MIC-1',
      contact: {
        name: 'Suporte da API',
        email: 'suporte@mic1-simulator.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: {
      development: 'Servidor de desenvolvimento',
      production: 'Servidor de produção',
    },
    tags: {
      health: {
        name: 'Saúde',
        description: 'Endpoints de saúde do serviço',
      },
      session: {
        name: 'Gerenciamento de Sessão',
        description: 'Operações para gerenciar sessões do processador',
      },
      program: {
        name: 'Operações de Programa',
        description: 'Operações para analisar, carregar e executar programas',
      },
      execution: {
        name: 'Controle de Execução',
        description: 'Operações para controlar a execução do programa',
      },
      state: {
        name: 'Estado e Memória',
        description: 'Operações para visualizar o estado do processador e memória',
      },
      debugging: {
        name: 'Depuração',
        description: 'Operações para depurar programas',
      },
      utilities: {
        name: 'Utilitários',
        description: 'Operações utilitárias',
      },
    },
    schemas: {
      sessionResponse: {
        success: 'Indica se a operação foi bem-sucedida',
        sessionId: 'Identificador único da sessão',
        message: 'Mensagem de resposta legível',
      },
      registers: {
        PC: 'Contador de Programa',
        AC: 'Acumulador',
        SP: 'Ponteiro da Pilha',
        IR: 'Registrador de Instrução',
        TIR: 'Registrador Temporário de Instrução',
        MAR: 'Registrador de Endereço de Memória',
        MBR: 'Registrador de Buffer de Memória',
      },
      processorState: {
        registers: 'Registradores do processador',
        memory: 'Array de memória',
        stack: 'Array da pilha',
        running: 'Se o processador está em execução',
        cycleCount: 'Número de ciclos de execução',
        lastInstruction: 'Última instrução executada',
      },
      instruction: {
        opcode: 'Código da instrução MIC-1',
        operand: 'Operando da instrução (opcional)',
        address: 'Endereço de memória (opcional)',
      },
      breakpoint: {
        line: 'Número da linha para o breakpoint',
        enabled: 'Se o breakpoint está ativo',
      },
      debugInfo: {
        currentLine: 'Linha de execução atual',
        breakpoints: 'Lista de breakpoints ativos',
        stepMode: 'Se o modo passo está habilitado',
      },
      program: {
        instructions: 'Array de instruções assembly',
        data: 'Seção de dados opcional com pares endereço-valor',
      },
      executionResult: {
        success: 'Se a execução foi bem-sucedida',
        state: 'Estado atual do processador',
        error: 'Mensagem de erro se a execução falhou',
        output: 'Linhas de saída do programa',
        debugInfo: 'Informações de depuração',
      },
      memoryDump: {
        success: 'Status de sucesso da operação',
        startAddress: 'Endereço inicial da memória',
        memory: 'Valores da memória a partir do endereço inicial',
      },
      binaryResult: {
        success: 'Status de sucesso da operação',
        binary: 'Representação binária das instruções',
      },
      stateReport: {
        success: 'Status de sucesso da operação',
        report: 'Relatório detalhado do estado do processador',
      },
      error: {
        success: 'Status de sucesso da operação',
        error: 'Mensagem de erro',
        message: 'Detalhes adicionais do erro',
      },
      healthCheck: {
        status: 'Status de saúde do serviço',
        service: 'Nome do serviço',
        timestamp: 'Timestamp atual',
      },
    },
    endpoints: {
      health: {
        summary: 'Verificar saúde do serviço',
        description: 'Retorna o status de saúde do backend do processador MIC-1',
        responses: {
          200: 'Serviço está saudável',
        },
      },
      session: {
        summary: 'Criar nova sessão do processador',
        description: 'Cria uma nova sessão do processador MIC-1 e retorna um ID único',
        responses: {
          200: 'Sessão criada com sucesso',
        },
      },
      load: {
        summary: 'Carregar programa no processador',
        description: 'Carrega um programa assembly MIC-1 no processador para execução',
        responses: {
          200: 'Programa carregado com sucesso',
          400: 'Programa inválido ou ID da sessão ausente',
        },
      },
      execute: {
        summary: 'Executar programa carregado',
        description: 'Executa o programa carregado em modo passo ou modo contínuo',
        responses: {
          200: 'Programa executado com sucesso',
          400: 'ID da sessão ausente ou erro de execução',
        },
      },
      step: {
        summary: 'Executar instrução única',
        description: 'Executa uma única instrução e retorna o estado atualizado do processador',
        responses: {
          200: 'Instrução executada com sucesso',
          400: 'ID da sessão ausente ou erro de execução',
        },
      },
      continue: {
        summary: 'Continuar execução',
        description: 'Continua a execução do programa até conclusão ou breakpoint',
        responses: {
          200: 'Execução continuada com sucesso',
          400: 'ID da sessão ausente ou erro de execução',
        },
      },
      reset: {
        summary: 'Resetar processador',
        description: 'Reseta o processador para seu estado inicial',
        responses: {
          200: 'Processador resetado com sucesso',
          400: 'ID da sessão ausente',
        },
      },
      getState: {
        summary: 'Obter estado do processador',
        description: 'Retorna o estado atual do processador incluindo registradores e memória',
        responses: {
          200: 'Estado recuperado com sucesso',
          400: 'ID da sessão ausente',
        },
      },
      getMemory: {
        summary: 'Obter dump da memória',
        description: 'Retorna um dump do conteúdo da memória da faixa de endereços especificada',
        responses: {
          200: 'Dump da memória recuperado com sucesso',
          400: 'ID da sessão ausente',
        },
      },
      getReport: {
        summary: 'Obter relatório de estado',
        description: 'Retorna um relatório detalhado do estado do processador',
        responses: {
          200: 'Relatório de estado recuperado com sucesso',
          400: 'ID da sessão ausente',
        },
      },
      getHistory: {
        summary: 'Obter histórico de execução',
        description: 'Retorna o histórico de execução incluindo todas as operações realizadas',
        responses: {
          200: 'Histórico recuperado com sucesso',
          400: 'ID da sessão ausente',
        },
      },
      setBreakpoint: {
        summary: 'Definir breakpoint',
        description: 'Define um breakpoint no número da linha especificado',
        responses: {
          200: 'Breakpoint definido com sucesso',
          400: 'Parâmetros obrigatórios ausentes',
        },
      },
      removeBreakpoint: {
        summary: 'Remover breakpoint',
        description: 'Remove um breakpoint do número da linha especificado',
        responses: {
          200: 'Breakpoint removido com sucesso',
          400: 'Parâmetros obrigatórios ausentes',
        },
      },
      binary: {
        summary: 'Converter programa para binário',
        description: 'Converte um programa assembly MIC-1 para sua representação binária',
        responses: {
          200: 'Programa convertido para binário com sucesso',
          400: 'Parâmetros obrigatórios ausentes',
        },
      },
    },
  },
} as const;

export type Language = 'en' | 'pt';
export type Translation = typeof swaggerTranslations.en; 