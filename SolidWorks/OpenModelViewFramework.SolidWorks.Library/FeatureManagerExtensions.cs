using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swconst;

namespace OpenModelViewFramework.SolidWorks.Library;

public static class FeatureManagerExtensions
{
    /*
        Gets the root level folders in the feature tree.

        manager: The feature manager to use.
        location: The feature manager pane to use.
    */
    public static List<TreeControlItem> GetRootFolders(this FeatureManager manager, swFeatMgrPane_e location)
    {
        List<TreeControlItem> folders = new();
        var item = manager.GetFeatureTreeRootItem2((int)location).GetFirstChild();
        while (item != null)
        {
            if (item.ObjectType == (int)swTreeControlItemType_e.swFeatureManagerItem_Feature)
            {
                var feature = (Feature)item.Object;
                if (feature.GetTypeName2() == "FtrFolder")
                    folders.Add(item);
            }
            item = item.GetNext();
        }
        return folders;
    }
    /*
        Gets the tree control item with the given name in the feature tree.

        manager: The feature manager to use.
        location: The feature manager pane to use.
        name: The tree control item name.
    */
    public static TreeControlItem GetItem(this FeatureManager manager, swFeatMgrPane_e location, string name)
    {
        var root = manager.GetFeatureTreeRootItem2((int)location);
        return root.GetItem(name);
    }
}