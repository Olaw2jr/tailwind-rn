# tailwind-rn

> Use [Tailwind CSS v4](https://tailwindcss.com) in [React Native](https://reactnative.dev) projects

![](header.jpg)

**tailwind-rn** is optimized for Tailwind CSS v4. It parses your CSS directly, extracts theme variables, and provides a high-performance runtime for React Native.

- **Tailwind v4 Ready**: CSS-first configuration, no `tailwind.config.js` required.
- **Type Safe**: Generates TypeScript union types for all your classes.
- **High Performance**: Built-in caching and optimized style merging.
- **Modern Features**: Support for `gap`, `aspect-ratio`, `calc()`, and Viewport Units.

---

## Install

```bash
$ npm install tailwind-rn
```

## Getting Started

### 1. Set up Tailwind v4

Install Tailwind CSS v4 and the `tailwind-rn` CLI:

```bash
$ npm install --save-dev @tailwindcss/cli tailwind-rn
```

### 2. Create your CSS entry point

Create an `input.css` file. In v4, you only need to import Tailwind:

```css
/* input.css */
@import "tailwindcss";

/* Optional: Add your custom theme variables here */
@theme {
  --color-brand: #3b82f6;
}
```

### 3. Add Build Scripts

Update your `package.json` to include the build pipeline:

```json
{
  "scripts": {
    "build:tailwind": "tailwindcss -i input.css -o tailwind.css && tailwind-rn -i tailwind.css -o tailwind.ts",
    "dev:tailwind": "concurrently \"tailwindcss -i input.css -o tailwind.css --watch\" \"tailwind-rn -i tailwind.css -o tailwind.ts --watch\""
  }
}
```
*Note: Using `.ts` for output enables full type safety and autocomplete.*

### 4. Wrap your App

Import `TailwindProvider` and the generated utilities at the root of your app:

```tsx
import {TailwindProvider} from 'tailwind-rn';
import utilities from './tailwind.ts';

const App = () => (
	<TailwindProvider utilities={utilities}>
		<MyComponent />
	</TailwindProvider>
);
```

### 5. Use Tailwind!

```tsx
import {useTailwind} from 'tailwind-rn';

const MyComponent = () => {
	const tailwind = useTailwind();

	return (
		<View style={tailwind('flex-1 items-center justify-center bg-white')}>
			<Text style={tailwind('text-brand font-bold text-xl')}>
				Hello Tailwind v4!
			</Text>
		</View>
	);
};
```

## Advanced Features

### State Modifiers
Use `hover:`, `active:`, and `focus:` by passing a state object to the `tailwind` function. Perfect for `Pressable`:

```tsx
<Pressable>
  {({ pressed }) => (
    <View style={tailwind('bg-blue-500 active:bg-blue-700', { active: pressed })} />
  )}
</Pressable>
```

### Platform & Direction Modifiers
Apply styles conditionally based on the platform or writing direction:

```tsx
// Platform-specific
tailwind('ios:mt-4 android:mt-2 web:mt-0');

// Directional (RTL/LTR)
tailwind('rtl:ml-4 ltr:mr-4');
```

### Viewport Units
Use responsive viewport units that update automatically on device rotation:

```tsx
tailwind('w-[50vw] h-[20vh] min-h-[10vmin]');
```

### Type Safety
When you output to a `.ts` file, `tailwind-rn` generates a union type of all available class names. This provides autocomplete and prevents typos:

```tsx
import { TailwindClass } from './tailwind';

// TypeScript will error if 'bg-invalid' doesn't exist in your CSS
tailwind('bg-blue-500'); 
```

## CLI

```
$ tailwind-rn --help

  Options
    -i, --input    Path to CSS file (default: tailwind.css)
    -o, --output   Output file (.json or .ts) (default: tailwind.json)
    -w, --watch    Watch for changes
```

## Supported Modifiers

- **Responsive**: `sm:`, `md:`, `lg:`, `xl:`, `2xl:`
- **State**: `hover:`, `active:`, `focus:`
- **Platform**: `ios:`, `android:`, `web:`, `macos:`, `windows:`
- **Direction**: `rtl:`, `ltr:`
- **Media**: `dark:`, `motion-safe:`, `motion-reduce:`, `portrait:`, `landscape:`

---

[Migrating from v4.2?](migrate.md)
