using static System.BitConverter;

namespace OpenModelViewFramework;

public class AssemblyData
{
    /*
        Explode line style.

        0: Solid
        1: Dashed
    */
    public byte LineStyle
    {
        get
        {
            return LineStyle;
        }
        set
        {
            if (value > 1)
                throw new ArgumentOutOfRangeException("AssemblyData.LineStyle must be less than or equal to 1.");
        }
    }
    // Explode line thickness.
    public byte LineThickness
    {
        get
        {
            return LineThickness;
        }
        set
        {
            if (value == 0)
                throw new ArgumentOutOfRangeException("AssemblyData.LineThickness must be greater than 0.");
        }
    }
    /*
        Explode line color and reflection properties. Size: 4 bytes.

        0: R (0 - 255)
        1: G (0 - 255)
        2: B (0 - 255)
        3: S (0 - 255)
    */
    public byte[] Properties
    {
        get
        {
            return Properties;
        }
        set
        {
            if (value == null)
                throw new ArgumentNullException("AssemblyData.Properties cannot be null.");
            else if (value.Length != 4)
                throw new ArgumentOutOfRangeException("AssemblyData.Properties length must be 4.");
        }
    }
    // Assembly steps.
    public AssemblyStep[] Steps
    {
        get
        {
            return Steps;   
        }
        set
        {
            if (value == null)
                throw new ArgumentNullException("AssemblyData.Steps cannot be null.");
            else if (value.Length == 0 || value.Length > short.MaxValue)
                throw new ArgumentOutOfRangeException($"AssemblyData.Steps length must be between 1 and {short.MaxValue} inclusive.");
        }
    }

    public AssemblyData(byte lineStyle, byte lineThickness, byte[] properties, int steps)
    {
        LineStyle = lineStyle;
        LineThickness = lineThickness;
        Properties = properties;
        Steps = new AssemblyStep[steps];
    }
    /*
        Gets the binary representation of the assembly data instance.

        data: The binary representation.
    */
    void GetBinaryRep(List<byte> data)
    {
        data.Add(LineStyle);
        data.Add(LineThickness);
        data.AddRange(Properties);
        data.AddRange(GetBytes((short)Steps.Length));
        foreach (var step in Steps)
            step.GetBinaryRep(data);
    }
    /*
        Creates an adata file in the current working directory.

        name: The file name to use.
    */
    public void CreateFile(string name)
    {
        List<byte> data = new();
        GetBinaryRep(data);
        File.WriteAllBytes($"{System.IO.Directory.GetCurrentDirectory()}\\{name}.adata", data.ToArray());
    }
}