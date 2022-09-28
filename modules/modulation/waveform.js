// custom math module imports
import { deg2rad, arange, round, repeat, where, rand } from "../base";

export function Waveform(config) {
    const {
        N,
        fs,
        waveform_type,
        fm,
        message_phase,
    } = config;

    var T = null;  // sample length per period
    var mt = null;  // message signal
    var mt_ = null; // integral of message signal
    var N_phase_shifted = null;  // message signal (modulo operation)
    var scaling = null;  // scaling

    const N_range = arange(0, N, 1);
    const xt = N_range.map(N => (N / fs));

    const digital_modulation = { 0: 'ask', 1: 'fsk', 2: 'psk' }
    const key_type = 'ask';

    switch (waveform_type) {
        case 'sine':
            T = fs / fm;  // sample length per period

            // message signal
            mt = xt.map((x) => (Math.sin(2 * Math.PI * fm * x + deg2rad(message_phase))));

            // integral of message signal
            mt_ = xt.map((x) => ((1 / (Math.PI * fm)) * Math.sin(Math.PI * fm * x) * Math.sin(Math.PI * fm * x + message_phase)));
            break;

        case 'triangle':
            // Triangle
            // https://en.wikipedia.org/wiki/Triangle_wave//Modulo_operation
            T = fs / fm;  // sample length per period

            // message signal (modulo operation)
            N_phase_shifted = N_range.map(N => (N + round(T * message_phase / 360)));

            mt = N_phase_shifted.map(N => ((4 / T) * Math.abs(((N - T / 4) % T) - T / 2) - 1));

            // integral of triangle
            const integral_shift = N_phase_shifted.map(N => (N + T / 4));

            function first(arr, T) {
                const t = arr.map(x => (x % T));
                return t.map(t => (2 / T * t ** 2 - t));
            };

            function second(arr, T) {
                const t = arr.map(x => (x % T));
                return t.map(t => (-2 / T * t ** 2 + 3 * t - T));
            };

            scaling = 1 / fs;
            const condition = integral_shift.map(it => ((it % T) < T / 2));
            mt_ = where(condition, first(integral_shift, T), second(integral_shift, T));
            mt_ = mt_.map(mt_ => scaling * mt_);
            break;

        case 'sawtooth':
            // Sawtooth
            T = fs / fm;  // sample length per period
            N_phase_shifted = N_range.map(N => (N + round(T * message_phase / 360)));

            mt = N_phase_shifted.map(N => ((N % T) / T));

            // integral of sawtooth
            scaling = 1 / fs;
            mt_ = N_phase_shifted.map(N => (scaling * ((1 / T) * (N % T) ** 2 - (N % T))));
            break;

        case 'square':
            T = fs / fm;
            N_phase_shifted = N_range.map(N => (N + round(T * message_phase / 360)));

            // message signal
            const cond = N_phase_shifted.map(N => ((N % T) < T / 2));
            mt = where(cond, 1, 0);

            // integral of message signal (square wave integral is a triangle wave (modulo operation) with 180 phase lag)
            scaling = 1 / fs;
            const ifTrue = N_phase_shifted.map(N => (N % T));
            const ifFalse = ifTrue.map(c => -c);
            mt_ = where(cond, ifTrue, ifFalse);
            mt_ = mt_.map(mt_ => (scaling * mt_));

            if (key_type == 'psk') {
                mt = deg2rad(message_phase * mt);
            };
            break;

        case 'keying':
            T = fs / fm;

            // message signal -------------------------------------------------------------------------------------------
            const binary_message = rand([1, round(N / T)])[0];
            mt = repeat([binary_message], [T]).slice(0, N);

            // frequency term is converted to an angle. Since discrete steps, there are only f_low (0) and f_high (1)
            mt_ = mt.map((mt, idx) => ((2 * mt - 1) * xt[idx]));

            if (key_type == 'psk') {
                mt = mt.map(mt => (deg2rad(message_phase * mt)));
            };

            break;

        default:
            throw new Error(`Invalid message waveform (${waveform_type})type selected!`);
    };

    return { message: mt, integral: mt_ };
};
