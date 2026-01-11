const test = require('ava');
const compile = require('./helpers/compile.cjs');

test('get styles for multiple classes', async t => {
	const {tailwind} = await compile('');
	
	// Tailwind v4 uses colors as variables
	const result = tailwind('text-blue-500 bg-blue-100');
	t.truthy(result.color);
	t.truthy(result.backgroundColor);
});

test('platform-specific styles', async t => {
	const {tailwind: iosTailwind} = await compile('', {platform: 'ios'});
	const {tailwind: androidTailwind} = await compile('', {platform: 'android'});

	const classNames = 'ios:mt-4 android:mt-2';
	
	t.deepEqual(iosTailwind(classNames), {marginTop: 16});
	t.deepEqual(androidTailwind(classNames), {marginTop: 8});
});

test('RTL/LTR support', async t => {
	const {tailwind: rtlTailwind} = await compile('', {isRTL: true});
	const {tailwind: ltrTailwind} = await compile('', {isRTL: false});

	const classNames = 'rtl:ml-4 ltr:mr-4';
	
	t.deepEqual(rtlTailwind(classNames), {marginLeft: 16});
	t.deepEqual(ltrTailwind(classNames), {marginRight: 16});
});

test('viewport units', async t => {
	const {tailwind} = await compile('', {width: 1000, height: 2000});

	t.deepEqual(tailwind('w-[50vw]'), {width: 500});
	t.deepEqual(tailwind('h-[10vh]'), {height: 200});
	t.deepEqual(tailwind('min-w-[10vmin]'), {minWidth: 100});
	t.deepEqual(tailwind('max-h-[10vmax]'), {maxHeight: 200});
});

test('state modifiers', async t => {
	const {tailwind} = await compile('');

	const classNames = 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700';
	
	// Base style
	const base = tailwind(classNames);
	
	// Hover state
	const hover = tailwind(classNames, {hovered: true});
	t.not(base.backgroundColor, hover.backgroundColor);
	
	// Active state
	const active = tailwind(classNames, {active: true});
	t.not(base.backgroundColor, active.backgroundColor);
});

test('box-shadow translation', async t => {
	const {tailwind} = await compile('');

	const result = tailwind('shadow-lg');
	t.truthy(result.shadowOffset);
	t.truthy(result.shadowRadius);
	t.truthy(result.shadowColor);
	t.truthy(result.elevation);
});

test('complex transforms', async t => {
	const {tailwind} = await compile('');

	const result = tailwind('rotate-45 scale-110');
	t.true(Array.isArray(result.transform));
	t.deepEqual(result.transform[0], {rotate: '45deg'});
	t.deepEqual(result.transform[1], {scale: 1.1});
});

test('caching', async t => {
	const {tailwind} = await compile('');
	
	const firstCall = tailwind('flex-1');
	const secondCall = tailwind('flex-1');
	
	t.is(firstCall, secondCall); // Should be the same object reference
});