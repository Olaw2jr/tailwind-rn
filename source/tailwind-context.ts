import {createContext} from 'react';
import {RNStyle as Style} from './types.js';

const TailwindContext = createContext((_classNames: string): Style => ({}));

export default TailwindContext;
