# Contributing to Rackarr

Thank you for your interest in contributing to Rackarr!

## AI-Assisted Development

Rackarr is built using AI-assisted development workflows, primarily using [Claude Code](https://claude.com/claude-code) via [Happy](https://happy.engineering). This approach enables rapid iteration, comprehensive testing, and high code quality through AI-human collaboration.

### Working with the AI Workflow

- **Planning documents**: See `.claude/context/` for technical specifications, prompts, and roadmaps
- **AI-specific guidance**: Read `CLAUDE.md` for detailed instructions on using Claude Code with this project
- **Commit co-authoring**: Many commits include AI co-authorship attribution
- **Both approaches welcome**: You can contribute using traditional development or AI-assisted workflows

This is NOT an AI-exclusive project - human contributors are equally welcome! The AI tooling simply provides additional development capabilities and maintains consistency with the existing codebase architecture.

### When to Include AI Attribution

Follow these guidelines when using AI assistance in your contributions:

- ✅ **Include attribution** when AI generates substantial code:
  - Complete functions or classes
  - Entire features or components
  - The bulk of a commit's changes
  - Complex algorithms or logic

- ❌ **Skip attribution** for trivial AI assists:
  - Autocomplete suggestions
  - Code formatting
  - Variable name suggestions
  - Docstring generation
  - Minor syntax fixes

When attribution is appropriate, use the `Co-authored-by:` trailer in your commit message (see `CLAUDE.md` for the exact format).

## Development Setup

1. **Prerequisites**
   - Node.js 20 or later
   - npm 10 or later

2. **Clone and Install**

   ```bash
   git clone https://github.com/ggfevans/rackarr.git
   cd rackarr
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

## Development Workflow

### Code Style

This project uses automated code formatting and linting:

- **ESLint**: JavaScript/TypeScript linting
- **Prettier**: Code formatting
- **svelte-check**: Svelte-specific type checking

Pre-commit hooks automatically run linting and formatting on staged files.

```bash
# Run linting
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

# Type checking
npm run check
```

### Testing

We follow Test-Driven Development (TDD). Write tests first, then implement.

```bash
# Run unit tests in watch mode
npm run test

# Run unit tests once
npm run test:run

# Run E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage
```

### Svelte 5 Runes

This project uses Svelte 5 with runes. Use the new reactivity primitives:

```svelte
<script lang="ts">
	// State
	let count = $state(0);

	// Derived values
	let doubled = $derived(count * 2);

	// Side effects
	$effect(() => {
		console.log('Count changed:', count);
	});

	// Props
	interface Props {
		name: string;
	}
	let { name }: Props = $props();
</script>
```

Do NOT use Svelte 4 stores (`writable`, `readable`, `derived` from `svelte/store`).

## Pull Request Process

1. **Create a Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write tests first (TDD)
   - Implement the feature
   - Ensure all tests pass
   - Run linting and formatting

3. **Commit**
   - Use clear, descriptive commit messages
   - Follow conventional commits format when applicable
   - If using AI assistance, include co-author attribution (see `CLAUDE.md` for format)

4. **Push and Create PR**
   - Push your branch
   - Create a pull request with a clear description
   - Reference any related issues

## Project Structure

```
src/
├── lib/
│   ├── components/     # UI components
│   ├── stores/         # State management
│   ├── types/          # TypeScript types
│   ├── utils/          # Utility functions
│   └── data/           # Static data
├── tests/              # Test files
└── App.svelte          # Root component
```

## Questions?

Open an issue for questions, bug reports, or feature requests.
