import { getWindowLength } from "../dsp/dsp";
import { arange, round, empty, randint, normal } from "../base";

function get_random_phase(dpi = np.pi / 6, distribution = 'gaussian') {

    if (distribution == 'random') {
        return randint({ low: 5 }) * dpi
    } else {
        return round(normal(5)) * dpi
    }
};

function getWaveform(config) {
    const { fc, df, emitted_modes = 5, bw = 1e9, bw_shape = 'gaussian', random_phase = False } = config

    yt_list = empty([modes]);  // initialize empty list

    yt_list.forEach(function (mode) {

        // calculate location of new spectral component
        const new_freq = df * (((mode % 2) * -2) + 1) * round((mode + 1) / 2);
        const f = fc + new_freq;

        // calculate a random phase if necessary
        var phase = 0;
        if (random_phase) { phase = get_random_phase() }

        // https://www.edmundoptics.com/knowledge-center/application-notes/optics/why-use-a-flat-top-laser-beam/
        // https://micro.magnet.fsu.edu/primer/java/lasers/gainbandwidth/index.html
        // sigma = 1 / (np.sqrt(2 * np.pi))
        // pos = fc / 2
        // A = (1 / (sigma * np.sqrt(2 * np.pi))) * np.exp(-0.5 * ((pos - 1) / sigma) ** 2);
        // TODO: calculate bandwidth

        const A = get_gaussian(f, fc, bw, bw_shape = bw_shape)
        yt_list[mode] = A * np.sin(2 * np.pi * f * xt + phase)
    });

    return fundamental;
};

function ModeLocked(config) {
    const { fc, laser_bw, emitted_modes, refraction_index, bandwidth_shape, window, MLW, random_phase } = config;

    const gaussian_profile = 20  // Gaussian profile standard deviation
    const fcc = fc * 1e12
    const laser_bww = fcc * laser_bw

    const wavelength = SPEED_OF_LIGHT / fcc
    const df_max = laser_bww / emitted_modes
    const cavity_modes = Math.ceil(fcc / (refraction_index * df_max))
    const cavity_length = cavity_modes * wavelength / 2
    const cavity_df = SPEED_OF_LIGHT / (2 * refraction_index * cavity_length)
    const longitudinal_modes = round(laser_bww / cavity_df)  // the number of modes supported by the laser bandwidth

    // TIME BASE --------------------------------------------------------------------------------------------------------
    const fs = fcc * 100
    const main_lobe_error = min(cavity_df / (50 * fcc), MLW)

    const N = getWindowLength(f0 = fc, fs = fs, windfunc = window, mlw = main_lobe_error, mainlobe_type = 'relative')
    const runtime = N / fs;
    const time = getWaveform({ ...config, N: N, df: cavity_df });
};

export { ModeLocked };
