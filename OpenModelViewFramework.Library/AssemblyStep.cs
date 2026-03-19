using System.Text;
using static System.BitConverter;

namespace OpenModelViewFramework.Library;

public class AssemblyStep
{
    // Name of the assembly step.
    string Name
    {
        get
        {
            return Name;
        }
        set
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
        get
        {
            return Lines;    
        }
        set
        {
            if (value != null && (value.Length == 0 || value.Length > short.MaxValue))
                throw new ArgumentOutOfRangeException($"AssemblyStep.Lines length must be between 1 and {short.MaxValue} inclusive.");
        }
    }
    // Components in the assembly step.
    List<AssemblyStepComponent> Components
    {
        get
        {
            return Components;
        }
        set
        {
            if (value == null)
                throw new ArgumentNullException("AssemblyStep.Components cannot be null.");
            else if (value.Count == 0 || value.Count > short.MaxValue)
                throw new ArgumentOutOfRangeException($"AssemblyStep.Components count must be between 1 and {short.MaxValue} inclusive.");
        }
    }

    public AssemblyStep(string name, Line[] lines, List<AssemblyStepComponent> components)
    {
        Name = name;
        Lines = lines;
        Components = components;
    }
    /*
        Gets the binary representation of the assembly step.

        data: The binary representation.
    */
    internal void GetBinaryRep(List<byte> data)
    {
        var bytes = Encoding.UTF8.GetBytes(Name);
        data.Add((byte)bytes.Length);
        data.AddRange(bytes);
        if (Lines == null)
            data.AddRange(GetBytes((short)0));
        else
        {
            data.AddRange(GetBytes((short)Lines.Length));
            foreach (var line in Lines)
                line.GetBinaryRep(data);
        }
        data.AddRange(GetBytes((short)Components.Count));
        foreach (var component in Components)
            component.GetBinaryRep(data);
    }
}