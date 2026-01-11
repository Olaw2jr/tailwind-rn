import postcss, { Rule, AtRule } from 'postcss';
import cssToReactNativeModule from 'css-to-react-native';
import remToPx from './lib/rem-to-px.js';
import { Utilities, Utility } from './types.js';

const cssToReactNative = (cssToReactNativeModule as any).default || cssToReactNativeModule;

class StyleConverter {
	private camelCase(str: string): string {
		if (str.startsWith('--')) return str;
		return str.replace(/-([a-z])/g, (_, g) => (g ? g.toUpperCase() : ''));
	}

	public convertRule(rule: Rule): Utility['style'] {
		const properties: StyleTuple[] = [];
		const rawProperties: Record<string, string | number | string[]> = {};

		rule.walkDecls(decl => {
			const { prop: property, value } = decl;
			
			if (
				property === 'transform' || 
				property.startsWith('--') || 
				value.includes('calc(') || 
				value.includes('var(')
			) {
				rawProperties[this.camelCase(property)] = value;
				return;
			}

			if (typeof value === 'string' && value.endsWith('rem')) {
				properties.push([property, remToPx(value)]);
			} else {
				properties.push([property, value]);
			}
		});

		let style: Record<string, any> = {};
		try {
			if (properties.length > 0) {
				style = cssToReactNative(properties);
			}
		} catch {
			properties.forEach(([prop, val]) => {
				rawProperties[this.camelCase(prop)] = val;
			});
		}

		return { ...style, ...rawProperties };
	}
}

const build = (source: string): Utilities => {
	const root = postcss.parse(source);
	const converter = new StyleConverter();

	const utilities: Utilities = {
		utilities: {},
		variables: {}
	};

	root.walkRules(rule => {
		const selectors = rule.selectors;
		if (!selectors) return;

		// Extract global variables
		if (selectors.some(s => s === ':root' || s === ':host' || s === '*')) {
			rule.walkDecls(decl => {
				if (decl.prop.startsWith('--')) {
					utilities.variables[decl.prop] = decl.value;
				}
			});
			return;
		}

		const media = rule.parent?.type === 'atrule' && (rule.parent as AtRule).name === 'media' 
			? (rule.parent as AtRule).params 
			: undefined;

		for (const selector of selectors) {
			if (!selector.startsWith('.')) continue;
			const utilityName = selector.slice(1).replace(/\\/g, '');

			utilities.utilities[utilityName] = {
				style: converter.convertRule(rule),
				media
			};
		}
	});

	return utilities;
};

export default build;

type StyleTuple = [string, string];