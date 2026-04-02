using System.Text.Json;
using System.Text.Json.Serialization;
using static System.BitConverter;

namespace OpenModelViewFramework.Library;

public class AssemblyData
{
    int _LineStyle;
    int _LineLength;
    int _LineThickness;
    int[] _Properties;
    AssemblyStep[] _Steps;
    /*
        Explode line style.

        0: Solid
        1: Dashed
    */
    public int LineStyle
    {
        get
        {
            return _LineStyle;
        }
        set
        {
            if (value < 0 || value > 1)
                throw new ArgumentOutOfRangeException("AssemblyData.LineStyle must be between 0 and 1 inclusive.");
            _LineStyle = value;
        }
    }
    // Explode line length.
    public int LineLength
    {
        get
        {
            return _LineLength;
        }
        set
        {
            if (value < 1 || value > 50)
                throw new ArgumentOutOfRangeException("AssemblyData.LineLength must be between 1 and 50 inclusive.");
            _LineLength = value;
        }
    }
    // Explode line thickness.
    public int LineThickness
    {
        get
        {
            return _LineThickness;
        }
        set
        {
            if (value < 1 || value > 10)
                throw new ArgumentOutOfRangeException("AssemblyData.LineThickness must be between 1 and 10 inclusive.");
            _LineThickness = value;
        }
    }
    /*
        Explode line color and reflection properties.

        0: R (0 - 255)
        1: G (0 - 255)
        2: B (0 - 255)
        3: S (0 - 255)
    */
    public int[] Properties
    {
        get
        {
            return _Properties;
        }
        set
        {
            if (value == null)
                throw new ArgumentNullException("AssemblyData.Properties cannot be null.");
            else if (value.Length != 4)
                throw new ArgumentOutOfRangeException("AssemblyData.Properties length must be 4.");
            for (var i = 0; i < value.Length; i++)
            {
                if (value[i] < 0 || value[i] > 255)
                   throw new ArgumentOutOfRangeException("AssemblyData.Properties elements must be between 0 and 255 inclusive."); 
            }
            _Properties = value;
        }
    }
    // Assembly steps.
    public AssemblyStep[] Steps
    {
        get
        {
            return _Steps;
        }
        set
        {
            if (value == null)
                throw new ArgumentNullException("AssemblyData.Steps cannot be null.");
            else if (value.Length == 0 || value.Length > byte.MaxValue)
                throw new ArgumentOutOfRangeException($"AssemblyData.Steps length must be between 1 and {byte.MaxValue} inclusive.");
            _Steps = value;
        }
    }

    public AssemblyData(string name)
    {
        var data = File.ReadAllBytes($"{System.IO.Directory.GetCurrentDirectory()}\\{name}.adata");
        var index = 0;
        LineStyle = data[index];
        index++;
        LineLength = data[index];
        index++;
        LineThickness = data[index];
        index++;
        Properties = new int[4];
        for (var i = 0; i < 4; i++)
        {
            Properties[i] = data[index];
            index++;
        }
        var count = ToInt16(data, index);
        index += 2;
        Steps = new AssemblyStep[count];
        for (var i = 0; i < count; i++)
            Steps[i] = new AssemblyStep(data, ref index);
    }

    [JsonConstructor]
    public AssemblyData(int lineStyle, int lineLength, int lineThickness, int[] properties, AssemblyStep[] steps)
    {
        LineStyle = lineStyle;
        LineLength = lineLength;
        LineThickness = lineThickness;
        Properties = properties;
        Steps = steps;
    }
    /*
        Gets the binary representation of the assembly data instance.

        data: The binary representation.
    */
    void GetBinaryRep(List<byte> data)
    {
        data.Add((byte)LineStyle);
        data.Add((byte)LineLength);
        data.Add((byte)LineThickness);
        data.AddRange(Properties.Select(i => (byte)i).ToArray());
        data.Add((byte)Steps.Length);
        foreach (var step in Steps)
            step.GetBinaryRep(data);
    }
    /*
        Creates an adata file with the given name in the current working directory.

        name: The file name to use.
    */
    public void CreateFile(string name)
    {
        List<byte> data = new();
        GetBinaryRep(data);
        File.WriteAllBytes($"{System.IO.Directory.GetCurrentDirectory()}\\{name}.adata", data.ToArray());
    }
    /*
        Creates an adata file in the current working directory.

        jsonFileName: The json file name to use.
    */
    public static void CreateFileFromJson(string jsonFileName)
    {
        var json = File.ReadAllText($"{System.IO.Directory.GetCurrentDirectory()}\\{jsonFileName}.json");
        var assemblyData = JsonSerializer.Deserialize<AssemblyData>(json);
        assemblyData.CreateFile(jsonFileName);
    }
}
