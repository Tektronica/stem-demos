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
    find_height_max
} from "../modules/projectiles/ProjectileMath"

export default function Projectiles() {
    const launch_velocity = 10;  // m/s
    const launch_angle = 45;  // deg
    const launch_height = 2;  // m

    const plotData = run_projectile_demo(launch_height, launch_angle, launch_velocity)

    return (
        <ShadowBox>
            <h1 className="text-3xl font-bold underline">
                Projectile Demo #1
            </h1>
            <TimePlot pointData={plotData} title='Projectile Demo #1' />
        </ShadowBox>
    )
};

const G = 9.81;  // m/s^2

function run_projectile_demo(h, theta, Vo) {
    const rad = deg2rad(theta);
    const Vx = Vo * Math.cos(rad);

    // console.log the governing projectile equation
    console.log(`Equation: y = ${h} + ${round(Math.tan(rad), 5)}x - ${round(G / (Vx ** 2 * 2.0), 5)}x^2`);

    // compute final x position
    const xfinal = find_final_position(h, theta, Vo);
    console.log(`Distance = ${round(xfinal, 3)} m`);

    // compute max height of projectile
    const ymax = find_height_max(h, theta, Vo);
    console.log(`Peak Height = ${round(ymax, 3)} m`);

    // compute time elapsed
    const tfinal = time_of_flight(h, theta, Vo)
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

    return plotData
};


Projectiles.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    )
};
