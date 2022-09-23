// https://github.com/Tektronica/projectile_demos

import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

// chart component import
import TimePlot from "../components/charts/TimePlot";

// custom math module imports
import { deg2rad, round, zeros, linspace } from "../modules/base";
import {
    find_final_position,
    time_of_flight,
    find_height_max,
    get_launch_angle,
    get_launch_velocity,
    get_target_angle
} from "../modules/projectiles/ProjectileMath"

export default function Projectiles() {
    // first demo ----------------------------------------
    var launch_velocity = 10;  // m/s
    var launch_angle = 45;  // degrees
    var launch_height = 2;  // meters

    const plotData01 = run_projectile_demo(launch_height, launch_angle, launch_velocity);

    // second demo ---------------------------------------
    launch_height = 1;  // meters
    launch_velocity = 10;  // m/s
    var target_distance = 8; // meters
    var target_height = 2;  // meters

    var params = {
        h: launch_height, // m/s
        v0: launch_velocity,  // meters
        xfinal: target_distance, // meters
        yfinal: target_height  // meters
    };

    launch_angle = get_launch_angle('velocity', params);
    const plotData02 = run_projectile_target_demo(launch_height, target_height, target_distance, launch_angle, launch_velocity);
    const boxes02 = [
        // rectangle(xy1, xy2, angle)
        rectangle([-0.5, 0], [0.5 + 0.5, launch_height]),  // left box 
        rectangle([target_distance - 0.5, 0], [target_distance + 0.5, target_height]),  // right box
    ];

    const xlim02 = [-0.5, target_distance]
    const ylim02 = [0.5, null]

    // third demo ----------------------------------------
    launch_height = 1;  // m/s
    target_distance = 20;  // meters
    target_height = 3; // meters
    var target_angle = -45;  // degrees

    params = {
        h: launch_height, // meters
        xfinal: target_distance,  // meters
        yfinal: target_height, // meters
        theta_final: target_angle  // theta
    };

    launch_angle = get_launch_angle('angle', params);
    var v0 = get_launch_velocity(launch_angle, target_angle, target_distance);
    const plotData03 = run_target_angle_demo(launch_height, target_height, target_distance, launch_angle, v0);
    const boxes03 = [
        // rectangle(xy1, xy2, angle)
        rectangle([-0.5, 0], [0.5 + 0.5, launch_height]),  // left box 
        rectangle([target_distance - 0.5, 0], [target_distance + 0.5, target_height]),  // right box
    ];

    const xlim03 = [-0.5, target_distance]
    const ylim03 = [0, null]

    // fourth demo ----------------------------------------
    launch_height = 3;  // meters
    target_distance = 10;  // meters
    target_height = 1;  // meters
    const ceiling_height = 5;  // meters

    params = {
        h: launch_height, // meters
        xfinal: target_distance,  // meters
        yfinal: target_height, // meters
        ymax: ceiling_height  // theta
    };

    launch_angle = get_launch_angle('ceiling', params);
    target_angle = get_target_angle(launch_height, target_distance, ceiling_height, launch_angle);
    v0 = get_launch_velocity(launch_angle, target_angle, target_distance);
    const plotData04 = run_projectile_target_ceiling_demo(launch_height, target_height, target_distance, launch_angle, v0);
    const boxes04 = [
        // rectangle(xy1, xy2, angle)
        rectangle([-0.5, 0], [0.5 + 0.5, launch_height]),  // left box 
        rectangle([target_distance - 0.5, 0], [target_distance + 0.5, target_height]),  // right box
        rectangle([-0.5 - 0.5, ceiling_height], [target_distance + 0.5, ceiling_height + 0.5]),  // ceiling box
    ];

    const xlim04 = [0, target_distance]
    const ylim04 = [0, ceiling_height + 0.4]

    console.log(`Launch Angle: ${launch_angle}`);
    console.log(`Target Angle: ${target_angle}`);
    console.log(`Project Velocity: ${v0}`);

    return (
        <>
            <ShadowBox>
                <h1 className="text-3xl font-bold underline">
                    Projectile Demo #1
                </h1>
                <TimePlot pointData={plotData01} title='Projectile Demo #1' />
            </ShadowBox>

            <ShadowBox>
                <h1 className="text-3xl font-bold underline">
                    Projectile Demo #2
                </h1>
                <TimePlot
                    pointData={plotData02}
                    box={boxes02}
                    xlim={xlim02}
                    ylim={ylim02}
                    title='Projectile Demo #2' />
            </ShadowBox>

            <ShadowBox>
                <h1 className="text-3xl font-bold underline">
                    Projectile Demo #3
                </h1>
                <TimePlot
                    pointData={plotData03}
                    box={boxes03}
                    xlim={xlim03}
                    ylim={ylim03}
                    title='Projectile Demo #3' />
            </ShadowBox>

            <ShadowBox>
                <h1 className="text-3xl font-bold underline">
                    Projectile Demo #4
                </h1>
                <TimePlot
                    pointData={plotData04}
                    box={boxes04}
                    xlim={xlim04}
                    ylim={ylim04}
                    title='Projectile Demo #4' />
            </ShadowBox>
        </>
    )
};


const G = 9.81;  // m/s^2

function run_projectile_demo(h, theta, v0) {
    const rad = deg2rad(theta);
    const Vx = v0 * Math.cos(rad);

    // log the governing projectile equation
    console.log(`Equation: y = ${h} + ${round(Math.tan(rad), 5)}x - ${round(G / (Vx ** 2 * 2.0), 5)}x^2`);

    // compute final x position
    const xfinal = find_final_position(h, theta, v0);
    console.log(`Distance = ${round(xfinal, 3)} m`);

    // compute max height of projectile
    const ymax = find_height_max(h, theta, v0);
    console.log(`Peak Height = ${round(ymax, 3)} m`);

    // compute time elapsed
    const tfinal = time_of_flight(h, theta, v0);
    console.log(`Time of flight = ${round(tfinal, 3)} s`);

    // compute x and y values
    const xt = linspace(0, xfinal, 100);
    const yt = xt.map((x) => (h + Math.tan(rad) * x - (G / (2.0 * Vx ** 2)) * (x ** 2)));

    // convert to pointData rather than datasets xt=[...] and yt=[...]
    // this could easily be a generator
    let plotData = zeros([xt.length, 0]);

    for (var idx in plotData) {
        plotData[idx] = { x: xt[idx], y: yt[idx] };
    };

    return plotData;
};


function run_projectile_target_demo(h, hfinal, xfinal, theta, v0) {
    const rad = deg2rad(theta);
    const Vx = v0 * Math.cos(rad);

    // log the governing projectile equation
    console.log(`Equation: y = ${h} + ${round(Math.tan(rad), 5)}x - ${round(G / (Vx ** 2 * 2.0), 5)}x^2`);

    // compute final x position
    // xfinal = find_final_position(h, theta, v0)
    console.log(`Distance = ${round(xfinal, 3)} m`);

    // compute max height of projectile
    const ymax = find_height_max(h, theta, v0);
    console.log(`Peak Height = ${round(ymax, 3)} m`);

    // compute time elapsed
    const tfinal = time_of_flight(h, theta, v0);
    console.log(`Time of Flight = ${round(tfinal, 3)} s`);

    // plot
    const xt = linspace(0, xfinal, 100);
    const yt = xt.map((x) => (h + Math.tan(rad) * x - (G / (2.0 * Vx ** 2)) * (x ** 2)));

    // convert to pointData rather than datasets xt=[...] and yt=[...]
    // this could easily be a generator
    let plotData = zeros([xt.length, 0]);

    for (var idx in plotData) {
        plotData[idx] = { x: xt[idx], y: yt[idx] };
    };

    return plotData;
};


function run_target_angle_demo(h, hfinal, xfinal, theta, v0) {
    const rad = deg2rad(theta);
    const Vx = v0 * Math.cos(rad);

    // log the governing projectile equation
    console.log(`Equation: y = ${h} + ${round(Math.tan(rad), 5)}x - ${round(G / (Vx ** 2 * 2.0), 5)}x^2`);

    // compute final x position
    // xfinal = find_final_position(h, theta, v0)
    console.log(`Distance = ${round(xfinal, 3)} m`);

    // compute max height of projectile
    const ymax = find_height_max(h, theta, v0);
    console.log(`Peak Height = ${round(ymax, 3)} m`);

    // compute time elapsed
    const tfinal = time_of_flight(h, theta, v0);
    console.log(`Time of Flight = ${round(tfinal, 3)} s`);

    // plot
    const xt = linspace(0, xfinal, 100);
    const yt = xt.map((x) => (h + Math.tan(rad) * x - (G / (2.0 * Vx ** 2)) * (x ** 2)));

    // convert to pointData rather than datasets xt=[...] and yt=[...]
    // this could easily be a generator
    let plotData = zeros([xt.length, 0]);

    for (var idx in plotData) {
        plotData[idx] = { x: xt[idx], y: yt[idx] };
    };

    return plotData;
};


function run_projectile_target_ceiling_demo(h, hfinal, xfinal, theta, v0) {
    const rad = deg2rad(theta);
    const Vx = v0 * Math.cos(rad);

    // print the governing projectile equation
    console.log(`Equation: y = ${h} + ${round(Math.tan(rad), 5)}x - ${round(G / (Vx ** 2 * 2.0), 5)}x^2`);

    // compute final x position
    // xfinal = find_final_position(h, theta, v0)
    console.log(`Distance = ${round(xfinal, 3)} m`);

    // compute max height of projectile
    const ymax = find_height_max(h, theta, v0);
    console.log(`Peak Height = ${round(ymax, 3)} m`);

    // compute time elapsed
    const tfinal = time_of_flight(h, theta, v0);
    console.log(`Time of Flight = ${round(tfinal, 3)} s`);

    // plot
    const xt = linspace(0, xfinal, 100);
    const yt = xt.map((x) => (h + Math.tan(rad) * x - (G / (2.0 * Vx ** 2)) * (x ** 2)));

    // convert to pointData rather than datasets xt=[...] and yt=[...]
    // this could easily be a generator
    let plotData = zeros([xt.length, 0]);

    for (var idx in plotData) {
        plotData[idx] = { x: xt[idx], y: yt[idx] };
    };

    return plotData;
};


function rectangle(xy1, xy2, angle) {
    /*
        xy1     : [float, float] left-lower corner
        xy2     : [float, float] right-upper corner
        angle   : float rotation
     */

    const [x1, y1] = xy1;
    const [x2, y2] = xy2;

    return { p1: [x1, y1], p2: [x2, y2] };
};


Projectiles.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    )
};
