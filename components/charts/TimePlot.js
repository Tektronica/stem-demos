import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

const TimePlot = ({pointData, box} ) => {

    // https://stackoverflow.com/questions/70684106/react-chartjs-2-typeerror-undefined-is-not-an-object-evaluating-nextdatasets
    // https://www.learnnext.blog/blogs/using-chartjs-in-your-nextjs-application
    // https://www.chartjs.org/docs/latest/general/data-structures.html
    // https://stackoverflow.com/questions/38341758/how-to-dynamically-set-chartjs-line-chart-width-based-on-dataset-size
    // https://blog.bitsrc.io/customizing-chart-js-in-react-2199fa81530a

    // Annotations
    // https://stackoverflow.com/a/47108487/3382269
    // https://github.com/reactchartjs/react-chartjs-2/issues/201#issuecomment-579630734
    // https://stackoverflow.com/a/70134348/3382269
    // https://www.chartjs.org/chartjs-plugin-annotation/latest/guide/integration.html

    // data is a list of point objects

    const chartRef = useRef(null);

    useEffect(() => {
        // if (chartRef?.current) {
        const chartToDraw = chartRef.current.getContext("2d");
        // const chartToDraw = document.getElementById("myChart");

        const data = {
            datasets: [
                {
                    // data
                    data: pointData,
                    indexAxis: 'x',
                    showLine: true,

                    //label
                    label: 'hello',
                    lineTension: 0.1,
                    borderColor: 'rgba(75,192,192,1)',
                    backgroundColor: 'rgba(75,192,192,1)',
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
                    // suggestedMin: '0',
                    // suggestedMax: '100',
                    gridLines: {
                        display: false,
                        color: "#FFFFFF"
                    },
                },
            },

            plugins: {
                autocolors: false,
                annotation: {
                    drawTime: "afterDatasetsDraw", // (default)
                    annotations: {
                        box1: {
                            type: 'box',
                            xMin: 1,
                            xMax: 2,
                            yMin: 2,
                            yMax: 3,
                            backgroundColor: 'rgba(255, 99, 132, 0.25)'
                        }
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


        const myLineChart = new Chart(chartToDraw, plotConfig)


        return function cleanup() {
            myLineChart.destroy();
        };

    }, []);

    return (
        <>
            <div className=''>
                <canvas
                    id="myChart"
                    ref={chartRef}
                />

            </div>
        </>
    )
};

export default TimePlot;
