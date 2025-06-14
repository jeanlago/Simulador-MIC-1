// Example TypeScript client for MIC-1 Backend API
// This demonstrates how to interact with the API programmatically

interface SessionResponse {
  success: boolean;
  sessionId: string;
  message: string;
}

interface ParseResponse {
  success: boolean;
  errors: string[];
  program?: {
    instructions: string[];
    data?: { [address: number]: number };
  };
}

interface ExecutionResponse {
  success: boolean;
  state: {
    registers: {
      PC: number;
      AC: number;
      SP: number;
      IR: number;
      TIR: number;
      MAR: number;
      MBR: number;
    };
    memory: number[];
    stack: number[];
    running: boolean;
    cycleCount: number;
  };
  error?: string;
}

class MIC1Client {
  private baseUrl: string;
  private sessionId: string | null = null;

  constructor(baseUrl: string = 'http://localhost:3000/api/mic1') {
    this.baseUrl = baseUrl;
  }

  async createSession(): Promise<string> {
    const response = await fetch(`${this.baseUrl}/session`, {
      method: 'POST',
    });
    const data: SessionResponse = await response.json();
    
    if (!data.success) {
      throw new Error('Failed to create session');
    }
    
    this.sessionId = data.sessionId;
    return data.sessionId;
  }

  async parseProgram(program: string): Promise<ParseResponse> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        program,
      }),
    });

    return await response.json();
  }

  async loadProgram(instructions: string[], data?: { [address: number]: number }): Promise<any> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/load`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        program: { instructions, data },
      }),
    });

    return await response.json();
  }

  async execute(stepMode: boolean = false): Promise<ExecutionResponse> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
        stepMode,
      }),
    });

    return await response.json();
  }

  async step(): Promise<ExecutionResponse> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/step`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: this.sessionId,
      }),
    });

    return await response.json();
  }

  async getState(): Promise<any> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/state/${this.sessionId}`);
    return await response.json();
  }

  async getStateReport(): Promise<string> {
    if (!this.sessionId) {
      throw new Error('No active session');
    }

    const response = await fetch(`${this.baseUrl}/report/${this.sessionId}`);
    const data = await response.json();
    return data.report;
  }
}

// Example usage
async function runExample() {
  const client = new MIC1Client();

  try {
    // Create a new session
    console.log('Creating session...');
    const sessionId = await client.createSession();
    console.log(`Session created: ${sessionId}`);

    // Define a simple program
    const program = `
LOCO 10
STOD 100
LOCO 5
ADDD 100
STOD 101
    `.trim();

    // Parse the program
    console.log('\nParsing program...');
    const parseResult = await client.parseProgram(program);
    if (!parseResult.success) {
      console.error('Parse errors:', parseResult.errors);
      return;
    }
    console.log('Program parsed successfully');

    // Load the program
    console.log('\nLoading program...');
    await client.loadProgram(parseResult.program!.instructions);
    console.log('Program loaded');

    // Execute the program
    console.log('\nExecuting program...');
    const executionResult = await client.execute();
    
    if (executionResult.success) {
      console.log('Program executed successfully');
      console.log(`Final AC value: ${executionResult.state.registers.AC}`);
      console.log(`Cycles executed: ${executionResult.state.cycleCount}`);
    } else {
      console.error('Execution error:', executionResult.error);
    }

    // Get the state report
    console.log('\nState Report:');
    const report = await client.getStateReport();
    console.log(report);

  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExample();
} 