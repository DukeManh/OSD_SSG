# Environment setup

## Installing dependencies:

```
npm install
```

## Execution:

### Option 1: Run with ts-node

Compile source code and execute the program directly with `ts-node`

```
npx ts-node src/index.ts -i assets/text
```

### Option 2: Build once, run multiple times with `node`

Compile source code to JavaScript to `/lib` and execute JS with `node`

```
npm run build

node lib/src/index.js -i assets/text
```

## Command line options:

**Options**:

```
  -i, --input       File or folder to be parsed              [string] [required]
  -o, --output      Output folder for generated files[string] [default: "build"]
  -r, --recursive   Recursively parsed files          [boolean] [default: false]
  -e, --relative    Maintain relative folder of files [boolean] [default: false]
  -s, --stylesheet  Custom stylesheet [string] [default: "src/styles/index.css"]
  -l, --lang        HTML language code               [string] [default: "en-CA"]
  -h, --help        Show help                                          [boolean]
  -v, --version     Show version number                                [boolean]
```

**Example**: To parse files from `assets/text` recursively and maintain relative path of generated files, run:

```
  npx ts-node src/index.ts -i assets/text -r
```

## Code linter and formatter

By default, code are ran though `eslint` and `prettier` before being committed.

To run static analysis tool manually,run:

```
  npm run lint

  npm run prettier
```

## Testing

Tests are also run before committing

Run all tests:

```
  npm run test
```

Run a single test:

```
  npm run test <name>
```

Generate code coverage report:

```
  npm run coverage
```

Run tests in watch mode

```
  npm run test:watch
```
