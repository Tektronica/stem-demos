const addArrowHeads = ({ width, display = false }) => {
    return (
        {
            start: {
                display: display,
                width: width
            },
            end: {
                display: display,
                width: width
            }
        }
    );
};

const addDimension = ({ xMin, xMax, y, label, color = 'rgb(0, 0, 0)' }) => {

    return (
        {
            dimLine: {
                type: 'line',
                xMin: xMin,
                xMax: xMax,
                yMin: y,
                yMax: y,
                borderColor: color,
                borderWidth: 2,
                arrowHeads: addArrowHeads({ display: true, width: 6, })
            },
            leftBar: {
                type: 'line',
                xMin: xMin,
                xMax: xMin,
                yMin: y * (1 - 0.25),
                yMax: y * (1 + 0.25),
                borderColor: color,
                borderWidth: 2,
            },
            rightBar: {
                type: 'line',
                xMin: xMax,
                xMax: xMax,
                yMin: y * (1 - 0.25),
                yMax: y * (1 + 0.25),
                borderColor: color,
                borderWidth: 2,
            },
            label1: {
                type: 'label',
                xValue: (xMax + xMin) / 2,
                yValue: y * (1 + 0.50),
                content: label,
                font: {
                    size: 14
                }
            }
        }
    )
};

export default addDimension;