import * from "AssemblyData.js";

export class AssemblyStepComponent
{
    constructor()
    {
        const length = AssemblyData.view.getUint8(AssemblyData.index, true);
        AssemblyData.index++;
        const nameData = new Int8Array(AssemblyData.view.buffer, AssemblyData.index, length);
        AssemblyData.index += length;
        const decoder = new TextDecoder();
        // Name of the component
        this.name = decoder.decode(nameData);
        const hasTransform = AssemblyData.view.getUint8(AssemblyData.index, true);
        AssemblyData.index++;
        /*
            Transform data.
            
            Δx, Δy, Δz
        */
        if (hasTransform == 0)
            this.transform = null;
        else
        {
            this.transform = new Array(3);
            for (let i = 0; i < 3; i++)
            {
                this.transform[i] = AssemblyData.view.getFloat32(AssemblyData.index, true);
                AssemblyData.index += 4;
            }
        }
    }
}