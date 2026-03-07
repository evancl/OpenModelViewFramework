namespace OpenModelViewLibrary;

class AssemblyDataFile
{
    // Assembly steps.
    AssemblyStep[] Steps;
    /*
        Gets the binary representation of the assembly steps.

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
    void CreateAssemblyDataFile(string name)
    {
        List<byte> data = new();
        GetBinaryRep(data);
        File.WriteAllBytes($"{System.IO.Directory.GetCurrentDirectory()}\\{name}.adata", data.ToArray());
    }
}