using System.Text;
using static System.BitConverter;

namespace OpenModelViewFramework;

public class AssemblyStepComponent
{
    // Name of the component.
    string Name
    {
        get
        {
            return Name;
        }
        set
        {
            if (value == null)
                throw new ArgumentNullException("AssemblyStepComponent.Name cannot be null.");
            var length = Encoding.UTF8.GetBytes(value).Length;
            if (length == 0 || length > byte.MaxValue)
                throw new ArgumentOutOfRangeException($"AssemblyStepComponent.Name length must be between 1 and {byte.MaxValue} inclusive.");
        }
    }
    /*
        Transform data.
    
        Δx, Δy, Δz
    */
    float[] Transform
    {
        get
        {
            return Transform;    
        }
        set
        {
            if (value != null)
            {
                if (value.Length != 3)
                    throw new ArgumentOutOfRangeException("AssemblyStepComponent.Transform length must be 3.");
                for (var i = 0; i < value.Length; i++)
                {
                    if (value[i] == float.NegativeInfinity || value[i] == float.PositiveInfinity)
                        throw new ArgumentOutOfRangeException("AssemblyStepComponent.Transform elements must be between negative infinity and positive infinity exclusive.");
                }
            }
        }
    }

    public AssemblyStepComponent(string name, float[] transform)
    {
        Name = name;
        Transform = transform;
    }
    /*
        Gets the binary representation of the assembly step component.

        data: The binary representation.
    */
    internal void GetBinaryRep(List<byte> data)
    {
        var bytes = Encoding.UTF8.GetBytes(Name);
        data.Add((byte)bytes.Length);
        data.AddRange(bytes);
        if (Transform == null)
            data.Add((byte)0);
        else
        {
            data.Add((byte)1);
            for (var i = 0; i < Transform.Length; i++)
                data.AddRange(GetBytes(Transform[i]));
        }
    }
}