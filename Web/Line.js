import { Point } from "Point.js";

export class Line
{
    // Vertex array identifier.
    vertexArray;
    // Vertex buffer identifier.
    vertexBuffer;
    // Line geometry data.
    model;

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
        Creates multiple rectangular prisms that represents the line.

        lineThickness: A value that is proportional to the diameter of a circumscribed circle
        positioned at the end point.
    */
    createDashedLine(lineThickness)
    {

    }
    /*
        Creates a rectangular prism that represents the line.

        lineThickness: A value that is proportional to the diameter of a circumscribed circle
        positioned at the end point.
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
        let n0 = vec3.fromValues(
            end[0] - start[0],
            end[1] - start[1],
            end[2] - start[2]
        );
        n0 = vec3.normalize(n0);
        let d0 = vec3.create();
        if (n0[0] == 0)
            d0[0] = 1;
        else if (n0[1] == 0)
            d0[1] = 1;
        else if (n0[2] == 0)
            d0[2] = 1;
        else
        {
            if (n0[0] >= n0[1] && n0[0] >= n0[2])
            {
                d0[0] = (-n0[2] - n0[1]) / n0[0];
                d0[1] = 1;
                d0[2] = 1;
            }
            else if (n0[1] >= n0[0] && n0[1] >= n0[2])
            {
                d0[0] = 1;
                d0[1] = (-n0[2] - n0[0]) / n0[1];
                d0[2] = 1;
            }
            else
            {
                d0[0] = 1;
                d0[1] = 1;
                d0[2] = (-n0[1] - n0[0]) / n0[2];
            }
            d0 = vec3.normalize(d0);
        }
        d0 = vec3.scale(d0, lineThickness);
        let matrix = mat4.fromRotation(.25 * Math.PI, n0);
        const n1 = vec3.transformMat4(d0, matrix);
        matrix = mat4.rotate(matrix, .25 * Math.PI, n0);
        const d1 = vec3.transformMat4(d0, matrix);
        matrix = mat4.rotate(matrix, .25 * Math.PI, n0);
        const n2 = vec3.transformMat4(d0, matrix);
        const d2 = vec3.scale(d0, -1);
        const d3 = vec3.scale(d1, -1);
        const p0 = vec3.add(end, d0);
        const p1 = vec3.add(end, d1);
        const p2 = vec3.add(end, d2);
        const p3 = vec3.add(end, d3);
        const p4 = vec3.add(start, d0);
        const p5 = vec3.add(start, d1);
        const p6 = vec3.add(start, d2);
        const p7 = vec3.add(start, d3);
        let index = 0;
        // End face.
        const points =
        [
            p0,
            p1,
            p2,
            p0,
            p2,
            p3
        ];
        index = this.createFace(index, points, n0);
        // Start face.
        const points =
        [
            p4,
            p5,
            p6,
            p4,
            p6,
            p7
        ];
        index = this.createFace(index, points, vec3.scale(n0, -1));
        // Top face.
        const points =
        [
            p4,
            p5,
            p1,
            p4,
            p1,
            p0
        ];
        index = this.createFace(index, points, n1);
        // Bottom face.
        const points =
        [
            p7,
            p6,
            p2,
            p7,
            p2,
            p3
        ];
        index = this.createFace(index, points, vec3.scale(n1, -1));
        // Right face.
        const points =
        [
            p5,
            p6,
            p2,
            p5,
            p2,
            p1
        ];
        index = this.createFace(index, points, n2);
        // Left face.
        const points =
        [
            p7,
            p4,
            p0,
            p7,
            p0,
            p3
        ];
        this.createFace(index, points, vec3.scale(n2, -1));
    }
    /*
        Creates a planar face using the given parameters.

        index: The start index within the model.
        points: A two dimensional array containing six points.
        normal: The normal vector to use.
    */
    createFace(index, points, normal)
    {
        for (let i = 0; i < 6; i++)
        {
            this.add(index + i * 6, normal);
            this.add(index + i * 6 + 3, points[i])
        }
        return index + 36;
    }
    /*
        Adds the elements in point to the model.

        index: The start index within the model.
        point: An array containing 3 elements.
    */
    add(index, point)
    {
        for (let i = 0; i < 3; i++)
            this.model[index + i] = list[i];
    }
}