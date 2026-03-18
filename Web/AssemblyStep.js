import { AssemblyData } from "./AssemblyData.js";
import { AssemblyStepComponent } from "./AssemblyStepComponent.js";
import { Line } from "./Line.js";

export class AssemblyStep
{
    constructor(lineStyle, lineThickness)
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
                this.lines[i] = new Line(lineStyle, lineThickness);
        }
        // Components in the assembly step.
        this.components = new Array(AssemblyData.view.getInt16(AssemblyData.index, true));
        AssemblyData.index += 2;
        for (let i = 0; i < this.components.length; i++)
            this.components[i] = new AssemblyStepComponent();
    }
}