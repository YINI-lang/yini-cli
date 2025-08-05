# Maintainer-Doc.md

## Making/Publishing a New Release on GitHub

1. **First:**
   - Make sure all tests pass by running:
        ```bash
        npm run ci:test
        ```
   - Test `npm publish --dry-run` locally before going to the publish step.

2. **Make a Release on GitHub**
   - Go to **Releases** tab in the repo (`yini-cli`, https://github.com/YINI-lang/yini-cli).
   - Click **"Draft a new release"**, write new tag, version, etc.
   - Click Publish release.

3. **Done!**  
   The package should now be published to the NPM Registry ([www.npmjs.com](https://www.npmjs.com/))

### Test the Published Package

1. **Check if got Published**  
   See if the release was published to npm at all:
   ```
   npm show yini-cli versions
   ```

2. **Install it globally from npm**  
   Install latest version globally:
   ```
   npm install -g yini-cli
   ```

3. **Verify correct/latest Version**  
   Run this in your terminal:
   ```bash
   yini -v
   ```
   Should print the latest version just released (e.g., `1.0.1`).

   Then try printing help:
   ```bash
   yini -h
   ```
   Should show the CLI help for YINI.

4. **Check command-specific help and parsing**  
   Then you may try printing **help for parse**:
   ```bash
   yini help parse
   ```
   This should print the CLI help for the command parse.

   Then try **parsing some yini file**, e.g.:
   ```bash
   yini parse sample.yini
   ```
   This should print the result as a JS object.

   Try **parsing and outputting as pretty JSON**, e.g.:
   ```bash
   yini parse sample.yini --pretty
   ```
   This should print the result as pretty-printed JSON.

   And so on, test the other command, and their options, etc...

5. OPTIONAL: **Check on another machine or in Docker**  
   To simulate a fresh environment:
   ```bash
   docker run -it node:20-alpine sh
   ```

   Then inside Docker:
   ```bash
   npm install -g yini-cli
   yini -h
   ```

6. **Uninstall when Done**  
   Clean up after::
   ```bash
   npm uninstall -g yini-cli
   ```
