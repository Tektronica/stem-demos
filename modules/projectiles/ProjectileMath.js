// https{//math.stackexchange.com/a/3019497

import { deg2rad, rad2deg } from "../base";

const G = 9.81;  // m/s^2


function find_position_at_time(h, theta, Vo, t) {
    const rad = deg2rad(theta);
    const Vy = Vo * Math.sin(rad);
    return h + Vy * t - ((G / 2.0) * (t ** 2));
};


function find_final_position(h, theta, Vo) {
    const rad = deg2rad(theta);
    const Vx = Vo * Math.cos(rad);
    return time_of_flight(h, theta, Vo) * Vx;
};


function time_of_flight(h, theta, Vo) {
    const rad = deg2rad(theta);
    const Vy = Vo * Math.sin(rad);
    return (Vy + Math.sqrt(Vy ** 2 + 2 * G * h)) / G;
};


function find_height_max(h, theta, Vo) {
    const rad = deg2rad(theta);
    const Vy = Vo * Math.sin(rad);
    return h + (Vy ** 2) / (2 * G);
};


function get_launch_angle(type, params) {
    var h = 0.0;  // launch height
    var v0 = 0.0;  // launch (initial) velocity
    var xfinal = 0.0;  // x coordinate to target
    var yfinal = 0.0;  // y coordinate to target
    var ymax = 0.0;  // max height of the projectile
    var theta_final = 0.0;  // final angle to target

    // https://stackoverflow.com/a/32138566/3382269
    switch (type) {
        case 'velocity':
            // launch angle given the fixed velocity and coordinate distance to the target
            ({ h, v0, xfinal, yfinal } = params);
            return rad2deg(Math.atan((v0 ** 2 + Math.sqrt(v0 ** 4 - G * (G * xfinal ** 2 + (2 * (yfinal - h) * (v0 ** 2))))) / (G * xfinal)));

        case 'angle':
            // launch angle given the angle and coordinate distance to the target
            ({ h, xfinal, yfinal, theta_final } = params);
            const rad_final = deg2rad(theta_final);
            return rad2deg(Math.atan((-xfinal * Math.tan(rad_final) - (2 * h) + (2 * yfinal)) / xfinal));

        case 'ceiling':
            // launch angle given the ceiling and coordinate distance to the target
            ({ h, xfinal, yfinal, ymax } = params);
            return rad2deg(Math.atan((2 * ((ymax - h) + (Math.sqrt((ymax - h) * (ymax - yfinal)))) / xfinal)));

        default:
            throw new Error("case does not exist");
    };
};


function get_launch_velocity(theta_initial, theta_final, xfinal) {
    const rad_initial = deg2rad(theta_initial);
    const rad_final = deg2rad(theta_final);
    return (1 / Math.cos(rad_initial)) * Math.sqrt((G * xfinal) / (Math.tan(rad_initial) - Math.tan(rad_final)));
};


function get_target_angle(h, xfinal, ymax, theta_launch) {
    const rad_launch = deg2rad(theta_launch);
    return rad2deg(Math.atan(Math.tan(rad_launch) - ((xfinal) / (2 * (ymax - h))) * Math.tan(rad_launch) ** 2));
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
