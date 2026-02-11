# Documentation Structure

This directory contains all project documentation, organized by purpose for easy navigation.

## Directory Organization

### `/architecture`
System design and requirements documentation
- **Technical_Architecture_Document.md** - Overall system architecture and design decisions
- **UI_UX_Design_Document.md** - User interface and user experience design specifications
- **CFD_Trading_Platform_Requirements.md** - Business and functional requirements

### `/engine-specs`
Core engine specifications, contracts, and validation rules
- **ENGINE_INTERFACE.md** - Engine public API and interface contracts
- **ENGINE_INVARIANTS.md** - Core invariants that must always hold true
- **ENGINE_STATE_MAP.md** - State structure and state transitions
- **ENGINE_TEST_MATRIX.md** - Test coverage matrix and strategy
- **ENGINE_VALIDATION_ORDER.md** - Validation execution order and dependencies
- **SYSTEM_GUARANTEES.md** - System-level guarantees and behavior contracts
- **PROPERTY_BOUNDARIES.md** - Property and boundary constraints
- **DETERMINISTIC_REPLAY_CONTRACT.md** - Deterministic replay requirements
- **ENGINE_EXECUTION_CONTRACT.md** - Execution guarantees and semantics
- **option_i_engine_skeleton_zero_logic.txt** - Engine skeleton specification

### `/testing`
Test execution guides and results
- **GOLDEN_PATH_TEST_EXECUTION_GUIDE.md** - Golden path test execution instructions
- **ENGINE_GOLDEN_PATHS.md** - Golden path test scenarios and specifications
- **ENGINE_GOLDEN_PATH_CONSISTENCY.md** - Golden path consistency requirements
- **GOLDEN_PATH_TEST_RESULTS.md** - Golden path test execution results

### `/deliverables`
Project option completions and status reports
- **OPTION_S_DELIVERABLES_INDEX.md** - Index of Option S deliverables
- **OPTION_S_COMPLETION_REPORT.md** - Option S completion status
- **OPTION_S_VISUAL_SUMMARY.md** - Visual summary of Option S
- **TEST_EXECUTION_REPORT_OPTION_S.md** - Test execution results for Option S
- **OPTION_J_STATUS.md** - Option J implementation status
- **OPTION_K_STATUS.md** - Option K implementation status

## Architecture Overview

```
cfd/
├── README.md                    # Project entry point
├── docs/                        # Documentation (this directory)
│   ├── architecture/            # System design & requirements
│   ├── engine-specs/            # Engine specifications & contracts
│   ├── testing/                 # Test documentation & results
│   └── deliverables/            # Project deliverables & status
├── engine/                      # Core engine implementation
│   ├── domain/                  # Domain logic (calculations, invariants, priority)
│   ├── effects/                 # Side effects (audit, notifications, persistence)
│   ├── events/                  # Event definitions
│   ├── execution/               # Event execution handlers
│   ├── ports/                   # External interfaces (Clock, IdGenerator, PriceFeed)
│   ├── state/                   # State definitions
│   ├── tests/                   # Test suites
│   └── validation/              # Validation functions
└── Configuration files          # jest.config.js, package.json, tsconfig.json
```

## Quick Navigation

- **New to the project?** Start with [Technical_Architecture_Document.md](./architecture/Technical_Architecture_Document.md)
- **Want to understand the engine?** Read [ENGINE_INTERFACE.md](./engine-specs/ENGINE_INTERFACE.md) and [ENGINE_INVARIANTS.md](./engine-specs/ENGINE_INVARIANTS.md)
- **Setting up tests?** See [GOLDEN_PATH_TEST_EXECUTION_GUIDE.md](./testing/GOLDEN_PATH_TEST_EXECUTION_GUIDE.md)
- **Project status?** Check [OPTION_S_DELIVERABLES_INDEX.md](./deliverables/OPTION_S_DELIVERABLES_INDEX.md)

## Documentation Maintenance

When adding new documentation:
1. Determine the appropriate category (architecture, engine-specs, testing, or deliverables)
2. Place the file in the corresponding directory
3. Update the relevant section in this README
4. Keep filenames descriptive and consistent with existing naming conventions
