# Directory Organization Map

## Clean Architecture Overview

This project now follows a clean, organized directory structure with all documentation centralized and the engine implementation kept separate.

### Root Level
- **README.md** - Project entry point and quick start guide
- **package.json** - npm dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **jest.config.js** - Jest test configuration

### `/docs` - All Project Documentation
**Unified documentation hub organized by purpose:**

```
docs/
├── architecture/           Architecture & design specs
│   ├── CFD_Trading_Platform_Requirements.md
│   ├── Technical_Architecture_Document.md
│   └── UI_UX_Design_Document.md
│
├── engine-specs/          Engine specifications & contracts
│   ├── DETERMINISTIC_REPLAY_CONTRACT.md
│   ├── ENGINE_EXECUTION_CONTRACT.md
│   ├── ENGINE_INTERFACE.md
│   ├── ENGINE_INVARIANTS.md
│   ├── ENGINE_STATE_MAP.md
│   ├── ENGINE_TEST_MATRIX.md
│   ├── ENGINE_VALIDATION_ORDER.md
│   ├── PROPERTY_BOUNDARIES.md
│   ├── SYSTEM_GUARANTEES.md
│   └── option_i_engine_skeleton_zero_logic.txt
│
├── testing/               Test documentation & results
│   ├── ENGINE_GOLDEN_PATHS.md
│   ├── ENGINE_GOLDEN_PATH_CONSISTENCY.md
│   ├── GOLDEN_PATH_TEST_EXECUTION_GUIDE.md
│   └── GOLDEN_PATH_TEST_RESULTS.md
│
├── deliverables/          Project status & completion reports
│   ├── OPTION_J_STATUS.md
│   ├── OPTION_K_STATUS.md
│   ├── OPTION_S_COMPLETION_REPORT.md
│   ├── OPTION_S_DELIVERABLES_INDEX.md
│   ├── OPTION_S_VISUAL_SUMMARY.md
│   └── TEST_EXECUTION_REPORT_OPTION_S.md
│
└── README.md             Documentation structure guide
```

### `/engine` - Core Implementation
**Engine source code following clean architecture principles:**

```
engine/
├── domain/                Domain logic (calculations, invariants, rules)
│   ├── calculations/      P&L, margin, fees, rounding
│   ├── invariants/        Financial and risk assertions
│   └── priority/          Liquidation ordering
│
├── effects/               Side effect definitions
│   ├── audit.ts
│   ├── notifications.ts
│   └── persistence.ts
│
├── events/                Event type definitions
│   └── *.ts               (10+ event types)
│
├── execution/             Event execution orchestration
│   ├── closePosition.ts
│   ├── executeEvent.ts
│   ├── marginEnforcement.ts
│   ├── openPosition.ts
│   └── updatePrices.ts
│
├── ports/                 External interface contracts
│   ├── Clock.ts
│   ├── IdGenerator.ts
│   └── PriceFeed.ts
│
├── state/                 Immutable state definitions
│   ├── AccountState.ts
│   ├── EngineState.ts
│   ├── MarketState.ts
│   └── PositionState.ts
│
├── tests/                 Test specifications & mapping
│   ├── __tests__/         Executable test suites
│   ├── goldenPaths/       Golden path references
│   └── invariants/        Invariant enforcement mapping
│
├── validation/            Invariant validation layer
│   ├── validateAccount.ts
│   ├── validateEvent.ts
│   ├── validatePosition.ts
│   └── validateRisk.ts
│
├── index.ts              Main engine entry point
└── README.md             Engine architecture documentation
```

## Navigation Guide

### 📚 Looking for Documentation?
**Start in `/docs/`**
- System overview → `docs/architecture/Technical_Architecture_Document.md`
- Engine specs → `docs/engine-specs/`
- Test guidance → `docs/testing/GOLDEN_PATH_TEST_EXECUTION_GUIDE.md`
- Project status → `docs/deliverables/OPTION_S_DELIVERABLES_INDEX.md`

### 💻 Looking for Source Code?
**Go to `/engine/`**
- Business logic → `engine/domain/`
- Event processing → `engine/execution/`
- State management → `engine/state/`
- Validation rules → `engine/validation/`

### 🔗 Cross-References
- Engine source references specs in `docs/engine-specs/`
- Tests reference specs in `docs/testing/`
- Implementation references architecture in `docs/architecture/`

## Key Principles

✅ **Single Responsibility** - Each directory has one clear purpose  
✅ **Easy Navigation** - Intuitive organization by function, not by file type  
✅ **Documentation First** - All specs centralized in `/docs/`  
✅ **Clean Architecture** - Engine code separate and rule-based  
✅ **Maintainability** - New contributors can quickly understand structure  

## Adding Files

When adding new documentation:
- Feature/architecture docs → `docs/architecture/`
- Engine specifications → `docs/engine-specs/`
- Test docs → `docs/testing/`
- Status/reports → `docs/deliverables/`

When adding implementation code:
- Business logic → `engine/domain/`
- Event handlers → `engine/execution/`
- Validation → `engine/validation/`

Last updated: February 11, 2026
