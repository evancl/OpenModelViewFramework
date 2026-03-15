import * from "Component.js";

export class Part extends Component
{
    /*
        Color and reflection properties.
        
        0: R (0 - 1)
        1: G (0 - 1)
        2: B (0 - 1)
        3: S (0 - 1)
    */
    properties;
    /*
        Matrix that transforms this component relative to the global coordinate system. Assignment is column based.
        
        r0c0, r0c1, r0c2, Δx
        r1c0, r1c1, r1c2, Δy
        r2c0, r2c1, r2c2, Δz
        0, 0, 0, 1
    */
    transform;

    constructor()
    {
        super();
        this.setProperties();
        this.setTransform();
        // Vertex array identifier.
        this.vertexArray = 0;
        // Vertex buffer identifier.
        this.vertexBuffer = 0;
    }
    // Sets the properties using the data view.
    setProperties()
    {
        this.properties = vec4.create();
        for (let i = 0; i < 4; i++)
        {
            this.properties[i] = Component.#dataView.getUint8(Component.index, true) / 255.0;
            Component.index++;
        }
    }
    // Sets the transform using the data view.
    setTransform()
    {
        this.transform = mat4.create();
        this.transform[0] = Component.dataView.getFloat32(Component.index, true);
        this.transform[1] = Component.dataView.getFloat32(Component.index + 4 * 3, true);
        this.transform[2] = Component.dataView.getFloat32(Component.index + 4 * 6, true);
        this.transform[3] = 0;
        this.transform[4] = Component.dataView.getFloat32(Component.index + 4, true);
        this.transform[5] = Component.dataView.getFloat32(Component.index + 4 * 4, true);
        this.transform[6] = Component.dataView.getFloat32(Component.index + 4 * 7, true);
        this.transform[7] = 0;
        this.transform[8] = Component.dataView.getFloat32(Component.index + 4 * 2, true);
        this.transform[9] = Component.dataView.getFloat32(Component.index + 4 * 5, true);
        this.transform[10] = Component.dataView.getFloat32(Component.index + 4 * 8, true);
        this.transform[11] = 0;
        this.transform[12] = Component.dataView.getFloat32(Component.index + 4 * 9, true);
        this.transform[13] = Component.dataView.getFloat32(Component.index + 4 * 10, true);
        this.transform[14] = Component.dataView.getFloat32(Component.index + 4 * 11, true);
        this.transform[15] = 1;
        Component.index += 48;
    }
}