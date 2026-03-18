export class Component
{
    // Identifier for geometry data. -1 indicates that this component is an assembly.
    id;
    // Indicates if this component is hidden.
    isHidden;
    // Name in the feature tree.
    name;
    // Visible components in this component and any child components.
    static visibleComponents;
    // View of data.
    static view;
    // Pointer within the data view buffer.
    static index;

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
    // Override this method in a derived class.
    create()
    {
        return null;
    }
    // Creates a component using the data view.
    static createComponent()
    {
        let component;
        const id = Component.view.getInt16(Component.index, true);
        if (id == -1)
            component = thiscreate();
        else
            component = new Part();
        return component;
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
        return Component.createComponent();
    }
}

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
    /*
        Transform data.

        Δx, Δy, Δz
    */
    collapsedTransform;
    /*
        Transform data.

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
            this.properties[i] = Component.view.getUint8(Component.index, true) / 255.0;
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
        Sets the collapsed and exploded transform of this part.

        transform: The exploded transform.
    */
    setTransform(transform)
    {
        this.collapsedTransform = new Array(3);
        for (let i = 0; i < this.collapsedTransform.length; i++)
            this.collapsedTransform[i] = this.transform[i + 12];
        this.explodedTransform = transform;
    }
    // Sets the transform using the data view.
    setTransform()
    {
        this.transform = mat4.create();
        this.transform[0] = Component.view.getFloat32(Component.index, true);
        this.transform[1] = Component.view.getFloat32(Component.index + 4 * 3, true);
        this.transform[2] = Component.view.getFloat32(Component.index + 4 * 6, true);
        this.transform[3] = 0;
        this.transform[4] = Component.view.getFloat32(Component.index + 4, true);
        this.transform[5] = Component.view.getFloat32(Component.index + 4 * 4, true);
        this.transform[6] = Component.view.getFloat32(Component.index + 4 * 7, true);
        this.transform[7] = 0;
        this.transform[8] = Component.view.getFloat32(Component.index + 4 * 2, true);
        this.transform[9] = Component.view.getFloat32(Component.index + 4 * 5, true);
        this.transform[10] = Component.view.getFloat32(Component.index + 4 * 8, true);
        this.transform[11] = 0;
        this.transform[12] = Component.view.getFloat32(Component.index + 4 * 9, true);
        this.transform[13] = Component.view.getFloat32(Component.index + 4 * 10, true);
        this.transform[14] = Component.view.getFloat32(Component.index + 4 * 11, true);
        this.transform[15] = 1;
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
                viewer.models[this.id],
                viewer.ctx.STATIC_DRAW
            );
        }
    }
}

export class Assembly extends Component
{
    // Array of child components.
    children;

    constructor()
    {
        super();
        this.setChildren();
    }
    /*
        Gets the child component that exists at the given path.

        path: The path of the child component relative to this assembly.
    */
    getChild(path)
    {
        let name;
        const index = path.indexOf("/");
        if (index == -1)
            name = path;
        else
            name = path.substring(0, index);
        for (let i = 0; i < this.children.length; i++)
        {
            if (this.children[i].name == name)
            {
                if (index == -1)
                    return this.children[i];
                else
                    return this.children[i].getChild(path.substring(index + 1));
            }
        }
        return null;
    }
    // Updates the transforms of the child components to use the exploded transforms.
    explode()
    {
        for (let i = 0; i < this.children.length; i++)
            this.children[i].explode();
    }
    // Updates the transforms of the child components to use the collapsed transforms.
    collapse()
    {
        for (let i = 0; i < this.children.length; i++)
            this.children[i].collapse();
    }
    /*
        Sets the collapsed and exploded transforms of the child components.

        transform: The exploded transform.
    */
    setTransform(transform)
    {
        for (let i = 0; i < this.children.length; i++)
            this.children[i].setTransform(transform);
    }
    // Hides the immediate children.
    hideChildren()
    {
        for (let i = 0; i < this.children.length; i++)
            this.children[i].isHidden = true;
    }
    // Sets the children using the data view.
    setChildren()
    {
        this.children = new Array(Component.view.getInt16(Component.index, true));
        Component.index += 2;
        for (let i = 0; i < this.children.length; i++)
            this.children[i] = Component.createComponent();
    }
    // Gets the visible components in this assembly.
    getVisibleComponents()
    {
        Component.visibleComponents = new LinkedList();
        this.setVisibleComponents();
        return Component.visibleComponents;
    }
    // Sets the visible components list.
    setVisibleComponents()
    {
        if (this.isHidden)
            return;
        else if (this.children.length == 0)
            Component.visibleComponents.add(this);
        else
        {
            for (let i = 0; i < this.children.length; i++)
                this.children[i].setVisibleComponents();
        }
    }
    /*
        Binds the components with the given ids to the updated models in the given viewer.

        ids: The IDs to use.
        viewer: The model viewer to use.
    */
    bind(ids, viewer)
    {
        for (let i = 0; i < this.children.length; i++)
            this.children[i].bind(ids, viewer);
    }
}