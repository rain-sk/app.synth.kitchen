import { IModule } from '../ui/patch-module';
import { audioContext } from '../io/utils/audio-context';

export const modules = new Map<string, IModule>();

modules.set('GLOBAL_CONTEXT', {
	moduleKey: 'GLOBAL_CONTEXT',
	type: 'GLOBAL_CONTEXT',
	initialized: true,
	node: audioContext,
	connectors: [
		{
			id: 'GLOBAL_CONTEXT',
			name: 'speakers',
			type: 'SIGNAL_IN',
			getter: () => audioContext.destination
		}
	]
});
