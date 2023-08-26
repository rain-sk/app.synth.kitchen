import React, { useCallback, useRef } from 'react';

import { ClockNode } from '../../audio/nodes/clock';

import { useModuleState } from '../../hooks/use-module-state';
import { IModule, IModuleState } from '../../state/types/module';
import { IoConnectors } from '../io-connectors';
import { NumberParameter } from '../number-parameter';
import { audioContext } from '../../audio';

const clockStateFromNode = (clock: ClockNode): IModuleState['CLOCK'] => ({
	tempo: clock.tempo.value
});

const initClock = (
	clockRef: React.MutableRefObject<ClockNode | undefined>,
	state?: IModuleState['CLOCK']
) => {
	clockRef.current = new ClockNode();
	if (state) {
		return state;
	} else {
		return clockStateFromNode(clockRef.current);
	}
};

export const ClockModule: React.FC<{ module: IModule<'CLOCK'> }> = ({
	module
}) => {
	const clockRef = useRef<ClockNode>();
	const [state, setState] = useModuleState<'CLOCK'>(
		() => initClock(clockRef, module.state) as any,
		module.moduleKey
	);

	const commitTempoChange = useCallback(
		(tempo: number) => {
			clockRef.current?.tempo.linearRampToValueAtTime(
				tempo,
				audioContext.currentTime
			);
			setState({
				...state,
				tempo
			});
		},
		[audioContext, state]
	);

	const enabled = state != undefined && clockRef.current;

	const tempoAccessor = useCallback(
		() => clockRef.current?.tempo as any,
		[enabled]
	);

	const inputAccessor = useCallback(
		() => clockRef.current?.node() as any,
		[enabled]
	);

	const outputAccessor = useCallback(
		() => clockRef.current?.node() as any,
		[enabled]
	);

	return enabled ? (
		<>
			<IoConnectors
				moduleKey={module.moduleKey}
				inputAccessors={[inputAccessor]}
				outputAccessors={[outputAccessor]}
			/>
			<section>
				<NumberParameter
					moduleKey={module.moduleKey}
					paramAccessor={tempoAccessor}
					name="tempo"
					value={state.tempo}
					commitValueCallback={commitTempoChange}
				/>
			</section>
		</>
	) : (
		<p>loading...</p>
	);
};
