import React, { useRef } from 'react';

import { IAudioContext, IGainNode } from 'standardized-audio-context';
import { audioContext } from '../audio';
import { useModuleState } from '../hooks/use-module-state';

import { IModule, IModuleState } from '../state/types/module';

const gainStateFromNode = (
	node: IGainNode<IAudioContext>
): IModuleState['GAIN'] => ({
	gain: node.gain.value
});

const initGain = (
	gainRef: React.MutableRefObject<IGainNode<IAudioContext> | undefined>,
	state?: IModuleState['GAIN']
) => {
	gainRef.current = audioContext.createGain();
	if (state) {
		gainRef.current.gain.setValueAtTime(state.gain, audioContext.currentTime);
		return state;
	} else {
		return gainStateFromNode(gainRef.current);
	}
};

export const GainModule: React.FC<{ module: IModule<'GAIN'> }> = ({
	module
}) => {
	const gainRef = useRef<IGainNode<IAudioContext>>();
	const [state] = useModuleState<'GAIN'>(
		() => initGain(gainRef, module.state),
		module.moduleKey
	);

	const enabled = state != undefined;

	return enabled ? <p>enabled</p> : <p>loading...</p>;
};
