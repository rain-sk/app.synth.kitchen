import React, { useRef } from 'react';

import { NoiseNode } from '../audio/nodes/noise';

import { useModuleState } from '../hooks/use-module-state';
import { IModule, IModuleState } from '../state/types/module';

const initNoise = (
	noiseRef: React.MutableRefObject<NoiseNode | undefined>,
	state?: IModuleState['NOISE']
) => {
	noiseRef.current = new NoiseNode();
	if (state) {
		return state;
	} else {
		return {};
	}
};

export const NoiseModule: React.FC<{ module: IModule<'NOISE'> }> = ({
	module
}) => {
	const noiseRef = useRef<NoiseNode>();
	const [state] = useModuleState<'NOISE'>(
		() => initNoise(noiseRef, module.state),
		module.moduleKey
	);

	const enabled = state != undefined && noiseRef.current;

	return enabled ? <p>enabled</p> : <p>loading...</p>;
};
