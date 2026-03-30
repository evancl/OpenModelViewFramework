class Line
{
    // Vertex array identifier.
    vertexArray;
    // Vertex buffer identifier.
    vertexBuffer;
    // Line geometry data.
    model;

    constructor()
    {
        // Explode line start point.
        this.start = new Point();
        // Explode line end point.
        this.end = new Point();
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
        // Path vector.
        this.path = vec3.fromValues(
            end[0] - start[0],
            end[1] - start[1],
            end[2] - start[2]
        );
        // y unit vector.
        const y = vec3.fromValues(0, 1, 0);
        // Path length.
        this.pathLength = vec3.length(this.path);
        this.path = vec3.normalize(this.path, this.path);
        const axis = vec3.cross(vec3.create(), y, this.path);
        const angle = vec3.angle(y, this.path);
        // Transforms for this line.
        this.transforms = new Array();
        // Matrix that aligns the line segment to the path.
        this.transforms[0] = mat4.fromRotation(mat4.create(), angle, axis);
        this.transform[0][12] = start[0];
        this.transform[0][13] = start[1];
        this.transform[0][14] = start[2];
    }
    /*
        Creates multiple cylinders that represent the line.

        assemblyData: The assembly data that contains the base line geometry.
        thicknessScale: The thickness scale to use.
    */
    createDashedLine(assemblyData, thicknessScale)
    {
        this.model = [...assemblyData.lineSegment.model];
        // TODO
    }
    /*
        Creates a cylinder that represents the line.
        
        assemblyData: The assembly data that contains the base line geometry.
        thicknessScale: The thickness scale to use.
    */
    createSolidLine(assemblyData, thicknessScale)
    {
        this.model = [...assemblyData.lineSegment.model];
        const lengthScale = this.pathLength / (assemblyData.lineLength * thicknessScale);
        for (let i = 3; i < this.model.length; i += 3)
        {
            this.model[i] *= thicknessScale;
            this.model[i + 1] *= lengthScale;
            this.model[i + 2] *= thicknessScale;
        }
    }
    /*
        Creates the line geometry.
        
        assemblyData: The assembly data that contains the base line geometry.
        thicknessScale: The thickness scale to use.
    */
    createLine(assemblyData, thicknessScale)
    {
        if (assemblyData.lineStyle == 0)
            this.createSolidLine(assemblyData, thicknessScale);
        else if (assemblyData.lineStyle == 1)
            this.createDashedLine(assemblyData, thicknessScale);
    }
}