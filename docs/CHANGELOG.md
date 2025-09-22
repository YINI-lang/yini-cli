# CHANGELOG

## ## 1.1.0-beta - 2025 Sep
- **New command:** New command `validate` to validate parsing of a YINI file.
- Added --strict as global option, to enable parsing in strict mode.
- Added -q, --quiet as global option, to reduce output (show only errors).
- Added --silent as global option, will suppress all output (even errors, exit code only).
- **CI/Tooling (GitHub Actions):** Added security and quality checks:
  - **Security:** CodeQL, dependency checke (`npm audit`) + lockfile-lint, Gitleaks (SARIF), Semgrep (SARIF).
  - CI CLI test.
  - **Regression tests:** run across a Node/OS matrix.
  - **Releases:** npm publish with provenance (tag-driven).
- Removed per-command --strict flags.

## 1.0.3-beta - 2025 Sep
- **Updated:** Now uses latest `yini-parser` library `v1.1.0-beta`, for greatly improved parsing, compatibility, and error handling with more descriptive and accurate error messages.

## 1.0.2-beta - 2025 Aug
- Bumped internal YINI Parser library to version 1.0.2-beta, which fixes and improves number parsing to fully support negative values and edge cases for integers, floats, hexadecimal, binary, octal, duodecimal, and exponential numbers.
- Added this file into the repo.
