using static System.BitConverter;

namespace OpenModelViewFramework;

public class ComponentData
{
    // Part IDs.
    public short[] IDs
    {
        get
        {
            return IDs;
        }
        set
        {
            if (value != null && (value.Length == 0 || value.Length > short.MaxValue))
                throw new ArgumentOutOfRangeException($"ComponentData.IDs length must be between 1 and {short.MaxValue} inclusive.");
        }
    }
    // Component properties to update.
    public ComponentProperties[] Properties
    {
        get
        {
            return Properties;
        }
        set
        {
            if (value != null && (value.Length == 0 || value.Length > short.MaxValue))
                throw new ArgumentOutOfRangeException($"ComponentData.Properties length must be between 1 and {short.MaxValue} inclusive.");
        }
    }
    // STL file names.
    string[] Files;

    public ComponentData()
    {
        var directory = Directory.GetCurrentDirectory();
        Files = Directory.GetFiles(
            directory,
            "*.stl",
            SearchOption.AllDirectories
        );
        if (Files.Length == 0 || Files.Length > short.MaxValue)
            throw new Exception($"ComponentData.ComponentData error: STL file count must be between 1 and {short.MaxValue} inclusive.");
        Array.Sort(Files);
    }
    /*
        Gets the binary representation of the component data instance.

        data: The binary representation.
    */
    void GetBinaryRep(List<byte> data)
    {
        if (Properties == null)
            data.AddRange(GetBytes((short)0));
        else
        {
            data.AddRange(GetBytes((short)Properties.Length));
            foreach (var property in Properties)
                property.GetBinaryRep(data);
        }
        if (IDs == null)
            data.AddRange(GetBytes((short)0));
        else
        {
            data.AddRange(GetBytes((short)IDs.Length));
            foreach (var id in IDs)
            {
                data.AddRange(GetBytes(id));
                GetGeometryBinaryRep(data, id);
            }
        }
    }
    /*
        Gets the binary representation of the geometry in the STL file.

        data: The binary representation.
    */
    void GetGeometryBinaryRep(List<byte> data, short id)
    {
        var bytes = File.ReadAllBytes(Files[id]);
        var index = 80;
        var count = ToUInt32(bytes, index);
        index += 4;
        // 72 bytes per triangle.
        data.AddRange(GetBytes(count * 72));
        for (var i = 0; i < count; i++)
        {
            var normal = new ReadOnlySpan<byte>(bytes, index, 12);
            index += 12;
            for (var j = 0; j < 3; j++)
            {
                data.AddRange(normal);
                var span = new ReadOnlySpan<byte>(bytes, index, 12);
                index += 12;
                data.AddRange(span);
            }
            // Skip over unused bytes.
            index += 2;
        }
    }
    // Gets a binary representation of a cdata file.
    public List<byte> GetFile()
    {
        List<byte> data = new();
        GetBinaryRep(data);
        return data;
    }
    /*
        Creates a cdata file in the current working directory.

        name: The file name to use.
    */
    public void CreateFile(string name)
    {
        List<byte> data = new();
        GetBinaryRep(data);
        File.WriteAllBytes($"{System.IO.Directory.GetCurrentDirectory()}\\{name}.cdata", data.ToArray());
    }
}