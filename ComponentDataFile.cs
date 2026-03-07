namespace OpenModelViewLibrary;

class ComponentDataFile
{
    // Component models.
    ComponentModel[] Models
    {
        get; set
        {
            if (value != null && (value.Length == 0 || value.Length > short.MaxValue))
                throw new ArgumentOutOfRangeException($"ComponentDataFile.Models length must be between 1 and {short.MaxValue} inclusive.");
        }
    }
    // Component properties to update.
    ComponentProperties[] Properties
    {
        get; set
        {
            if (value != null && (value.Length == 0 || value.Length > short.MaxValue))
                throw new ArgumentOutOfRangeException($"ComponentDataFile.Properties length must be between 1 and {short.MaxValue} inclusive.");
        }
    }
    /*
        Gets the binary representation of the component data file.

        data: The binary representation.
    */
    void GetBinaryRep(List<byte> data)
    {
        if (Models == null)
            data.AddRange(GetBytes((short)0));
        else
        {
            data.AddRange(GetBytes((short)Models.Length));
            foreach (var model in Models)
                model.GetBinaryRep(data);
        }
        if (Properties == null)
            data.AddRange(GetBytes((short)0));
        else
        {
            data.AddRange(GetBytes((short)Properties.Length));
            foreach (var property in Properties)
                property.GetBinaryRep(data);
        }
    }
    /*
        Creates a cdata file in the current working directory.

        name: The file name to use.
    */
    void Create(string name)
    {
        List<byte> data = new();
        GetBinaryRep(data);
        File.WriteAllBytes($"{System.IO.Directory.GetCurrentDirectory()}\\{name}.cdata", data.ToArray());
    }
}