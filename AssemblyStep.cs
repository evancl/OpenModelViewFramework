namespace OpenModelViewLibrary;

class AssemblyStep
{
    // Name of the assembly step.
    string Name
    {
        get; set
        {
            if (value == null)
                throw new ArgumentNullException("AssemblyStep.Name cannot be null.");
            var length = Encoding.UTF8.GetBytes(value).Length;
            if (length == 0 || length > byte.MaxValue)
                throw new ArgumentOutOfRangeException($"AssemblyStep.Name length must be between 1 and {byte.MaxValue} inclusive.");
        }
    }
    // Explode line list.
    Line[] Lines
    {
        get; set
        {
            if (value != null && (value.Length == 0 || value.Length > short.MaxValue))
                throw new ArgumentOutOfRangeException($"AssemblyStep.Lines length must be between 1 and {short.MaxValue} inclusive.");
        }
    }
    // Components in the assembly step.
    AssemblyStepComponent[] Components
    {
        get; set
        {
            if (value == null)
                throw new ArgumentNullException("AssemblyStep.Components cannot be null.");
            var length = Encoding.UTF8.GetBytes(value).Length;
            if (length == 0 || length > byte.MaxValue)
                throw new ArgumentOutOfRangeException($"AssemblyStep.Components length must be between 1 and {short.MaxValue} inclusive.");
        }
    }
    /*
        Gets the binary representation of the assembly step.

        data: The binary representation.
    */
    void GetBinaryRep(List<byte> data)
    {
        var bytes = Encoding.UTF8.GetBytes(Name);
        data.Add((byte)bytes.Length);
        data.AddRange(bytes);
        if (Lines == null)
            data.Add(GetBytes((short)0));
        else
        {
            data.Add((short)Lines.Length);
            foreach (var line in Lines)
                line.GetBinaryRep(data);
        }
        data.AddRange(GetBytes((short)Components.Length));
        foreach (var component in Components)
            component.GetBinaryRep(data);
    }
}