using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swconst;

namespace OpenModelViewFramework.SolidWorks.Library;

public static class FeatureManagerExtensions
{
    /*
        Gets the folders in the feature tree.

        manager: The feature manager to use.
    */
    public static List<TreeControlItem> GetFolders(this FeatureManager manager)
    {
        List<TreeControlItem> folders = new();
        var item = manager.GetFeatureTreeRootItem2((int)swFeatMgrPane_e.swFeatMgrPaneTop);
        while (item != null)
        {
            if (item.ObjectType != (int)swTreeControlItemType_e.swFeatureManagerItem_Feature)
            {
                item = item.GetNext();
                continue;
            }
            var feature = (Feature)item.Object;
            if (feature.GetTypeName2() != "FtrFolder")
            {
                item = item.GetNext();
                continue;
            }
            folders.Add(item);
            item = item.GetNext();
        }
        return folders;
    }
}