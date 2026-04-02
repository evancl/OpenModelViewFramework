class Camera
{
    /*
        Class constructor.

        position: The camera position in model space.
        zoomSensitivity: A floating point value that indicates the zoom sensitivity.
        rotateSensitivity: A floating point value that indicates the rotate sensitivity.
        left: The left bound of the frustum.
        right: The right bound of the frustum.
        bottom: The bottom bound of the frustum.
        top: The top bound of the frustum.
        near: The near bound of the frustum.
        far: The far bound of the frustum.
    */
    constructor(position, zoomSensitivity, rotateSensitivity, left, right, bottom, top, near, far)
    {
        // Camera zoom sensitivity.
        this.zoomSensitivity = zoomSensitivity;
        // Camera rotate sensitivity.
        this.rotateSensitivity = rotateSensitivity;
        // Position in clip space.
        this.position = vec3.fromValues(0, 0, -1);
        // Distance from the origin.
        let radius = vec3.length(position);
        // Phi. Units are in radians.
        this.phi = Math.asin(position[1] / radius);
        let denominator = radius * Math.cos(this.phi);
        // Theta. Units are in radians.
        this.theta = denominator == 0 ? 0 : Math.asin(-position[2] / denominator);
        // Left bound of the frustum.
        this.left = left;
        // Right bound of the frustum.
        this.right = right;
        // Top bound of the frustum.
        this.top = top;
        // Bottom bound of the frustum.
        this.bottom = bottom;
        // Near bound of the frustum.
        this.near = near;
        // Far bound of the frustum.
        this.far = far;
        // Projection matrix.
        this.projection = mat4.create();
        this.projection = mat4.ortho(this.projection, this.left, this.right, this.bottom, this.top, this.near, this.far);
        // View matrix.
        this.view = mat4.create();
        this.view[3] = 0;
        this.view[4] = 0;
        this.view[7] = 0;
        this.view[11] = 0;
        this.view[12] = 0;
        this.view[13] = 0;
        this.view[14] = -radius;
        this.view[15] = 1;
        this.setRotation();
    }
    /*
        Sets the view matrix when rotating.

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
        Sets the frustum bounds when zooming.

        viewer: The model viewer to use.
        event: The scroll event.
    */
    zoomCamera(viewer, event)
    {
        const x = (this.right - this.left) * (event.clientX + document.documentElement.scrollLeft - viewer.left) / viewer.ctx.canvas.width + this.left;
        const y = (this.bottom - this.top) * (event.clientY + document.documentElement.scrollTop - viewer.top) / viewer.ctx.canvas.height + this.top;
        const delta = this.zoomSensitivity * event.deltaY;
        this.left -= delta * (x - this.left);
        this.right += delta * (this.right - x);
        this.top += delta * (this.top - y);
        this.bottom -= delta * (y - this.bottom);
        this.projection = mat4.ortho(this.projection, this.left, this.right, this.bottom, this.top, this.near, this.far);
    }
    /*
        Sets the rotation part of the view matrix. Assignment is column based.

        -sin(θ), 0, -cos(θ)
        -cos(θ) * sin(φ), cos(φ), sin(θ) * sin(φ)
        cos(θ) * cos(φ), sin(φ), -sin(θ) * cos(φ)
    */
    setRotation()
    {
        this.view[0] = -Math.sin(this.theta);
        this.view[1] = -Math.cos(this.theta) * Math.sin(this.phi);
        this.view[2] = Math.cos(this.theta) * Math.cos(this.phi);
        this.view[5] = Math.cos(this.phi);
        this.view[6] = Math.sin(this.phi);
        this.view[8] = -Math.cos(this.theta);
        this.view[9] = Math.sin(this.theta) * Math.sin(this.phi);
        this.view[10] = -Math.sin(this.theta) * Math.cos(this.phi);
    }
}
