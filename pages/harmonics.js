import { useEffect, useState } from "react";

import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

// custom chart component import
import LinePlot from "../components/charts/LinePlot";

// custom math module imports

import { arange, round } from "../modules/base";
import { DistortedWaveform } from "../modules/distortion/distortionEngine";

export default function Harmonics() {
    const [results, setResults] = useState({});
    const [config, setConfig] = useState({
        fc: 1000,  // Hz
        fs: 80000,  // Hz
        main_lobe_error: 0.06,
        harmonics: {
            2: 0.2,
            3: 0,
            4: 0.2,
            5: 0,
            6: 0.2,
            7: 0,
            8: 0,
            9: 0,
            10: 0.1
        },
    });

    // chart data arranged as points
    const [timePlot, setTimePlot] = useState({
        datasets: [{ 'x': null, 'y': null }],
        xlim: [null, null],
        ylim: [null, null]
    });

    const [freqPlot, setFreqPlot] = useState({
        datasets: [{ 'x': null, 'y': null }],
        xlim: [null, null],
        ylim: [null, null]
    });

    function getData() {

        const plots = DistortedWaveform(config);

        setResults({
            fc: config.fc,
            fs: config.fs,

            N: plots.time.N,
            runtime: plots.time.runtime,

            rms: plots.spectral.rms,
            fft_length: plots.spectral.fft_length,
            binSize: plots.spectral.binSize,
            thd: plots.spectral.thd,
            thdn: plots.spectral.thdn
        });

        setTimePlot({
            datasets: [
                {
                    data: plots.time.data,
                    label: 'Modulated Signal',
                    color: 'rgba(75,192,192,1)',
                    dashed: false
                },
            ],
            xlim: [null, null],
            ylim: [null, null]
        });

        setFreqPlot({
            datasets: [
                {
                    data: plots.spectral.data,
                    label: 'Spectral Data',
                    color: 'rgba(162,20,47,1)',
                    dashed: false
                },
            ],
            xlim: plots.spectral.xlim,
            ylim: [-0.1, null]
        });
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
    function handleHarmonic(evt, newVal) {
        // unpack id to get classification
        const [category, type, harmonic] = (evt.target.id).split('-');
        console.log(type, newVal, harmonic)

        // update state of category type
        // https://stackoverflow.com/a/46209368/3382269
        setConfig((current) => ({
            ...current,
            harmonics: {
                ...(current.harmonics), [harmonic]: newVal
            }
        }));
    };

    // dispatch useEffect on config state change
    useEffect(() => {
        getData();
    }, [config]);

    return (
        <>
            <ShadowBox>
                <h1 className="text-3xl font-bold">
                    Harmonics
                </h1>
                <div className="border rounded">
                    <label className='flex p-2 font-bold uppercase border-b'>
                        Results
                    </label>

                    <div className="p-2 bg-slate-100 font-mono text-sm">
                        <div className="grid grid-cols-3 gap-2">
                            <div className="grid grid-rows-3">
                                <ResultsItem label={'Signal Frequency'} result={config.fc} roundTo={3} units={'Hz'} />
                                <ResultsItem label={'Sampling Frequency'} result={config.fs} roundTo={3} units={'Hz'} />
                                <ResultsItem label={'Run Time'} result={results.runtime} roundTo={3} units={'s'} />

                            </div>

                            <div className="grid grid-rows-3">
                                <ResultsItem label={'Sample Length'} result={results.N} roundTo={3} units={''} />
                                <ResultsItem label={'FFT Length'} result={results.fft_length} roundTo={3} units={''} />
                                <ResultsItem label={'Bin Size'} result={results.binSize} roundTo={3} units={'Hz/S'} />
                            </div>

                            <div className="grid grid-rows-3">
                                <ResultsItem label={'RMS'} result={results.rms} roundTo={4} units={''} />
                                <ResultsItem label={'THD'} result={results.thd * 100} roundTo={4} units={'%'} />
                                <ResultsItem label={'THDN'} result={results.thdn * 100} roundTo={4} units={'%'} />
                            </div>
                        </div>
                    </div>
                </div>
            </ShadowBox>

            <ShadowBox>
                <div>
                    <LinePlot
                        pointData={timePlot.datasets}
                        // box={boxes}
                        xlim={timePlot.xlim}
                        ylim={timePlot.ylim}
                        height={300}
                    // title='Sampled Time Series Data'
                    />

                    <LinePlot
                        pointData={freqPlot.datasets}
                        // box={boxes}
                        xlim={freqPlot.xlim}
                        ylim={freqPlot.ylim}
                        height={300}
                    // dimension={dimension}
                    // color='rgba(162,20,47,1)'
                    // title='Spectral Data'
                    />
                </div>
            </ShadowBox>

            <ShadowBox>
                <div className="grid grid-cols-1 gap-2">
                    <div className="border rounded shadow">
                        <div className="p-2 flex border-b bg-slate-100">
                            <label className="font-bold text-cyan-800 uppercase">
                                Sampling
                            </label>
                        </div>
                        <div className="grid grid-cols-2 px-2">
                            <div>
                                <label className="font-bold text-cyan-800">Sample Rate</label>
                                <RangeSlider
                                    onChange={(evt) => handleSlider(evt, (1000 * evt.target.valueAsNumber))}
                                    id={'slider-fs'}
                                    type="range"
                                    min={50}
                                    max={100}
                                    step={10}
                                    defaultValue={(config.fs / 1000)}
                                />
                            </div>
                            <div>
                                <label className="font-bold text-cyan-800">Main Lobe Error (ppm)</label>
                                <RangeSlider
                                    onChange={(evt) => handleSlider(evt, (evt.target.valueAsNumber / 1000))}
                                    id={'slider-main_lobe_error'}
                                    type="range"
                                    min={40}
                                    max={100}
                                    step={20}
                                    defaultValue={(config.main_lobe_error * 1000)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className='grid grid-cols-3 gap-2'>
                        <div className="border rounded shadow">
                            <div className="p-2 flex border-b bg-slate-100">
                                <label className="font-bold text-cyan-800 uppercase">
                                    Harmonics (2-4)
                                </label>
                            </div>
                            <div className="grid grid-cols-1 px-2">
                                <div className="flex">
                                    <label className="font-bold text-cyan-800">
                                        2
                                    </label>
                                    <div className="w-full">
                                        <RangeSlider
                                            onChange={(evt) => handleHarmonic(evt, (evt.target.valueAsNumber / 100))}
                                            id={'slider-harmonics-2'}
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={20}
                                            defaultValue={(config.harmonics[2] * 100)}
                                        />
                                    </div>
                                </div>

                                <div className="flex">
                                    <label className="font-bold text-cyan-800">
                                        3
                                    </label>
                                    <div className="w-full">
                                        <RangeSlider
                                            onChange={(evt) => handleHarmonic(evt, (evt.target.valueAsNumber / 100))}
                                            id={'slider-harmonics-3'}
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={20}
                                            defaultValue={(config.harmonics[3] * 100)}
                                        />
                                    </div>
                                </div>

                                <div className="flex">
                                    <label className="font-bold text-cyan-800">
                                        4
                                    </label>
                                    <div className="w-full">
                                        <RangeSlider
                                            onChange={(evt) => handleHarmonic(evt, (evt.target.valueAsNumber / 100))}
                                            id={'slider-harmonics-4'}
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={20}
                                            defaultValue={(config.harmonics[4] * 100)}
                                        />
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="border rounded shadow">
                            <div className="p-2 flex border-b bg-slate-100">
                                <label className="font-bold text-cyan-800 uppercase">
                                    Harmonics (5-7)
                                </label>
                            </div>
                            <div className="grid grid-cols-1 px-2">

                                <div className="flex">
                                    <label className="font-bold text-cyan-800">
                                        5
                                    </label>
                                    <div className="w-full">
                                        <RangeSlider
                                            onChange={(evt) => handleHarmonic(evt, (evt.target.valueAsNumber / 100))}
                                            id={'slider-harmonics-5'}
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={20}
                                            defaultValue={(config.harmonics[5] * 100)}
                                        />
                                    </div>
                                </div>

                                <div className="flex">
                                    <label className="font-bold text-cyan-800">
                                        6
                                    </label>
                                    <div className="w-full">
                                        <RangeSlider
                                            onChange={(evt) => handleHarmonic(evt, (evt.target.valueAsNumber / 100))}
                                            id={'slider-harmonics-6'}
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={20}
                                            defaultValue={(config.harmonics[6] * 100)}
                                        />
                                    </div>
                                </div>

                                <div className="flex">
                                    <label className="font-bold text-cyan-800">
                                        7
                                    </label>
                                    <div className="w-full">
                                        <RangeSlider
                                            onChange={(evt) => handleHarmonic(evt, (evt.target.valueAsNumber / 100))}
                                            id={'slider-harmonics-7'}
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={20}
                                            defaultValue={(config.harmonics[7] * 100)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="border rounded shadow">
                            <div className="p-2 flex border-b bg-slate-100">
                                <label className="font-bold text-cyan-800 uppercase">
                                    Harmonics (5-7)
                                </label>
                            </div>
                            <div className="grid grid-cols-1 px-2">
                                <div className="flex">
                                    <label className="font-bold text-cyan-800">
                                        8
                                    </label>
                                    <div className="w-full">
                                        <RangeSlider
                                            onChange={(evt) => handleHarmonic(evt, (evt.target.valueAsNumber / 100))}
                                            id={'slider-harmonics-8'}
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={20}
                                            defaultValue={(config.harmonics[8] * 100)}
                                        />
                                    </div>
                                </div>

                                <div className="flex">
                                    <label className="font-bold text-cyan-800">
                                        9
                                    </label>
                                    <div className="w-full">
                                        <RangeSlider
                                            onChange={(evt) => handleHarmonic(evt, (evt.target.valueAsNumber / 100))}
                                            id={'slider-harmonics-9'}
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={20}
                                            defaultValue={(config.harmonics[9] * 100)}
                                        />
                                    </div>
                                </div>

                                <div className="flex">
                                    <label className="font-bold text-cyan-800">
                                        10
                                    </label>
                                    <div className="w-full">
                                        <RangeSlider
                                            onChange={(evt) => handleHarmonic(evt, (evt.target.valueAsNumber / 100))}
                                            id={'slider-harmonics-10'}
                                            type="range"
                                            min={0}
                                            max={100}
                                            step={20}
                                            defaultValue={(config.harmonics[10] * 100)}
                                        />
                                    </div>
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

Harmonics.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    )
};
