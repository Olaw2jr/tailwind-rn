import * as colorString from 'color-string';
import { RNStyle, Environment, RNTransform } from '../types.js';

class StyleEvaluator {
	constructor(private readonly environment: Environment) {}

	public evaluate(style: Record<string, any>): RNStyle {
		const resolvedStyle: Record<string, any> = {};

		for (const [key, value] of Object.entries(style)) {
			if (key.startsWith('--')) continue;

			let resolvedValue = value;

			if (typeof value === 'string') {
				resolvedValue = this.resolveVariables(value, style);
				resolvedValue = this.resolveCalculations(resolvedValue);
				resolvedValue = this.resolveViewportUnits(resolvedValue);
				resolvedValue = this.resolvePercentages(resolvedValue);
				resolvedValue = this.resolveNumericStrings(resolvedValue);
				resolvedValue = this.resolveColors(resolvedValue);
			}

			resolvedStyle[key] = resolvedValue;
		}

		return this.applyNativeTranslations(resolvedStyle);
	}

	private resolveVariables(value: string, style: Record<string, any>): string {
		return value.replace(/var\((--[a-zA-Z0-9-]+)\)/g, (_, name: string) => {
			return style[name] || name;
		});
	}

	private resolveCalculations(value: string): string {
		if (!value.includes('calc(')) return value;
		return value.replace(/calc\(([^)]+)\)/g, (_, expr: string) => {
			try {
				const cleanedExpr = expr.replace(/(-?\d+(\.\d+)?)rem/g, (__, val) => String(parseFloat(val) * 16))
					.replace(/px/g, '')
					.trim();
				return String(new Function(`return ${cleanedExpr}`)());
			} catch {
				return _;
			}
		});
	}

	private resolveViewportUnits(value: string): string {
		return value.replace(/(-?\d+(\.\d+)?)(vw|vh|vmin|vmax)/g, (_: string, num: string, __: string, unit: string) => {
			const val = parseFloat(num);
			switch (unit) {
				case 'vw': return String((val * this.environment.width) / 100);
				case 'vh': return String((val * this.environment.height) / 100);
				case 'vmin': return String((val * Math.min(this.environment.width, this.environment.height)) / 100);
				case 'vmax': return String((val * Math.max(this.environment.width, this.environment.height)) / 100);
				default: return _;
			}
		});
	}

	private resolvePercentages(value: string): string | number {
		if (value.endsWith('%') && !value.includes(' ')) {
			const val = parseFloat(value);
			return isNaN(val) ? value : val / 100;
		}
		return value;
	}

	private resolveNumericStrings(value: string): string | number {
		if (/^-?\d+(\.\d+)?$/.test(value)) {
			return parseFloat(value);
		}
		return value;
	}

	private resolveColors(value: string | number): string | number {
		if (typeof value === 'string' && (value.startsWith('rgb(') || value.startsWith('rgba('))) {
			const color = colorString.get.rgb(value);
			if (color) {
				return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${color[3]})`;
			}
		}
		return value;
	}

	private applyNativeTranslations(style: Record<string, any>): RNStyle {
		const nativeStyle: any = { ...style };

		// Shadow Translation
		if (typeof style['boxShadow'] === 'string') {
			const shadows = style['boxShadow'].split(/,(?![^(]*\))/);
			const activeShadow = shadows.find((s: string) => (s.match(/-?\d+/g) || []).map(Number).some(n => n !== 0)) || shadows[0] || '';
			const parts = activeShadow.trim().split(/\s+/);
			const nums = parts.filter(p => p.match(/^-?\d+/)).map(p => parseInt(p, 10));
			const color = parts.find(p => p.includes('rgb') || p.includes('#'));

			if (nums.length >= 2) {
				nativeStyle['shadowOffset'] = { width: nums[0] || 0, height: nums[1] || 0 };
				nativeStyle['shadowRadius'] = nums[2] || 0;
				nativeStyle['shadowOpacity'] = 1;
				nativeStyle['shadowColor'] = color || 'black';
				nativeStyle['elevation'] = Math.abs(nums[1] || 0) * 2;
			}
			delete nativeStyle['boxShadow'];
		}

		// Transform Translation
		const transformProps = ['rotate', 'scale', 'scaleX', 'scaleY', 'translateX', 'translateY', 'skewX', 'skewY'];
		const transforms: RNTransform[] = [];

		for (const prop of transformProps) {
			if (style[prop] !== undefined) {
				let val = style[prop];
				
				// Handle Tailwind v4 scale: "110% 110%"
				if (prop === 'scale' && typeof val === 'string' && val.includes('%')) {
					const parts = val.trim().split(/\s+/);
					val = parseFloat(parts[0] || '0') / 100;
				}

				if (prop === 'rotate' && typeof val === 'number') val = `${val}deg`;
				
				transforms.push({ [prop]: val });
				delete nativeStyle[prop];
			}
		}

		if (transforms.length > 0) {
			nativeStyle['transform'] = [...(nativeStyle['transform'] as any[] || []), ...transforms];
		}

		return nativeStyle as RNStyle;
	}
}

export default StyleEvaluator;