using System.Text.Json;
using System.Text.Json.Serialization;
using static System.BitConverter;

namespace OpenModelViewFramework.Library;

public class Point
{
    double _X;
    double _Y;
    double _Z;
    // X coordinate.
    public double X
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
    public double Y
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
    public double Z
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

    internal Point(byte[] data, ref int index)
    {
        X = ToSingle(data, index);
        index += 4;
        Y = ToSingle(data, index);
        index += 4;
        Z = ToSingle(data, index);
        index += 4;
    }

    public Point(float[] point)
    {
        X = point[0];
        Y = point[1];
        Z = point[2];
    }

    [JsonConstructor]
    public Point(double x, double y, double z)
    {
        X = x;
        Y = y;
        Z = z;
    }
    /*
        Gets the binary representation of the point.

        data: The binary representation.
    */
    internal void GetBinaryRep(List<byte> data)
    {
        data.AddRange(GetBytes((float)X));
        data.AddRange(GetBytes((float)Y));
        data.AddRange(GetBytes((float)Z));
    }
}