using System.Text.Json;
using System.Text.Json.Serialization;

namespace OpenModelViewFramework.Library;

public class Line
{
    Point _Start;
    Point _End;
    // Explode line start point.
    public Point Start
    {
        get
        {
            return _Start;
        }
        set
        {
            if (value == null)
                throw new ArgumentNullException("Line.Start cannot be null.");
            _Start = value;
        }
    }
    // Explode line end point.
    public Point End
    {
        get
        {
            return _End;
        }
        set
        {
            if (value == null)
                throw new ArgumentNullException("Line.End cannot be null.");
            _End = value;
        }
    }

    internal Line(byte[] data, ref int index)
    {
        Start = new Point(data, ref index);
        End = new Point(data, ref index);
    }

    [JsonConstructor]
    public Line(Point start, Point end)
    {
        Start = start;
        End = end;
    }
    /*
        Gets the binary representation of the line.

        data: The binary representation.
    */
    internal void GetBinaryRep(List<byte> data)
    {
        Start.GetBinaryRep(data);
        End.GetBinaryRep(data);
    }
}