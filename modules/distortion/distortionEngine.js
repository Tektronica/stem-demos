import { Waveform } from "../modulation/waveform";
import { getWindowLength, windowed_fft } from "../dsp/dsp";
import { round, zeros } from "../base";

const WINDOW_FUNC = 'blackman'


function getWaveform(config) {

    const f0 = config.fc;
    var signals = [];

    var fundamental = Waveform(config)
    const harmonics = Object.keys(config.harmonics)

    // build array from 
    harmonics.forEach(function (h) {
        if (config.harmonics[h] !== 0) {
            signals.push(
                Waveform({
                    ...config,
                    Ac: config.harmonics[h],
                    fc: f0 * (h),
                    integral: false
                }));
        }
    });

    signals.forEach(function (signal, idx) {
        signal.y.forEach(function (pos, idx) {
            fundamental.y[idx] = fundamental.y[idx] + pos
        })
    })

    return fundamental;
};

function getDistortion(config) {
    return { thd: null, thdn: null }
};

function getTimeBase(fc, fs, main_lobe_error) {
    // return time base determined by modulation frequency
    if (fc != 0) {
        return getWindowLength({ fc: fc, fs: fs, windfunc: WINDOW_FUNC, error: main_lobe_error });
    } else if (fc == 0) {
        const ldf = fc / 10;  // lowest detectable frequency
        return getWindowLength({ fc: ldf, fs: fs, windfunc: WINDOW_FUNC, error: main_lobe_error });
    } else {
        console.log("Carrier frequency must be non-zero!");
        return undefined;
    };
};

function transformAsPoints(x, y, slice = undefined) {
    // convert to pointData rather than datasets x=[...] and y=[...]
    // this could easily be a generator
    var points = [];

    if (!slice) {
        points = zeros([x.length, 0]);
        for (var idx in points) {
            points[idx] = { x: x[idx], y: y[idx] };
        };
    } else {
        points = zeros([slice, 0]);
        for (var idx = 0; idx < slice; idx++) {
            points[idx] = { x: x[idx], y: y[idx] };
        };
    };

    return points;
};


function DistortedWaveform(config) {
    // unpack config
    const { fc, fs, main_lobe_error } = config;

    // temporal ----------------------------------------------------
    const N = getTimeBase(fc, fs, main_lobe_error);
    const runtime = N / fs;
    const time = getWaveform({ ...config, N: N });

    // find time slice index to plot up to 4 periods of modulation
    const periods = 4;
    const slice = round(periods * (fs / fc));
    const timePoints = transformAsPoints(time.x, time.y, slice);

    // spectral ----------------------------------------------------
    const freq = windowed_fft(time.y, time.x, WINDOW_FUNC);

    // find spectral slice index   
    // const xflim = getFreqLimits(fc, fm, fs, N, time.bw, freq.fft_length);

    // frequency bin for FFT depends only on duration of the signal input
    // https://dsp.stackexchange.com/a/48220
    const df = fs / N;
    // const fslice = round(xflim[1] / df);
    const freqPoints = transformAsPoints(freq.xf, freq.yf, null);

    // const { thd, thdn } = getDistortion();

    return {
        time: {
            data: timePoints,
            N: N,
            runtime: runtime,
        },
        spectral: {
            data: freqPoints,
            rms: freq.rms,
            xlim: [null, null],
            fft_length: freq.fft_length,
            binSize: df,
            thd: freq.thd,
            thdn: freq.thdn.thdn
        },
    };
};

export { DistortedWaveform };
