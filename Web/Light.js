export class Light
{
    /*
        Class constructor.

        ambient: A COLORREF value that represents the ambient light.
        diffuse: A COLORREF value that represents the diffuse light.
        specular: A COLORREF value that represents the specular light.
        diffuseDirection: The normalized diffuse light direction in model space.
        specularPosition: The position of the specular light in view space.
    */
    constructor(ambient, diffuse, specular, diffuseDirection, specularPosition)
    {
        this.ambient = vec3.fromValues(
            (ambient & 0xFF) / 255,
            (ambient >> 8 & 0xFF) / 255,
            (ambient >> 16 & 0xFF) / 255
        );
        this.diffuse = vec3.fromValues(
            (diffuse & 0xFF) / 255,
            (diffuse >> 8 & 0xFF) / 255,
            (diffuse >> 16 & 0xFF) / 255
        );
        this.specular = vec3.fromValues(
            (specular & 0xFF) / 255,
            (specular >> 8 & 0xFF) / 255,
            (specular >> 16 & 0xFF) / 255
        );
        this.diffuseVector = vec3.fromValues(
            diffuseDirection[0],
            diffuseDirection[1],
            diffuseDirection[2]
        );
        this.specularPosition = vec3.fromValues(
            specularPosition[0],
            specularPosition[1],
            specularPosition[2]
        );
    }
}