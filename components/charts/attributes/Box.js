const addBox = (p1, p2, name, color = 'rgba(255, 99, 132, 0.25)') => {
    console.log(p1, p2, name)
    const [xMin, yMin] = p1
    const [xMax, yMax] = p2

    return (
        {
            [name]: {
                type: 'box',
                xMin: xMin,
                yMin: yMin,
                xMax: xMax,
                yMax: yMax,
                backgroundColor: color
            }
        }
    )
}

const addBoxes = (boxes) => {
    var attributes = {};

    boxes.forEach(function (box, idx) {
        attributes = { ...attributes, ...addBox(box.p1, box.p2, `box${idx}`) }
    });

    return attributes;
};

export { addBox, addBoxes };
