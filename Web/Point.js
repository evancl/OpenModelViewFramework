import { AssemblyData } from "./AssemblyData.js";

export class Point
{
    constructor()
    {
        // X coordinate.
        this.x = AssemblyData.view.getFloat32(AssemblyData.index, true);
        AssemblyData.index += 4;
        // Y coordinate.
        this.y = AssemblyData.view.getFloat32(AssemblyData.index, true);
        AssemblyData.index += 4;
        // Z coordinate.
        this.z = AssemblyData.view.getFloat32(AssemblyData.index, true);
        AssemblyData.index += 4;
    }
}