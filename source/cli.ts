#!/usr/bin/env node
import * as fs from 'fs';
import * as chokidar from 'chokidar';
import { execSync } from 'child_process';
import meow from 'meow';
import buildTailwind from './build.js';

const cli = meow(`
	Usage
	  $ tailwind-rn [options]

	Options
	  -i, --input    Path to CSS file (default: tailwind.css)
	  -o, --output   Output file (.json or .ts) (default: tailwind.json)
	  -w, --watch    Watch for changes
`, {
	importMeta: import.meta,
	flags: {
		input: { type: 'string', alias: 'i', default: 'tailwind.css' },
		output: { type: 'string', alias: 'o', default: 'tailwind.json' },
		watch: { type: 'boolean', alias: 'w' }
	}
});

const {input, output, watch} = cli.flags;

const checkTailwindVersion = () => {
	try {
		const version = execSync('npx tailwindcss --version', { encoding: 'utf8' });
		if (!version.includes('4.')) {
			console.error(`Error: tailwind-rn v5 requires Tailwind CSS v4. Found: ${version.trim()}`);
			process.exit(1);
		}
	} catch {
		console.warn('Warning: Could not verify Tailwind CSS version. Ensure tailwindcss v4 is installed.');
	}
};

const build = () => {
	try {
		const source = fs.readFileSync(input, 'utf8');
		const utilities = buildTailwind(source);

		if (output.endsWith('.ts')) {
			const classNames = Object.keys(utilities.utilities);
			const typeDef = `export type TailwindClass = ${classNames.map(c => `'${c}'`).join(' | ') || 'string'};

`;
			const content = `${typeDef}const utilities = ${JSON.stringify(utilities, null, '\t')} as const;
export default utilities;`;
			fs.writeFileSync(output, content);
		} else {
			fs.writeFileSync(output, JSON.stringify(utilities, null, '\t'));
		}
		console.log(`Successfully built ${output}`);
	} catch (error: any) {
		console.error('Build failed:', error.message);
	}
};

checkTailwindVersion();

if (watch) {
	console.log(`Watching ${input}...`);
	chokidar.watch(input).on('change', build);
} else {
	build();
}
