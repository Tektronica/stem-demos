import {
    get_launch_angle,
    get_launch_velocity,
    get_target_angle
} from "../ProjectileMath";

import Projectile from "./StandardEquation";

/*
PROJECTILE WITH MAX CEILING
This function constrains the projectile to a max trajectory height
[Example] ......... Limited Ceiling
                    A trajectory can't exceed a ceiling

[constraints] ..... angle final and position final
[function] ........ initial angle
                    θi(θf, xf)

[constraints] ..... angle final and position final
[function] ........ initial angle
                    θf(h0, θi, xfinal, ymax)

[constraints] ..... angle initial, angle final, and position final
[function] ........ initial angle
                    v0(θi, θf, xf)

[constraints] ..... height initial, velocity initial, and angle initial.
[function] ........ vertical position
                    y(h0, θi, v0)
 */

function MaxCeiling(h0, xfinal, yfinal, ymax) {
    const params = {
        h0: h0, // launch height
        xfinal: xfinal,  // target distance
        yfinal: yfinal, // target height
        ymax: ymax  // trajectory max height
    };

    const deg0 = get_launch_angle('ceiling', params);
    const degf = get_target_angle(h0, deg0, xfinal, ymax);
    const v0 = get_launch_velocity(deg0, degf, xfinal);

    const plotData = Projectile(h0, v0, deg0)
    return plotData;
};

export default MaxCeiling;
