import React, { useEffect, useRef } from 'react';

import { keyCodeMovementMap } from '../constants/key';
import { useDispatchContext } from '../hooks/use-dispatch-context';
import { useStateContext } from '../hooks/use-state-context';
import { actions } from '../state/actions';

export const KeyHandler: React.FC = () => {
	const { selectedModuleKeys } = useStateContext();
	const dispatch = useDispatchContext();

	const { current: onKeyDown } = useRef((e: KeyboardEvent) => {
		if (e.keyCode in keyCodeMovementMap && selectedModuleKeys.size > 0) {
			e.preventDefault();
		}

		dispatch(actions.keyDownAction(e.keyCode));
	});

	const { current: onKeyUp } = useRef((e: KeyboardEvent) => {
		dispatch(actions.keyUpAction(e.keyCode));
	});

	useEffect(() => {
		document.body.addEventListener('keydown', onKeyDown, false);
		document.body.addEventListener('keyup', onKeyUp, false);

		return () => {
			document.body.removeEventListener('keydown', onKeyDown, false);
			document.body.removeEventListener('keyup', onKeyUp, false);
		};
	}, []);

	return null;
};
