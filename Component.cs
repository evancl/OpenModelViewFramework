namespace OpenModelViewLibrary;

public abstract class Component
{
    // Identifier for geometry data. -1 indicates that this component is an assembly. Size: 2 bytes.
    protected abstract short ID;
    // Indicates if this component is hidden. Size: 1 byte.
    protected bool IsHidden;
    // Name in the model's feature tree. Size: 1 - 255 bytes.
    protected string Name
    {
        get; set
        {
            if (value == null)
                throw new ArgumentNullException("Component.Name cannot be null.");
            var length = Encoding.UTF8.GetBytes(value).Length;
            if (length == 0 || length > byte.MaxValue)
                throw new ArgumentOutOfRangeException($"Component.Name length must be between 1 and {byte.MaxValue} inclusive.");
        }
    }
    /*
        Gets the binary representation of this component.

        data: The binary representation.
    */
    protected virtual void GetBinaryRep(List<byte> data)
    {
        data.AddRange(GetBytes(ID));
        data.Add(IsHidden ? (byte)1 : (byte)0);
        var bytes = Encoding.UTF8.GetBytes(Name);
        data.Add((byte)bytes.Length);
        data.AddRange(bytes);
    }
    /*
        Creates a ctree file in the current working directory.

        name: The file name to use.
    */
    protected void CreateComponentTreeFile(string name)
    {
        List<byte> data = new();
        GetBinaryRep(data);
        File.WriteAllBytes($"{System.IO.Directory.GetCurrentDirectory()}\\{name}.ctree", data.ToArray());
    }
}