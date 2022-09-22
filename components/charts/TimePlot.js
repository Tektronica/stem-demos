import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const TimePlot = ({ pointData }) => {

    // https://stackoverflow.com/questions/70684106/react-chartjs-2-typeerror-undefined-is-not-an-object-evaluating-nextdatasets
    // https://www.learnnext.blog/blogs/using-chartjs-in-your-nextjs-application
    // https://www.chartjs.org/docs/latest/general/data-structures.html
    // https://stackoverflow.com/questions/38341758/how-to-dynamically-set-chartjs-line-chart-width-based-on-dataset-size
    // https://blog.bitsrc.io/customizing-chart-js-in-react-2199fa81530a

    // data is a list of point objects

    const canvasEl = useRef(null);

    useEffect(() => {
        const ctx = canvasEl.current.getContext("2d");
        // const ctx = document.getElementById("myChart");

        const data = {
            datasets: [
                {
                    // data
                    data: pointData,
                    indexAxis: 'x',
                    showLine: true,

                    //label
                    label: 'test',
                    fill: false,
                    lineTension: 0.1,
                    backgroundColor: 'rgba(75,192,192,0.4)',
                    borderColor: 'rgba(75,192,192,1)',
                    borderCapStyle: 'butt',
                    borderDash: [],
                    borderDashOffset: 0.0,
                    borderJoinStyle: 'miter',
                    pointBorderColor: 'rgba(75,192,192,1)',
                    pointBackgroundColor: '#fff',
                    pointBorderWidth: 1,
                    pointHoverRadius: 5,
                    pointHoverBackgroundColor: 'rgba(75,192,192,1)',
                    pointHoverBorderColor: 'rgba(220,220,220,1)',
                    pointHoverBorderWidth: 2,
                    pointRadius: 1,
                    pointHitRadius: 10,
                }
            ]
        };

        const config = {
            options: {
                responsive: true,
                title: {
                    // optional: your title here
                },
                events: [],
                animation: false,
                scales: {
                    xAxes: [{
                        type: 'linear', // MANDATORY TO SHOW YOUR POINTS! (THIS IS THE IMPORTANT BIT) 
                        display: true, // mandatory
                        ticks: {
                            max: 100,
                            min: 0,
                            stepSize: 10
                        },
                        scaleLabel: {
                            display: true, // mandatory
                            labelString: 'Your label' // optional 
                        },
                    }],
                    yAxes: [{ // and your y axis customization as you see fit...
                        display: true,
                        scaleLabel: {
                            display: true,
                            labelString: 'Count'
                        }
                    }],
                }
            }
        };

        const plotConfig = {
            type: 'scatter',
            data: data,
            options: config,
        };


        const myLineChart = new Chart(ctx, plotConfig)


        return function cleanup() {
            myLineChart.destroy();
        };
    });

    return (
        <>
            <div className=''>
                <canvas
                    id="myChart"
                    ref={canvasEl}
                />

            </div>
        </>
    )
};

export default TimePlot;
