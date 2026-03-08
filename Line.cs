namespace OpenModelViewFramework;

class Line
{
	// Explode line start point.
	Point Start;
	// Explode line end point.
	Point End;
	/*
        Gets the binary representation of the line.

        data: The binary representation.
    */
    void GetBinaryRep(List<byte> data)
    {
        Start.GetBinaryRep(data);
        End.GetBinaryRep(data);
    }
}