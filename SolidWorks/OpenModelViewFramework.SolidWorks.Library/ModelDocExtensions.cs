using SolidWorks.Interop.sldworks;
using SolidWorks.Interop.swconst;
using OpenModelViewFramework.Library;

namespace OpenModelViewFramework.SolidWorks.Library;

public static class ModelDoc2Extensions
{
    /*
        Gets the explode lines in the sketch specified by name.

        document: The document to use.
        name: The sketch name before "Routes". This should match the feature folder name.
    */
    public static Line[] GetExplodeLines(this ModelDoc2 document, string name)
    {
        name = $"{name} Routes";
        var item = document.FeatureManager.GetItem(swFeatMgrPane_e.swFeatMgrPaneBottom, name);
        if (item == null)
            return null;
        var feature = (Feature)item.Object;
        var sketch = (Sketch)feature.GetSpecificFeature2();
        var segments = (object[])sketch.GetSketchSegments();
        var lines = new Line[segments.Length];
        for (var i = 0; i < lines.Length; i++)
        {
            var route = (SketchLine)segments[i];
            var startPoint = (SketchPoint)route.GetStartPoint2();
            var endPoint = (SketchPoint)route.GetEndPoint2();
            float[] start =
            {
                (float)startPoint.X,
                (float)startPoint.Y,
                (float)startPoint.Z
            };
            float[] end =
            {
                (float)endPoint.X,
                (float)endPoint.Y,
                (float)endPoint.Z
            };
            lines[i] = new Line(new Point(start), new Point(end));
        }
        return lines;
    }
}