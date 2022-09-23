// https{//math.stackexchange.com/a/3019497

import { deg2rad, rad2deg } from "../base";

const G = 9.81;  // m/s^2


function find_position_at_time(h0, v0, deg0, t) {
    const rad0 = deg2rad(deg0);
    const Vy = v0 * Math.sin(rad0);
    return h0 + Vy * t - ((G / 2.0) * (t ** 2));
};


function find_final_position(h0, v0, deg0) {
    const rad0 = deg2rad(deg0);
    const Vx = v0 * Math.cos(rad0);
    return time_of_flight(h0, v0, deg0) * Vx;
};


function time_of_flight(h0, v0, deg0) {
    const rad0 = deg2rad(deg0);
    const Vy = v0 * Math.sin(rad0);
    return (Vy + Math.sqrt(Vy ** 2 + 2 * G * h0)) / G;
};


function find_height_max(h0, v0, deg0) {
    const rad0 = deg2rad(deg0);
    const Vy = v0 * Math.sin(rad0);
    return h0 + (Vy ** 2) / (2 * G);
};


function get_launch_angle(type, params) {
    var h0 = 0.0;  // launch height
    var v0 = 0.0;  // launch (initial) velocity
    var xfinal = 0.0;  // x coordinate to target
    var yfinal = 0.0;  // y coordinate to target
    var ymax = 0.0;  // max height of the projectile
    var degf = 0.0;  // final angle to target

    // https://stackoverflow.com/a/32138566/3382269
    switch (type) {
        case 'velocity':
            // launch angle given the fixed velocity and coordinate distance to the target
            ({ h0, v0, xfinal, yfinal } = params);
            return rad2deg(Math.atan((v0 ** 2 + Math.sqrt(v0 ** 4 - G * (G * xfinal ** 2 + (2 * (yfinal - h0) * (v0 ** 2))))) / (G * xfinal)));

        case 'angle':
            // launch angle given the angle and coordinate distance to the target
            ({ h0, xfinal, yfinal, degf } = params);
            const radf = deg2rad(degf);
            return rad2deg(Math.atan((-xfinal * Math.tan(radf) - (2 * h0) + (2 * yfinal)) / xfinal));

        case 'ceiling':
            // launch angle given the ceiling and coordinate distance to the target
            ({ h0, xfinal, yfinal, ymax } = params);
            return rad2deg(Math.atan((2 * ((ymax - h0) + (Math.sqrt((ymax - h0) * (ymax - yfinal)))) / xfinal)));

        default:
            throw new Error("case does not exist");
    };
};


function get_launch_velocity(deg0, degf, xfinal) {
    const rad0 = deg2rad(deg0);
    const radf = deg2rad(degf);
    return (1 / Math.cos(rad0)) * Math.sqrt((G * xfinal) / (Math.tan(rad0) - Math.tan(radf)));
};


function get_target_angle(h0, deg0, xfinal, ymax) {
    const rad0 = deg2rad(deg0);
    return rad2deg(Math.atan(Math.tan(rad0) - ((xfinal) / (2 * (ymax - h0))) * Math.tan(rad0) ** 2));
};


export {
    find_position_at_time,
    find_final_position,
    time_of_flight,
    find_height_max,
    get_launch_angle,
    get_launch_velocity,
    get_target_angle
};
