namespace OpenModelViewFramework;

public class ComponentProperties
{
    // Bit field that indicates which properties in the component have been updated. Size: 1 byte.
    byte Properties
    {
        get
        {
            return Properties;    
        }
        set
        {
            if (Properties == 0 || Properties > 15)
                throw new ArgumentOutOfRangeException("ComponentProperties.Properties must be between 1 and 15 inclusive.");
        }
    }
    // Updated component.
    Component UpdatedComponent;

    public ComponentProperties(byte properties, Component component)
    {
        Properties = properties;
        UpdatedComponent = component;
    }
    /*
        Gets the binary representation of the component properties instance.

        data: The binary representation.
    */
    internal void GetBinaryRep(List<byte> data)
    {
        UpdatedComponent.GetBinaryRep(data, Properties);
    }
}