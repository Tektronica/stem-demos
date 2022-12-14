import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";
import annotationPlugin from 'chartjs-plugin-annotation';
import { addBoxes, addDimension } from './attributes'

Chart.register(annotationPlugin);

const LinePlot = (props) => {

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

    const { pointData, box, dimension, xlim, ylim, title, height = null } = props;
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

        // data is a list of point objects
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

        const options = {
            responsive: true,
            maintainAspectRatio: false,
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
                        // this is where ...boxes attributes would be
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

        if (pointData.length == 0) {
            chartRef.current.data.datasets[0].data = pointData;

        } else {
            var newDatasets = [];

            pointData.forEach(function ({ data, color, label, dashed = [] }) {

                const dataset =
                {
                    data: data,
                    indexAxis: 'x',
                    showLine: true,
                    label: label,
                    lineTension: 0.1,
                    borderColor: color,
                    backgroundColor: color,
                    pointRadius: 0,
                    borderDash: dashed ? [5, 5] : [],
                }

                // append to beginning (temporary solution??)
                newDatasets.unshift(dataset);
            });

            chartRef.current.data.datasets = newDatasets
        };
        chartRef.current.update();

    }, [pointData]);


    // mutable access to update box attributes
    useEffect(() => {
        if (box) {
            const boxes = addBoxes(box)

            chartRef.current.options.plugins.annotation.annotations = boxes;
            chartRef.current.update();
        };

    }, [box]);

    // mutable access to update box attributes
    useEffect(() => {
        if (dimension) {
            const dim = addDimension(dimension)

            chartRef.current.options.plugins.annotation.annotations = dim;
            chartRef.current.update();
        };

    }, [dimension]);


    // mutable access to update scale limits
    useEffect(() => {
        // https://stackoverflow.com/a/20100851/3382269
        // The options are not reactive. Thus if you change them you need to re-render the chart.
        // https://stackoverflow.com/a/38649297/3382269

        chartRef.current.options.scales.x.min = xlim[0];
        chartRef.current.options.scales.x.max = xlim[1];
        chartRef.current.options.scales.y.min = ylim[0];
        chartRef.current.options.scales.y.max = ylim[1];
        chartRef.current.update();

    }, [xlim, ylim]);


    return (
        <div style={{ height: (height ? height : 300) }}>
            <canvas
                id="myChart"
                ref={canvasRef}
            />
        </div>
    )
};

export default LinePlot;
