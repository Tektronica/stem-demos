// https://github.com/Tektronica/projectile_demos
import { useState } from "react";

import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

// custom chart component import
import TimePlot from "../components/charts/TimePlot";

// custom math module imports
import {
    Projectile,
    animateProjectile,
    Cannon,
    TargetAngle,
    MaxCeiling
} from "../modules/projectiles/solvers";

export default function Projectiles() {

    // first demo ----------------------------------------
    var launch_height = 2;  // meters
    var launch_velocity = 10;  // m/s
    var launch_angle = 45;  // degrees

    // const plotData01 = Projectile(launch_height, launch_velocity, launch_angle);
    const [plotData, setPlotData] = useState([{ 'x': null, 'y': null }]);
    const [xlim, setXlim] = useState([null, null]);
    const [ylim, setYlim] = useState([null, null]);
    const [boxes, setBoxes] = useState(null);

    function selectData(type) {
        switch (type) {
            case 'projectile':
                async function myfunc() {
                    setPlotData([{ 'x': null, 'y': null }]);  // reset data
                    animateProjectile(launch_height, launch_velocity, launch_angle, setPlotData);
                }
                myfunc();

                setXlim([-0.5, 12]);
                setYlim([0.5, 5]);
                setBoxes(null);
                break;

            case 'cannon':
                // second demo ---------------------------------------
                launch_height = 1;  // meters
                launch_velocity = 10;  // m/s
                var target_distance = 8; // meters
                var target_height = 2;  // meters

                setPlotData(Cannon(launch_height, launch_velocity, target_distance, target_height));
                setBoxes([
                    // rectangle(xy1, xy2, angle)
                    rectangle([-0.5, 0], [0.5 + 0.5, launch_height]),  // left box 
                    rectangle([target_distance - 0.5, 0], [target_distance + 0.5, target_height]),  // right box
                ]);

                setXlim([-0.5, target_distance]);
                setYlim([0.5, null]);
                break;

            case 'target':
                // third demo ----------------------------------------
                launch_height = 1;  // m/s
                target_distance = 20;  // meters
                target_height = 3; // meters
                var target_angle = -45;  // degrees

                setPlotData(TargetAngle(launch_height, target_distance, target_height, target_angle));
                setBoxes([
                    // rectangle(xy1, xy2, angle)
                    rectangle([-0.5, 0], [0.5 + 0.5, launch_height]),  // left box 
                    rectangle([target_distance - 0.5, 0], [target_distance + 0.5, target_height]),  // right box
                ]);

                setXlim([-0.5, target_distance]);
                setYlim([0, null]);
                break;

            case 'ceiling':
                // fourth demo ----------------------------------------
                launch_height = 3;  // meters
                target_distance = 10;  // meters
                target_height = 1;  // meters
                const ceiling_height = 5;  // meters

                setPlotData(MaxCeiling(launch_height, target_distance, target_height, ceiling_height));
                setBoxes([
                    // rectangle(xy1, xy2, angle)
                    rectangle([-0.5, 0], [0.5 + 0.5, launch_height]),  // left box 
                    rectangle([target_distance - 0.5, 0], [target_distance + 0.5, target_height]),  // right box
                    rectangle([-0.5 - 0.5, ceiling_height], [target_distance + 0.5, ceiling_height + 0.5]),  // ceiling box
                ]);

                setXlim([0, target_distance]);
                setYlim([0, ceiling_height + 0.4]);
                break;
        }
    }

    return (
        <>
            <ShadowBox>
                <h1 className="text-3xl font-bold underline">
                    Projectile Demo #2
                </h1>
                <TimePlot
                    pointData={plotData}
                    box={boxes}
                    xlim={xlim}
                    ylim={ylim}
                    title='Projectile Demo #2' />
            </ShadowBox>

            <ShadowBox>
                <div className="grid gap-4 grid-cols-4">
                    <button
                        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                        onClick={() => (selectData('projectile'))}>
                        Projectile
                    </button>
                    <button
                        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                        onClick={() => (selectData('cannon'))}>
                        Cannon
                    </button>
                    <button
                        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                        onClick={() => (selectData('target'))}>
                        Known Target
                    </button>
                    <button
                        className="bg-white hover:bg-gray-100 text-gray-800 font-semibold py-2 px-4 border border-gray-400 rounded shadow"
                        onClick={() => (selectData('ceiling'))}>
                        Max Ceiling
                    </button>
                </div>
            </ShadowBox>
        </>
    )
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
