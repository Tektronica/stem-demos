// https{//math.stackexchange.com/a/3019497

import { deg2rad } from "../base";

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

export {
    find_position_at_time,
    find_final_position,
    time_of_flight,
    find_height_max
};
