namespace OpenModelViewFramework.Library;

public class Line
{
    // Explode line start point.
    Point Start;
    // Explode line end point.
    Point End;

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