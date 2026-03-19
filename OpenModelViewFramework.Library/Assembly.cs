using static System.BitConverter;

namespace OpenModelViewFramework.Library;

public class Assembly : Component
{
    // Identifier for geometry data. -1 indicates that this component is an assembly. Size: 2 bytes.
    protected override short ID => -1;
    // Child components.
    Component[] Children
    {
        get
        {
            return Children;
        }
        set
        {
            if (value == null)
                throw new ArgumentNullException("Assembly.Children cannot be null.");
            else if (value.Length == 0 || value.Length > short.MaxValue)
                throw new ArgumentOutOfRangeException($"Assembly.Children length must be between 1 and {short.MaxValue} inclusive.");
        }
    }

    public Assembly(bool isHidden, string path, string name, Component[] children) : base(isHidden, name, path)
    {
        Children = children;
    }
    /*
        Gets the binary representation of this assembly.

        data: The binary representation.
    */
    internal override void GetBinaryRep(List<byte> data)
    {
        base.GetBinaryRep(data);
        data.AddRange(GetBytes((short)Children.Length));
        foreach (var child in Children)
            child.GetBinaryRep(data);
    }
    /*
        Gets the component at the given path.

        path: The path of the component relative to this component.
    */
    public Component GetChild(string path)
    {
        var index = path.IndexOf('/');
        var name = index == -1 ? path : path[..index];
        Component component = null;
        foreach (var child in Children)
        {
            if (child.Name == name)
            {
                component = child;
                break;
            }
        }
        if (component == null || index == -1)
            return component;
        path = path[(index + 1)..];
        return ((Assembly)component).GetChild(path);
    }
}