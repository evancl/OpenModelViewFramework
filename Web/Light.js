class Light
{
    /*
        Class constructor.

        diffuseDirection: The normalized diffuse light direction in clip space.
        specularPosition: The position of the specular light in clip space.
        ambient: A COLORREF value that represents the ambient light.
        diffuse: A COLORREF value that represents the diffuse light.
        specular: A COLORREF value that represents the specular light.
    */
    constructor(diffuseDirection, specularPosition, ambient, diffuse, specular)
    {
        // Ambient light color.
        this.ambient = vec3.fromValues(
            (ambient & 0xFF) / 255,
            (ambient >> 8 & 0xFF) / 255,
            (ambient >> 16 & 0xFF) / 255
        );
        // Diffuse light color.
        this.diffuse = vec3.fromValues(
            (diffuse & 0xFF) / 255,
            (diffuse >> 8 & 0xFF) / 255,
            (diffuse >> 16 & 0xFF) / 255
        );
        // Specular light color.
        this.specular = vec3.fromValues(
            (specular & 0xFF) / 255,
            (specular >> 8 & 0xFF) / 255,
            (specular >> 16 & 0xFF) / 255
        );
        // Diffuse light direction.
        this.diffuseVector = vec3.clone(diffuseDirection);
        // Specular light position.
        this.specularPosition = vec3.clone(specularPosition);
    }
}
