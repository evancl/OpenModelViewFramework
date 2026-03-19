using SolidWorks.Interop.sldworks;

namespace OpenModelViewFramework.SolidWorks.Library;

public static class MathTransformExtensions
{
    /*
        Gets the adjoint of the transform as an array of floats.

        transform: The transform to use.
    */
	public static float[] GetAdjoint(this MathTransform transform)
	{
		var arrayData = (double[])transform.ArrayData;
		var data = new float[12];
		for (var i = 0; i < 12; i++)
			data[i] = (float)arrayData[i];
		var temp = data[3];
        data[3] = data[1];
        data[1] = temp;
        temp = data[6];
        data[6] = data[2];
        data[2] = temp;
        temp = data[7];
        data[7] = data[5];
        data[5] = temp;
		return data;
	}
}