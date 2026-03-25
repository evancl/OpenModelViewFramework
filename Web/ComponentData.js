class ComponentData
{
    // View of data.
    static view;
    // Pointer within the data view buffer.
    static index;
    // Component properties.
    properties;
    // Model geometry.
    models;
    /*
        Class constructor.

        body: The body to parse as a component data file.
    */
    constructor(body)
    {
        const data = new Uint8Array(body);
        ComponentData.view = new DataView(data.buffer);
        ComponentData.index = 0;
        const useCompressedFormat = ComponentData.view.getUint8(ComponentData.index, true) == 1;
        ComponentData.index++;
        if (useCompressedFormat)
            this.parseCompressed();
        else
            throw new Error("ComponentData.constructor error: Uncompressed format is unsupported.");
    }
    // Parses a component data file using the compressed format.
    parseCompressed()
    {
        this.properties = null;
        let count = ComponentData.view.getInt16(ComponentData.index, true);
        ComponentData.index += 2;
        if (count == 0)
            this.models = null;
        else
        {
            this.models = new Array(count);
            for (let i = 0; i < this.models.length; i++)
            {
                count = ComponentData.view.getUint32(ComponentData.index, true);
                ComponentData.index += 4;
                this.models[i] = new Float32Array(ComponentData.view.buffer.slice(ComponentData.index, ComponentData.index + count * 72));
                ComponentData.index += count * 72;
            }
        }
    }
}