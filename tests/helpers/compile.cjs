const fs = require('fs');
const execa = require('execa');
const tempy = require('tempy');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../../');
// Use relative path from dist for require in CJS
const build = require('../../dist/build.js').default;
const create = require('../../dist/create.js').default;

const tailwindPath = path.resolve(projectRoot, 'node_modules/.bin/tailwindcss');

const compile = async (cssSource, media = {}) => {
	const contentFile = tempy.file({extension: 'js'});
	fs.writeFileSync(contentFile, `
		const classes = [
			'text-blue-500', 'bg-blue-100', 'bg-blue-500', 'bg-blue-600', 'bg-blue-700',
			'mt-4', 'mt-2', 'ml-4', 'mr-4', 'flex-1', 'shadow-lg', 'rotate-45', 'scale-110'
		];
	`);

	const inputName = `test-input-${Math.random().toString(36).slice(2)}.css`;
	const input = path.resolve(projectRoot, inputName);
	
	const fullCss = cssSource.includes('@import') || cssSource.includes('@theme') 
		? cssSource 
		: `@import "tailwindcss";\n${cssSource}`;
	
	fs.writeFileSync(input, fullCss);

	const output = tempy.file({extension: 'css'});

	try {
		await execa(tailwindPath, [
			'-i', input,
			'-o', output,
			'--content', contentFile
		], {
			cwd: projectRoot
		});
	} finally {
		if (fs.existsSync(input)) fs.unlinkSync(input);
		if (fs.existsSync(contentFile)) fs.unlinkSync(contentFile);
	}

	const env = {
		platform: 'ios',
		isRTL: false,
		orientation: 'portrait',
		colorScheme: 'light',
		reduceMotion: false,
		width: 375,
		height: 812,
		...media
	};

	const source = fs.readFileSync(output, 'utf8');
	const utilities = build(source);
	const tailwind = create(utilities, env);

	return {
		tailwind,
		utilities
	};
};

module.exports = compile;
