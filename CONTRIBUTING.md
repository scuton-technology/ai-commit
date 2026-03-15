# Contributing to ai-commit

Thanks for your interest in contributing!

## Development Setup

```sh
git clone https://github.com/scuton-technology/ai-commit.git
cd ai-commit
npm install
npm run dev
```

## Running Tests

```sh
npm test
```

## Commit Messages

We use [Conventional Commits](https://www.conventionalcommits.org/). You can use `aic` itself to generate commit messages for your contributions!

## Pull Requests

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit with conventional commit format
6. Push and open a PR

## Adding a New Provider

1. Create `src/providers/your-provider.ts` implementing `AIProvider`
2. Add the provider to `src/core/generate.ts`
3. Add tests
4. Update README

## Code Style

- TypeScript strict mode
- No external dependencies for core functionality where possible
- Keep it simple
