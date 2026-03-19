using System.Text;
using static System.BitConverter;

namespace OpenModelViewFramework.Library;

public class Component
{
    // Identifier for geometry data. -1 indicates that this component is an assembly. Size: 2 bytes.
    protected virtual short ID { get; set; }
    // Indicates if this component is hidden. Size: 1 byte.
    protected bool IsHidden;
    // Name in the model's feature tree. Size: 1 - 255 bytes.
    public string Name { get; }
    // Path relative to the root component. Size: 0 - 32767 bytes.
    public string Path { get; }

    private protected Component(bool isHidden, string name, string path)
    {
        IsHidden = isHidden;
        if (name == null)
            throw new ArgumentNullException("Component.Name cannot be null.");
        var length = Encoding.UTF8.GetBytes(name).Length;
        if (length == 0 || length > byte.MaxValue)
            throw new ArgumentOutOfRangeException($"Component.Name length must be between 1 and {byte.MaxValue} inclusive.");
        Name = name;
        if (path == null)
            throw new ArgumentNullException("Component.Path cannot be null.");
        length = Encoding.UTF8.GetBytes(path).Length;
        if (length > short.MaxValue)
            throw new ArgumentOutOfRangeException($"Component.Path length must be less than or equal to {short.MaxValue}.");
        Path = path;
    }
    /*
        Gets the binary representation of this component.

        data: The binary representation.
    */
    internal virtual void GetBinaryRep(List<byte> data)
    {
        data.AddRange(GetBytes(ID));
        data.Add(IsHidden ? (byte)1 : (byte)0);
        var bytes = Encoding.UTF8.GetBytes(Name);
        data.Add((byte)bytes.Length);
        data.AddRange(bytes);
    }
    /*
        Gets the binary representation of this component.

        data: The binary representation.
        properties: The properties to get.
    */
    internal virtual void GetBinaryRep(List<byte> data, byte properties)
    {
        var bytes = Encoding.UTF8.GetBytes(Path);
        data.AddRange(GetBytes((short)bytes.Length));
        data.AddRange(bytes);
        data.Add(properties);
        if ((properties & 1) != 0)
            data.Add(IsHidden ? (byte)1 : (byte)0);
    }
    // Creates a ctree file in the current working directory.
    public void CreateComponentTreeFile()
    {
        List<byte> data = new();
        GetBinaryRep(data);
        File.WriteAllBytes($"{System.IO.Directory.GetCurrentDirectory()}\\{Name}.ctree", data.ToArray());
    }
    // Override this method in a derived class to update CAD models.
    public virtual void Update() { return; }
}