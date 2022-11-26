import React, { useContext } from 'react';

import { IAction } from './actions';
import { reducers } from './reducers';
import { initialState, IState } from './types/state';

export const reducer = (state: IState, action: IAction) => {
	const newState = (() => {
		switch (action.type) {
			case 'KeyboardEvent': {
				return reducers.keyboardEvent(state, action);
			}
			case 'SelectionDrag': {
				return reducers.selectionDrag(state, action);
			}
			case 'SelectModule': {
				return reducers.selectModule(state, action);
			}
			case 'UpdateModulePosition': {
				return reducers.updateModulePosition(state, action);
			}
			case 'UpdateModuleState': {
				return reducers.updateModuleState(state, action);
			}
			default: {
				return state;
			}
		}
	})();
	return newState;
};

export const DispatchContext = React.createContext<React.Dispatch<IAction>>(
	() => {}
);

export const useDispatchContext = () => useContext(DispatchContext);

export const StateContext = React.createContext<IState>(initialState);

export const useStateContext = () => useContext(StateContext);
