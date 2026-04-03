class Component
{
    // Identifier for geometry data. -1 indicates that this component is an assembly.
    id;
    // Indicates if this component is hidden.
    isHidden;
    // Name in the feature tree.
    name;
    // Visible components in this component.
    static visibleComponents;
    // View of data.
    static view;
    // Pointer within the data view buffer.
    static index;
    // Model cube bounding box.
    static boundingBox;
    // Model center.
    static modelCenter;
    // Model radius.
    static modelRadius;
    // Matrix that translates the model center to the origin.
    static translation;

    constructor()
    {
        this.setID();
        this.setHiddenState();
        this.setName();
    }
    // Sets the ID using the data view.
    setID()
    {
        this.id = Component.view.getInt16(Component.index, true);
        Component.index += 2;
    }
    // Sets the hidden state using the data view.
    setHiddenState()
    {
        this.isHidden = Component.view.getUint8(Component.index, true) == 1;
        Component.index++;
    }
    // Sets the name using the data view.
    setName()
    {
        const length = Component.view.getUint8(Component.index, true);
        Component.index++;
        const nameData = new Int8Array(Component.view.buffer, Component.index, length);
        Component.index += length;
        const decoder = new TextDecoder();
        this.name = decoder.decode(nameData);
    }
    // Creates a component using the data view.
    static createComponent()
    {
        let component;
        const id = Component.view.getInt16(Component.index, true);
        if (id == -1)
            component = new Assembly();
        else
            component = new Part();
        return component;
    }
    // Gets a camera position in model space relative to the model center that results in an isometric view of the model.
    static getIsometricCameraPosition()
    {
        return vec3.fromValues(Component.modelRadius, Component.modelRadius, Component.modelRadius);
    }
    /*
        Returns the root component that is represented by the request body.

        body: The body to parse as a component tree file.
    */
    static parse(body)
    {
        const data = new Uint8Array(body);
        Component.view = new DataView(data.buffer);
        Component.index = 0;
        Component.boundingBox = new Float32Array(6);
        for (let i = 0; i < Component.boundingBox.length; i++)
        {
            Component.boundingBox[i] = Component.view.getFloat32(Component.index, true);
            Component.index += 4;
        }
        const modelCorner = vec3.fromValues(Component.boundingBox[0], Component.boundingBox[1], Component.boundingBox[2]);
        Component.modelCenter = vec3.fromValues(
            .5 * (Component.boundingBox[0] + Component.boundingBox[3]),
            .5 * (Component.boundingBox[1] + Component.boundingBox[4]),
            .5 * (Component.boundingBox[2] + Component.boundingBox[5])
        );
        Component.modelRadius = vec3.distance(Component.modelCenter, modelCorner);
        Component.boundingBox[0] = -Component.modelRadius;
        Component.boundingBox[1] = -Component.modelRadius;
        Component.boundingBox[2] = -Component.modelRadius;
        Component.boundingBox[3] = Component.modelRadius;
        Component.boundingBox[4] = Component.modelRadius;
        Component.boundingBox[5] = Component.modelRadius;
        Component.translation = mat4.fromTranslation(new Float32Array(16), vec3.fromValues(-Component.modelCenter[0], -Component.modelCenter[1], -Component.modelCenter[2]));
        return Component.createComponent();
    }
}