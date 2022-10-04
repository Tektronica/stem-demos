import { mean } from "../base";

function chisquare() {
    /* 
    Pearson's chi-squared test (χ2):
    >> statistical test to determine how Gaussian (or any distribution) the data fits

    https://en.wikipedia.org/wiki/Pearson's_chi-squared_test
    https://docs.scipy.org/doc/scipy/reference/generated/scipy.stats.chisquare.html
    https://en.wikibooks.org/wiki/Algorithm_Implementation/Pseudorandom_Numbers/Chi-Square_Test
    */

};

// MAPE not for zero test values
function mean_absolute_percentage_error({ y_test, y_actual }) {
    // MAPE
    // MAPE cannot be used for values near or equal to zero!!
    // https://en.wikipedia.org/wiki/Mean_absolute_percentage_error
    // https://stackoverflow.com/a/30244189/3382269

    const items = y_test.map((y, idx) => (Math.abs((y - y_actual[idx]) / (y))));

    return mean(items) * 100;
};

export { chisquare, mean_absolute_percentage_error };
