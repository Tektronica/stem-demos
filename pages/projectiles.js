// https://github.com/Tektronica/projectile_demos

import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

// custom chart component import
import TimePlot from "../components/charts/TimePlot";

// custom math module imports
import {
    Projectile,
    Cannon,
    TargetAngle,
    MaxCeiling
} from "../modules/projectiles/solvers";

export default function Projectiles() {
    // first demo ----------------------------------------
    var launch_height = 2;  // meters
    var launch_velocity = 10;  // m/s
    var launch_angle = 45;  // degrees

    const plotData01 = Projectile(launch_height, launch_velocity, launch_angle);


    // second demo ---------------------------------------
    launch_height = 1;  // meters
    launch_velocity = 10;  // m/s
    var target_distance = 8; // meters
    var target_height = 2;  // meters

    const plotData02 = Cannon(launch_height, launch_velocity, target_distance, target_height);
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

    const plotData03 = TargetAngle(launch_height, target_distance, target_height, target_angle);
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

    const plotData04 = MaxCeiling(launch_height, target_distance, target_height, ceiling_height);
    const boxes04 = [
        // rectangle(xy1, xy2, angle)
        rectangle([-0.5, 0], [0.5 + 0.5, launch_height]),  // left box 
        rectangle([target_distance - 0.5, 0], [target_distance + 0.5, target_height]),  // right box
        rectangle([-0.5 - 0.5, ceiling_height], [target_distance + 0.5, ceiling_height + 0.5]),  // ceiling box
    ];

    const xlim04 = [0, target_distance]
    const ylim04 = [0, ceiling_height + 0.4]


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
