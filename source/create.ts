import StyleEvaluator from './lib/style-evaluator.js';
import matchesMediaQuery from './lib/matches-media-query.js';
import addLetterSpacing from './lib/add-letter-spacing.js';
import { Utilities, Environment, TailwindState, RNStyle, TailwindFunction } from './types.js';

class TailwindRuntime {
	private readonly cache = new Map<string, RNStyle>();
	private readonly evaluator: StyleEvaluator;

	constructor(
		private readonly data: Utilities,
		private readonly environment: Environment
	) {
		this.evaluator = new StyleEvaluator(environment);
	}

	public create(): TailwindFunction {
		return (classNames: string, state?: TailwindState): RNStyle => {
			const cacheKey = `${classNames}_${JSON.stringify(state)}`;
			if (this.cache.has(cacheKey)) return this.cache.get(cacheKey)!;

			let style: Record<string, any> = {};
			if (!classNames) return style as RNStyle;

			const separateClassNames = classNames.replace(/\s+/g, ' ').trim().split(' ');

			for (const className of separateClassNames) {
				if (className.startsWith('tracking-')) continue;

				const targetClass = this.resolveClass(className, state);
				if (!targetClass) continue;

				const utility = this.data.utilities[targetClass];
				if (!utility) continue;

				if (!utility.media || matchesMediaQuery(utility.media, this.environment)) {
					style = this.mergeStyles(style, utility.style);
				}
			}

			addLetterSpacing(this.data, style, classNames);

			const result = this.evaluator.evaluate({ ...this.data.variables, ...style });
			this.cache.set(cacheKey, result);
			return result;
		};
	}

	private resolveClass(className: string, state?: TailwindState): string | null {
		const platformPrefixes = ['ios:', 'android:', 'web:', 'macos:', 'windows:'];
		const directionPrefixes = ['rtl:', 'ltr:'];
		const statePrefixes = ['hover:', 'active:', 'focus:'];
		const allPrefixes = [...platformPrefixes, ...directionPrefixes, ...statePrefixes];

		if (!allPrefixes.some(p => className.startsWith(p))) return className;

		if (className.startsWith(`${this.environment.platform}:`)) {
			return className.replace(`${this.environment.platform}:`, '');
		}
		if (className.startsWith('rtl:') && this.environment.isRTL) {
			return className.replace('rtl:', '');
		}
		if (className.startsWith('ltr:') && !this.environment.isRTL) {
			return className.replace('ltr:', '');
		}
		if (className.startsWith('hover:') && state?.hovered) {
			return className.replace('hover:', '');
		}
		if (className.startsWith('active:') && state?.active) {
			return className.replace('active:', '');
		}
		if (className.startsWith('focus:') && state?.focused) {
			return className.replace('focus:', '');
		}

		return null;
	}

	private mergeStyles(base: Record<string, any>, extra: Record<string, any>): Record<string, any> {
		const result = { ...base };
		for (const [key, value] of Object.entries(extra)) {
			if (key === 'fontVariant' && Array.isArray(value)) {
				result[key] = [...(result[key] as string[] || []), ...value];
			} else {
				result[key] = value;
			}
		}
		return result;
	}
}

const create = (data: Utilities, environment: Environment): TailwindFunction => {
	return new TailwindRuntime(data, environment).create();
};

export default create;
