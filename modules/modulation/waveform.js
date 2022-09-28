// custom math module imports
import { deg2rad, arange, round, repeat, where, rand } from "../base";


function Sine(fc, fs, N, phase) {
    const N_range = arange(0, N, 1);
    const xt = N_range.map(N => (N / fs));

    // message signal
    const yt = xt.map((x) => (Math.sin(2 * Math.PI * fc * x + deg2rad(phase))));

    // integral of message signal
    const yt_ = xt.map((x) => ((1 / (Math.PI * fc)) * Math.sin(Math.PI * fc * x) * Math.sin(Math.PI * fc * x + phase)));

    return { x: xt, y: yt, integral: yt_ };
};


function Triangle(fc, fs, N, phase) {
    // https://en.wikipedia.org/wiki/Triangle_wave//Modulo_operation

    const N_range = arange(0, N, 1);
    const xt = N_range.map(N => (N / fs));

    const T = fs / fc;  // sample length per period

    // message signal (modulo operation)
    const N_phase_shifted = N_range.map(N => (N + round(T * phase / 360)));

    const yt = N_phase_shifted.map(N => ((4 / T) * Math.abs(((N - T / 4) % T) - T / 2) - 1));

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

    const scaling = 1 / fs;
    const condition = integral_shift.map(it => ((it % T) < T / 2));
    var yt_ = where(condition, first(integral_shift, T), second(integral_shift, T));
    yt_ = yt_.map(yt_ => scaling * yt_);

    return { x: xt, y: yt, integral: yt_ };
};


function Sawtooth(fc, fs, N, phase) {
    const N_range = arange(0, N, 1);
    const xt = N_range.map(N => (N / fs));

    const T = fs / fc;  // sample length per period
    const N_phase_shifted = N_range.map(N => (N + round(T * phase / 360)));

    const yt = N_phase_shifted.map(N => ((N % T) / T));

    // integral of sawtooth
    const scaling = 1 / fs;
    const yt_ = N_phase_shifted.map(N => (scaling * ((1 / T) * (N % T) ** 2 - (N % T))));

    return { x: xt, y: yt, integral: yt_ };
};


function Square(fc, fs, N, phase) {
    const N_range = arange(0, N, 1);
    const xt = N_range.map(N => (N / fs));

    const digital_modulation = { 0: 'ask', 1: 'fsk', 2: 'psk' }
    const key_type = 'ask';

    const T = fs / fc;
    const N_phase_shifted = N_range.map(N => (N + round(T * phase / 360)));

    // message signal
    const cond = N_phase_shifted.map(N => ((N % T) < T / 2));
    var yt = where(cond, 1, 0);

    // integral of message signal (square wave integral is a triangle wave (modulo operation) with 180 phase lag)
    const scaling = 1 / fs;
    const ifTrue = N_phase_shifted.map(N => (N % T));
    const ifFalse = ifTrue.map(c => -c);
    var yt_ = where(cond, ifTrue, ifFalse);
    yt_ = yt_.map(yt_ => (scaling * yt_));

    if (key_type == 'psk') {
        yt = deg2rad(phase * yt);
    };

    return { x: xt, y: yt, integral: yt_ };
};


function Keying(fc, fs, N, phase) {
    const N_range = arange(0, N, 1);
    const xt = N_range.map(N => (N / fs));

    const digital_modulation = { 0: 'ask', 1: 'fsk', 2: 'psk' }
    const key_type = 'ask';

    const T = fs / fc;

    const binary_message = rand([1, round(N / T)])[0];
    var yt = repeat([binary_message], [T]).slice(0, N);

    // frequency term is converted to an angle. Since discrete steps, there are only f_low (0) and f_high (1)
    const yt_ = yt.map((yt, idx) => ((2 * yt - 1) * xt[idx]));

    if (key_type == 'psk') {
        yt = yt.map(yt => (deg2rad(phase * yt)));
    };

    return { x: xt, y: yt, integral: yt_ };
};


export function Waveform(config) {
    const { waveform_type, N, fs, fm, message_phase } = config;

    // a bit cleaner than a switch case
    const waveFunc = (func) => func(fm, fs, N, message_phase);
    const waveforms = {
        'sine': Sine,
        'triangle': Triangle,
        'sawtooth': Sawtooth,
        'square': Square,
        'keying': Keying
    };

    return waveFunc(waveforms[waveform_type]);
};
