class Line
{
    // Vertex array identifier.
    vertexArray;
    // Vertex buffer identifier.
    vertexBuffer;
    // Line geometry data.
    model;
    /*
        Class constructor.

        lineStyle: Explode line style.
        lineThickness: Explode line thickness.
    */
    constructor(lineStyle, lineThickness)
    {
        // Explode line start point.
        this.start = new Point();
        // Explode line end point.
        this.end = new Point();
        if (lineStyle == 0)
            this.createSolidLine(lineThickness);
        else if (lineStyle == 1)
            this.createDashedLine(lineThickness);
        else
            throw new Error("Line.constructor error: Unsupported line style.");
    }
    /*
        Creates multiple cylinders that represent the line.

        lineThickness: A value that is proportional to the diameter of the cylinders.
    */
    createDashedLine(lineThickness)
    {

    }
    /*
        Creates a cylinder that represents the line.

        lineThickness: A value that is proportional to the diameter of the cylinder.
    */
    createSolidLine(lineThickness)
    {
        this.model = new Float32Array(216);
        const start = vec3.fromValues(
            this.start.x,
            this.start.y,
            this.start.z
        );
        const end = vec3.fromValues(
            this.end.x,
            this.end.y,
            this.end.z
        );
        let path = vec3.fromValues(
            end[0] - start[0],
            end[1] - start[1],
            end[2] - start[2]
        );
        const length = vec3.length(path);
        path = vec3.normalize(path, path);
        const segment = new LineSegment(length, lineThickness, 36);
        this.model = segment.model;
        // TODO: Transform the model.
    }
}