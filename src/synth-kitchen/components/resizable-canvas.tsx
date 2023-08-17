import React, {
	MouseEvent as ReactMouseEvent,
	useCallback,
	useEffect,
	useRef,
	useState
} from 'react';
import { queueAnimation } from '../animation';
import { useDispatchContext } from '../hooks/use-dispatch-context';
import { useEffectOnce } from '../hooks/use-effect-once';
import { useStateContext } from '../hooks/use-state-context';

import { actions } from '../state/actions';
import { INVALID_POSITION } from '../state/types/state';

const positionFromMouseEvent = (
	e: MouseEvent,
	scrollableElement: HTMLElement
): [number, number] => [
	e.clientX + scrollableElement.scrollLeft,
	e.clientY + scrollableElement.scrollTop
];

const state = {
	initialized: false,
	container: undefined as HTMLElement | undefined,
	selection: {
		element: undefined as HTMLDivElement | undefined,
		start: INVALID_POSITION,
		end: INVALID_POSITION
	},
	spacer: undefined as HTMLDivElement | undefined
};

export const ResizableCanvas: React.FC<{
	drawOnTop: boolean;
	children: React.ReactNode;
}> = ({ children }) => {
	useEffectOnce(() => {
		if (state.initialized) {
			console.error('oh no!');
			throw 'oh no!';
		} else {
			state.initialized = true;
		}
	});

	const { modules } = useStateContext();
	const dispatch = useDispatchContext();

	const [initialized, setInitialized] = useState(false);

	const canvasWasResized = useRef(false);

	const { current: drawSelection } = useRef(() => {
		if (state.selection.element) {
			if (state.selection.start.join(',') === INVALID_POSITION.join(',')) {
				state.selection.element.style.display = 'none';
			} else {
				const xStart = state.selection.start[0];
				const xEnd = state.selection.end[0];
				const yStart = state.selection.start[1];
				const yEnd = state.selection.end[1];

				state.selection.element.style.display = 'block';
				state.selection.element.style.left = `${Math.min(xStart, xEnd)}px`;
				state.selection.element.style.top = `calc(${Math.min(
					yStart,
					yEnd
				)}px - 2.5rem)`;
				state.selection.element.style.width = `${Math.abs(xEnd - xStart)}px`;
				state.selection.element.style.height = `${Math.abs(yEnd - yStart)}px`;
			}
		}
	});

	const { current: clearSelection } = useRef(() => {
		state.selection.start = INVALID_POSITION;
		state.selection.end = INVALID_POSITION;

		drawSelection();
	});

	const isInitialized = () =>
		!!state.container && !!state.selection && !!state.spacer;

	const onResize = useCallback(() => {
		queueAnimation(() => {
			if (state.container && state.spacer) {
				const containerRect = state.container.getBoundingClientRect();
				{
					const modulesArray = Object.values(modules);

					const width = Math.max(
						...[
							containerRect.width,
							...modulesArray.map((module) => module.x + module.width)
						]
					);
					const height = Math.max(
						...[
							containerRect.height,
							...modulesArray.map((module) => module.y + module.height)
						]
					);

					state.spacer.style.width = `calc(${width}px + 50vw)`;
					state.spacer.style.height = `calc(${height}px + 50vh)`;
				}

				drawSelection();

				if (!canvasWasResized.current) {
					canvasWasResized.current = true;
					const spacerRect = state.spacer.getBoundingClientRect();
					console.log((spacerRect.width - window.innerWidth) / 2);
					console.log((spacerRect.height - window.innerHeight) / 2);
					state.container.scrollTo({
						left: (spacerRect.width - window.innerWidth) / 2,
						top: (spacerRect.height - window.innerHeight) / 2
					});
				}
			}
		});
	}, [modules]);

	const { current: onMouseout } = useRef((/*e: MouseEvent*/) => {});

	useEffect(() => {
		if (state.container && state.selection && state.spacer) {
			onResize();

			window.addEventListener('resize', onResize, false);
			document.addEventListener('resize', onResize, false);
			window.addEventListener('mouseout', onMouseout, false);

			return () => {
				window.removeEventListener('resize', onResize, false);
				document.removeEventListener('resize', onResize, false);
				window.addEventListener('mouseout', onMouseout, false);
			};
		}
	}, [initialized, state.container, state.selection, state.spacer]);

	const { current: onDrag } = useRef((e: MouseEvent) => {
		console.log(e);
		console.log(state.container);
		state.selection.end = positionFromMouseEvent(
			e,
			state.container as HTMLElement
		);

		queueAnimation(drawSelection);

		dispatch(actions.selectionDragContinueAction(state.selection.end));
	});

	const { current: onMouseUp } = useRef((e: MouseEvent) => {
		dispatch(
			actions.selectionDragEndAction(
				positionFromMouseEvent(e, state.container as HTMLElement)
			)
		);

		queueAnimation(() => clearSelection());

		document.body.removeEventListener('mouseup', onMouseUp);
		document.body.removeEventListener('mousemove', onDrag);
	});

	const { current: onMouseDown } = useRef(
		(e: ReactMouseEvent<HTMLDivElement>) => {
			const position = positionFromMouseEvent(
				e.nativeEvent,
				state.container as HTMLElement
			);

			state.selection.start = position;

			dispatch(actions.selectionDragStartAction(position));

			document.body.addEventListener('mouseup', onMouseUp);
			document.body.addEventListener('mousemove', onDrag);

			onDrag(e.nativeEvent);
		}
	);

	return (
		<main
			ref={(main) => {
				state.container = main ?? undefined;
				setInitialized(isInitialized());
			}}
			onMouseDown={initialized ? onMouseDown : () => {}}
			onScroll={initialized ? onResize : () => {}}
		>
			<div
				id="selection"
				ref={(div) => {
					state.selection.element = div ?? undefined;
					setInitialized(isInitialized());
				}}
			/>
			<div
				ref={(div) => {
					state.spacer = div ?? undefined;
					setInitialized(isInitialized());
				}}
			/>
			{children}
		</main>
	);
};
