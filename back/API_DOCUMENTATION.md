# MIC-1 Processor Backend API Documentation

This document provides comprehensive documentation for the MIC-1 Processor Backend REST API, which simulates the MIC-1 processor architecture.

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Interactive API Documentation](#interactive-api-documentation)
- [Authentication](#authentication)
- [API Endpoints](#api-endpoints)
- [Data Models](#data-models)
- [Error Handling](#error-handling)
- [Examples](#examples)
- [Development](#development)

## Overview

The MIC-1 Processor Backend API provides a comprehensive REST interface for simulating the MIC-1 processor architecture. The API supports:

- **Session Management**: Create and manage processor sessions
- **Program Operations**: Parse, load, and execute MIC-1 assembly programs
- **Execution Control**: Step-by-step execution, continue, and reset operations
- **State Inspection**: View processor state, memory, and detailed reports
- **Debugging**: Set and remove breakpoints, step-through debugging
- **Utilities**: Binary conversion and other utility operations

### Key Features

- ✅ **Session-based Architecture**: Multiple isolated processor instances
- ✅ **Real-time Execution Control**: Step, continue, and reset operations
- ✅ **Comprehensive State Inspection**: View registers, memory, and stack
- ✅ **Advanced Debugging**: Breakpoints and step-through debugging
- ✅ **Program Validation**: Syntax checking and error reporting
- ✅ **Binary Utilities**: Convert assembly to binary representation

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- TypeScript
- Yarn or npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd mic1-simulator/back

# Install dependencies
yarn install

# Start the development server
yarn dev
```

The server will start on `http://localhost:3000` by default.

### Quick Start

1. **Check Health**: `GET /health`
2. **Create Session**: `POST /api/mic1/session`
3. **Load Program**: `POST /api/mic1/load`
4. **Execute Program**: `POST /api/mic1/execute`

## Interactive API Documentation

Once the server is running, you can access the interactive Swagger documentation at:

- **Swagger UI**: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)
- **OpenAPI JSON**: [http://localhost:3000/api-docs.json](http://localhost:3000/api-docs.json)

The Swagger UI provides:
- Complete API endpoint documentation
- Interactive request testing
- Response examples
- Schema definitions
- Authentication information

## Authentication

Currently, the API does not require authentication. All endpoints are publicly accessible.

## API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/health` | Service health status |

### Session Management

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/mic1/session` | Create new processor session |

### Program Operations

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/mic1/parse` | Parse and validate program |
| POST   | `/api/mic1/load` | Load program into processor |
| POST   | `/api/mic1/execute` | Execute loaded program |

### Execution Control

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/mic1/step` | Execute single instruction |
| POST   | `/api/mic1/continue` | Continue execution |
| POST   | `/api/mic1/reset` | Reset processor state |

### State and Memory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/api/mic1/state/{sessionId}` | Get processor state |
| GET    | `/api/mic1/memory/{sessionId}` | Get memory dump |
| GET    | `/api/mic1/report/{sessionId}` | Get detailed state report |

### Debugging

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/mic1/breakpoint/set` | Set breakpoint |
| POST   | `/api/mic1/breakpoint/remove` | Remove breakpoint |

### Utilities

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST   | `/api/mic1/binary` | Convert program to binary |

## Data Models

### Core Types

#### ProcessorState
```typescript
{
  registers: Registers;
  memory: number[];
  stack: number[];
  running: boolean;
  cycleCount: number;
  lastInstruction?: MIC1Instruction;
}
```

#### Registers
```typescript
{
  PC: number;    // Program Counter
  AC: number;    // Accumulator
  SP: number;    // Stack Pointer
  IR: number;    // Instruction Register
  TIR: number;   // Temporary Instruction Register
  MAR: number;   // Memory Address Register
  MBR: number;   // Memory Buffer Register
}
```

#### MIC1Instruction
```typescript
{
  opcode: string;     // Instruction opcode
  operand?: number;   // Optional operand
  address?: number;   // Optional address
}
```

### MIC-1 Instruction Set

The API supports all standard MIC-1 instructions:

| Instruction | Description | Example |
|-------------|-------------|---------|
| `LODD`      | Load Direct | `LODD 100` |
| `STOD`      | Store Direct | `STOD 100` |
| `ADDD`      | Add Direct | `ADDD 100` |
| `SUBD`      | Subtract Direct | `SUBD 100` |
| `JPOS`      | Jump if Positive | `JPOS 50` |
| `JZER`      | Jump if Zero | `JZER 50` |
| `JUMP`      | Unconditional Jump | `JUMP 50` |
| `LOCO`      | Load Constant | `LOCO 10` |
| `LODL`      | Load Local | `LODL 2` |
| `STOL`      | Store Local | `STOL 2` |
| `ADDL`      | Add Local | `ADDL 2` |
| `SUBL`      | Subtract Local | `SUBL 2` |
| `JNEG`      | Jump if Negative | `JNEG 50` |
| `JNZE`      | Jump if Not Zero | `JNZE 50` |
| `CALL`      | Call Subroutine | `CALL 200` |
| `PSHI`      | Push Indirect | `PSHI` |
| `POPI`      | Pop Indirect | `POPI` |
| `PUSH`      | Push | `PUSH` |
| `POP`       | Pop | `POP` |
| `RETN`      | Return | `RETN` |
| `SWAP`      | Swap | `SWAP` |
| `INSP`      | Increment SP | `INSP` |
| `DESP`      | Decrement SP | `DESP` |

## Error Handling

All API responses follow a consistent error format:

```json
{
  "success": false,
  "error": "Error message",
  "message": "Additional details"
}
```

### Common HTTP Status Codes

- `200 OK`: Request successful
- `400 Bad Request`: Invalid request parameters
- `404 Not Found`: Endpoint not found
- `500 Internal Server Error`: Server error

## Examples

### Complete Workflow Example

```bash
# 1. Create a new session
curl -X POST http://localhost:3000/api/mic1/session
# Response: {"success": true, "sessionId": "abc123", "message": "..."}

# 2. Parse a program
curl -X POST http://localhost:3000/api/mic1/parse \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "program": ["LOCO 10", "STOD 100", "HALT"]
  }'

# 3. Load the program
curl -X POST http://localhost:3000/api/mic1/load \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "program": {
      "instructions": ["LOCO 10", "STOD 100", "HALT"]
    }
  }'

# 4. Execute the program
curl -X POST http://localhost:3000/api/mic1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "stepMode": false
  }'

# 5. Get processor state
curl http://localhost:3000/api/mic1/state/abc123

# 6. Get memory dump
curl "http://localhost:3000/api/mic1/memory/abc123?startAddress=0&length=16"
```

### Step-by-Step Debugging Example

```bash
# Set a breakpoint
curl -X POST http://localhost:3000/api/mic1/breakpoint/set \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "line": 2
  }'

# Execute until breakpoint
curl -X POST http://localhost:3000/api/mic1/execute \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123",
    "stepMode": true
  }'

# Step through instructions
curl -X POST http://localhost:3000/api/mic1/step \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123"
  }'

# Continue execution
curl -X POST http://localhost:3000/api/mic1/continue \
  -H "Content-Type: application/json" \
  -d '{
    "sessionId": "abc123"
  }'
```

### Program Examples

#### Simple Addition Program
```assembly
LOCO 5      // Load constant 5 into AC
STOD 100    // Store AC to memory address 100
LOCO 3      // Load constant 3 into AC
ADDD 100    // Add value at memory address 100 to AC
STOD 101    // Store result to memory address 101
HALT        // Stop execution
```

#### Loop Example
```assembly
LOCO 0      // Initialize counter
STOD 200    // Store counter
LOCO 10     // Load limit
STOD 201    // Store limit
LODL 200    // Load counter
SUBD 201    // Subtract limit
JNEG 7      // Jump if negative (continue loop)
HALT        // Stop if counter >= limit
LODL 200    // Load counter
LOCO 1      // Load increment
ADDD 200    // Add to counter
STOD 200    // Store updated counter
JUMP 4      // Jump back to loop condition
```

## Development

### Running Tests

```bash
# Run the test suite
yarn test

# Run with watch mode
yarn test:watch
```

### Building for Production

```bash
# Build TypeScript
yarn build

# Start production server
yarn start
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment mode |

### Contributing

1. Fork the repository
2. Create a feature branch
3. Implement your changes
4. Add tests
5. Update documentation
6. Submit a pull request

### API Versioning

The API follows semantic versioning. The current version is `v1.0.0`.

Future versions will maintain backward compatibility where possible.

## Support

For issues, questions, or contributions:
- Create an issue in the repository
- Contact the development team
- Check the interactive documentation at `/api-docs`

---

**Last Updated**: December 2024  
**API Version**: 1.0.0  
**OpenAPI Version**: 3.0.0 