# CFD Trading Platform

A comprehensive Contracts for Difference (CFD) trading platform with a deterministic execution engine, built with TypeScript and tested with comprehensive golden path tests.

## Project Structure

```
cfd/
├── docs/                    # 📚 All project documentation (organized by category)
│   ├── architecture/        # System design & requirements
│   ├── engine-specs/        # Engine specifications & contracts
│   ├── testing/            # Test documentation & results
│   └── deliverables/       # Project deliverables & status
├── engine/                 # 🔧 Core engine implementation
│   ├── domain/            # Domain logic & calculations
│   ├── effects/           # Side effects management
│   ├── events/            # Event definitions
│   ├── execution/         # Event execution handlers
│   ├── ports/             # External interfaces
│   ├── state/             # State definitions
│   ├── tests/             # Test suites
│   └── validation/        # Validation logic
├── package.json           # Project dependencies & scripts
├── jest.config.js         # Test configuration
└── tsconfig.json          # TypeScript configuration
```

## Documentation

All project documentation has been organized into the `docs/` directory for better maintainability:

- **[Architecture](./docs/architecture/)** - System design, requirements, and UX specifications
- **[Engine Specs](./docs/engine-specs/)** - Core engine specifications, contracts, and invariants
- **[Testing](./docs/testing/)** - Golden path tests and test execution documentation
- **[Deliverables](./docs/deliverables/)** - Project options completion status and reports

Start with [docs/architecture/Technical_Architecture_Document.md](./docs/architecture/Technical_Architecture_Document.md) for an overview of the system.

## Getting Started

### Prerequisites
- Node.js (v16+)
- npm or yarn

### Installation
```bash
npm install
```

### Running Tests
```bash
npm test              # Run all tests
npm run test:watch   # Run tests in watch mode
```

## Engine Architecture

The platform features a deterministic execution engine with:
- **State Management** - Immutable state with clear state transitions
- **Event-Driven** - All platform changes driven through typed events
- **Invariant Validation** - Continuous validation of system invariants
- **Deterministic Execution** - Reproducible results with deterministic replay capability

For detailed architecture information, see [docs/architecture/](./docs/architecture/).

## Key Features

- 🔐 Position and account management
- 💰 Margin enforcement and risk management
- 📊 Real-time price updates
- ⚡ Stop-loss and take-profit orders
- 🎯 Account status management
- ✅ Comprehensive validation and invariant checking

## Development

### Architecture
- **Domain-Driven Design** - Clear separation of domain logic, events, and effects
- **Hexagonal Architecture** - Dependencies inverted through ports
- **Deterministic** - All calculations are deterministic and reproducible

### Adding Documentation
Place new documentation in the appropriate subdirectory under `docs/`:
- Architecture/requirements → `docs/architecture/`
- Engine specifications → `docs/engine-specs/`
- Testing & test results → `docs/testing/`
- Completion reports & status → `docs/deliverables/`

See [docs/README.md](./docs/README.md) for the full documentation structure and guidelines.

## Status

Current implementation status and deliverables can be found in [docs/deliverables/](./docs/deliverables/).