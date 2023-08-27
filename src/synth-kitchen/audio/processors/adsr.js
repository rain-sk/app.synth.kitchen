function interpolate(a, d, s, r, tickStart, tickEnd) {
	const timeSinceLastTick = currentTime - tickStart;

	if (timeSinceLastTick <= a) {
		return timeSinceLastTick / a;
	} else if (timeSinceLastTick <= a + d) {
		const decayTimeElapsed = timeSinceLastTick - a;
		const decayRatio = decayTimeElapsed / d;
		return 1 - decayRatio * (1 - s);
	} else if (tickEnd === -1) {
		return s;
	} else {
		const releaseTimeElapsed = currentTime - tickEnd;
		const releaseRatio = releaseTimeElapsed / r;
		return Math.max(s - releaseRatio * s, 0);
	}
}

class Adsr extends AudioWorkletProcessor {
	static get parameterDescriptors() {
		return [
			{ name: 'attack', defaultValue: 0.1, minValue: 0, maxValue: 60 },
			{ name: 'decay', defaultValue: 0.1, minValue: 0, maxValue: 60 },
			{ name: 'sustain', defaultValue: 0.7, minValue: 0, maxValue: 1 },
			{ name: 'release', defaultValue: 0.3, minValue: 0, maxValue: 60 }
		];
	}

	tickStart = -1;
	tickEnd = -1;

	process(inputs, outputs, parameters) {
		const input = inputs[0];
		const hasInput = input.length > 0;

		if (!hasInput) {
			return true;
		}

		const output = outputs[0];

		let tickStart = this.tickStart;
		let tickEnd = this.tickEnd;

		const attack = parameters.attack;
		const isAttackConstant = attack.length === 1;

		const decay = parameters.decay;
		const isDecayConstant = decay.length === 1;

		const sustain = parameters.sustain;
		const isSustainConstant = sustain.length === 1;

		const release = parameters.release;
		const isReleaseConstant = release.length === 1;

		for (let i = 0; i < channelOne.length; i++) {
			const gateOpen = input[0][i] === 1;

			if (tickStart === -1 && input[0][i] === 1) {
				tickStart = currentTime;
			}

			if (tickStart !== -1) {
				const frameAttack = isAttackConstant ? attack[0] : attack[i];
				const frameDecay = isDecayConstant ? decay[0] : decay[i];
				const frameSustain = isSustainConstant ? sustain[0] : sustain[i];
				const frameRelease = isReleaseConstant ? release[0] : release[i];

				if (tickEnd === -1 && !gateOpen) {
					tickEnd = currentTime;
				}

				const frameValue = interpolate(
					frameAttack,
					frameDecay,
					frameSustain,
					frameRelease,
					tickStart,
					tickEnd
				);

				output.forEach((channel) => (channel[i] = frameValue));

				if (tickEnd !== -1 && currentTime - tickEnd > frameRelease) {
					tickStart = -1;
					tickEnd = -1;
				}
			}
		}

		this.tickStart = tickStart;
		this.tickEnd = tickEnd;

		return true;
	}
}

registerProcessor('adsr', Adsr);
