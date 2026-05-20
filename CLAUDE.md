# CLAUDE.md

## General Principles

- Follow DRY (Don't Repeat Yourself)
- Apply SOLID principles where appropriate
- Prefer simplicity over cleverness
- Avoid overengineering
- Prefer composition over inheritance
- Keep implementations minimal and focused

---

## Code Quality

- Write self-documenting code
- Use descriptive names for variables, functions, and classes
- Prioritize readability over brevity
- Keep functions small and single-purpose
- Avoid hidden side effects
- Prefer explicit logic over magic abstractions

---

## Architecture

- Maintain clear separation of concerns
- Keep business logic separate from UI and infrastructure
- Avoid tight coupling between modules
- Favor modular and composable designs
- Reuse existing utilities before creating new abstractions

---

## Performance

- Avoid unnecessary re-renders and recomputations
- Avoid premature optimization
- Optimize only when measurable or clearly necessary
- Load only required data
- Prefer efficient algorithms and data structures when complexity matters

---

## Validation & Safety

- Validate all external input
- Never trust client-side data
- Handle errors explicitly
- Fail loudly rather than silently
- Do not ignore async errors or rejected promises
- Avoid unsafe type assertions and implicit assumptions

---

## Maintainability

- Remove dead code and unused imports
- Do not leave commented-out code
- Keep diffs minimal and focused
- Do not refactor unrelated code
- Preserve existing project structure and conventions unless improvement is necessary

---

## Commit Hygiene

- Write small focused commits
- Use clear and descriptive commit messages
- Prefer conventional commits when applicable
- Keep each commit logically isolated
- Avoid mixing refactoring with feature work

---

## Working Style

- Explain the implementation approach briefly before coding
- Ask before making breaking changes
- Prefer incremental changes over large rewrites
- Do not invent APIs, libraries, or framework features
- If uncertain, state assumptions clearly

---

## Testing

- Write testable code
- Cover business-critical logic with tests
- Test behavior rather than implementation details
- Avoid brittle tests tightly coupled to internal implementation

---

## TypeScript Rules (if applicable)

- Use strict typing
- Avoid `any`
- Prefer explicit types for public APIs
- Prefer immutable patterns where practical
- Keep types simple and maintainable

---

## Final Rule

- Leave the codebase cleaner than you found it
