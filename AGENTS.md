# AGENTS.md

## Build, Lint, and Test Commands
- **Start dev server:** `npm run dev`
- **Build for production:** `npm run build`
- **Lint codebase:** `npm run lint`
- **Preview production build:** `npm run preview`
- **Testing:** _No test framework or scripts are currently configured._

## Code Style Guidelines
- **Imports:**
  - Group external modules first, then internal files.
  - Use single quotes for strings and import paths.
  - Include file extensions for local imports (e.g., `import X from './X.jsx'`).
- **Formatting:**
  - 2 spaces per indent, no semicolons, no trailing commas.
  - Place JSX props on new lines for readability if multiline.
- **Naming:**
  - camelCase for variables and functions.
  - PascalCase for React components.
- **Types:**
  - JavaScript only (no TypeScript). Use PropTypes if needed (not currently used).
- **Error Handling:**
  - Use try/catch for async operations. Log errors with `console.error`.
- **General:**
  - Use functional components and React hooks.
  - Keep components small and focused.

_No Cursor or Copilot rules detected._
