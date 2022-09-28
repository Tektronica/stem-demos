import { getWindowLength, windowed_fft } from "../dsp/dsp";
import { round, zeros } from "../base";
import { Waveform } from "./waveform";

const WINDOW_FUNC = 'blackman'

/*  
carrier config uses:
    fs
    main_lobe_error
    modulation_type
    waveform_type
    Ac
    fc
    modulation_index
    fm
    message_phase
 
message config uses:
    xt
    fs
    waveform_type
    fm
    message_phase
*/

function getTimeBase(fm, fs, main_lobe_error) {
    // return time base determined by modulation frequency
    if (fm != 0) {
        return getWindowLength({ f0: fm, fs: fs, windfunc: WINDOW_FUNC, error: main_lobe_error });
    } else if (fm == 0) {
        const ldf = fc / 10;  // lowest detectable frequency
        return getWindowLength({ f0: ldf, fs: fs, windfunc: WINDOW_FUNC, error: main_lobe_error });
    } else {
        console.log("Carrier frequency must be non-zero!");
        return undefined;
    };
};


function signal(config) {
    const {
        fs,
        N,
        modulation_type,
        waveform_type,
        Ac,
        fc,
        modulation_index,
        fm,
    } = config;

    var ct = null;  // carrier signal
    var st = null;  // final modulated signal
    var bw = null;  // bandwidth of the signal

    // x values
    const runtime = N / fs;

    const msg = Waveform({ ...config, N: N });
    const xt = msg.x;
    const mt = msg.y;
    const mt_ = msg.integral;

    const T = fs / fm;

    switch (modulation_type) {
        case 'amplitude':
            // amplitude modulation
            ct = xt.map((x) => (Ac * Math.sin(2 * Math.PI * fc * x)));
            st = ct.map((c, idx) => (c * modulation_index * mt[idx]));
            bw = 2 * fm;
            break;

        case 'frequency':
            // frequency modulation
            // In FM, the angle is directly proportional to the integral of m(t)
            // https://math.stackexchange.com/q/178079
            // modulation index (mi) = (Am * kf) / fm
            // kf = (mi) * fm / Am

            st = xt.map((x, idx) => (Ac * Math.sin(2 * Math.PI * (fc * x + (modulation_index * fm * mt_[idx])))));

            if (waveform_type != 'keying') {
                bw = 2 * fm * (modulation_index + 1);
            } else {
                bw = 2 * (1 / T + modulation_index * fm) + fm;
            };
            break;

        case 'phase':
            // phase modulation
            // In PM, the angle is directly proportional to m(t)

            st = xt.map((x, idx) => (Ac * Math.sin(2 * Math.PI * fc * x + modulation_index * mt[idx])));

            if (waveform_type != 'keying') {
                bw = 2 * fm * (modulation_index + 1)
            } else {
                bw = fc + fm - (fc - fm)
            };
            break;

        default:
            throw new Error("Invalid modulation selected!");
    };

    return {
        xt: xt,
        st: st,
        mt: mt,
        bw: bw,
        runtime: runtime,
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


function getFreqLimits(fc, fm, fs, N, bw, fft_length) {
    var [xf_left, xf_right] = [null, null];

    const freq_end = fs * ((fft_length - 1) / N);
    const bw_margin = 2 * fm;
    if (fm != 0) {
        xf_left = Math.max((fc - bw / 2) - bw_margin, 0);
        xf_right = Math.min(Math.max(2 * fc - xf_left, fc + bw / 2), freq_end);  // does not exceed max bin
    } else if (fm == 0) {
        xf_left = Math.max(fc - (fc / 2), 0);
        xf_right = Math.min(2 * fc - fc / 2, freq_end);  // does not exceed max bin
    }
    else {
        console.log("Carrier frequency must be non-zero!");
    };

    return [xf_left, xf_right];
};


function getModulation(config) {
    // unpack config
    const { fc, fm, fs, main_lobe_error } = config;

    // temporal ----------------------------------------------------
    const N = getTimeBase(fm, fs, main_lobe_error);
    const runtime = N / fs;
    const time = signal({ ...config, N: N });

    // find time slice index to plot up to 4 periods of modulation
    const periods = 4;
    const slice = round(periods * (N / fm));
    const timePoints = transformAsPoints(time.xt, time.st, slice);

    // spectral ----------------------------------------------------
    const freq = windowed_fft(time.st, time.xt, WINDOW_FUNC);

    // find spectral slice index   
    const xflim = getFreqLimits(fc, fm, fs, N, time.bw, freq.fft_length);

    // frequency bin for FFT depends only on duration of the signal input
    // https://dsp.stackexchange.com/a/48220
    const df = fs / N;
    const fslice = round(xflim[1] / df);
    const freqPoints = transformAsPoints(freq.xf, freq.yf, fslice);

    return {
        time: {
            data: timePoints,
            mt: time.mt,
            bw: time.bw,
            N: N,
            runtime: runtime,
        },
        spectral: {
            data: freqPoints,
            rms: freq.rms,
            xlim: xflim.map(limit => limit / 1000),
            fft_length: freq.fft_length,
            binSize: df,
        },
    };
};


export { getModulation };
