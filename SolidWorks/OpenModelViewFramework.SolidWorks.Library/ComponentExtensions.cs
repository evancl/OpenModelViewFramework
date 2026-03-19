using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swconst;

namespace OpenModelViewFramework.SolidWorks.Library;

public static class ComponentExtensions
{
    /*
        Gets the component name.

        component: The component to use.
        document: The parent document.
    */
    public static string GetName(this Component2 component, ModelDoc2 document)
    {
        var isSelected = document.Extension.SelectByID2(
            component.GetSelectByIDString(),
            "COMPONENT",
            0,
            0,
            0,
            true,
            -1,
            null,
            (int)swSelectOption_e.swSelectOptionDefault
        );
        if (!isSelected)
            throw new Exception($"Component2.GetName error: Failed to select {component.Name2} in {document.GetPathName()}.");
        var name = component.Name2;
        document.ClearSelection2(true);
        return name;
    }
}