class Part extends Component
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
    /*
        Collapsed transform data.

        Δx, Δy, Δz
    */
    collapsedTransform;
    /*
        Exploded transform data.

        Δx, Δy, Δz
    */
    explodedTransform;
    // Vertex array identifier.
    vertexArray;
    // Vertex buffer identifier.
    vertexBuffer;

    constructor()
    {
        super();
        this.setProperties();
        this.setTransform();
    }
    // Sets the properties using the data view.
    setProperties()
    {
        this.properties = vec4.create();
        for (let i = 0; i < 4; i++)
        {
            this.properties[i] = Component.view.getUint8(Component.index, true) / 255;
            Component.index++;
        }
    }
    // Updates the transform to use the exploded transform.
    explode()
    {
        for (let i = 0; i < this.explodedTransform.length; i++)
            this.transform[i + 12] = this.explodedTransform[i];
    }
    // Updates the transform to use the collapsed transform.
    collapse()
    {
        for (let i = 0; i < this.collapsedTransform.length; i++)
            this.transform[i + 12] = this.collapsedTransform[i];
    }
    /*
        Sets the exploded and collapsed transform of this part.

        transform: The exploded transform relative to the collapsed state.
    */
    setExplodedAndCollapsed(transform)
    {
        this.collapsedTransform = vec3.create();
        this.explodedTransform = vec3.create();
        for (let i = 0; i < this.collapsedTransform.length; i++)
        {
            this.collapsedTransform[i] = this.transform[i + 12];
            this.explodedTransform[i] = this.transform[i + 12] + transform[i];
        }
    }
    // Sets the transform using the data view.
    setTransform()
    {
        this.transform = mat4.fromValues(
            Component.view.getFloat32(Component.index, true),
            Component.view.getFloat32(Component.index + 4 * 3, true),
            Component.view.getFloat32(Component.index + 4 * 6, true),
            0,
            Component.view.getFloat32(Component.index + 4, true),
            Component.view.getFloat32(Component.index + 4 * 4, true),
            Component.view.getFloat32(Component.index + 4 * 7, true),
            0,
            Component.view.getFloat32(Component.index + 4 * 2, true),
            Component.view.getFloat32(Component.index + 4 * 5, true),
            Component.view.getFloat32(Component.index + 4 * 8, true),
            0,
            Component.view.getFloat32(Component.index + 4 * 9, true),
            Component.view.getFloat32(Component.index + 4 * 10, true),
            Component.view.getFloat32(Component.index + 4 * 11, true),
            1
        );
        Component.index += 48;
    }
    /*
        Binds the components with the given ids to the updated models in the given viewer.

        ids: The IDs to use.
        viewer: The model viewer to use.
    */
    bind(ids, viewer)
    {
        if (ids.includes(this.id))
        {
            viewer.ctx.bindBuffer(viewer.ctx.ARRAY_BUFFER, this.vertexBuffer);
            viewer.ctx.bufferData(
                viewer.ctx.ARRAY_BUFFER,
                new Float32Array(viewer.models[this.id]),
                viewer.ctx.STATIC_DRAW
            );
        }
    }
}
