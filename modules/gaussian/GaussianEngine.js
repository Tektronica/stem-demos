import { arange, linspace, normal, zeros, mean, round, min, max } from "../base";
import { mean_absolute_percentage_error } from "./fitnessTest";

// https://stackoverflow.com/a/49434653/3382269
// https://jsfiddle.net/2uc346hp/

function normalize({ data, N }) {
    return data.map((d) => (d / N));
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

function gaussianCurve({ mean = 0, stddev = 1, N }) {
    // https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.norm.html
    // https://stackoverflow.com/a/47763007/3382269

    const start = mean - 3 * stddev;
    const end = mean + 3 * stddev;
    const xrange = linspace(start, end, N)

    const variance = stddev ** 2;

    const C = Math.sqrt(2.0 * Math.PI);
    const norm = xrange.map(x => (Math.exp(-((x - mean) ** 2) / 2 * variance) / C));
    return { xrange, norm };
};

function histogram({ data = [], min_val = null, max_val = null, nbins = 10 }) {
    // https://stackoverflow.com/questions/21619347/creating-a-python-histogram-without-pylab
    // https://stackoverflow.com/a/21626237/3382269

    const histLength = nbins + 1;
    let hist_vals = zeros([histLength]);

    if (!min_val) { min_val = min(data) };
    if (!max_val) { max_val = max(data) };

    data.forEach(function (d) {
        let bin_number = round(nbins * ((d - min_val) / (max_val - min_val)));
        hist_vals[bin_number] += 1;
    });

    const bin_lower_bounds = hist_vals.map((val, idx) => (min_val + idx * (max_val - min_val) / histLength));

    // const bin_array = linspace(min, max, nbins)
    // const my_histogram = []
    // bin_array.forEach(function (bin, idx) {
    //     var mask = data.map((a, idx) => ((a >= bin_array[idx]) & (a < bin_array[idx + 1])));
    //     console.log(mask)
    //     my_histogram.append((data[mask]).length)
    // });

    return { hist: hist_vals, bounds: bin_lower_bounds };
};

function Gaussian({ mean, stddev, N, bins = 10 }) {

    const x = arange(0, N, 1);
    const y = normal({
        loc: mean,
        scale: stddev,
        size: [N]
    });

    // transform the [x,y] values into plottable points
    const points = transformAsPoints(x, y);

    // histrogram
    const { hist, bounds } = histogram({ data: [...y], nbins: bins });
    const binWidth = Math.abs(bounds[1] - bounds[2]);

    // normalized histogram
    // https://stackoverflow.com/a/20057520/3382269
    const scaling = binWidth * N;  // bin_width*total length of data
    const normalized = normalize({ data: hist, N: scaling });

    // transform the [x,y] values into plottable points
    const sorted = transformAsPoints(bounds, normalized);

    // get smooth gaussian
    const { xrange, norm } = gaussianCurve({
        mean: mean,
        stddev: stddev,
        N: bins + 1
    });

    const smooth = transformAsPoints(xrange, norm);

    // fit test
    const fitTest = mean_absolute_percentage_error({ y_test: normalized, y_actual: norm });

    return ({
        raw: {
            data: points,
            hist: sorted,
            xlim: [null, null],
            ylim: [null, null]
        },
        smooth: {
            data: smooth,
            xlim: [null, null],
            ylim: [null, null]
        },
        results: {
            binWidth: binWidth,
            fitTest: fitTest
        }
    });
};

export { Gaussian };
