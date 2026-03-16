using static System.BitConverter;

namespace OpenModelViewFramework;

public class AssemblyData
{
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
                throw new ArgumentNullException("AssemblyStep.Steps cannot be null.");
            else if (value.Length == 0 || value.Length > short.MaxValue)
                throw new ArgumentOutOfRangeException($"AssemblyStep.Steps length must be between 1 and {short.MaxValue} inclusive.");
        }
    }

    public AssemblyData(int steps)
    {
        Steps = new AssemblyStep[steps];
    }
    /*
        Gets the binary representation of the assembly data instance.

        data: The binary representation.
    */
    void GetBinaryRep(List<byte> data)
    {
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