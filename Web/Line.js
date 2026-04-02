class Line
{
    // Vertex array identifier.
    vertexArray;
    // Vertex buffer identifier.
    vertexBuffer;
    // Partial vertex array identifier.
    partialVertexArray;
    // Partial vertex buffer identifier.
    partialVertexBuffer;
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
        // Translations for this line.
        this.translations = new Array(1);
        this.translations[0] = vec3.fromValues(start[0], start[1], start[2]);
        // Partial geometry data.
        this.partial = null;
        // Partial translation for this line.
        this.partialTranslation = vec3.create();
        if (vec3.exactEquals(y, this.path))
            this.transform = mat4.create();
        else
        {
            const axis = vec3.cross(vec3.create(), y, this.path);
            const angle = vec3.angle(y, this.path);
            // Matrix that aligns the line segment to the path.
            this.transform = mat4.fromRotation(mat4.create(), angle, axis);
        }
    }
    /*
        Creates multiple cylinders that represent the line.

        assemblyData: The assembly data that contains the base line geometry.
        lineScale: The line scale to use.
    */
    createDashedLine(assemblyData, lineScale)
    {
        this.model = [...assemblyData.lineSegment.model];
        let length = lineScale * assemblyData.lineLength;
        if (length > this.pathLength)
            length = this.pathLength;
        for (let i = 3; i < this.model.length; i += 6)
        {
            this.model[i] *= lineScale * assemblyData.lineThickness;
            this.model[i + 1] *= length;
            this.model[i + 2] *= lineScale * assemblyData.lineThickness;
        }
        const numberOfSegments = Math.ceil(Math.floor(this.pathLength / (lineScale * assemblyData.lineLength)) / 2);
        if (numberOfSegments > 1)
        {
            const factor = 2 * lineScale * assemblyData.lineLength;
            this.translations.length = numberOfSegments;
            for (var i = 1; i < numberOfSegments; i++)
                this.translations[i] = vec3.add(vec3.create(), this.translations[0], vec3.scale(vec3.create(), this.path, i * factor));
        }
        const partialLength = this.pathLength - 2 * numberOfSegments * lineScale * assemblyData.lineLength;
        if (partialLength > 0)
        {
            this.partial = [...assemblyData.lineSegment.model];
            for (let i = 3; i < this.partial.length; i += 6)
            {
                this.partial[i] *= lineScale * assemblyData.lineThickness;
                this.partial[i + 1] *= partialLength;
                this.partial[i + 2] *= lineScale * assemblyData.lineThickness;
            }
            this.partialTranslation = vec3.add(vec3.create(), this.translations[0], vec3.scale(vec3.create(), this.path, this.pathLength - partialLength));
        }
        else
            this.partial = null;
    }
    /*
        Creates a cylinder that represents the line.
        
        assemblyData: The assembly data that contains the base line geometry.
        lineScale: The line scale to use.
    */
    createSolidLine(assemblyData, lineScale)
    {
        this.model = [...assemblyData.lineSegment.model];
        for (let i = 3; i < this.model.length; i += 6)
        {
            this.model[i] *= lineScale * assemblyData.lineThickness;
            this.model[i + 1] *= this.pathLength;
            this.model[i + 2] *= lineScale * assemblyData.lineThickness;
        }
    }
    /*
        Creates the line geometry.
        
        viewer: The model viewer to use.
    */
    createLine(viewer)
    {
        if (viewer.assemblyData.lineStyle == 0)
            this.createSolidLine(viewer.assemblyData, viewer.lineScale);
        else if (viewer.assemblyData.lineStyle == 1)
            this.createDashedLine(viewer.assemblyData, viewer.lineScale);
        const setToNull = this.partial == null;
        if (this.partial == null)
            this.partial = [...viewer.assemblyData.lineSegment.model];
        this.vertexBuffer = viewer.ctx.createBuffer();
        this.vertexArray = viewer.ctx.createVertexArray();
        viewer.ctx.bindVertexArray(this.vertexArray);
        viewer.ctx.bindBuffer(viewer.ctx.ARRAY_BUFFER, this.vertexBuffer);
        viewer.ctx.bufferData(
            viewer.ctx.ARRAY_BUFFER,
            new Float32Array(this.model),
            viewer.ctx.STATIC_DRAW
        );
        // Normal attribute.
        viewer.ctx.vertexAttribPointer(
            viewer.vertexNormal,
            3,
            viewer.ctx.FLOAT,
            false,
            24,
            0
        );
        viewer.ctx.enableVertexAttribArray(viewer.vertexNormal);
        // Position attribute.
        viewer.ctx.vertexAttribPointer(
            viewer.vertexPosition,
            3,
            viewer.ctx.FLOAT,
            false,
            24,
            12
        );
        viewer.ctx.enableVertexAttribArray(viewer.vertexPosition);
        this.partialVertexBuffer = viewer.ctx.createBuffer();
        this.partialVertexArray = viewer.ctx.createVertexArray();
        viewer.ctx.bindVertexArray(this.partialVertexArray);
        viewer.ctx.bindBuffer(viewer.ctx.ARRAY_BUFFER, this.partialVertexBuffer);
        viewer.ctx.bufferData(
            viewer.ctx.ARRAY_BUFFER,
            new Float32Array(this.partial),
            viewer.ctx.STATIC_DRAW
        );
        // Normal attribute.
        viewer.ctx.vertexAttribPointer(
            viewer.vertexNormal,
            3,
            viewer.ctx.FLOAT,
            false,
            24,
            0
        );
        viewer.ctx.enableVertexAttribArray(viewer.vertexNormal);
        // Position attribute.
        viewer.ctx.vertexAttribPointer(
            viewer.vertexPosition,
            3,
            viewer.ctx.FLOAT,
            false,
            24,
            12
        );
        viewer.ctx.enableVertexAttribArray(viewer.vertexPosition);
        if (setToNull)
            this.partial = null;
    }
    /*
        Updates the line geometry.
        
        viewer: The model viewer to use.
    */
    updateLine(viewer)
    {
        if (viewer.assemblyData.lineStyle == 0)
            this.createSolidLine(viewer.assemblyData, viewer.lineScale);
        else if (viewer.assemblyData.lineStyle == 1)
            this.createDashedLine(viewer.assemblyData, viewer.lineScale);
        viewer.ctx.bindBuffer(viewer.ctx.ARRAY_BUFFER, this.vertexBuffer);
        viewer.ctx.bufferData(
            viewer.ctx.ARRAY_BUFFER,
            new Float32Array(this.model),
            viewer.ctx.STATIC_DRAW
        );
        if (this.partial != null)
        {
            viewer.ctx.bindBuffer(viewer.ctx.ARRAY_BUFFER, this.partialVertexBuffer);
            viewer.ctx.bufferData(
                viewer.ctx.ARRAY_BUFFER,
                new Float32Array(this.partial),
                viewer.ctx.STATIC_DRAW
            );
        }
    }
}