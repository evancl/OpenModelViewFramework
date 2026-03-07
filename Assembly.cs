namespace OpenModelViewLibrary;

public class Assembly : Component
{
    // Identifier for geometry data. -1 indicates that this component is an assembly. Size: 2 bytes.
    protected override short ID
    {
        get; set
        {
            if (value != -1)
                throw new ArgumentOutOfRangeException("Assembly.ID must be equal to -1.");
        }
    }
    // Child components.
    Component[] Children
    {
        get; set
        {
            if (value == null)
                throw new ArgumentNullException("Assembly.Children cannot be null.");
            else if (value.Length == 0 || value.Length > short.MaxValue)
                throw new ArgumentOutOfRangeException($"Assembly.Children length must be between 1 and {short.MaxValue} inclusive.");
        }
    }
    /*
        Gets the binary representation of this assembly.

        data: The binary representation.
    */
    protected override void GetBinaryRep(List<byte> data)
    {
        base.GetBinaryRep(data);
        data.AddRange(GetBytes((short)Children.Length));
        foreach (var child in Children)
            child.GetBinaryRep(data);
    }
}