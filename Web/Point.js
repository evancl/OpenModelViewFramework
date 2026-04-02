class Point
{
    constructor()
    {
        // x coordinate.
        this.x = AssemblyData.view.getFloat32(AssemblyData.index, true);
        AssemblyData.index += 4;
        // y coordinate.
        this.y = AssemblyData.view.getFloat32(AssemblyData.index, true);
        AssemblyData.index += 4;
        // z coordinate.
        this.z = AssemblyData.view.getFloat32(AssemblyData.index, true);
        AssemblyData.index += 4;
    }
}
