# Contributing

- First things first: welcome!
- Feedback, bug reports, suggestions, or even a bit of roasting are all welcome.
- Feel free to open a [discussion](https://github.com/YINI-lang/yini-cli/discussions) or [issue](https://github.com/YINI-lang/yini-cli/issues).
- For project overview and details, see [Project-Setup](./project-setup.md).


---

## Intro
Even though `yini-cli` is in beta, your feedback, suggestions, and contributions are **highly valued**.

If you find any bugs, errors or other issues in the YINI parser, if something doesn't work as you expect, or you have other ideas—please make a new issue!

---

## Quick Development Start

1. Open the terminal in this project's root directory, then run:
   ```bash
   npm i
   ```
   This will install all needed dependencies.

2. To confirm it even runs:
   ```bash
   npm start
   ```
   This should show the help screen of the yini command.  

3. Quick try to parse some YINI file:
   ```bash
   npm run run:parse
   ```
   This will show the ouput of parsing a `sample.yini` file.  

   It will show something similar as to below:
   ```bash
   yini-cli>npm run run:parse

   {
     Service: {
       Enabled: true,
       Cache: {
         Type: 'redis',
         TTL: 3600,
         Options: { Host: '127.0.0.1', Port: 6379 }
       }
     },
     Env: { code: 'dev' }
   }
   ```

4. There are many more ready made scripts to run, see the `"scripts"` part in `package.json` in the root directory.

---

## Building & Running

For running the `yini` command directly while developing, follow these steps.

1. First, it must be build to include the latest changes.
   ```bash
   npm run build
   ```

2. Then run the command directly from `bin/` with node.  
   Simulate running: `yini help parse`:
   ```bash
   node ./bin/yini.js help parse
   ```
   Shows the help screen of the `parse` command.  

3. Simulate running: `yini -h`:
   ```bash
   node ./bin/yini.js -h
   ```
   This shows the main help screen for the command.

4. Simulate running: `parse sample.yini --pretty`:
   ```bash
   node ./bin/yini.js parse sample.yini --pretty
   ```
   This outputs the parsed file as prettyfied JSON.


For more detailed info, head over to the [Project-Setup](./project-setup.md).

---

## Submitting Changes

Of course, you are free to fork this repo and mess around with it. 😄  
Did you write a patch that fixes a bug, adds a new feature or implenting test cases in tests? Thank you!

- Open a pull request (PR) against the `main` branch (make sure all tests pass by running `npm run test`).
- Name the branch using one of the following prefixes:
  * `fix/`  for bug fixes.
  * `update/` for updates to docs or data.
  * `feature/` for new features.
  
  **Before submitting a PR, it's a good idea to create an issue to discuss your changes—so your PR is less likely to be wasted!** 🙂
