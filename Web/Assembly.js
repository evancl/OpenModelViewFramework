class Assembly extends Component
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
    // Updates the transforms of the child components to use their exploded transforms.
    explode()
    {
        for (let i = 0; i < this.children.length; i++)
            this.children[i].explode();
    }
    // Updates the transforms of the child components to use their collapsed transforms.
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