namespace OpenModelViewFramework.Library;

public class ComponentProperties
{
    byte _Properties;
    // Bit field that indicates which properties in the component have been updated.
    byte Properties
    {
        get
        {
            return _Properties;    
        }
        set
        {
            if (value == 0 || value > 15)
                throw new ArgumentOutOfRangeException("ComponentProperties.Properties must be between 1 and 15 inclusive.");
            _Properties = value;
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
