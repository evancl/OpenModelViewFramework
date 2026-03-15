export class Camera
{
    /*
        Class constructor.

        zoomSensitivity: A floating point value that indicates the zoom sensitivity.
        rotateSensitivity: A floating point value that indicates the rotate sensitivity.
        nearPlane: The near plane.
        maximumRadius: The maximum distance of model geometry from the model origin.
        position: The initial camera position.
    */
    constructor(zoomSensitivity, rotateSensitivity, nearPlane, maximumRadius, position)
    {
        // Camera zoom sensitivity.
        this.zoomSensitivity = zoomSensitivity;
        // Camera rotate sensitivity.
        this.rotateSensitivity = rotateSensitivity;
        // Position in view space.
        this.position = vec3.fromValues(0, 0, -1);
        const props = document.querySelector("#model-viewer").getBoundingClientRect();
        // Aspect ratio.
        this.aspectRatio = props.width / props.height;
        // Near plane distance.
        this.nearPlane = nearPlane;
        // Maximum distance of model geometry from the model origin.
        this.maximumRadius = maximumRadius;
        // Distance from the origin.
        let radius = vec3.length(position);
        // Phi. Units are in radians.
        this.phi = Math.asin(position[1] / radius);
        let denominator = radius * Math.cos(this.phi);
        // Theta. Units are in radians.
        this.theta = denominator == 0 ? 0 : Math.asin(-position[2] / denominator);
        this.transform = mat4.create();
        this.transform[3] = 0;
        this.transform[4] = 0;
        this.transform[7] = 0;
        this.transform[11] = 0;
        this.transform[12] = 0;
        this.transform[13] = 0;
        this.transform[14] = 0;
        this.transform[15] = this.maximumRadius + this.nearPlane;
        this.setRotation();
    }
    /*
        Sets the transform when rotating.

        deltaX: The change in the cursor's x position.
        deltaY: The change in the cursor's y position.
    */
    rotateCamera(deltaX, deltaY)
    {
        this.theta -= deltaX * this.rotateSensitivity;
        if (Math.abs(this.theta) > 2 * Math.PI)
        {
            let multiple = Math.floor(Math.abs(this.theta) / (2 * Math.PI));
            if (this.theta < 0)
                multiple *= -1;
            this.theta -= multiple * 2 * Math.PI;
        }
        this.phi -= deltaY * this.rotateSensitivity;
        if (Math.abs(this.phi) > 2 * Math.PI)
        {
            let multiple = Math.floor(Math.abs(this.phi) / (2 * Math.PI));
            if (this.phi < 0)
                multiple *= -1;
            this.phi -= multiple * 2 * Math.PI;
        }
        this.setRotation();
    }
    /*
        Sets the scale when zooming.

        deltaY: The change in depth.
    */
    zoomCamera(deltaY)
    {
        const scale = this.transform[15] - deltaY * this.zoomSensitivity;
        if (scale < this.maximumRadius + this.nearPlane)
            this.transform[15] = this.maximumRadius + this.nearPlane;
        else
            this.transform[15] = scale;
    }
    /*
        Sets the rotation part of the transform. Assignment is column based.

        -sin(θ), 0, -cos(θ)
        -cos(θ) * sin(φ), cos(φ), sin(θ) * sin(φ)
        -cos(θ) * cos(φ), -sin(φ), sin(θ) * cos(φ)
    */
    setRotation()
    {
        this.transform[0] = -Math.sin(this.theta);
        this.transform[1] = -Math.cos(this.theta) * Math.sin(this.phi);
        this.transform[2] = -Math.cos(this.theta) * Math.cos(this.phi);
        this.transform[5] = Math.cos(this.phi);
        this.transform[6] = -Math.sin(this.phi);
        this.transform[8] = -Math.cos(this.theta);
        this.transform[9] = Math.sin(this.theta) * Math.sin(this.phi);
        this.transform[10] = Math.sin(this.theta) * Math.cos(this.phi);
    }
}