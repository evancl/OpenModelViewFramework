namespace OpenModelViewFramework;

public static class TreeContolItemExtensions
{
    public static List<AssemblyStepComponent> GetAssemblyComponents(this TreeContolItem parent, ModelDoc2 document, bool isExploded)
    {
        List<AssemblyStepComponent> components = new();
        var item = parent.GetFirstChild();
        while (item != null)
        {
            if (item.ObjectType != (int)swTreeControlItemType_e.swFeatureManagerItem_Component)
            {
                item = item.GetNext();
                continue;
            }
            var component = (Component2)item.Object;
            float[] translation;
            if (isExploded)
            {
                var transform = (MathTransform)component.GetSpecificTransform(false);
                var data = (double[])transform.ArrayData;
                translation =
                [
                    (float)data[9],
                    (float)data[10],
                    (float)data[11]
                ];
            }
            else
                translation = null;
            components.Add(new AssemblyStepComponent(component.GetName(document), translation));
            item = item.GetNext();
        }
        return components;
    }
}