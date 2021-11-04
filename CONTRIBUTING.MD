# Environment setup

## Prerequisites:

- `ts-node`
```
npm install -g ts-node
```

## Installing dependencies:
```
npm install
```
## Static Analysis tooling

By default, code are ran though `eslint` and `prettier` before being committed.

To run static analysis manually, use `npm script` defined in `package.json`

```
  npm run lint

  npm run prettier
```

## Execution

```
ts-node src/index.ts 
  -i Sherlock\ Holmes\ Selected\ Stories\ / 
  -r 
  -e 
  -s src/styles/retro.css
```

## Using config file:

```
ts-node .\src\index.ts 
  --config .\src\config.json
```