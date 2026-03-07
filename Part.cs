namespace OpenModelViewLibrary;

public class Part : Component
{
    // Identifier for geometry data. Size: 2 bytes.
    protected override short ID
    {
        get; set
        {
            if (value <= -1 || value > short.MaxValue)
                throw new ArgumentOutOfRangeException($"Part.ID must be between 0 and {short.MaxValue} inclusive.");
        }
    }
    /*
        Color and reflection properties. Size: 4 bytes.

        0: R (0 - 255)
        1: G (0 - 255)
        2: B (0 - 255)
        3: S (0 - 255)
    */
    protected byte[] Properties
    {
        get; set
        {
            if (value == null)
                throw new ArgumentNullException("Part.Properties cannot be null.");
            else if (value.Length != 4)
                throw new ArgumentOutOfRangeException("Part.Properties length must be 4.");
        }
    }
    /*
        Data that transforms this part relative to the global coordinate system. Size: 48 bytes.
            
        r0c0, r0c1, r0c2,
        r1c0, r1c1, r1c2,
        r2c0, r2c1, r2c2,
        Δx, Δy, Δz
    */
    protected float[] Transform
    {
        get; set
        {
            if (value == null)
                throw new ArgumentNullException("Part.Transform cannot be null.");
            else if (value.Length != 12)
                throw new ArgumentOutOfRangeException("Part.Transform length must be equal to 12.");
            for (var i = 0; i < 9; i++)
            {
                if (value[i] < -1 || value[i] > 1)
                    throw new ArgumentOutOfRangeException("Part.Transform rotation elements must be between -1 and 1 inclusive.");
            }
            for (var i = 9; i < value.Length; i++)
            {
                if (value[i] == float.NegativeInfinity || value[i] == float.PositiveInfinity)
                    throw new ArgumentOutOfRangeException("Part.Transform translation elements must be between negative infinity and positive infinity exclusive.");
            }
        }
    }
    /*
        Gets the binary representation of this part.

        data: The binary representation.
    */
    protected override void GetBinaryRep(List<byte> data)
    {
        base.GetBinaryRep(data);
        data.AddRange(Properties);
        for (var i = 0; i < Transform.Length; i++)
            data.AddRange(GetBytes(Transform[i]));
    }
}