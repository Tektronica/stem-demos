// https://github.com/Tektronica/projectile_demos
import { useEffect, useState } from "react";

import Layout from "../components/layout";
import ShadowBox from "../components/containers/ShadowBox";

// custom chart component import
import TimePlot from "../components/charts/TimePlot";
import SpectrumPlot from "../components/charts/SpectrumPlot";

// custom math module imports

import { arange, round } from "../modules/base";
import { getModulation } from "../modules/modulation/modulationEngine";

export default function Modulation() {
    const [results, setResults] = useState({});
    const [config, setConfig] = useState({
        fs: 80000,  // kHz
        fm: 100,  // Hz
        fc: 1000,  // kHz
        main_lobe_error: 0.06,
        modulation_type: 'frequency',
        waveform_type: 'sine',
        modulation_index: 5,
        message_phase: 0,
        Ac: 1,
    });

    // chart data arranged as point
    const [timePlot, setTimePlot] = useState({
        datasets: [{ 'x': null, 'y': null }],
        xlim: [null, null],
        ylim: [null, null]
    });
    const [freqPlot, setFreqPlot] = useState({
        data: [{ 'x': null, 'y': null }],
        xlim: [null, null],
        ylim: [null, null]
    });

    function getData() {
        const plots = getModulation(config);
        setResults({
            fc: config.fc,
            fm: config.fm,
            fs: config.fs,
            bw: plots.time.bw,
            N: plots.time.N,
            runtime: plots.time.runtime,
            rms: plots.spectral.rms,
            fft_length: plots.spectral.fft_length,
            binSize: plots.spectral.binSize,
        });

        setTimePlot({
            datasets: [
                {
                    data: plots.time.data,
                    label: 'Modulated Signal',
                    color: 'rgba(75,192,192,1)',
                    dashed: false
                },
                {
                    data: plots.time.message,
                    label: 'Message',
                    color: 'rgba(244,114,182,1)',
                    dashed: true
                }],
            xlim: [null, null],
            ylim: [null, null]
        });

        setFreqPlot({
            data: plots.spectral.data,
            xlim: plots.spectral.xlim,
            // xlim: [null, null],
            ylim: [null, null]
        });
    };

    // handles the slider value update
    function handleSlider(evt, newVal) {
        // unpack id to get classification
        const [category, type] = (evt.target.id).split('-');

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
                    Modulation Demos
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
                    <label className="font-bold text-cyan-800">Carrier Frequency</label>
                    <RangeSlider
                        onChange={(evt) => handleSlider(evt, (1000 * evt.target.valueAsNumber))}
                        id={'slider-fc'}
                        type="range"
                        min={1}
                        max={5}
                        step={1}
                        defaultValue={(config.fc / 1000)}
                    />
                </div>
                <div>
                    <label className="font-bold text-cyan-800">Modulation Frequency</label>
                    <RangeSlider
                        onChange={(evt) => handleSlider(evt, (evt.target.valueAsNumber))}
                        id={'slider-fm'}
                        type="range"
                        min={100}
                        max={500}
                        step={100}
                        defaultValue={(config.fm)}
                    />
                </div>
                <div>
                    <label className="font-bold text-cyan-800">Modulation Index</label>
                    <RangeSlider
                        onChange={(evt) => handleSlider(evt, (evt.target.valueAsNumber))}
                        id={'slider-modulation_index'}
                        type="range"
                        min={2}
                        max={8}
                        step={1}
                        defaultValue={(config.modulation_index)}
                    />
                </div>
                <div>
                    <label className="font-bold text-cyan-800">Modulation Phase</label>
                    <RangeSlider
                        onChange={(evt) => handleSlider(evt, (evt.target.valueAsNumber))}
                        id={'slider-message_phase'}
                        type="range"
                        min={0}
                        max={90}
                        step={15}
                        defaultValue={(config.message_phase)}
                    />
                </div>
                <div>
                    <label className="font-bold text-cyan-800">Modulation</label>

                    <select name="cars" id="select-modulation_type" onChange={(evt) => handleSelect(evt)} defaultValue={(config.modulation_type)}>
                        <option value="amplitude">Amplitude</option>
                        <option value="frequency">Frequency</option>
                        <option value="phase">Phase</option>
                    </select>
                </div>
                <div>
                    <label className="font-bold text-cyan-800">Modulation</label>

                    <select name="cars" id="select-waveform_type" onChange={(evt) => handleSelect(evt)} defaultValue={(config.waveform_type)}>
                        <option value="sine">Sine</option>
                        <option value="triangle">Triangle</option>
                        <option value="sawtooth">Sawtooth</option>
                        <option value="square">Square</option>
                        <option value="keying">Keying</option>
                    </select>
                </div>
            </ShadowBox>

            <ShadowBox>
                <div>
                    <TimePlot
                        pointData={timePlot.datasets}
                        // box={boxes}
                        xlim={timePlot.xlim}
                        ylim={timePlot.ylim}
                        title='Sampled Time Series Data' />

                    <SpectrumPlot
                        pointData={freqPlot.data}
                        // box={boxes}
                        xlim={freqPlot.xlim}
                        ylim={freqPlot.ylim}
                        color='rgba(162,20,47,1)'
                        title='Spectral Data' />
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

Modulation.getLayout = function getLayout(page) {
    return (
        <Layout>
            {page}
        </Layout>
    )
};
