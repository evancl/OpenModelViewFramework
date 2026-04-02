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
