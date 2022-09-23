import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import annotationPlugin from 'chartjs-plugin-annotation';

Chart.register(annotationPlugin);

const TimePlot = ({ pointData, box, xlim, ylim, title }) => {

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

    const canvasRef = useRef(null);
    const chartRef = useRef(null);

    const destroyChart = () => {

        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }
    };

    useEffect(() => {

        if (!canvasRef.current) return;

        const chartToDraw = canvasRef.current.getContext("2d");
        // const chartToDraw = document.getElementById("myChart");

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
                    borderColor: 'rgba(75,192,192,1)',
                    backgroundColor: 'rgba(75,192,192,1)',
                    pointRadius: 0,
                }
            ]
        };

        const boxes = {}
        if (box) {
            const k = box.map((b, idx) => (
                boxes[`box${idx}`] = {
                    type: 'box',
                    xMin: b.p1[0],
                    yMin: b.p1[1],
                    xMax: b.p2[0],
                    yMax: b.p2[1],
                    backgroundColor: 'rgba(255, 99, 132, 0.25)'
                }
            ));
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
                    min: ylim ? ylim[0] : null,
                    max: ylim ? ylim[1] : null,
                }
            },

            plugins: {
                autocolors: false,
                annotation: {
                    drawTime: "afterDatasetsDraw", // (default)
                    annotations: {
                        ...boxes
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
        // https://github.com/chartjs/Chart.js/issues/13#issuecomment-50232100
        // https://www.chartjs.org/docs/latest/samples/animations/loop.html
        // https://github.com/chartjs/Chart.js/blob/master/docs/samples/animations/loop.md
        // https://codepen.io/webgeeker/pen/jKBqge
        console.log('new data:', pointData)
        chartRef.current.data.datasets[0].data = pointData;
        chartRef.current.update();

    }, [pointData]);

    return (
        <>
            <div className=''>
                <canvas
                    id="myChart"
                    ref={canvasRef}
                />

            </div>
        </>
    )
};

export default TimePlot;
