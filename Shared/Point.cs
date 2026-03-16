using static System.BitConverter;

namespace OpenModelViewFramework;

public class Point
{
    // X coordinate.
    float X
    {
        get
        {
            return X;    
        }
        set
        {
            if (value == float.NegativeInfinity || value == float.PositiveInfinity)
                throw new ArgumentOutOfRangeException("Point.X must be between negative infinity and positive infinity exclusive.");
        }
    }
    // Y coordinate.
    float Y
    {
        get
        {
            return Y;
        }
        set
        {
            if (value == float.NegativeInfinity || value == float.PositiveInfinity)
                throw new ArgumentOutOfRangeException("Point.Y must be between negative infinity and positive infinity exclusive.");
        }
    }
    // Z coordinate.
    float Z
    {
        get
        {
            return Z;
        }
        set
        {
            if (value == float.NegativeInfinity || value == float.PositiveInfinity)
                throw new ArgumentOutOfRangeException("Point.Z must be between negative infinity and positive infinity exclusive.");
        }
    }

    public Point(float[] point)
    {
        X = point[0];
        Y = point[1];
        Z = point[2];
    }
    /*
        Gets the binary representation of the point.

        data: The binary representation.
    */
    internal void GetBinaryRep(List<byte> data)
    {
        data.AddRange(GetBytes(X));
        data.AddRange(GetBytes(Y));
        data.AddRange(GetBytes(Z));
    }
}