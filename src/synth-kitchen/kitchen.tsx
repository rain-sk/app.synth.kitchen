import React, { useReducer } from 'react';
import { ResizableCanvas } from './components/resizable-canvas';
import { KeyHandler } from './components/key-handler';
import { ModuleCanvas } from './components/module-canvas';
import { reducer } from './state';
import { initialState } from './state/types/state';
import { Toolbar } from './components/toolbar';
import { StateContext } from './contexts/state';
import { DispatchContext } from './contexts/dispatch';

export const Kitchen: React.FC = () => {
	const [state, dispatch] = useReducer(reducer, initialState);

	return (
		<StateContext.Provider value={state}>
			<DispatchContext.Provider value={dispatch}>
				<Toolbar />
				<ResizableCanvas drawOnTop={false}>
					<KeyHandler />
					<ModuleCanvas modules={state.modules} />
				</ResizableCanvas>
			</DispatchContext.Provider>
		</StateContext.Provider>
	);
};
