export class ComponentData
{
    // Component properties.
    properties;
    // Model geometry.
    models;
    /*
        Class constructor.

        body: The body to parse as a component data file.
        useCompressedFormat: Indicates if the compressed format should be used.
    */
    constructor(body, useCompressedFormat)
    {
        if (useCompressedFormat)
            this.parseCompressed(body);
        else
            throw new Error("ComponentData.constructor error: Unsupported option.");
    }
    /*
        Parses a component data file using the compressed format.

        body: The body to parse as a component data file.
    */
    parseCompressed(body)
    {
        const data = new Uint8Array(body);
        const view = new DataView(data.buffer);
        let index = 0;
        let count = view.getInt16(index, true);
        index += 2;
        if (count != 0)
            throw new Error("ComponentData.parseCompressed error: Unexpected number of components.");
        count = view.getInt16(index, true);
        this.properties = null;
        if (count == 0)
            this.models = null;
        else
        {
            this.models = new Array(count);
            for (let i = 0; i < this.models.length; i++)
            {
                const size = view.getInt32(index, true);
                index += 4;
                this.models[id] = new Float32Array(data.buffer.slice(index, index + size));
                index += size;
            }
        }
    }
}