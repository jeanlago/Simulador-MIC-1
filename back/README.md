# MIC-1 Processor Backend Service

A TypeScript-based backend service that simulates a MIC-1 (Microarchitecture 1) processor. This service provides a REST API for loading, executing, and debugging MIC-1 assembly programs.

## Features

- Complete MIC-1 instruction set implementation
- Session-based processor instances
- Step-by-step execution and debugging
- Breakpoint support
- Memory inspection
- Program validation and parsing
- Binary instruction encoding
- **Interactive API Documentation with Swagger UI**
- **Comprehensive OpenAPI 3.0 specification**

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- Yarn package manager

### Installation

```bash
# Install dependencies
yarn install

# Run in development mode
yarn dev

# Build for production
yarn build

# Run production build
yarn start
```

The server will start on port 3000 by default (configurable via `PORT` environment variable).

## API Documentation

### Interactive Documentation
Once the server is running, you can access the comprehensive API documentation at:

- **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **OpenAPI JSON**: [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)
- **Postman Collection**: Import `postman_collection.json` for ready-to-use API requests
- **Detailed API Guide**: See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete examples and workflows

### Quick API Test
```bash
# Check service health
curl http://localhost:3000/health

# Create a new processor session
curl -X POST http://localhost:3000/api/mic1/session

# Load and execute a simple program
curl -X POST http://localhost:3000/api/mic1/load \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "your-session-id",
    "program": {
      "instructions": ["LOCO 10", "STOD 100", "HALT"]
    }
  }'
```

## MIC-1 Instruction Set

The processor supports the following instructions:

### Memory Operations
- `LODD <address>` - Load Direct: AC = Memory[address]
- `STOD <address>` - Store Direct: Memory[address] = AC
- `LODL <offset>` - Load Local: AC = Memory[SP + offset]
- `STOL <offset>` - Store Local: Memory[SP + offset] = AC
- `LOCO <value>` - Load Constant: AC = value

### Arithmetic Operations
- `ADDD <address>` - Add Direct: AC = AC + Memory[address]
- `SUBD <address>` - Subtract Direct: AC = AC - Memory[address]
- `ADDL <offset>` - Add Local: AC = AC + Memory[SP + offset]
- `SUBL <offset>` - Subtract Local: AC = AC - Memory[SP + offset]

### Control Flow
- `JUMP <address>` - Unconditional Jump: PC = address
- `JPOS <address>` - Jump if Positive: if (AC > 0) PC = address
- `JZER <address>` - Jump if Zero: if (AC == 0) PC = address
- `JNEG <address>` - Jump if Negative: if (AC < 0) PC = address
- `JNZE <address>` - Jump if Not Zero: if (AC != 0) PC = address
- `CALL <address>` - Call Subroutine: Push PC+1, PC = address
- `RETN` - Return from Subroutine: PC = Pop()

### Stack Operations
- `PUSH` - Push AC onto stack
- `POP` - Pop from stack into AC
- `SWAP` - Swap top two stack elements
- `INSP <value>` - Increment Stack Pointer: SP = SP + value
- `DESP <value>` - Decrement Stack Pointer: SP = SP - value

## API Endpoints

### Session Management

#### Create New Session
```http
POST /api/mic1/session
```
Response:
```json
{
  "success": true,
  "sessionId": "kn3x7a0.r5h8k9",
  "message": "New MIC-1 processor session created"
}
```

### Program Operations

#### Parse Program
```http
POST /api/mic1/parse
Content-Type: application/json

{
  "sessionId": "kn3x7a0.r5h8k9",
  "program": "LOCO 10\nSTOD 100\nLODD 100\nADDD 100"
}
```

#### Load Program
```http
POST /api/mic1/load
Content-Type: application/json

{
  "sessionId": "kn3x7a0.r5h8k9",
  "program": {
    "instructions": ["LOCO 10", "STOD 100", "LODD 100", "ADDD 100"],
    "data": {
      "200": 5,
      "201": 10
    }
  }
}
```

### Execution Control

#### Execute Program
```http
POST /api/mic1/execute
Content-Type: application/json

{
  "sessionId": "kn3x7a0.r5h8k9",
  "stepMode": false
}
```

#### Step Through One Instruction
```http
POST /api/mic1/step
Content-Type: application/json

{
  "sessionId": "kn3x7a0.r5h8k9"
}
```

#### Continue Execution
```http
POST /api/mic1/continue
Content-Type: application/json

{
  "sessionId": "kn3x7a0.r5h8k9"
}
```

#### Reset Processor
```http
POST /api/mic1/reset
Content-Type: application/json

{
  "sessionId": "kn3x7a0.r5h8k9"
}
```

### State and Memory

#### Get Processor State
```http
GET /api/mic1/state/{sessionId}
```

#### Get Memory Dump
```http
GET /api/mic1/memory/{sessionId}?startAddress=0&length=16
```

#### Get State Report
```http
GET /api/mic1/report/{sessionId}
```

### Debugging

#### Set Breakpoint
```http
POST /api/mic1/breakpoint/set
Content-Type: application/json

{
  "sessionId": "kn3x7a0.r5h8k9",
  "line": 3
}
```

#### Remove Breakpoint
```http
POST /api/mic1/breakpoint/remove
Content-Type: application/json

{
  "sessionId": "kn3x7a0.r5h8k9",
  "line": 3
}
```

### Utilities

#### Convert Program to Binary
```http
POST /api/mic1/binary
Content-Type: application/json

{
  "sessionId": "kn3x7a0.r5h8k9",
  "program": {
    "instructions": ["LOCO 10", "PUSH", "POP"]
  }
}
```

## Example Programs

### Simple Addition
```
# Load constant 10 into AC
LOCO 10
# Store AC at address 100
STOD 100
# Load from address 100 into AC
LODD 100
# Add value at address 100 to AC (AC = 10 + 10 = 20)
ADDD 100
```

### Loop Example
```
# Initialize counter
LOCO 5
STOD 200
# Loop start (address 2)
LODD 200
SUBD 201  # Subtract 1
STOD 200
JPOS 2    # Jump to address 2 if positive
# Data section
.data 201 1
```

### Stack Operations
```
LOCO 10
PUSH
LOCO 20
PUSH
POP       # AC = 20
POP       # AC = 10
```

### Subroutine Call
```
LOCO 5
CALL 10   # Call subroutine at address 10
JUMP 20   # Continue after return
# Subroutine at address 10
ADDD 100  # Add value at address 100
RETN      # Return to caller
```

## Response Format

All API responses follow this general format:

```json
{
  "success": true|false,
  "data": { ... },
  "error": "Error message if success is false"
}
```

Execution results include the processor state:

```json
{
  "success": true,
  "state": {
    "registers": {
      "PC": 4,
      "AC": 20,
      "SP": 4095,
      "IR": 0x2064,
      "TIR": 0,
      "MAR": 0,
      "MBR": 0
    },
    "memory": [...],
    "stack": [],
    "running": false,
    "cycleCount": 4,
    "lastInstruction": {
      "opcode": "ADDD",
      "operand": 100
    }
  },
  "debugInfo": {
    "currentLine": 4,
    "breakpoints": [],
    "stepMode": false
  }
}
```

## Architecture Details

- **Memory Size**: 4096 words (12-bit addressing)
- **Stack**: Grows downward from address 4095
- **Word Size**: 16 bits
- **Registers**:
  - PC (Program Counter)
  - AC (Accumulator)
  - SP (Stack Pointer)
  - IR (Instruction Register)
  - TIR (Temporary Instruction Register)
  - MAR (Memory Address Register)
  - MBR (Memory Buffer Register)

## Session Management

- Each client creates a session to get an isolated processor instance
- Sessions are automatically cleaned up after 1 hour of inactivity
- Multiple programs can be loaded and executed within the same session

## Error Handling

The API returns appropriate HTTP status codes:
- `200` - Success
- `400` - Bad Request (missing parameters, invalid program)
- `404` - Not Found (invalid endpoint)
- `500` - Internal Server Error

Error responses include descriptive messages to help with debugging.

## Development

The project structure:
```
src/
├── api/
│   ├── controllers/    # Request handlers
│   └── routes/         # Route definitions
├── mic1/
│   ├── processor.ts    # Core processor implementation
│   └── mic1Service.ts  # Service layer
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── index.ts           # Server entry point
```

## License

MIT 