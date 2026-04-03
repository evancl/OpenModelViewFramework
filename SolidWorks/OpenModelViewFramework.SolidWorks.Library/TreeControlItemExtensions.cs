using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swconst;
using OpenModelViewFramework.Library;

namespace OpenModelViewFramework.SolidWorks.Library;

public static class TreeContolItemExtensions
{
    /*
        Gets the assembly components in this tree control item.

        parent: The tree control item to use.
        document: The document to use.
        isExploded: Indicates if the model is in an exploded state.
    */
    public static List<AssemblyStepComponent> GetAssemblyComponents(this TreeControlItem parent, ModelDoc2 document, bool isExploded)
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
                var explodedTransform = (MathTransform)component.GetSpecificTransform(false);
                var explodedData = (double[])explodedTransform.ArrayData;
                var collapsedTransform = (MathTransform)component.GetSpecificTransform(true);
                var collapsedData = (double[])collapsedTransform.ArrayData;
                translation =
                [
                    (float)(explodedData[9] - collapsedData[9]),
                    (float)(explodedData[10] - collapsedData[10]),
                    (float)(explodedData[11] - collapsedData[11])
                ];
            }
            else
                translation = null;
            components.Add(new AssemblyStepComponent(component.GetName(document), translation));
            item = item.GetNext();
        }
        return components;
    }
    /*
        Gets the tree control item with the given name.

        parent: The tree control item to use.
        name: The tree control item name.
    */
    public static TreeControlItem GetItem(this TreeControlItem parent, string name)
    {
        if (parent.Text == name)
            return parent;
        var child = parent.GetFirstChild();
        if (child == null)
            return null;
        while (child != null)
        {
            var result = child.GetItem(name);
            if (result != null)
                return result;
            child = child.GetNext();
        }
        return null;
    }
}