export function subtract(x1, x2) {
    // supports up to n-dimensions - this is not a cross-mult operation!

    if ((typeof x1 === 'object') && (typeof x2 === 'object')) {
        return zipWith(x1, x2, subtract)

    } else if ((typeof x1 === 'number') && (typeof x2 === 'object')) {
        return x2.map((b) => (x1 - b))

    } else if ((typeof x1 === 'object') && (typeof x2 === 'number')) {
        return x1.map((a) => (a - x2))

    } else {
        return (x1 - x2)
    }
};

export function sum(arr) {
    // returns the sum for all list items
    return arr.reduce((a, b) => a + b)
};

export function magnitude(arr) {
    // returns a new array with every next element pair magnitude computed
    const res = [];
    for (let idx = 0; idx < arr.length; idx += 2) {
        res.push(sqrt(arr[idx] ** 2 + (arr[idx + 1] || 0) ** 2));
    };

    return res;
};

export function ksum(arr) {
    // returns the kahan sum for all list items
    // https://stackoverflow.com/a/4940219

    var sum = 0.0
        , c = 0.0  // A running compensation for lost low-order bits.

    for (var i = 0; i < arr.length; i++) {
        const y = arr[i] - c    // So far, so good: c is zero.
        const t = sum + y       // Alas, sum is big, y small, so low-order digits of y are lost.

        c = (t - sum) - y       // (t - sum) recovers the high-order part of y; subtracting y recovers -(low part of y)
        sum = t                 // Algebraically, c should always be zero. Beware eagerly optimising compilers!
    }                           // Next time around, the lost low part will be added to y in a fresh attempt.

    return sum
};

export function mean(arr) {
    return arr.reduce((a, b) => a + b) / arr.length;
};

export function multiply(x1, x2) {
    // supports up to n-dimensions - this is not a cross-mult operation!

    if ((typeof x1 === 'object') && (typeof x2 === 'object')) {
        return zipWith(x1, x2, multiply)

    } else if ((typeof x1 === 'number') && (typeof x2 === 'object')) {
        return x2.map((b) => (x1 * b))

    } else if ((typeof x1 === 'object') && (typeof x2 === 'number')) {
        return x1.map((a) => (a * x2))

    } else {
        return (x1 * x2)
    }
};

// TODO: not implemented!
export function _cross(x1, x2) {
    // supports up to n-dimensions - assumes x1 and x2 are arrays!
    // BROKEN
    if ((typeof x1 === 'object') && (typeof x2 === 'object')) {
        return zipWith(x1, x2, _cross)
    } else {
        return (x1 * x2)
    }
};

export function divide(x1, x2) {
    // supports up to n-dimensions

    if ((typeof x1 === 'object') && (typeof x2 === 'object')) {
        return zipWith(x1, x2, divide)

    } else if ((typeof x1 === 'number') && (typeof x2 === 'object')) {
        return x2.map((b) => (x1 / b))

    } else if ((typeof x1 === 'object') && (typeof x2 === 'number')) {
        return x1.map((a) => (a / x2))

    } else {
        return (x1 / x2)
    }
};

export function round(arr, decimals = 0) {
    // returns rounded value for each list item 
    if (typeof arr === 'object') {
        return arr.map(a => round(a, decimals));
    } else {
        return Math.round(arr * (10 ** decimals)) / (10 ** decimals)
    }
};

export function abs(arr) {
    // returns absolute value for each list item 
    if (typeof arr === 'object') {
        return arr.map(Math.abs);
    } else {
        return Math.abs(arr)
    }
};

export function min(arr) {
    // returns the indices of the maximum values along an axis.
    // TODO: support multiple axes (recursive call)
    if (arr.length === 0) {
        return -1;
    }

    return Math.min(...arr);
};


export function max(arr) {
    // returns the indices of the maximum values along an axis.
    // TODO: support multiple axes (recursive call)
    if (arr.length === 0) {
        return -1;
    }

    return Math.max(...arr);
};

export function argmax(arr) {
    // returns the indices of the maximum values along an axis.
    // TODO: support multiple axes (recursive call)
    if (arr.length === 0) {
        return -1;
    }

    var max = arr[0];
    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
};

export function sqr(arr) {
    // returns squared value for each list item
    if (typeof arr === 'object') {
        return arr.map((x) => Math.pow(x, 2));
    } else {
        return Math.pow(arr, 2)
    }
};

export function sqrt(arr) {
    // returns squared value for each list item
    if (typeof arr === 'object') {
        return arr.map((x) => Math.sqrt(x));
    } else {
        return Math.sqrt(arr)
    }
};

export function log10(arr) {
    // returns log10 value for each list item
    if (typeof arr === 'object') {
        return arr.map((x) => Math.log10(x));
    } else {
        return Math.log10(arr)
    }
};

export function zip(x1, x2) {
    // two array-like objects are passed element-by-element to func
    // return length is equal to the shortest input array length
    // returns [func(a1, a2), func(b1, b2), func(c1, c2), ...]

    return x1.map((x, i) => [x, x2[i]]);
};

export function zipWith(x1, x2, func) {
    // two array-like objects are passed element-by-element to func
    // return length is equal to the shortest input array length
    // returns [func(a1, a2), func(b1, b2), func(c1, c2), ...]

    return x1.map((x, i) => func(x, x2[i]));
};

export function less_equal(x1, x2) {
    // supports up to n-dimensions

    if ((typeof x1 === 'object') && (typeof x2 === 'object')) {
        return zipWith(x1, x2, less_equal)

    } else if ((typeof x1 === 'number') && (typeof x2 === 'object')) {
        return x2.map((b) => (x1 <= b))

    } else if ((typeof x1 === 'object') && (typeof x2 === 'number')) {
        return x1.map((a) => (a <= x2))

    } else {
        return (x1 <= x2)
    }
};

export function where(condition, x, y) {
    // Return elements chosen from x or y depending on condition.

    const func = (condition, x, y) => (condition ? x : y)

    if (Array.isArray(condition[0])) {
        return condition.map((a, idx) => where(a, x[idx], y[idx]));
    } else {
        return condition.map((a, idx) => func(a, x[idx], y[idx]));
    }
};

export function arange(start = 0, stop, step = 1) {
    /*
    Returns an array with evenly spaced elements as per the interval.

    start : [optional] start of interval range. By default start = 0
    stop  : end of interval range
    step  : [optional] step size of interval. By default step size = 1,  
    For any output out, this is the distance between two adjacent values, out[i+1] - out[i]. 
    */

    const listLength = Math.ceil((stop - start) / step)

    return Array(listLength).fill(start).map((x, y) => x + y * step)
};

export function NDimArray(dimensions, value = undefined) {
    // [row, col, stack]. default fill value is undefined

    if (dimensions.length > 0) {
        var dim = dimensions[0];
        var rest = dimensions.slice(1);
        return Array(dim).fill(value).map(() => NDimArray(rest, value));

    } else {
        return value;
    }
};

export function ones(shape) {
    // returns a n-dimensional array of ones
    // shape is a dimensional list [ row, col, stack, ... ]
    return NDimArray(shape, 1)
};

export function zeros(shape) {
    // returns a n-dimensional array of zeros
    // shape is a dimensional list [ row, col, stack, ... ]
    return NDimArray(shape, 0)
};

export function empty(shape) {
    // returns a n-dimensional array of undefined
    // shape is a dimensional list [ row, col, stack, ... ]
    return NDimArray(shape)
};

export function full(shape, value = undefined) {
    // returns a n-dimensional array of some value - else undefined
    // shape is a dimensional list [ row, col, stack, ... ]
    return NDimArray(shape, value)
};

export function repeat(a, repeats, axis = undefined) {
    // repeat elements of an array
    return (a.flatMap((v, i) => Array(repeats).fill(v))).flat();
};

export function rand(dimensions) {
    // Uniformly distributed random numbers

    if (dimensions.length > 0) {
        var dim = dimensions[0];
        var rest = dimensions.slice(1);
        var current = [...Array(dim)].map(() => (Math.random()));
        return current.map(() => rand(rest));

    } else {
        return Math.random();
    };
};

export function randint({ low, high = null, size = null }) {
    // return random integers from low (inclusive) to high (exclusive)

    /* 
    low: int or array-like of ints
        Lowest (signed) integers to be drawn from the distribution
            > [ low, high )
        > if high=None, the low parameter is one above the highest return
            > [ 0, low )

    high: int or array-like of ints, (optional)
        One above the largest (signed) integer to be drawn from the distribution
            > [ low, high )

    size: int or tuple of ints, (optional)
        Output shape. If the given shape is, e.g., (m, n, k), then m * n * k samples are drawn.

    out: int or array of ints
        size-shaped array of random integers from the appropriate distribution
        > if size=null, a single random int returned
    */

    function getInt(r) {
        // returns a bounded integer given a random r
        const min = Math.ceil(low);
        const max = Math.floor(high);
        return Math.floor(r * (max - min) + low);
    };

    if (size) {
        return (rand(size)).map(r => getInt(r));
    } else {
        return getInt(rand([1])[0])
    }
};

export function normal({ loc, scale, size }) {
    // draw random samples from a normal (Gaussian) distribution
    // https://stackoverflow.com/a/36481059/3382269
    // https://stackoverflow.com/a/49434653/3382269
    // https://en.wikipedia.org/wiki/Box%E2%80%93Muller_transform#Implementation
    // https://mika-s.github.io/javascript/random/normal-distributed/2019/05/15/generating-normally-distributed-random-numbers-in-javascript.html
    // https://www.sharpsightlabs.com/blog/numpy-random-normal/

    /*
    loc: float or array_like of floats
        Mean (???centre???) of the distribution.

    scale: float or array_like of floats
        Standard deviation (spread or ???width???) of the distribution. Must be non-negative.

    size: int or tuple of ints, (optional)
        Output shape. If the given shape is, e.g., (m, n, k), then m * n * k samples are drawn. If size is None (default), a single value is returned if loc and scale are both scalars. Otherwise, np.broadcast(loc, scale).size samples are drawn.

    out: array or scalar
        Drawn samples from the parameterized normal distribution.
    */
    // Standard Normal variate using Box-Muller transform.

    function randn_bm(mu, sigma) {
        let u1 = Math.random();
        let u2 = Math.random();

        //compute z0 and z1 transforms
        const mag = sigma * Math.sqrt(-2.0 * Math.log(u1));
        const z0 = mag * Math.cos(2.0 * Math.PI * u2) + mu;
        const z1 = mag * Math.sin(2.0 * Math.PI * u2) + mu;

        return {z0, z1}
    }

    const data = empty(size);
    data.forEach(function (pos, idx) {
        data[idx] = (randn_bm(loc, scale)).z0;
    })

    return data;
};

export function fftfreq(n, d = 1.0) {
    /* 
    Return the Discrete Fourier Transform sample frequencies.
        f = [0, 1, ...,   n/2-1,     -n/2, ..., -1] / (d*n)   if n is even
        f = [0, 1, ..., (n-1)/2, -(n-1)/2, ..., -1] / (d*n)   if n is odd
        n: Window length (int)
        d: Sample spacing, timestep (scalar, optional)
        f: ndarray
    */

    const val = 1.0 / (n * d)
    const results = empty([n])
    const N = Math.floor((n - 1) / 2) + 1

    const p1 = arange(0, N)
    results.splice(0, N, ...p1)  // start, end, array

    const p2 = arange(-Math.floor(n / 2), 0)
    results.splice(N, n, ...p2)  // start, end, array

    return multiply(round(results), val)
};

export function rfftfreq(n, d = 1.0) {
    /* 
    Return the Discrete Fourier Transform sample frequencies (for usage with rfft, irfft).
        f = [0, 1, ...,     n/2-1,     n/2] / (d*n)   if n is even
        f = [0, 1, ..., (n-1)/2-1, (n-1)/2] / (d*n)   if n is odd
        n: Window length (int)
        d: Sample spacing, timestep (scalar, optional)
        f: ndarray (length: n//2 + 1)
    */

    const val = 1.0 / (n * d);
    const N = Math.floor(n / 2) + 1;

    const results = arange(0, N);
    return multiply(round(results), val)
};

export function linspace(startValue, stopValue, cardinality) {
    // cardinality: number of elements in a set

    var arr = [];
    var step = (stopValue - startValue) / (cardinality - 1);
    for (var i = 0; i < cardinality; i++) {
        arr.push(startValue + (step * i));
    };
    return arr;
};

export function deg2rad(deg) {
    return deg * Math.PI / 180;
};

export function rad2deg(rad) {
    return 180 * rad / Math.PI;
};

export function mod(a, b) {
    // computes the remainder complementary to the floor_divide function.
    var m = a % b;
    if (m < 0) {
        // m += (b < 0) ? -b : b; // avoid this form: it is UB when b == INT_MIN
        m = (b < 0) ? m - b : m + b;
    }
    return m;
};
