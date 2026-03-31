class LineSegment
{
    // The triangles.
    triangles;
    // The model geometry.
    model;
    // The x and z coordinates.
    vertices;
    /*
        Class constructor.

        length: Length of the line segment.
        thickness: Thickness of the line segment.
        numberOfTriangles: Number of triangles in the end face.
    */
    constructor(length, thickness, numberOfTriangles)
    {
        if (length <= 0 || length > 10)
            throw new Error("LineSegment.constructor error: Line segment length must be between 1 and 10 inclusive.");
        this.length = length;
        if (thickness <= 0 || thickness > 10)
            throw new Error("LineSegment.constructor error: Line segment thickness must be between 1 and 10 inclusive.");
        this.thickness = thickness;
        this.numberOfTriangles = numberOfTriangles;
        this.createModel();
    }
    /*
        Creates a triangle that is on an end face.

        index: The index in vertices.
        y: The y value to use. This will be 0 or length.
    */
    createEndTriangle(index, y)
    {
        const indices = [index, index == this.numberOfTriangles - 1 ? 0 : index + 1];
        let triangle = new Array(3);
        for (let i = 0; i < 2; i++)
        {
            triangle[i] = new Float32Array(3);
            triangle[i][0] = this.vertices[indices[i]][0];
            triangle[i][1] = y;
            triangle[i][2] = this.vertices[indices[i]][1];
        }
        triangle[2] = new Float32Array(3);
        triangle[2][0] = 0;
        triangle[2][1] = y;
        triangle[2][2] = 0;
        return triangle;
    }
    /*
        Creates a triangle that is on a side face.

        index: The index in vertices.
        y0: The first y value to use. This will be 0 or length.
        y1: The second y value to use. This will be 0 or length.
    */
    createSideTriangles(index, y0, y1, useFirst)
    {
        const indices = [index, index == this.numberOfTriangles - 1 ? 0 : index + 1];
        let triangle = new Array(3);
        for (let i = 0; i < 2; i++)
        {
            triangle[i] = new Float32Array(3);
            triangle[i][0] = this.vertices[indices[i]][0];
            triangle[i][1] = y0;
            triangle[i][2] = this.vertices[indices[i]][1];
        }
        if (!useFirst)
            index = indices[1];
        triangle[2] = new Float32Array(3);
        triangle[2][0] = this.vertices[index][0];
        triangle[2][1] = y1;
        triangle[2][2] = this.vertices[index][1];
        return triangle;
    }
    // Creates the triangles.
    createTriangles()
    {
        this.triangles = new Array(this.numberOfTriangles * 4);
        // Create the top and bottom triangles.
        for (let i = 0; i < this.numberOfTriangles; i++)
        {
            this.triangles[i] = this.createEndTriangle(i, 0);
            this.triangles[i + this.numberOfTriangles] = this.createEndTriangle(i, this.length);
        }
        // Create the side triangles.
        for (let i = 0; i < this.numberOfTriangles; i++)
        {
            this.triangles[(i + this.numberOfTriangles) * 2] = this.createSideTriangles(i, 0, this.length, true);
            this.triangles[(i + this.numberOfTriangles) * 2 + 1] = this.createSideTriangles(i, this.length, 0, false);
        }
    }
    // Creates the model data.
    createModel()
    {
        this.createVertices();
        this.createTriangles();
        const length = this.numberOfTriangles * 4 * 3 * 6;
        this.model = new Float32Array(length);
        let modelIndex = 0;
        let vector = [0, -1, 0];
        modelIndex = this.writeData(0, this.numberOfTriangles, modelIndex, vector);
        vector = [0, 1, 0];
        modelIndex = this.writeData(this.numberOfTriangles, this.numberOfTriangles, modelIndex, vector);
        const increment = 2 * Math.PI / this.numberOfTriangles;
        const initialAngle = increment / 2;
        for (let i = 0; i < this.numberOfTriangles; i++)
        {
            vector =
            [
                Math.cos(initialAngle + increment * i),
                0,
                Math.sin(initialAngle + increment * i)
            ];
            modelIndex = this.writeData((i + this.numberOfTriangles) * 2, 2, modelIndex, vector);
        }
    }
    // Creates the vertices.
    createVertices()
    {
        this.vertices = new Array(this.numberOfTriangles);
        const increment = 2 * Math.PI / this.numberOfTriangles;
        for (let i = 0; i < this.numberOfTriangles; i++)
        {
            this.vertices[i] = new Float32Array(2);
            this.vertices[i][0] = this.thickness * Math.cos(increment * i);
            this.vertices[i][1] = this.thickness * Math.sin(increment * i);
        }
    }
    /*
        Writes the specified data to the model array.

        triangleIndex: The index within the triangles array.
        numberOfTriangles: The number of triangles to write out.
        modelIndex: The index within the model array.
        vector: The triangle normal vector.
    */
    writeData(triangleIndex, numberOfTriangles, modelIndex, vector)
    {
        for (let i = triangleIndex; i < triangleIndex + numberOfTriangles; i++)
        {
            for (let j = 0; j < 3; j++)
            {
                for (let k = 0; k < 3; k++)
                {
                    this.model[modelIndex] = vector[k];
                    modelIndex++;
                }
                for (let k = 0; k < 3; k++)
                {
                    this.model[modelIndex] = this.triangles[i][j][k];
                    modelIndex++;
                }
            }
        }
        return modelIndex;
    }
}