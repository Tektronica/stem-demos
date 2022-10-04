// https://github.com/Tektronica/modulation_schemes
import { useEffect, useState } from "react";

import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

// custom chart component import
import LinePlot from "../components/charts/LinePlot";

// custom math module imports

import { arange, linspace, normal, round, zeros } from "../modules/base";
import { Gaussian } from "../modules/gaussian/GaussianEngine";

export default function LaserModeLocking() {
    const [results, setResults] = useState({});
    const [config, setConfig] = useState({
        mean: 0,  // mean
        stddev: 1,  // standard deviation
        N: 10000,  // samples
        bins: 40,  // bins
    });

    // chart data arranged as point
    const [gaussData, setGaussData] = useState({
        datasets: [{ 'x': null, 'y': null }],
        xlim: [null, null],
        ylim: [null, null]
    });

    // chart data arranged as point
    const [distributionData, setDistributionData] = useState({
        datasets: [{ 'x': null, 'y': null }],
        xlim: [null, null],
        ylim: [null, null]
    });

    const [dimension, setDimension] = useState(null);

    function getData() {
        const plots = Gaussian(config);

        setResults({
            fc: config.mean,
            stddev: config.stddev,

            samples: config.N,
            bins: config.bins,

            binWidth: plots.results.binWidth,
            fit: plots.results.fitTest,
        });

        setGaussData({
            datasets: [
                {
                    data: plots.raw.data,
                    label: 'Gaussian',
                    color: 'rgba(244,114,182,1)',
                    dashed: false
                },
                // {
                //     data: plots.smooth.data,
                //     label: 'Gaussian',
                //     color: 'rgba(244,114,182,1)',
                //     dashed: true
                // }
            ],
            xlim: [null, null],
            ylim: [null, null]
        });

        setDistributionData({
            datasets: [
                {
                    data: plots.raw.hist,
                    label: 'Percent Chance',
                    color: 'rgba(244,114,182,1)',
                    dashed: false
                },
                {
                    data: plots.smooth.data,
                    label: 'Curve',
                    // color: 'rgba(244,114,182,1)',
                    dashed: true
                }
            ],
            xlim: [null, null],
            ylim: [null, null]
        });

        // setDimension({
        //     label: `Standard Deviation = ${config.stddev}`,
        //     xMin: (config.mean - config.stddev),
        //     xMax: (config.mean + config.stddev),
        //     y: 0.03
        // })
    };

    // handles the slider value update
    function handleSlider(evt, newVal) {
        // unpack id to get classification
        const [category, type] = (evt.target.id).split('-');
        console.log(type, newVal)
        // update state of category type
        // https://stackoverflow.com/a/46209368/3382269
        setConfig((current) => ({ ...current, [type]: newVal }));
    };


    // when range sliders update, dispatch useEffect on state change
    useEffect(() => {
        // the state needs time to mutate before updating plot
        // https://stackoverflow.com/a/41278440/3382269
        // https://stackoverflow.com/a/56394177/3382269

        getData();

    }, [config]);

    return (
        <>
            <ShadowBox>
                <h1 className="text-3xl font-bold">
                    Gaussian Demo
                </h1>
                <div className="border rounded">
                    <label className='flex p-2 font-bold uppercase border-b'>
                        Results
                    </label>

                    <div className="p-2 bg-slate-100 font-mono text-sm">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="grid grid-rows-2">
                                <ResultsItem label={'Mean (μ)'} result={config.mean} roundTo={3} units={''} />
                                <ResultsItem label={'Standard Deviation (σ)'} result={config.stddev} roundTo={3} units={''} />
                            </div>

                            <div className="grid grid-rows-2">
                                <ResultsItem label={'Samples'} result={results.samples} roundTo={3} units={''} />
                                <ResultsItem label={'Bins'} result={results.bins} roundTo={3} units={''} />
                            </div>

                            <div className="grid grid-rows-2">
                                <ResultsItem label={'Bin Width'} result={results.binWidth} roundTo={3} units={''} />
                                <ResultsItem label={'Fit'} result={results.fitTest} roundTo={3} units={''} />
                            </div>
                        </div>
                    </div>
                </div>
            </ShadowBox>

            <ShadowBox>
                <div>
                    <LinePlot
                        pointData={distributionData.datasets}
                        title='Normal Distribution'
                        xlim={distributionData.xlim}
                        ylim={distributionData.ylim}
                        dimension={dimension}
                        height={400}
                    />

                </div>
                {/* <div>
                    <LinePlot
                        pointData={gaussData.datasets}
                        title='Gaussian Noise'
                        xlim={gaussData.xlim}
                        ylim={gaussData.ylim}
                        height={150}
                    />

                </div> */}
            </ShadowBox>

            <ShadowBox>
                <div className="grid grid-cols-1 gap-2">

                    <div className="grid grid-cols-2 gap-2">
                        <div className="border rounded shadow">
                            <div className="p-2 flex border-b bg-slate-100">
                                <label className="font-bold text-cyan-800 uppercase">
                                    Normal Distribution
                                </label>
                            </div>
                            <div className="grid grid-cols-2 px-2">
                                <div>
                                    <label className="font-bold text-cyan-800">
                                        Mean
                                    </label>
                                    <RangeSlider
                                        onChange={(evt) => handleSlider(evt, evt.target.valueAsNumber)}
                                        id={'slider-mean'}
                                        type="range"
                                        min={0}
                                        max={8}
                                        step={2}
                                        defaultValue={config.mean}
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-cyan-800">
                                        Standard Deviation
                                    </label>
                                    <RangeSlider
                                        onChange={(evt) => handleSlider(evt, evt.target.valueAsNumber)}
                                        id={'slider-stddev'}
                                        type="range"
                                        min={1}
                                        max={5}
                                        step={1}
                                        defaultValue={config.stddev}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="border rounded shadow">
                            <div className="p-2 flex border-b bg-slate-100">
                                <label className="font-bold text-cyan-800 uppercase">
                                    Sampling
                                </label>
                            </div>
                            <div className="grid grid-cols-2 px-2">
                                <div>
                                    <label className="font-bold text-cyan-800">Samples (kS)</label>
                                    <RangeSlider
                                        onChange={(evt) => handleSlider(evt, (evt.target.valueAsNumber * 1000))}
                                        id={'slider-N'}
                                        type="range"
                                        min={10}
                                        max={100}
                                        step={30}
                                        defaultValue={(config.N / 1000)}
                                    />
                                </div>
                                <div>
                                    <label className="font-bold text-cyan-800">Bins</label>
                                    <RangeSlider
                                        onChange={(evt) => handleSlider(evt, evt.target.valueAsNumber)}
                                        id={'slider-bins'}
                                        type="range"
                                        min={10}
                                        max={100}
                                        step={30}
                                        defaultValue={config.bins}
                                    />
                                </div>
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
        <div className={'flex flex-col space-y-2 p-2'}>
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
                                {/* <span className="flex justify-center">╵</span> */}
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

LaserModeLocking.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    )
};
