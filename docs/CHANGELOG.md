# CHANGELOG

## ## 1.0.3-beta + [UPDATES] - 2025 XXX
- Removed per-command --strict flags.
- Added --strict as global option, to enable parsing in strict mode.
- Added -q, --quiet as global option, to reduce output (show only errors).
- Added --silent as global option, will suppress all output (even errors, exit code only).
- **CI/Tooling: Added security and quality checks** in GitHub Actions:
  - **Security:** CodeQL, Dependency Security (Audit) + lockfile-lint, Gitleaks (SARIF), Semgrep (SARIF).
  - CLI test.
  - Releases: npm publish with provenance (tag-driven).

## 1.0.3-beta - 2025 Sep
- **Updated:** Now uses latest `yini-parser` library `v1.1.0-beta`, for greatly improved parsing, compatibility, and error handling with more descriptive and accurate error messages.

## 1.0.2-beta - 2025 Aug
- Bumped internal YINI Parser library to version 1.0.2-beta, which fixes and improves number parsing to fully support negative values and edge cases for integers, floats, hexadecimal, binary, octal, duodecimal, and exponential numbers.
- Added this file into the repo.
