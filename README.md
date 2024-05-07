# TypeSentinel 🫡

Check for existing type aliases starting from their values.

## Why?

I was working on a project and while i was going through the code i was seeing a lot of duplicated types declaration so i took this opportunity to learn more about Typescript APIs

## What does it do?

Say you have

```ts
// file1.ts
type NullableString = string | null
```

```ts
// file2.ts
type AnotherNullableString = string | null
```

TypeSentinel will tell you that you already have one or multiple type alias(es) with that exact same values, returning:

- the name of the type alias that you already have
- the usage count (how many times was that type alias used in your project)

<img width="585" alt="Screenshot 2024-05-07 at 22 22 03" src="https://github.com/thomscoder/TypeSentinel/assets/78874117/4777ba2f-3e3e-48d1-968f-4dbb08cdedfc">

TypeSentinel currently supports

-  Types aliases with the same name

<img width="648" alt="Screenshot 2024-05-07 at 22 23 52" src="https://github.com/thomscoder/TypeSentinel/assets/78874117/c8482356-e306-4e4d-9914-ed7a443414be">

- Searching types with generics

<img width="561" alt="Screenshot 2024-05-07 at 22 26 45" src="https://github.com/thomscoder/TypeSentinel/assets/78874117/9b89198d-5f2e-41e1-a948-3e9dbaccad20">

- Interfaces declarations

By default it skips the `node_modules` folder, but you can customize it with a `config.json`

```json
{
  "skip": ["node_modules", "sentinel.ts", "index.ts"],
  "collectTypes": true
}
```

in the same path of your `process.cwd()`.

## HOW TO RUN IT

### Fast way

```bash
npm link && typesentinel
```

### Development

```bash
pnpm tsc
```

1. Make it executable

```bash
pnpm makex
````

2. Add Shebang to ./build/index.js 

```javascript
#!/usr/bin/env node

// rest of the file
```

3. Link

```bash
npm link
```

4. Run it
```bash
typesentinel
```