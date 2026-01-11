import {useContext} from 'react';
import TailwindContext from './tailwind-context.js';

const useTailwind = () => {
	return useContext(TailwindContext);
};

export default useTailwind;
