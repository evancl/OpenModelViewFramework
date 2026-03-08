namespace OpenModelViewFramework;

public class PartProperties
{
    // Bit field that indicates which properties in the part have been updated. Size: 1 byte.
    public byte Properties
    {
        get; set
        {
            if (Properties == 0 || Properties > 15)
                throw new ArgumentOutOfRangeException("PartProperties.Properties must be between 1 and 15 inclusive.");
        }
    }
    // Updated part.
    public Part UpdatedPart;

    internal void GetBinaryRep(List<byte> data)
    {
        UpdatedPart.GetBinaryRep(data, Properties);
    }
}