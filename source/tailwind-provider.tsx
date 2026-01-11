import React, {useMemo} from 'react';
import {useColorScheme, useWindowDimensions, Platform, I18nManager} from 'react-native';
import {useAccessibilityInfo, useDeviceOrientation} from '@react-native-community/hooks';
import TailwindContext from './tailwind-context.js';
import create from './create.js';
import {Utilities} from './types.js';

interface Props {
	utilities: Utilities;
	colorScheme?: 'light' | 'dark';
	children: React.ReactNode;
}

const TailwindProvider: React.FC<Props> = ({ utilities, colorScheme: overrideColorScheme, children }) => {
	const systemColorScheme = useColorScheme() ?? 'light';
	const {width, height} = useWindowDimensions();
	const {reduceMotionEnabled: reduceMotion} = useAccessibilityInfo();
	
	const deviceOrientation = useDeviceOrientation();
	const orientation = (typeof deviceOrientation === 'string' ? deviceOrientation : (deviceOrientation as any).portrait ? 'portrait' : 'landscape') as 'portrait' | 'landscape';

	const tailwind = useMemo(() => create(utilities, {
		platform: Platform.OS as any,
		isRTL: I18nManager.isRTL,
		colorScheme: overrideColorScheme ?? systemColorScheme,
		width,
		height,
		reduceMotion: Boolean(reduceMotion),
		orientation
	}), [utilities, systemColorScheme, overrideColorScheme, width, height, reduceMotion, orientation]);

	return (
		<TailwindContext.Provider value={tailwind}>
			{children}
		</TailwindContext.Provider>
	);
};

export default TailwindProvider;