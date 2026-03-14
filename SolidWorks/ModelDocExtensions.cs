namespace OpenModelViewFramework;

public static class ModelDoc2
{
    public static List<Line> GetExplodeLines(this ModelDoc2 document, string name)
    {
        var isSelected = document.Extension.SelectByID2(
            $"{name} Routes",
            "SKETCH",
            0,
            0,
            0,
            true,
            -1,
            null,
            (int)swSelectOption_e.swSelectOptionDefault
        );
        if (!isSelected)
            throw new Exception($"ModelDoc2.GetExplodeLines error: Failed to select {name} Routes in {document.GetPathName()}.");
        var feature = (Feature)document.SelectionManager.GetSelectedObject6(1, -1);
        document.ClearSelection2(true);
        var sketch = (Sketch)feature.GetSpecificFeature2();
        var segments = (object[])sketch.GetSketchSegments();
        Line[] lines = new(segments.Length);
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
            lines[i] = new Line(new Point(start), new Point(end)));
        }
        return lines;
    }
}