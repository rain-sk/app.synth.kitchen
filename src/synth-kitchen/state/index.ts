import React from 'react';
import { IAction } from './actions';
import { reducers } from './reducers';
import { IState } from './types/state';

export const reducer: React.Reducer<IState, IAction> = (state, action) =>
	(() => {
		switch (action.type) {
			case 'DragModules': {
				return reducers.dragModules(state, action);
			}
			case 'KeyboardEvent': {
				return reducers.keyboardEvent(state, action);
			}
			case 'LoadPatch': {
				return reducers.loadPatch(state, action);
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
