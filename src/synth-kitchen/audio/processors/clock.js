function calcPhase(phase, ticksPerMinute) {
	const ticksPerSecond = ticksPerMinute / 60;
	const framesPerTick = sampleRate / ticksPerSecond;
	const phaseOffsetPerFrame = 1 / framesPerTick;
	return phase + Math.abs(phaseOffsetPerFrame);
}

class Clock extends AudioWorkletProcessor {
	static get parameterDescriptors() {
		return [{ name: 'tempo', defaultValue: 120, minValue: 0, maxValue: 1000 }];
	}

	phase = 1;

	process(inputs, outputs, parameters) {
		const input = inputs[0];
		const hasInput = input.length > 0;

		const output = outputs[0];
		const channelOne = output[0];

		const tempo = parameters.tempo;
		const isTempoConstant = tempo.length === 1;
		let phase = this.phase;

		for (let i = 0; i < channelOne.length; i++) {
			phase =
				hasInput && input[0][i] === 1
					? 1
					: calcPhase(phase, isTempoConstant ? tempo[0] : tempo[i]);

			if (phase >= 1) {
				phase -= 1;
				channelOne[i] = 1;
			} else {
				channelOne[i] = 0;
			}
		}

		this.phase = phase;

		return true;
	}
}

registerProcessor('clock', Clock);
