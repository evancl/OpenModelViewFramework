import * from "Component.js";

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

        path: The path of the child component relative to this component.
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
    // Sets the children using the data view.
    setChildren()
    {
        this.children = new Array(Component.dataView.getInt16(Component.index, true));
        Component.index += 2;
        for (let i = 0; i < this.children.length; i++)
            this.children[i] = Component.createComponent();
    }
    // Gets the visible components in this component.
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
}