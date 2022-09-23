import {
    get_launch_angle,
} from "../ProjectileMath";

import Projectile from "./StandardEquation";

/*
PROJECTILE GIVEN VELOCITY INITIAL AND POSITION FINAL
This function constrains the projectile to a velocity initial and position final
[Example] ......... Cannon
                    Air compressor has a known exit velocity
                    adjusting angle adjust height

[constraints] ..... initial velocity and the final position
[function] ........ launch angle
                    θi(v0, xf)

[constraints] ..... height initial, velocity initial, and angle initial.
[function] ........ vertical position
                    y(h0, θi, v0)
 */

function Cannon(h0, v0, xfinal, yfinal) {

    const params = {
        h0: h0, // launch height
        v0: v0,  // launch velocity
        xfinal: xfinal, // target distance
        yfinal: yfinal  // target height
    };

    const deg0 = get_launch_angle('velocity', params);
    const plotData = Projectile(h0, v0, deg0)
    return plotData;
};

export default Cannon;
