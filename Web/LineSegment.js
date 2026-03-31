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

        numberOfTriangles: The number of triangles in the end face.
    */
    constructor(numberOfTriangles)
    {
        this.createVertices(numberOfTriangles);
        this.createTriangles(numberOfTriangles);
        const length = numberOfTriangles * 4 * 3 * 6;
        this.model = new Float32Array(length);
        let modelIndex = 0;
        let vector = [0, -1, 0];
        modelIndex = this.writeData(0, numberOfTriangles, modelIndex, vector);
        vector = [0, 1, 0];
        modelIndex = this.writeData(numberOfTriangles, numberOfTriangles, modelIndex, vector);
        const increment = 2 * Math.PI / numberOfTriangles;
        const initialAngle = increment / 2;
        for (let i = 0; i < numberOfTriangles; i++)
        {
            vector =
            [
                Math.cos(initialAngle + increment * i),
                0,
                Math.sin(initialAngle + increment * i)
            ];
            modelIndex = this.writeData((i + numberOfTriangles) * 2, 2, modelIndex, vector);
        }
    }
    /*
        Creates a triangle that is on an end face.

        index: The index in vertices.
        y: The y value to use. This will be 0 or 1.
        numberOfTriangles: The number of triangles in the end face.
    */
    createEndTriangle(index, y, numberOfTriangles)
    {
        const indices = [index, index == numberOfTriangles - 1 ? 0 : index + 1];
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
        y0: The first y value to use. This will be 0 or 1.
        y1: The second y value to use. This will be 0 or 1.
        useFirst: Indicates if the first index should be used.
        numberOfTriangles: The number of triangles in the end face.
    */
    createSideTriangles(index, y0, y1, useFirst, numberOfTriangles)
    {
        const indices = [index, index == numberOfTriangles - 1 ? 0 : index + 1];
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
    /*
        Creates the triangles.

        numberOfTriangles: Number of triangles in the end face.
    */
    createTriangles(numberOfTriangles)
    {
        this.triangles = new Array(numberOfTriangles * 4);
        // Create the top and bottom triangles.
        for (let i = 0; i < numberOfTriangles; i++)
        {
            this.triangles[i] = this.createEndTriangle(i, 0, numberOfTriangles);
            this.triangles[i + numberOfTriangles] = this.createEndTriangle(i, 1, numberOfTriangles);
        }
        // Create the side triangles.
        for (let i = 0; i < numberOfTriangles; i++)
        {
            this.triangles[(i + numberOfTriangles) * 2] = this.createSideTriangles(i, 0, 1, true, numberOfTriangles);
            this.triangles[(i + numberOfTriangles) * 2 + 1] = this.createSideTriangles(i, 1, 0, false, numberOfTriangles);
        }
    }
    /*
        Creates the vertices.

        numberOfTriangles: The number of triangles in the end face.
    */
    createVertices(numberOfTriangles)
    {
        this.vertices = new Array(numberOfTriangles);
        const increment = 2 * Math.PI / numberOfTriangles;
        for (let i = 0; i < numberOfTriangles; i++)
        {
            this.vertices[i] = new Float32Array(2);
            this.vertices[i][0] = Math.cos(increment * i);
            this.vertices[i][1] = Math.sin(increment * i);
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