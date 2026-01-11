# Migrate to tailwind-rn (v5.0 - Tailwind v4 Support)

This version is a major cleanup and optimization for **Tailwind CSS v4**.

## 1. Tailwind Configuration
Tailwind v4 moves configuration into CSS. You can now delete your `tailwind.config.js`.

**Before:**
```js
// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,ts,jsx,tsx}"],
  theme: { extend: { colors: { brand: '#3b82f6' } } },
  corePlugins: require('tailwind-rn/unsupported-core-plugins')
}
```

**After:**
Move your theme values into your CSS entry point:
```css
/* input.css */
@import "tailwindcss";

@theme {
  --color-brand: #3b82f6;
}
```

## 2. API Changes
The `tailwind` function returned by `useTailwind` now accepts an optional second argument for state.

**Update your components:**
```tsx
// Before
<View style={tailwind('bg-blue-500')} />

// After (with new state support)
<Pressable>
  {({ pressed }) => (
    <View style={tailwind('bg-blue-500 active:bg-blue-700', { active: pressed })} />
  )}
</Pressable>
```

## 3. CLI Output & Type Safety
We recommend switching your CLI output from `.json` to `.ts` to get full type safety and autocomplete.

**Update your scripts:**
```diff
- "build:rn": "tailwind-rn -i tailwind.css -o tailwind.json"
+ "build:rn": "tailwind-rn -i tailwind.css -o tailwind.ts"
```

## 4. ESM Requirement
`tailwind-rn` v5 is now a native ES Module. If you are using a CommonJS environment, ensure your build tool (like Metro) is configured to handle ESM dependencies. Most modern React Native versions (0.72+) handle this out of the box.

## 5. CSS Variables & calc()
The library now supports native `calc()` resolution and global CSS variables. Ensure your variables are defined in `:root` or `@theme` blocks.
