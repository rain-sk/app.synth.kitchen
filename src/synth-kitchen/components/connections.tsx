import React, { useCallback, useContext, useEffect, useRef } from 'react';
import { ConnectionContext, connectorKey } from '../contexts/connection';
import { useStateContext } from '../hooks/use-state-context';
import { INVALID_POSITION } from '../state/types/state';
import { useEffectOnce } from '../hooks/use-effect-once';
import { queueAnimation } from '../utils/animation';

const coordinates = (connectorKey: string) => {
	// console.log(connectorKey);
	const connector = document.getElementById(connectorKey);
	if (!connector) {
		return INVALID_POSITION;
	}

	const rect = connector.getBoundingClientRect();
	return [
		rect.left + rect.width / 2 + window.pageXOffset,
		rect.top + rect.height / 2 + window.pageYOffset
	];
};

const devicePixelRatio = window.devicePixelRatio || 1;

const resizeCanvas = (
	canvas: HTMLCanvasElement,
	width: number,
	height: number
) => {
	canvas.width = width * devicePixelRatio;
	canvas.height = height * devicePixelRatio;
};

export const Connections: React.FC = () => {
	const canvasRef = useRef<HTMLCanvasElement>();
	const contextRef = useRef<CanvasRenderingContext2D>();

	const { modules } = useStateContext();
	const { connectionCount, connections } = useContext(ConnectionContext);

	const drawConnections = useCallback(() => {
		if (canvasRef.current && !contextRef.current) {
			contextRef.current = canvasRef.current.getContext('2d') ?? undefined;
			if (contextRef.current) {
				contextRef.current.scale(devicePixelRatio, devicePixelRatio);
			}
		}

		if (contextRef.current && canvasRef.current) {
			const context2d = contextRef.current;
			contextRef.current.clearRect(
				0,
				0,
				canvasRef.current.width,
				canvasRef.current.height
			);

			var rect = canvasRef.current.getBoundingClientRect();

			resizeCanvas(canvasRef.current, rect.width, rect.height);

			const connectionsToDraw = [...connections.values()].map(
				// todo: filter out off-screen connections
				([output, input]) => [
					coordinates(connectorKey(output)),
					coordinates(connectorKey(input))
				]
			);

			connectionsToDraw.forEach(([[outputX, outputY], [inputX, inputY]]) => {
				context2d.beginPath();
				context2d.lineWidth = 4;
				context2d.moveTo(outputX, outputY);
				context2d.lineTo(inputX, inputY);
				context2d.stroke();

				context2d.beginPath();
				context2d.arc(outputX, outputY, 5, 0, 2 * Math.PI);
				context2d.fill();

				context2d.beginPath();
				context2d.arc(inputX, inputY, 5, 0, 2 * Math.PI);
				context2d.fill();
			});
		}
	}, []);

	const onResize = useCallback(() => {
		const parent = document.getElementById('root');

		const width = parent ? parent.offsetWidth : 0;
		const height = parent ? parent.offsetHeight : 0;

		if (canvasRef.current && contextRef.current) {
			contextRef.current.clearRect(0, 0, width, height);
			contextRef.current.clearRect(0, 0, width, height);
			resizeCanvas(canvasRef.current, width, height);
		}

		queueAnimation(drawConnections);
	}, []);

	useEffectOnce(() => {
		const parent = document.getElementById('root');
		const main = document.getElementsByTagName('main')[0];
		(parent as any).addEventListener('resize', onResize, false);
		(main as any).addEventListener('scroll', onResize, false);
		onResize();
		return () => {
			(parent as any).removeEventListener('resize', onResize, false);
			(main as any).removeEventListener('scroll', onResize, false);
		};
	});

	useEffect(onResize, [connectionCount, modules]);

	return (
		<canvas
			id="connections"
			ref={(ref) => {
				canvasRef.current = ref ?? undefined;
			}}
		/>
	);
};
