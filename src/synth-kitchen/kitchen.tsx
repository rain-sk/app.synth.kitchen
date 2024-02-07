import React, { useReducer } from 'react';
import { ModuleCanvasBackdrop } from './components/module-canvas-backdrop';
import { KeyHandler } from './components/key-handler';
import { ModuleCanvas } from './components/module-canvas';
import { reducer } from './state';
import { IState, initialState } from './state/types/state';
import { Toolbar } from './components/toolbar';
import { StateContext } from './contexts/state';
import { DispatchContext } from './contexts/dispatch';
import { ConnectionContextProvider } from './contexts/connection';
import { IAction } from './state/actions';
import { Connections } from './components/connections';
import { MidiContextProvider } from './contexts/midi';

const ContextWrapper: React.FC<
	React.PropsWithChildren<{ state: IState; dispatch: React.Dispatch<IAction> }>
> = ({ children, state, dispatch }) => {
	return (
		<StateContext.Provider value={state}>
			<DispatchContext.Provider value={dispatch}>
				<ConnectionContextProvider>
					<MidiContextProvider>{children}</MidiContextProvider>
				</ConnectionContextProvider>
			</DispatchContext.Provider>
		</StateContext.Provider>
	);
};

export const Kitchen: React.FC = () => {
	const [state, dispatch] = useReducer(reducer, initialState);

	return (
		<ContextWrapper state={state} dispatch={dispatch}>
			<Toolbar />
			<ModuleCanvasBackdrop drawOnTop={false}>
				<KeyHandler />
				<ModuleCanvas modules={state.modules} />
			</ModuleCanvasBackdrop>
			<Connections />
		</ContextWrapper>
	);
};
