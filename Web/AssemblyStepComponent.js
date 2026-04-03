class AssemblyStepComponent
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
        const hasTransform = AssemblyData.view.getUint8(AssemblyData.index, true) == 1;
        AssemblyData.index++;
        /*
            Transform data.
            
            Δx, Δy, Δz
        */
        if (!hasTransform)
            this.transform = null;
        else
        {
            this.transform = vec3.create();
            for (let i = 0; i < this.transform.length; i++)
            {
                this.transform[i] = AssemblyData.view.getFloat32(AssemblyData.index, true);
                AssemblyData.index += 4;
            }
        }
    }
}