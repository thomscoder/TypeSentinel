// Type aliases and their usage count:
// Path: /Users/thomasalbertini/Desktop/typevision/example/example.tsx
// THelloWorld used 3 times
type THelloWorld = "hello world" | "ciao mondo"
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// CustomType<T> used 2 times
type CustomType<T> = {value: T}
// Path: /Users/thomasalbertini/Desktop/typevision/example/input2.ts
// THelloWorld used 2 times
type THelloWorld = "hello world" | "hola mundo"
// Path: /Users/thomasalbertini/Desktop/typevision/example/example.tsx
// ReactNode used 1 time
type ReactNode = {}
// Path: /Users/thomasalbertini/Desktop/typevision/example/example.tsx
// Props used 1 time
type Props = {
  children: ReactNode;
  height?: number;
  width?: number;
}
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// CustomInterface<T> used 1 time
type CustomInterface<T> = {age: T}
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// THelloWorld used 1 time
type THelloWorld = "hello world" | "ciao mondo"
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// StringOrNumber used 1 time
type StringOrNumber = string | number
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// Asofjaooidj used 0 times
type Asofjaooidj = string
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// Name used 0 times
type Name = string
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// Age used 0 times
type Age = number
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// ExtendedCustomType used 0 times
type ExtendedCustomType = CustomType<number>
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// ArrayOfObjects<T, U, K> used 0 times
type ArrayOfObjects<T, U, K> = {
  id: string;
  data: T[];
  nestedArray: T[][];
  callback: (arg: T) => void;
  mapCallback: <U>(callback: (arg: T) => U) => U[];
  complexType: Map<string, Set<T[]>>;
  nestedGenerics: Map<CustomType<number>, Set<Set<T>>>;
  genericUnion: T | number;
  conditionalTypes: T extends string ? string : number;
}
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// ExpandedTHelloWorld used 0 times
type ExpandedTHelloWorld = THelloWorld
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// ExtendedCustomInterface used 0 times
type ExtendedCustomInterface = CustomInterface<number>
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// IsEmployed used 0 times
type IsEmployed = boolean
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// Hobbies used 0 times
type Hobbies = string[]
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// Address used 0 times
type Address = {
  street: string;
  city: string;
  zipCode: string;
  personName: Asofjaooidj
}
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// GreetingGenerator used 0 times
type GreetingGenerator = (name: Name) => string
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// NumberDictionary used 0 times
type NumberDictionary = { [key: string]: number }
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// Validator used 0 times
type Validator = (input: StringOrNumber) => boolean
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// Coordinates used 0 times
type Coordinates = [number, number] & Asofjaooidj
// Path: /Users/thomasalbertini/Desktop/typevision/example/input.ts
// ColoredShape used 0 times
type ColoredShape = {
  color: string;
  size: number;
  presonName: Asofjaooidj
}
// Path: /Users/thomasalbertini/Desktop/typevision/example/nested/nestedInput.ts
// Extended used 0 times
type Extended = Asofjaooidj & THelloWorld
// Path: /Users/thomasalbertini/Desktop/typevision/example/nested/nestedInput.ts
// Lol used 0 times
type Lol = Asofjaooidj & THelloWorld