import { deg2rad, round, zeros, linspace } from "../../base";

import {
    find_final_position,
    time_of_flight,
    find_height_max,
} from "../ProjectileMath";

const G = 9.81;  // m/s^2

/*
THE STANDARD PROJECTILE EQUATION
This function provides the standard equation for a projectile without air resistance
[Example] ......... Standard Equation
                    Knowing all initial components of the trajectory path

[constraints] ..... height initial, velocity initial, and angle initial.
[function] ........ vertical position
                    y(h0, θi, v0)
 */

function Projectile(h0, v0, deg0) {
    const rad0 = deg2rad(deg0);
    const Vx = v0 * Math.cos(rad0);

    // log the governing projectile equation
    console.log(`Equation: y = ${h0} + ${round(Math.tan(rad0), 5)}x - ${round(G / (Vx ** 2 * 2.0), 5)}x^2`);

    // compute final x position
    const xfinal = find_final_position(h0, v0, deg0);
    console.log(`Distance = ${round(xfinal, 3)} m`);

    // compute max height of projectile
    const ymax = find_height_max(h0, v0, deg0);
    console.log(`Peak Height = ${round(ymax, 3)} m`);

    // compute time elapsed
    const tfinal = time_of_flight(h0, deg0, v0);
    console.log(`Time of flight = ${round(tfinal, 3)} s`);

    // compute x and y values
    const xt = linspace(0, xfinal, 100);
    const yt = xt.map((x) => (h0 + Math.tan(rad0) * x - (G / (2.0 * Vx ** 2)) * (x ** 2)));

    // convert to pointData rather than datasets xt=[...] and yt=[...]
    // this could easily be a generator
    let plotData = zeros([xt.length, 0]);

    for (var idx in plotData) {
        plotData[idx] = { x: xt[idx], y: yt[idx] };
    };

    return plotData;
};

export default Projectile;
