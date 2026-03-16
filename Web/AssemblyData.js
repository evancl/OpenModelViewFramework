import * from "AssemblyStep.js";

export class AssemblyData
{
    // View of data.
    static view;
    // Pointer within the data view buffer.
    static index;
    /*
        Class constructor.

        body: The body to parse as an assembly data file.
    */
    constructor(body)
    {
        const data = new Uint8Array(body);
        AssemblyData.view = new DataView(data.buffer);
        AssemblyData.index = 0;
        // Assembly steps.
        this.steps = new Array(AssemblyData.view.getInt16(AssemblyData.index, true));
        AssemblyData.index += 2;
        for (let i = 0; i < this.steps.length; i++)
            this.steps[i] = new AssemblyStep();
    }
}