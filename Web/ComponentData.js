export class ComponentData
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
        if (!useCompressedFormat)
            throw new Error("ComponentData.constructor error: Uncompressed format is unsupported.");
        ComponentData.index++;
        this.parseCompressed();
    }
    // Parses a component data file using the compressed format.
    parseCompressed()
    {
        this.properties = null;
        const count = ComponentData.view.getInt16(ComponentData.index, true);
        index += 2;
        if (count == 0)
            this.models = null;
        else
        {
            this.models = new Array(count);
            for (let i = 0; i < this.models.length; i++)
            {
                const size = ComponentData.view.getInt32(ComponentData.index, true);
                ComponentData.index += 4;
                this.models[id] = new Float32Array(ComponentData.view.buffer.slice(ComponentData.index, ComponentData.index + size));
                ComponentData.index += size;
            }
        }
    }
}