// https://github.com/Tektronica/modulation_schemes
import { useEffect, useState } from "react";

import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

// custom chart component import
import LinePlot from "../components/charts/LinePlot";

// custom math module imports

import { arange, linspace, normal, round, zeros } from "../modules/base";
import { getModulation } from "../modules/modulation/modulationEngine";
import { ModeLocked } from "../modules/lasers/LaserEngine";
import { Gaussian } from "../modules/gaussian/GaussianEngine";

export default function LaserModeLocking() {
    const [results, setResults] = useState({});
    const [config, setConfig] = useState({
        mean: 0,  // (THz) actual vacuum frequency of HeNe (632.991 nm)
        std: 1,  // standard deviation
        N: 10000,  // samples
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

        // setResults({
        //     fc: config.fc,
        //     runtime: plots.time.runtime,

        //     fs: config.fs,
        //     N: plots.time.N,

        //     laser_bw: plots.time.laser_bw,
        //     wavelength: plots.time.wavelength,
        //     cavity_modes: plots.time.cavity_modes,
        //     cavity_length: plots.time.length,
        //     df: plots.time.df,
        //     longitudinal: plots.time.df,
        //     fwhm: plots.time.fwhm,
        //     fwhm_width: plots.time.fwhm_width,
        // });

        setGaussData({
            datasets: [
                {
                    data: plots.data,
                    label: 'Gaussian',
                    color: 'rgba(244,114,182,1)',
                    dashed: false
                }],
            xlim: [null, null],
            ylim: [null, null]
        });

        setDistributionData({
            datasets: [
                {
                    data: plots.sorted,
                    label: 'Percent Chance',
                    color: 'rgba(244,114,182,1)',
                    dashed: false
                }],
            xlim: [null, null],
            ylim: [null, null]
        });


        // setDimension({
        //     label: `BW = ${plots.time.bw} Hz`,
        //     xMin: (config.fc - plots.time.bw / 2) / 1000,
        //     xMax: (config.fc + plots.time.bw / 2) / 1000,
        //     y: -0.05
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

    // handles the slider value update
    function handleSelect(evt) {
        // unpack id to get classification
        const [category, type] = (evt.target.id).split('-');

        // https://stackoverflow.com/a/66814808/3382269
        const newVal = evt.target.value;

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
                            <div className="grid grid-rows-3">
                                <ResultsItem label={'Carrier Frequency'} result={config.fc} roundTo={3} units={'Hz'} />
                                <ResultsItem label={'Modulating Frequency'} result={config.fm} roundTo={3} units={'Hz'} />
                                <ResultsItem label={'Sampling Frequency'} result={config.fs} roundTo={3} units={'Hz'} />
                            </div>

                            <div className="grid grid-rows-3">
                                <ResultsItem label={'Bandwidth'} result={results.bw} roundTo={3} units={'Hz'} />
                                <ResultsItem label={'RMS'} result={results.rms} roundTo={3} units={''} />
                                <ResultsItem label={'Runtime'} result={results.runtime} roundTo={3} units={'s'} />
                            </div>

                            <div className="grid grid-rows-3">
                                <ResultsItem label={'FFT length'} result={results.fft_length} roundTo={3} units={''} />
                                <ResultsItem label={'Samples'} result={results.N} roundTo={3} units={''} />
                                <ResultsItem label={'Bin Size'} result={results.binSize} roundTo={3} units={'Hz/S'} />
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
                        height={400}
                    // title='Sampled Time Series Data'
                    />

                </div>
                <div>
                    <LinePlot
                        pointData={gaussData.datasets}
                        title='Gaussian Noise'
                        xlim={gaussData.xlim}
                        ylim={gaussData.ylim}
                        height={150}
                    // title='Sampled Time Series Data'
                    />

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
