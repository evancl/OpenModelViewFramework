class AssemblyStep
{
    constructor()
    {
        const length = AssemblyData.view.getUint8(AssemblyData.index, true);
        AssemblyData.index++;
        const nameData = new Int8Array(AssemblyData.view.buffer, AssemblyData.index, length);
        AssemblyData.index += length;
        const decoder = new TextDecoder();
        // Assembly step name.
        this.name = decoder.decode(nameData);
        let count = AssemblyData.view.getInt16(AssemblyData.index, true);
        AssemblyData.index += 2;
        // Explode line list.
        if (count == 0)
            this.lines = null;
        else
        {
            this.lines = new Array(count);
            for (let i = 0; i < this.lines.length; i++)
                this.lines[i] = new Line();
        }
        // Components in the assembly step.
        this.components = new Array(AssemblyData.view.getInt16(AssemblyData.index, true));
        AssemblyData.index += 2;
        for (let i = 0; i < this.components.length; i++)
            this.components[i] = new AssemblyStepComponent();
    }
    /*
        Updates the line geometry after zooming.

        viewer: The model viewer to use.
    */
    updateLines(viewer)
    {
        if (this.lines == null)
            return;
        for (let i = 0; i < this.lines.length; i++)
            this.lines[i].createLine(viewer);
    }
}