import {ViewStyle, TextStyle, ImageStyle, ColorSchemeName} from 'react-native';

export type RNStyle = ViewStyle | TextStyle | ImageStyle;

export interface RNTransform {
	[key: string]: number | string;
}

export interface Utility {
	style: Record<string, string | number | string[]>;
	media?: string;
}

export interface Utilities {
	utilities: Record<string, Utility>;
	variables: Record<string, string>;
}

export interface Environment {
	platform: 'ios' | 'android' | 'web' | 'macos' | 'windows';
	isRTL: boolean;
	orientation: 'portrait' | 'landscape';
	colorScheme: ColorSchemeName;
	reduceMotion: boolean;
	width: number;
	height: number;
}

export interface TailwindState {
	hovered?: boolean;
	active?: boolean;
	focused?: boolean;
}

export type TailwindFunction = (classNames: string, state?: TailwindState) => RNStyle;
