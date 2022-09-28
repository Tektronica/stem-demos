// <!-- requires chart.js -->
// <!-- chartjs-plugin-zoom -->

import React, { useEffect, useRef } from "react";
import annotationPlugin from 'chartjs-plugin-annotation';
// import zoomPlugin from 'chartjs-plugin-zoom';

import {
    Chart,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    LogarithmicScale,
} from "chart.js";

Chart.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    LogarithmicScale,
    // zoomPlugin,
);

const SpectrumPlot = ({ pointData, box, xlim, ylim, title, yscale = 'linear', color = 'rgba(75,192,192,1)' }) => {
    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const destroyChart = () => {

        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }
    };


    // tracks when data updates by an external state
    useEffect(() => {
        if (!canvasRef.current) return;

        const chartToDraw = canvasRef.current.getContext("2d");

        const data = {
            datasets: [
                {
                    // data
                    data: null,
                    indexAxis: 'x',
                    showLine: true,

                    //label
                    label: title,
                    lineTension: 0.1,
                    borderColor: color,
                    pointRadius: 0,
                }
            ]
        };

        const options = {
            responsive: true,
            events: [],
            animation: false,

            scales: {
                x: {
                    type: 'linear',
                    min: xlim ? xlim[0] : null,
                    max: xlim ? xlim[1] : null,
                    gridLines: {
                        display: false,
                        color: "#FFFFFF"
                    },
                },
                y: {
                    type: 'linear',
                    min: ylim ? ylim[0] : null,
                    max: ylim ? ylim[1] : null,
                }
            },

            plugins: {
                autocolors: false,
                annotation: {
                    drawTime: "afterDatasetsDraw", // (default)
                    annotations: {
                        // this is where ...boxes attributes would be
                    }
                },

                zoom: {
                    zoom: {
                        wheel: {
                            enabled: false
                        },
                        mode: "xy",
                        speed: 100
                    },
                    pan: {
                        enabled: true,
                        mode: "x",
                        // speed: 100
                    }
                }
            }
        };

        const plotConfig = {
            type: 'line',
            data: data,
            options: options,
            // plugins: annotationPlugin
        };

        chartRef.current = new Chart(chartToDraw, plotConfig)

        return function cleanup() {
            destroyChart();
        };

    }, []);

    // mutable access to data when pointData changes
    useEffect(() => {
        chartRef.current.data.datasets[0].data = pointData;
        chartRef.current.update();

    }, [pointData]);


    // mutable access to update scale limits
    useEffect(() => {
        chartRef.current.options.scales.x.min = xlim[0];
        chartRef.current.options.scales.x.max = xlim[1];
        chartRef.current.options.scales.y.min = ylim[0];
        chartRef.current.options.scales.y.max = ylim[1];
        chartRef.current.update();

    }, [xlim, ylim]);

    return (
        <>
            <div className=''>
                <canvas
                    id="freqChart"
                    ref={canvasRef}
                />

            </div>
        </>
    )
};

function getRangeMax(percentOfRange, maxRange) {
    let newRangeMax = Math.round(Math.round((percentOfRange / 100 * maxRange) * 10000 * 6)) / (6 * 10000);

    if (newRangeMax === 0) {
        newRangeMax = maxRange
    }
    return newRangeMax

};

function updateMax(xScaleMax, setRangeMax, e) {
    // slices a percent of the plot array based on range value
    const newSliderValue = parseInt(e.target.value)
    const newRangeMax = getRangeMax(newSliderValue, xScaleMax)
    console.log('client: range slider adjusted to:', newRangeMax, 'Updating max range to: ', newRangeMax)
    setRangeMax(newRangeMax)
};

export default SpectrumPlot;
