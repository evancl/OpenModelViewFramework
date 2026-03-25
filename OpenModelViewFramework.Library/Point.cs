using static System.BitConverter;

namespace OpenModelViewFramework.Library;

public class Point
{
    float _X;
    float _Y;
    float _Z;
    // X coordinate.
    float X
    {
        get
        {
            return _X;    
        }
        set
        {
            if (value == float.NegativeInfinity || value == float.PositiveInfinity)
                throw new ArgumentOutOfRangeException("Point.X must be between negative infinity and positive infinity exclusive.");
            _X = value;
        }
    }
    // Y coordinate.
    float Y
    {
        get
        {
            return _Y;
        }
        set
        {
            if (value == float.NegativeInfinity || value == float.PositiveInfinity)
                throw new ArgumentOutOfRangeException("Point.Y must be between negative infinity and positive infinity exclusive.");
            _Y = value;
        }
    }
    // Z coordinate.
    float Z
    {
        get
        {
            return _Z;
        }
        set
        {
            if (value == float.NegativeInfinity || value == float.PositiveInfinity)
                throw new ArgumentOutOfRangeException("Point.Z must be between negative infinity and positive infinity exclusive.");
            _Z = value;
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