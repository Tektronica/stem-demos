import { arange, linspace, normal, zeros, round, min, max } from "../base";

// https://stackoverflow.com/a/49434653/3382269
// https://jsfiddle.net/2uc346hp/

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

// Standard Normal variate using Box-Muller transform.
function randn_bm() {
    let u = 1 - Math.random(); //Converting [0,1) to (0,1)
    let v = Math.random();
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

function randn_bm1() {
    let u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) return randn_bm1() // resample between 0 and 1
    return num
};

const randn_bm2 = (min, max, skew) => {
    var u = 0, v = 0;
    while (u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while (v === 0) v = Math.random();
    let k = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);

    let num = k / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = randn_bm2(min, max, skew); // resample between 0 and 1 if out of range
    // num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}

const round_to_precision = (x, precision) => {
    var y = +x + (precision === undefined ? 0.5 : precision / 2);
    return y - (y % (precision === undefined ? 1 : +precision));
};

function histogram({ data = [], min_val = null, max_val = null, nbins = 10 }) {
    // https://stackoverflow.com/questions/21619347/creating-a-python-histogram-without-pylab
    // https://stackoverflow.com/a/21626237/3382269

    // const hist_vals = zeros([10]);
    // var bin_number = 0;
    // data.forEach(function (value, idx) {
    //     bin_number = round((nbins * ((value - min_val) / (max_val - min_val))))
    //     hist_vals[bin_number] += 1;
    // });
    const histLength = nbins + 1;
    let hist_vals = zeros([histLength]);

    // if (!min_val) { min_val = Math.min(data) };
    // if (!max_val) { max_val = Math.max(data) };

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

// function Gaussian() {
//     let n = 10000;
//     let step = 1;
//     let max = 100;
//     let min = 0;
//     let data = {};


//     // Seed data with a bunch of 0s
//     for (let j = min; j < max; j += step) {
//         data[j] = 0;
//     }

//     // Create n samples between min and max
//     for (var i = 0; i < n; i += step) {
//         // let rand_num = randn_bm();
//         // let rand_num = randn_bm1();
//         let rand_num = randn_bm2(min, max, 1);
//         // let rounded = round_to_precision(rand_num, step)
//         let rounded = round(rand_num)
//         data[rounded] += 1;
//     }

//     // Count number of samples at each increment
//     let hc_data = [];
//     for (const [key, val] of Object.entries(data)) {
//         hc_data.push({ "x": parseFloat(key), "y": val });
//     }

//     // Sort
//     hc_data = hc_data.sort(function (a, b) {
//         if (a.x < b.x) return -1;
//         if (a.x > b.x) return 1;
//         return 0;
//     });

//     return ({
//         data: hc_data,
//         sorted: hc_data,
//         xlim: [null, null],
//         ylim: [null, null]
//     });
// }

function Gaussian({ mean, std, N }) {

    // const x = linspace(0, N, 1);
    const x = arange(0, N, 1);

    const y = normal({
        loc: mean,
        scale: std,
        size: [N]
    });

    const points = transformAsPoints(x, y);

    const { hist, bounds } = histogram({ data: [...y], min_val: 0, max_val: 1, nbins: 10 });
    const xx = linspace(0, 1, 11)
    const sorted = transformAsPoints(xx, hist);

    return ({
        data: points,
        sorted: sorted,
        xlim: [null, null],
        ylim: [null, null]
    });

};

export { Gaussian };
