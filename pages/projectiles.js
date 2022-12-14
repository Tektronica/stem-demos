// https://github.com/Tektronica/projectile_demos
import { useEffect, useState } from "react";

import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

// custom chart component import
import LinePlot from "../components/charts/LinePlot";

// custom math module imports
import {
    Projectile,
    animateProjectile,
    Cannon,
    TargetAngle,
    MaxCeiling
} from "../modules/projectiles/solvers";
import { arange, round } from "../modules/base";


const WAIT_INTERVAL = 200;  // ms
var timerID = null;

export default function Projectiles() {

    // const plotData01 = Projectile(launch_height, launch_velocity, launch_angle);
    const [plotData, setPlotData] = useState({
        datasets: [{ 'x': null, 'y': null }],
        xlim: [null, null],
        ylim: [null, null]
    });

    const [boxes, setBoxes] = useState(null);

    // range sliders
    const [launchConfig, setLaunchConfig] = useState({ y0: 2, v0: 10, deg0: 45 });
    const [targetConfig, setTargetConfig] = useState({ xfinal: 8, yfinal: 2, degf: -45, ymax: 10 });
    const [activeMode, setActiveMode] = useState('cannon');

    // plot results
    const [results, setResults] = useState({
        eqn: '',
        y0: null,
        v0: null,
        deg0: null,
        xfinal: null,
        yfinal: null,
        degf: null,
        ymax: null,
        tfinal: null,
    });

    function getData() {
        switch (activeMode) {
            case 'projectile':
                // projectile
                var { y0, v0, deg0 } = launchConfig;

                // async function myfunc() {
                //     setPlotData([{ 'x': null, 'y': null }]);  // reset data
                //     animateProjectile(y0, v0, deg0, setPlotData);
                // }
                // myfunc();

                var [pointData, plotResults] = Projectile(y0, v0, deg0);

                // attributes
                setBoxes([
                    // rectangle(xy1, xy2, deg0)
                    rectangle([-0.5, 0], [0.5 + 0.5, y0]),  // left box 
                ]);

                setPlotData({
                    datasets: [
                        {
                            data: pointData,
                            label: 'projectile',
                            color: 'rgba(75,192,192,1)',
                            dashed: false
                        },
                    ],
                    xlim: [0, null],
                    ylim: [0, null]
                });

                break;

            case 'cannon':
                // cannon
                var { y0, v0 } = launchConfig;
                var { xfinal, yfinal } = targetConfig;
                var [pointData, plotResults] = Cannon(y0, v0, xfinal, yfinal);


                // attributes
                setBoxes([
                    // rectangle(xy1, xy2, deg0)
                    rectangle([-0.5, 0], [0.5 + 0.5, y0]),  // left box 
                    rectangle([xfinal - 0.5, 0], [xfinal + 0.5, yfinal]),  // right box
                ]);

                setPlotData({
                    datasets: [
                        {
                            data: pointData,
                            label: 'projectile',
                            color: 'rgba(75,192,192,1)',
                            dashed: false
                        },
                    ],
                    xlim: [-0.5, xfinal],
                    ylim: [0.5, null]
                });
                break;

            case 'target':
                // target
                var { y0 } = launchConfig;
                var { xfinal, yfinal, degf } = targetConfig;
                var [pointData, plotResults] = TargetAngle(y0, xfinal, yfinal, degf);

                setBoxes([
                    // rectangle(xy1, xy2, angle)
                    rectangle([-0.5, 0], [0.5 + 0.5, y0]),  // left box 
                    rectangle([xfinal - 0.5, 0], [xfinal + 0.5, yfinal]),  // right box
                ]);

                setPlotData({
                    datasets: [
                        {
                            data: pointData,
                            label: 'projectile',
                            color: 'rgba(75,192,192,1)',
                            dashed: false
                        },
                    ],
                    xlim: [-0.5, xfinal],
                    ylim: [0, null]
                });
                break;

            case 'ceiling':
                // ceiling
                var { y0 } = launchConfig;
                var { xfinal, yfinal, ymax } = targetConfig;
                var [pointData, plotResults] = MaxCeiling(y0, xfinal, yfinal, ymax);

                setBoxes([
                    // rectangle(xy1, xy2, angle)
                    rectangle([-0.5, 0], [0.5 + 0.5, y0]),  // left box 
                    rectangle([xfinal - 0.5, 0], [xfinal + 0.5, yfinal]),  // right box
                    rectangle([-0.5 - 0.5, ymax], [xfinal + 0.5, ymax + 0.5]),  // ceiling box
                ]);

                setPlotData({
                    datasets: [
                        {
                            data: pointData,
                            label: 'projectile',
                            color: 'rgba(75,192,192,1)',
                            dashed: false
                        },
                    ],
                    xlim: [0, xfinal],
                    ylim: [0, ymax + 0.4]
                });
                break;
        }

        setResults(plotResults);
    };

    // handles the button used to change mode
    function handleClick(evt) {
        // unpack name to get mode
        setActiveMode(evt.target.name);
    };

    // handles the slider value update
    function handleSlider(evt, setState) {

        // clear the timeout after every new firing
        clearTimeout(timerID);

        // update plot
        // delay fetch unless user has stopped typing for at least the timeout duration
        timerID = setTimeout(async () => {
            // unpack id to get classification
            const [category, type] = (evt.target.id).split('-');

            // https://stackoverflow.com/a/66814808/3382269
            const newVal = evt.target.valueAsNumber;

            // update state of category type
            // https://stackoverflow.com/a/46209368/3382269
            setState((current) => ({ ...current, [type]: newVal }));

        }, WAIT_INTERVAL);
    };

    // when range sliders update, dispatch useEffect on state change
    useEffect(() => {
        // the state needs time to mutate before updating plot
        // https://stackoverflow.com/a/41278440/3382269
        // https://stackoverflow.com/a/56394177/3382269
        getData();
    }, [launchConfig, targetConfig, activeMode]);

    return (
        <>
            <ShadowBox>
                <h1 className="text-3xl font-bold">
                    Projectile Demos
                </h1>
                <LinePlot
                    pointData={plotData.datasets}
                    box={boxes}
                    xlim={plotData.xlim}
                    ylim={plotData.ylim}
                    height={300}
                // title='Projectile Demo'
                />
            </ShadowBox>

            <ShadowBox>
                <div className="border rounded">
                    <label className='flex p-2 font-bold uppercase border-b'>
                        Results
                    </label>
                    <div className='p-2 font-mono text-sm'>
                        {results.eqn}
                    </div>
                    <div className="p-2 bg-slate-100 font-mono text-sm">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="grid grid-rows-3">
                                <ResultsItem result={results.y0} roundTo={3} units={'m'} label={'Launch Height'} />
                                <ResultsItem result={results.v0} roundTo={3} units={'m/s'} label={'Launch Velocity'} />
                                <ResultsItem result={results.deg0} roundTo={3} units={'(deg)'} label={'Launch Angle'} />
                            </div>

                            <div className="grid grid-rows-3">
                                <ResultsItem result={results.tfinal} roundTo={3} units={'s'} label={'Flight Time'} />
                                <ResultsItem result={results.ymax} roundTo={3} units={'m'} label={'Max Height'} />
                            </div>

                            <div className="grid grid-rows-3">
                                <ResultsItem result={results.yfinal} roundTo={3} units={'m'} label={'Target Height'} />
                                <ResultsItem result={results.xfinal} roundTo={3} units={'m'} label={'Target Velocity'} />
                                <ResultsItem result={results.degf} roundTo={3} units={'(deg)'} label={'Target Angle'} />
                            </div>
                        </div>
                    </div>
                </div>
            </ShadowBox>

            <ShadowBox>
                <div className="grid grid-cols-4 gap-4">

                    <button
                        className={`py-2 px-4 bg-white border ${(activeMode == "projectile") ? "border-pink-400 border-2" : "border-gray-400"} rounded hover:bg-gray-100 text-gray-800 font-semibold shadow`}
                        name="projectile"
                        onClick={(evt) => (handleClick(evt))}>
                        Projectile
                    </button>

                    <button
                        className={`py-2 px-4 bg-white border ${(activeMode == "cannon") ? "border-pink-400 border-2" : "border-gray-400"} rounded hover:bg-gray-100 text-gray-800 font-semibold shadow`}
                        name="cannon"
                        onClick={(evt) => (handleClick(evt))}>
                        Cannon
                    </button>
                    <button
                        className={`py-2 px-4 bg-white border ${(activeMode == "target") ? "border-pink-400 border-2" : "border-gray-400"} rounded hover:bg-gray-100 text-gray-800 font-semibold shadow`}
                        name="target"
                        onClick={(evt) => (handleClick(evt))}>
                        Known Target
                    </button>
                    <button
                        className={`py-2 px-4 bg-white border ${(activeMode == "ceiling") ? "border-pink-400 border-2" : "border-gray-400"} rounded hover:bg-gray-100 text-gray-800 font-semibold shadow`}
                        name="ceiling"
                        onClick={(evt) => (handleClick(evt))}>
                        Max Ceiling
                    </button>
                </div>

                <div className="grid grid-cols-3 gap-2 m-4">
                    <div className="border rounded">
                        <label className='flex p-2 font-bold uppercase border-b'>Launch</label>
                        <div className="px-2 py-4 grid grid-rows-3 gap-4 bg-slate-100">
                            <div>
                                {/* active for all modes */}
                                <label className="font-bold text-cyan-800">Height</label>
                                <RangeSlider
                                    onChange={(evt) => handleSlider(evt, setLaunchConfig)}
                                    id={'launch-y0'}
                                    type="range"
                                    min={0}
                                    max={10}
                                    step={2}
                                    defaultValue={launchConfig.y0}
                                    disabled={!(['projectile', 'cannon', 'target', 'ceiling'].includes(activeMode))} />
                            </div>
                            <div>
                                {/* active for modes: [projectile, cannon, target] */}
                                <label className="font-bold text-cyan-800">Velocity</label>
                                <RangeSlider
                                    onChange={(evt) => handleSlider(evt, setLaunchConfig)}
                                    id={'launch-v0'}
                                    type="range"
                                    min={5}
                                    max={25}
                                    step={5}
                                    defaultValue={launchConfig.v0}
                                    disabled={!(['projectile', 'cannon'].includes(activeMode))} />
                            </div>
                            <div>
                                {/* active for modes: [projectile, cannon] */}
                                <label className="font-bold text-cyan-800">Angle</label>
                                <RangeSlider
                                    onChange={(evt) => handleSlider(evt, setLaunchConfig)}
                                    id={'launch-deg0'}
                                    type="range"
                                    min={15}
                                    max={75}
                                    step={15}
                                    defaultValue={launchConfig.deg0}
                                    disabled={!(['projectile'].includes(activeMode))} />
                            </div>
                        </div>
                    </div>

                    <div className="border rounded">
                        <label className='flex p-2 font-bold uppercase border-b'>Path</label>
                        <div className="px-2 py-4 grid grid-rows-3 gap-4 bg-slate-100">
                            <div>
                                {/* active for modes: [ceiling] */}
                                <label className="font-bold text-cyan-800">Ceiling</label>
                                <RangeSlider
                                    onChange={(evt) => handleSlider(evt, setTargetConfig)}
                                    id={'target-ymax'}
                                    type="range"
                                    min={5}
                                    max={25}
                                    step={5}
                                    defaultValue={targetConfig.ymax}
                                    disabled={!(['ceiling'].includes(activeMode))} />
                            </div>
                        </div>
                    </div>

                    <div className="border rounded">
                        <label className='flex p-2 font-bold uppercase border-b'>Target</label>
                        <div className="px-2 py-4 grid grid-rows-3 gap-4 bg-slate-100">
                            <div>
                                {/* active for modes: [cannon, target, ceiling] */}
                                <label className="font-bold text-cyan-800">Height</label>
                                <RangeSlider
                                    onChange={(evt) => handleSlider(evt, setTargetConfig)}
                                    id={'target-yfinal'}
                                    type="range"
                                    min={0}
                                    max={10}
                                    step={2}
                                    defaultValue={targetConfig.yfinal}
                                    disabled={!(['cannon', 'target', 'ceiling'].includes(activeMode))} />
                            </div>
                            <div>
                                {/* active for modes: [cannon, target, ceiling] */}
                                <label className="font-bold text-cyan-800">Distance</label>
                                <RangeSlider
                                    onChange={(evt) => handleSlider(evt, setTargetConfig)}
                                    id={'target-xfinal'}
                                    type="range"
                                    min={4}
                                    max={16}
                                    step={4}
                                    defaultValue={targetConfig.xfinal}
                                    disabled={!(['cannon', 'target', 'ceiling'].includes(activeMode))} />

                            </div>
                            <div>
                                {/* active for modes: [target] */}
                                <label className="font-bold text-cyan-800">Angle</label>
                                <RangeSlider
                                    onChange={(evt) => handleSlider(evt, setTargetConfig)}
                                    id={'target-degf'}
                                    type="range"
                                    min={-75}
                                    max={-15}
                                    step={15}
                                    defaultValue={targetConfig.degf}
                                    disabled={!(['target'].includes(activeMode))} />
                            </div>
                        </div>
                    </div>
                </div>
            </ShadowBox>
        </>
    )
};

function ResultsItem(props) {
    const { result, roundTo, units, label } = props;
    return (
        <div className="flex items-center">
            <label className="pr-2 text-cyan-800">{`${label}:`}</label>
            <div>{result ? `${round(result, roundTo)} ${units}` : '--'}</div>
        </div>
    )
};

function RangeSlider(props) {
    // https://stackoverflow.com/a/70711290/3382269

    // unpack props
    const { onChange, id, type, min, max, step, defaultValue, disabled } = props;

    // Return evenly spaced values within a given interval
    const ticks = arange(min, (max + step), step);  // include endpoint

    // tailwindcss does not recommend dynamic class names because of purging.
    // Safelisting is an option, but should be handled as a last resort...
    // https://tailwindcss.com/docs/content-configuration#safelisting-classes
    return (
        <div className={`flex flex-col space-y-2 p-2 ${!disabled ? "border border-2 border-pink-300 rounded" : null}`}>
            <input
                className="w-full h-2 rounded-lg cursor-pointer accent-pink-200"
                onChange={(evt) => onChange(evt)}
                id={id}
                type={type}
                min={min}
                max={max}
                step={step}
                defaultValue={defaultValue}
                disabled={disabled}
            />
            <div>
                <ul className="flex justify-between w-full">
                    {ticks.map((tick, idx) => (
                        <li key={`mark_${tick}_${idx}`} className="flex justify-center">
                            <div className='grid grid-cols-1'>
                                {/* <span className="flex justify-center">???</span> */}
                                <span className="flex justify-center">{tick}</span>
                            </div>
                        </li>
                    ))
                    }
                </ul>
            </div>
        </div>
    )
};


function rectangle(xy1, xy2, deg0) {
    /*
    xy1     : [float, float] left-lower corner
    xy2     : [float, float] right-upper corner
    deg0   : float rotation
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
