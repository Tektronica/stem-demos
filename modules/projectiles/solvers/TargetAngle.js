import {
    get_launch_angle,
    get_launch_velocity,
} from "../ProjectileMath";

import { Projectile } from "./StandardEquation";

/*
PROJECTILE GIVEN A KNOWN TARGET
This function constrains the projectile to a position final and angle final
[Example] ......... Critical Target Angle
                    A basketball hoop is an example where a steeper target angle is preferred

[constraints] ..... angle final and position final
[function] ........ launch angle
                    θi(θf, xf)

[constraints] ..... angle initial, angle final, and position final
[function] ........ target angle
                    v0(θi, θf, xf)

[constraints] ..... height initial, velocity initial, and angle initial.
[function] ........ vertical position
                    y(h0, v0, θi)
 */

function TargetAngle(h0, xfinal, yfinal, degf) {

    const params = {
        h0: h0, // launch height
        xfinal: xfinal,  // target distance
        yfinal: yfinal, // target height
        degf: degf  // target angle
    };

    const deg0 = get_launch_angle('angle', params);
    const v0 = get_launch_velocity(deg0, degf, xfinal);

    const plotData = Projectile(h0, v0, deg0)
    return plotData;
};

export default TargetAngle;
