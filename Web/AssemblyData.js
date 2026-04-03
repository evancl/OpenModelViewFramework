class AssemblyData
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
        // Explode line style.
        this.lineStyle = AssemblyData.view.getUint8(AssemblyData.index, true);
        AssemblyData.index++;
        // Explode line length.
        this.lineLength = AssemblyData.view.getUint8(AssemblyData.index, true);
        AssemblyData.index++;
        // Explode line thickness.
        this.lineThickness = AssemblyData.view.getUint8(AssemblyData.index, true);
        AssemblyData.index++;
        /*
            Explode line color and reflection properties.
            
            0: R (0 - 1)
            1: G (0 - 1)
            2: B (0 - 1)
            3: S (0 - 1)
        */
        this.properties = vec4.create();
        for (let i = 0; i < this.properties.length; i++)
        {
            this.properties[i] = AssemblyData.view.getUint8(AssemblyData.index, true) / 255;
            AssemblyData.index++;
        }
        // Assembly steps.
        this.steps = new Array(AssemblyData.view.getUint8(AssemblyData.index, true));
        AssemblyData.index++;
        // Line segment that contains the base geometry.
        this.lineSegment = new LineSegment(36);
        for (let i = 0; i < this.steps.length; i++)
            this.steps[i] = new AssemblyStep();
    }
}