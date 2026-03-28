using System.Collections;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using static System.BitConverter;

namespace OpenModelViewFramework.Library;

public class AssemblyStep
{
    string _Name;
    Line[] _Lines;
    List<AssemblyStepComponent> _Components;
    // Name of the assembly step.
    public string Name
    {
        get
        {
            return _Name;
        }
        set
        {
            if (value == null)
                throw new ArgumentNullException("AssemblyStep.Name cannot be null.");
            var length = Encoding.UTF8.GetBytes(value).Length;
            if (length == 0 || length > byte.MaxValue)
                throw new ArgumentOutOfRangeException($"AssemblyStep.Name length must be between 1 and {byte.MaxValue} inclusive.");
            _Name = value;
        }
    }
    // Explode line list.
    public Line[] Lines
    {
        get
        {
            return _Lines;    
        }
        set
        {
            if (value != null && (value.Length == 0 || value.Length > short.MaxValue))
                throw new ArgumentOutOfRangeException($"AssemblyStep.Lines length must be between 1 and {short.MaxValue} inclusive.");
            _Lines = value;
        }
    }
    // Components in the assembly step.
    public List<AssemblyStepComponent> Components
    {
        get
        {
            return _Components;
        }
        set
        {
            if (value == null)
                throw new ArgumentNullException("AssemblyStep.Components cannot be null.");
            else if (value.Count == 0 || value.Count > short.MaxValue)
                throw new ArgumentOutOfRangeException($"AssemblyStep.Components count must be between 1 and {short.MaxValue} inclusive.");
            _Components = value;
        }
    }

    internal AssemblyStep(byte[] data, ref int index)
    {
        var length = data[index];
        index++;
        Name = Encoding.UTF8.GetString(data, index, length);
        index += length;
        var count = ToInt16(data, index);
        index += 2;
        if (count == 0)
            Lines = null;
        else
        {
            Lines = new Line[count];
            for (var i = 0; i < Lines.Length; i++)
                Lines[i] = new Line(data, ref index);
        }
        count = ToInt16(data, index);
        index += 2;
        var components = new List<AssemblyStepComponent>();
        for (var i = 0; i < count; i++)
            components.Add(new AssemblyStepComponent(data, ref index));
        Components = components;
    }

    [JsonConstructor]
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