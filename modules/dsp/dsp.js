import * as kissFFT from '../kissFFT/FFT';
import * as np from '../base';  // numpy-like base functions
import * as windowing from './windowing';  // windowing functions

function windowData(arr) {
    const dataLength = arr.length

    const bufferLength = 2 ** Math.ceil(Math.log2(dataLength));
    const newArr = np.zeros([bufferLength])

    newArr.splice(0, dataLength, ...arr)
    return newArr
};

function fft_next_fast_size(n) {
    while (1) {
        var m = n;
        while ((m % 2) == 0) m /= 2;
        while ((m % 3) == 0) m /= 3;
        while ((m % 5) == 0) m /= 5;
        if (m <= 1) {
            break; /* n is completely factorable by twos, threes, and fives */
        }
        n++;
    }
    return n;
};

function fftr_next_fast_size(n) {
    const ceil_half_n = Math.round((n + 1) / 2);
    return 2 * fft_next_fast_size(ceil_half_n);
};

function bufferData(arr) {
    const dataLength = arr.length

    // const bufferLength = 2 ** Math.ceil(Math.log2(dataLength));
    const bufferLength = fftr_next_fast_size(dataLength);
    const newArr = np.zeros([bufferLength])

    newArr.splice(0, dataLength, ...arr)
    return newArr
};


function rms_flat(a) {
    // Return the root mean square of all the elements of * a *, flattened out.
    // https://stackoverflow.com/a/17463210
    // https://code.activestate.com/recipes/393090/
    // https://stackoverflow.com/a/33004170

    const sqr = np.abs(a) ** 2
    const mean = np.sum(sqr) / sqr.length  // computed from partial sums
    return np.sqrt(mean)
};

function find_range(f, x) {
    // Find range between nearest local minima from peak at index x
    console.log('Client: finding range between nearest local minima from peak at index x')

    let lowermin = 0;
    let uppermin = 0;

    for (i in np.arange(x + 1, f.length)) {
        if (f[i + 1] >= f[i]) {
            uppermin = i
            break
        }
    }
    for (i in np.arange(x - 1, 0, -1)) {
        if (f[i] <= f[i - 1]) {
            lowermin = i + 1
            break
        }
    }

    return { left: lowermin, right: uppermin }
};

function rms_noise(yf, fs, N, hpf = 0, lpf = 100e3) {
    // APPLY HIGH PASS FILTERING
    if (!(hpf == 0) && (hpf < lpf)) {
        fc = Math.floor(hpf * N / fs)
        yf(1e-10, 0, fc)
    }

    // APPLY LOW PASS FILTERING
    if (lpf != 0) {
        fc = Math.floor(lpf * N / fs)
        yf(1e-10, fc)
    }
    return yf
};

function getWindowLength(props) {
    /*
    Computes the window length of the measurement.An error is expressed since the main lobe width is directly
    proportional to the number of cycles captured.The minimum value of M correlates to the lowest detectable frequency
    by the windowing function. For instance, blackman requires a minimum of 6 period cycles of the frequency of interest
        in order to express content of that lobe in the DFT.Sampling frequency does not play a role in the width of the
    lobe, only the resolution of the lobe.
    :param f0: fundamental frequency of signal
    :param fs: sampling frequency
    :param windfunc: "Rectangular", "Bartlett", "Hanning", "Hamming", "Blackman"
    :param error: 100 % error suggests the lowest detectable frequency is the fundamental
    : return: window length of integer value(number of time series samples collected)
    */

    // https://stackoverflow.com/a/9004058/3382269
    var f0 = props.f0 || 10e3;
    var fs = props.fs || 2.5e6;
    var windfunc = props.windfunc || 'blackman';
    var error = props.error || 0.1;
    var mainlobe_type = props.mainlobe_type || 'relative';


    console.log('client: computing window length')

    // lowest detectable frequency by window
    // aka - the main lobe width
    let ldf = 0.0;
    let M = 0;

    if (mainlobe_type == 'relative') {
        ldf = f0 * error
    } else if (mainlobe_type == 'absolute') {
        ldf = error
    } else {
        console.log('Client Error:Incorrect main lobe type used!\nSelection should either be relative or absolute.')
    }

    if (windfunc == 'rectangular') {
        M = Math.floor(2 * (fs / ldf))
    } else if (windfunc in ['bartlett', 'hanning', 'hamming']) {
        M = Math.floor(4 * (fs / ldf))
    } else if (windfunc == 'blackman') {
        M = Math.floor(6 * (fs / ldf))
    } else {
        console.log('Client Error:Not a valid windowing function.')
    }
    return M
};


function windowed_fft(yt, xt, windfunc = 'rectangular') {
    /*
    :param yt: time series data
    :param Fs: sampling frequency
    :param N: number of samples, or the length of the time series data
    :param windfunc: the chosen windowing function
    : return:
        xf_rfft : One sided frequency axis.
        yf_rfft : One sided power spectrum.
        main_lobe_width : The bandwidth(Hz) of the main lobe of the frequency domain window function.
    */
    const yrms = np.sqrt(np.mean(yt.map((y) => (np.abs(y) ** 2))));

    console.log('Client: computing windowed FFT.')

    // remove DC offset
    yt = np.subtract(yt, np.mean(yt))

    const N = yt.length;
    const M = fftr_next_fast_size(N)
    console.log(`\t**> The sample length of ${N} could be optimized by zero-padding the data to a size of: ${M}`)

    const Fs = np.round(1 / (xt[1] - xt[0]), 2) // sampling frequency

    let w = undefined;
    let main_lobe_width = 1.0;

    // Calculate windowing function and its length----------------------------------------------------------------------
    console.log(`\t1> calculating parameters for a ${windfunc} window.`)
    if (windfunc == 'rectangular') {
        w = windowing.rectangular(N)
        main_lobe_width = 2 * (Fs / N)
    }
    else if (windfunc == 'bartlett') {
        w = windowing.bartlett(N)
        main_lobe_width = 4 * (Fs / N)
    }
    else if (windfunc == 'blackman') {
        w = windowing.blackman(N)
        main_lobe_width = 6 * (Fs / N)
    }
    else if (windfunc == 'hanning') {
        w = windowing.hanning(N)
        main_lobe_width = 4 * (Fs / N)
    }
    else if (windfunc == 'hamming') {
        w = windowing.hamming(N)
        main_lobe_width = 4 * (Fs / N)
    }
    else {
        // TODO - maybe include kaiser as well, but main lobe width varies with alpha
        console.error('Client Error: Invalid windowing function selected!')
    }

    // Calculate amplitude correction factor after windowing------------------------------------------------------------
    // https://stackoverflow.com/q/47904399/3382269
    const amplitude_correction_factor = 1 / np.mean(w)

    // Calculate the length of the FFT----------------------------------------------------------------------------------
    console.log('\t2> calculating FFT length')

    let fft_length = 0;

    if ((N % 2) == 0) {
        // for even values of N: FFT length is (N / 2) + 1
        fft_length = Math.floor(N / 2) + 1
    }
    else {
        // for odd values of N: FFT length is (N + 1) / 2
        fft_length = Math.floor((N + 2) / 2)
    }

    console.log('\t3> zero padding data into next largest power-of-2 buffer')
    // TODO: buffer length to a power of 2 needs some work....
    // const buffered = bufferData(np.multiply(yt, w))
    const buffered = np.multiply(yt, w);

    /*
    Compute the FFT of the signal Divide by the length of the FFT to recover the original amplitude.
    Note dividing alternatively by N samples of the timeseries data splits the power between the positive and negative sides.
    However, we are only looking at one side of the FFT.
    */

    try {
        console.log('\t4> computing the one-dimensional FFT for real input.')
        /*
        frequency-domain data is stored from dc up to 2pi.
            so out[0] is the dc bin of the FFT
            and out[nfft/2] is the Nyquist bin (if exists)
        The FFTR optimization code only works for even length ffts. 
        */
        var rfft = new kissFFT.FFTR(buffered.length)
        var out = rfft.forward(buffered)
        const mag = np.magnitude(out)

        var yf_rfft = mag.map((yf) => (yf / fft_length) * amplitude_correction_factor);
        const yfdBm = yf_rfft.map((yf) => (20 * np.log10(np.abs(yf))));

        const xf_rfft = np.rfftfreq(N, 1. / Fs);
        const xf_kHz = xf_rfft.map((xf) => (np.round(xf, 6) / 1000));  // one - sided

        rfft.dispose();

        const thdn = THDN_F(xf_rfft, yf_rfft, Fs, N, main_lobe_width, 0, 100e3);
        const thd = THD(xf_rfft, yf_rfft, Fs, N, main_lobe_width);

        return { xf: xf_kHz, yf: yf_rfft, yfdBm: yfdBm, mlw: main_lobe_width, fft_length: fft_length, rms: yrms, fs: Fs, samples: N, thd: thd, thdn: thdn };

    } catch (error) {
        console.error(error)
        return undefined
    }

};

function THDN_F(xf, _yf, fs, N, main_lobe_width = None, hpf = 0, lpf = 100e3) {
    /*
    [THDF compares the harmonic content of a waveform to its fundamental] and is a much better measure of harmonics
    content than THDR.Thus, the usage of THDF is advocated.
    Source: https://www.thierry-lequeu.fr/data/PESL-00101-2003-R2.pdf
    Performs a windowed fft of a time - series signal y and calculate THDN.
        + Estimates fundamental frequency by finding peak value in fft
        + Skirts the fundamental by finding local minimas and throws those values away
        + Applies a Low - pass filter at fc(100kHz)
        + Calculates THD + N by calculating the rms ratio of the entire signal to the fundamental removed signal
    
    : returns: THD and fundamental frequency
    */

    console.log('Computing THDN_F figure:')

    const yf = [..._yf]; // protects yf from mutation

    // FIND FUNDAMENTAL(peak of frequency spectrum)--------------------------------------------------------------------
    console.log('\t1> searching for fundamental')
    try {
        const f0_idx = np.argmax(np.abs(yf));
        var fundamental = xf[f0_idx];
    } catch (error) {
        console.error('Client Error: Failed to find fundamental. Most likely index was outside of bounds.')
        console.error(error);
    }

    let fc = 0.0;

    // APPLY HIGH PASS FILTERING----------------------------------------------------------------------------------------
    if (!(hpf == 0) && (hpf < lpf)) {
        console.log('\t2> applying highpass filter')
        fc = Math.floor(hpf * N / fs);
        yf.fill(1e-10, 0, fc);  // value, start, end
    }

    // APPLY LOW PASS FILTERING-----------------------------------------------------------------------------------------
    if (lpf != 0) {
        console.log('\t2> applying lowpass filter')
        fc = Math.floor(lpf * N / fs) + 1;
        yf.fill(1e-10, fc);  // value, start, end
    }


    // COMPUTE RMS FUNDAMENTAL------------------------------------------------------------------------------------------
    console.log('\t3> computing rms fundamental')
    // https://stackoverflow.com/questions/23341935/find-rms-value-in-frequency-domain
    // Find the local minimas of the main lobe fundamental frequency
    let left_of_lobe = 0;
    let right_of_lobe = 0;

    if (main_lobe_width) {
        left_of_lobe = Math.floor((fundamental - main_lobe_width / 2) * (N / fs));
        right_of_lobe = Math.floor((fundamental + main_lobe_width / 2) * (N / fs));
    } else {
        const lobeValue = find_range(np.abs(yf), f0_idx);
        left_of_lobe = lobeValue.left;
        right_of_lobe = lobeValue.right;
    }

    const rms_fundamental = np.sqrt(np.ksum((yf.slice(left_of_lobe, right_of_lobe)).map((yf) => (np.sqr(np.abs(yf))))));


    // REJECT FUNDAMENTAL FOR NOISE RMS---------------------------------------------------------------------------------
    console.log('\t4> rejecting fundamental for noise measurement')
    // Throws out values within the region of the main lobe fundamental frequency
    yf.fill(1e-10, left_of_lobe, right_of_lobe)  // value, start, end

    // COMPUTE RMS NOISE------------------------------------------------------------------------------------------------
    console.log('\t5> computing rms noise')
    const rms_noise = np.sqrt(np.sum(yf.map((y) => (np.sqr(np.abs(y))))))

    // THDN CALCULATION-------------------------------------------------------------------------------------------------
    console.log('\t6> computing THD+N (F)')
    // https://www.thierry-lequeu.fr/data/PESL-00101-2003-R2.pdf

    const THDN = rms_noise / rms_fundamental

    return { thdn: THDN, f0: np.round(fundamental, 2), rms: np.round(1e6 * rms_noise, 2) }
};

function THDN_R(xf, yf, fs, N, hpf = 0, lpf = 100e3) {
    /*
        [THDR compares the harmonic content of a waveform to the waveform's entire RMS signal.] This method was inherited
        from the area of audio amplifiers, where the THD serves as a measure of the systems linearity where its numerical
        value is always much less than 1(practically it ranges from 0.1 % - 0.3 % in Hi - Fi systems up to a few percent in
        conventional audio systems).Thus, for this range of THD values, the error caused by mixing up the two
        definitions of THD was acceptable.However, THDF  is a much better measure of harmonics content.Employment of
        THDR in measurements may yield high errors in significant quantities such as power - factor and distortion - factor,
        derived from THD measurement.
        Source: https://www.thierry-lequeu.fr/data/PESL-00101-2003-R2.pdf
        Performs a windowed fft of a time - series signal y and calculate THDN.
            + Estimates fundamental frequency by finding peak value in fft
            + Skirts the fundamental by finding local minimas and throws those values away
            + Applies a Low - pass filter at fc(100kHz)
            + Calculates THD + N by calculating the rms ratio of the entire signal to the fundamental removed signal
            : returns: THD and fundamental frequency
    */

    console.log('Computing THDN_R figure:')

    const _yf = [...yf] // protects yf from mutation
    const freqs = np.rfftfreq(len(_yf))

    // FIND FUNDAMENTAL(peak of frequency spectrum)--------------------------------------------------------------------
    console.log('\t1> searching for fundamental')
    try {
        const f0_idx = np.argmax(np.abs(_yf))
        var fundamental = xf[f0_idx]
    } catch (error) {
        console.error('Client Error: Failed to find fundamental. Most likely index was outside of bounds.')
        console.error(error)
    }

    let fc = 0;

    // APPLY HIGH PASS FILTERING----------------------------------------------------------------------------------------
    if (!(hpf == 0) && (hpf < lpf)) {
        console.log('\t2> applying highpass filter')
        fc = Math.floor(hpf * N / fs)
        _yf.fill(1e-10, 0, fc)  // value, start, end
    }

    // APPLY LOW PASS FILTERING-----------------------------------------------------------------------------------------
    if (lpf != 0) {
        console.log('\t2> applying lowpass filter')
        fc = Math.floor(lpf * N / fs) + 1
        _yf.fill(1e-10, fc)  // value, start, end
    }

    // REJECT FUNDAMENTAL FOR NOISE RMS---------------------------------------------------------------------------------
    console.log('\t3> rejecting fundamental for noise measurement')
    // https://stackoverflow.com/questions/ 23341935/find-rms-value-in-frequency-domain
    const rms_total = rms_flat(_yf)  // Parseval'sTheorem

    // NOTCH REJECT FUNDAMENTAL AND MEASURE NOISE-----------------------------------------------------------------------
    // Find local minimas around main lobe fundamental frequency and throws out values within this window.
    // TODO: Calculate mainlobe width of the windowing function rather than finding local minimas ?
    const lobeValue = find_range(np.abs(_yf), f0_idx)

    const left_of_lobe = lobeValue.left
    const right_of_lobe = lobeValue.right

    _yf.fill(1e-10, left_of_lobe, right_of_lobe)  // value, start, end

    // COMPUTE RMS NOISE------------------------------------------------------------------------------------------------
    console.log('\t4> computing rms noise')
    const rms_noise = rms_flat(_yf)  // Parseval's Theorem

    // THDN CALCULATION-------------------------------------------------------------------------------------------------
    console.log('\t5> computing THDN (R)')
    // https://www.thierry-lequeu.fr/data/PESL-00101-2003-R2.pdf

    const THDN = rms_noise / rms_total

    return { thdn: THDN, f0: fundamental, rms: np.round(1e6 * rms_total, 2) }
};

function THD(xf, yf, Fs, N, main_lobe_width) {
    console.log('Computing THD value:')
    const _yf = [...yf] // protects yf from mutation
    const _yf_data_peak = np.max(np.abs(yf))

    // FIND FUNDAMENTAL(peak of frequency spectrum)
    console.log('\t1> searching for fundamental')
    try {
        var f0_idx = np.argmax(np.abs(_yf))
        var f0 = xf[f0_idx]
    }
    catch (error) {
        console.error('Client Error: Failed to find fundamental for computing the THD.\nMost likely related to a zero-size array.')
        console.error(error)
    }

    // COMPUTE RMS FUNDAMENTAL------------------------------------------------------------------------------------------
    console.log('\t2> computing rms fundamental from local minimas')
    // https://stackoverflow.com/questions/23341935/find-rms-value-in-frequency-domain
    // Find the local minimas of the main lobe fundamental frequency

    let thd = 1;

    if (f0_idx != 0) {
        const n_harmonics = Math.floor(Math.floor((Fs / 2) / f0) - 1); // find maximum number of harmonics
        var amplitude = np.zeros([n_harmonics]);

        for (const h of Array(n_harmonics).keys()) {
            let local_idx = f0_idx * Math.floor(h + 1);

            try {
                local_idx = local_idx + (4 - np.argmax(np.abs(yf.slice(local_idx - 4, local_idx + 4))));
                const freq = xf[local_idx];

                const left_of_lobe = Math.floor((freq - main_lobe_width / 2) * (N / Fs));
                const right_of_lobe = Math.floor((freq + main_lobe_width / 2) * (N / Fs));

                amplitude[h] = np.sqrt(np.sum(np.sqr(np.abs(np.multiply(np.sqrt(2), yf.slice(left_of_lobe, right_of_lobe))))));

            } catch (error) {
                console.error('Client Error: Failed to capture all peaks for calculating THD.\nMost likely zero-size array.')
                console.error(error)
                break;
            }
        }

        console.log('\t3> computing THD')
        thd = np.sqrt(np.sum(np.sqr(np.abs(amplitude.slice(1))))) / np.abs(amplitude[0])

    } else {
        console.log('Check the damn connection, you husk of an oat!')
        thd = 1  // bad input usually. Check connection.
    }

    return thd
};

export { getWindowLength, windowed_fft, THD, THDN_F, THDN_R };
