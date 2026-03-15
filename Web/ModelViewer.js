import * from "LinkedList.js";

export class ModelViewer
{
    /*
        Class constructor.

        root: The top level component.
        models: The array of part data.
        camera: The camera to use.
        light: The light to use.
    */
    constructor(root, models, camera, light)
    {
        this.root = root;
        this.models = models;
        this.camera = camera;
        this.light = light;
        this.hiddenComponents = new LinkedList();
        this.visibleComponents = new LinkedList();
        const viewer = document.querySelector("#model-viewer");
        var self = this;
        viewer.addEventListener("wheel", (event) => { self.onZoom(self, event); });
        viewer.addEventListener("mousemove", (event) => { self.onRotate(self, event); });
        viewer.addEventListener("mousedown", (event) => { self.onStartRotate(self, event); });
        viewer.addEventListener("mouseup", (event) => { self.onStopRotate(self); });
        this.isRotating = false;
        this.cursorX = 0.0;
        this.cursorY = 0.0;
        this.ctx = viewer.getContext("webgl2", { antialias: true });
        if (this.ctx === null)
            throw new Error("ModelViewer.constructor error: Failed to initialize viewer.");
        const props = viewer.getBoundingClientRect();
        this.ctx.canvas.width = props.width;
        this.ctx.canvas.height = props.height;
        this.ctx.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.clearColor(0, 0, 0, 0);
        this.ctx.enable(this.ctx.DEPTH_TEST);
        this.ctx.depthFunc(this.ctx.LEQUAL);
        this.shaderProgram = this.#configureShaders();
        this.ctx.useProgram(this.shaderProgram);
        this.vertexNormal = this.ctx.getAttribLocation(this.shaderProgram, "vertexNormal");
        this.vertexPosition = this.ctx.getAttribLocation(this.shaderProgram, "vertexPosition");
        this.cameraPosition = this.ctx.getUniformLocation(this.shaderProgram, "cameraPosition");
        this.ambientLight = this.ctx.getUniformLocation(this.shaderProgram, "ambientLight");
        this.diffuseLightColor = this.ctx.getUniformLocation(this.shaderProgram, "diffuseLightColor");
        this.diffuseLightVector = this.ctx.getUniformLocation(this.shaderProgram, "diffuseLightVector");
        this.specularLightColor = this.ctx.getUniformLocation(this.shaderProgram, "specularLightColor");
        this.specularLightPosition = this.ctx.getUniformLocation(this.shaderProgram, "specularLightPosition");
        this.model = this.ctx.getUniformLocation(this.shaderProgram, "modelMatrix");
        this.view = this.ctx.getUniformLocation(this.shaderProgram, "viewMatrix");
        this.properties = this.ctx.getUniformLocation(this.shaderProgram, "properties");
        this.ctx.uniform3fv(this.cameraPosition, this.camera.position);
        this.ctx.uniform3fv(this.ambientLight, this.light.ambient);
        this.ctx.uniform3fv(this.diffuseLightColor, this.light.diffuse);
        this.ctx.uniform3fv(this.diffuseLightVector, this.light.diffuseVector);
        this.ctx.uniform3fv(this.specularLightColor, this.light.specular);
        this.ctx.uniform3fv(this.specularLightPosition, this.light.specularPosition);
        this.ctx.uniformMatrix4fv(this.view, false, this.camera.transform);
        this.createBuffers(this.root, false);
        this.needsRebuild = false;
        this.render();
        let node = this.hiddenComponents.head;
        while (node != null)
        {
            node.value.vertexBuffer = this.ctx.createBuffer();
            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, node.value.vertexBuffer);
            this.ctx.bufferData(
                this.ctx.ARRAY_BUFFER,
                new Float32Array(this.models[node.value.id]),
                this.ctx.STATIC_DRAW
            );
            this.ctx.bindVertexArray(node.value.vertexArray);
            // Normal attribute.
            this.ctx.vertexAttribPointer(
                this.vertexNormal,
                3,
                this.ctx.FLOAT,
                false,
                24,
                0
            );
            this.ctx.enableVertexAttribArray(this.vertexNormal);
            // Position attribute.
            this.ctx.vertexAttribPointer(
                this.vertexPosition,
                3,
                this.ctx.FLOAT,
                false,
                24,
                12
            );
            this.ctx.enableVertexAttribArray(this.vertexPosition);
            node = node.next;
        }
    }
    // Vertex shader source code.
    static vertexShaderSource =
    `
        attribute vec3 vertexPosition;
        attribute vec3 vertexNormal;
        uniform mat4 modelMatrix;
        uniform mat4 viewMatrix;
        uniform vec3 cameraPosition;
        uniform vec3 ambientLight;
        uniform vec3 diffuseLightColor;
        uniform vec3 diffuseLightVector;
        uniform vec3 specularLightColor;
        uniform vec3 specularLightPosition;
        uniform vec4 properties;
        varying vec3 specularLight;
        varying vec3 light;

        void main()
        {
            gl_Position = viewMatrix * modelMatrix * vec4(vertexPosition, 1.0);
            vec3 viewNormal = vec3(viewMatrix * modelMatrix * vec4(vertexNormal, 0.0));
            vec3 diffuseLight = diffuseLightColor * max(dot(viewNormal, diffuseLightVector), 0.0);
            vec3 v0 = normalize(specularLightPosition - gl_Position.xyz);
            vec3 v1 = normalize(cameraPosition - gl_Position.xyz);
            vec3 v2 = normalize(v0 + v1);
            specularLight = specularLightColor * pow(max(dot(viewNormal, v2), 0.0), 6.0);
            light = min(ambientLight + diffuseLight + (1.0 - properties.a) * specularLight, 1.0);
        }
    `;
    // Fragment shader source code.
    static fragmentShaderSource =
    `
        precision highp float;
        varying vec3 specularLight;
        varying vec3 light;
        uniform vec4 properties;

        void main()
        {
            vec3 colorVector = min(properties.rgb * light + properties.a * specularLight, 1.0);
            gl_FragColor = vec4(colorVector, 1.0);
        }
    `;
    /*
        Create a buffer for the specified component and every child component that has a model. Components are added to
        the model viewer's hidden and visible component lists.

        component: The component to use.
        isParentHidden: Indicates if the parent component is hidden.
    */
    createBuffers(component, isParentHidden)
    {
        const isHidden = component.isHidden || isParentHidden;
        if (component.id == -1)
        {
            for (let i = 0; i < component.children.length; i++)
                this.createBuffers(component.children[i], isHidden);
        }
        else
        {
            component.vertexArray = this.ctx.createVertexArray();
            if (isHidden)
            {
                this.hiddenComponents.add(component);
                return;
            }
            this.ctx.bindVertexArray(component.vertexArray);
            component.vertexBuffer = this.ctx.createBuffer();
            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, component.vertexBuffer);
            this.ctx.bufferData(
                this.ctx.ARRAY_BUFFER,
                this.models[component.id],
                this.ctx.STATIC_DRAW
            );
            // Normal attribute.
            this.ctx.vertexAttribPointer(
                this.vertexNormal,
                3,
                this.ctx.FLOAT,
                false,
                24,
                0
            );
            this.ctx.enableVertexAttribArray(this.vertexNormal);
            // Position attribute.
            this.ctx.vertexAttribPointer(
                this.vertexPosition,
                3,
                this.ctx.FLOAT,
                false,
                24,
                12
            );
            this.ctx.enableVertexAttribArray(this.vertexPosition);
            this.visibleComponents.add(component);
        }
    }
    // Configures the shaders.
    configureShaders()
    {
        const vertexShader = this.loadShader(this.ctx.VERTEX_SHADER, ModelViewer.vertexShaderSource);
        if (!this.ctx.getShaderParameter(vertexShader, this.ctx.COMPILE_STATUS))
        {
            const message = `ModelViewer.linkShaders error: Failed to load shader. Log: ${this.ctx.getShaderInfoLog(vertexShader)}`;
            this.ctx.deleteShader(vertexShader);
            throw new Error(message);
        }
        const fragmentShader = this.loadShader(this.ctx.FRAGMENT_SHADER, ModelViewer.fragmentShaderSource);
        if (!this.ctx.getShaderParameter(fragmentShader, this.ctx.COMPILE_STATUS))
        {
            const message = `ModelViewer.linkShaders error: Failed to load shader. Log: ${this.ctx.getShaderInfoLog(fragmentShader)}`;
            this.ctx.deleteShader(vertexShader);
            this.ctx.deleteShader(fragmentShader);
            throw new Error(message);
        }
        const shaderProgram = this.ctx.createProgram();
        this.ctx.attachShader(shaderProgram, vertexShader);
        this.ctx.attachShader(shaderProgram, fragmentShader);
        this.ctx.linkProgram(shaderProgram);
        // The shaders are no longer needed after linking.
        this.ctx.deleteShader(vertexShader);
        this.ctx.deleteShader(fragmentShader);
        if (!this.ctx.getProgramParameter(shaderProgram, this.ctx.LINK_STATUS))
            throw new Error(`ModelViewer.linkShaders error: Failed to initialize shader program. Log: ${this.ctx.getProgramInfoLog(shaderProgram)}`);
        return shaderProgram;
    }
    /*
        Loads the shader.

        type: The type of shader to load.
        source: The shader source.
    */
    loadShader(type, source)
    {
        const shader = this.ctx.createShader(type);
        this.ctx.shaderSource(shader, source);
        this.ctx.compileShader(shader);
        return shader;
    }
    /*
        Rotate event handler.

        self: The this pointer.
        event: The rotate event.
    */
    onRotate(self, event)
    {
        event.preventDefault();
        if (!self.isRotating)
            return;
        const deltaX = event.clientX - self.cursorX;
        const deltaY = self.cursorY - event.clientY;
        self.cursorX = event.clientX;
        self.cursorY = event.clientY;
        self.camera.rotateCamera(deltaX, deltaY);
        self.ctx.uniformMatrix4fv(
            self.view,
            false,
            self.camera.transform
        );
        self.render();
    }
    /*
        Start rotate event handler.

        self: The this pointer.
        event: The start rotate event.
    */
    onStartRotate(self, event)
    {
        self.cursorX = event.clientX;
        self.cursorY = event.clientY;
        self.isRotating = true;
    }
    /*
        Stop rotate event handler.

        self: The this pointer.
    */
    onStopRotate(self)
    {
        self.isRotating = false;
    }
    /*
        Zoom event handler.

        self: The this pointer.
        event: The zoom event.
    */
    onZoom(self, event)
    {
        event.preventDefault();
        self.camera.zoomCamera(event.deltaY);
        self.ctx.uniformMatrix4fv(
            self.view,
            false,
            self.camera.transform
        );
        self.render();
    }
    // Renders the model.
    render()
    {
        this.ctx.clear(this.ctx.COLOR_BUFFER_BIT | this.ctx.DEPTH_BUFFER_BIT);
        let node = this.visibleComponents.head;
        while (node != null)
        {
            this.ctx.bindVertexArray(node.value.vertexArray);
            this.ctx.uniformMatrix4fv(
                this.model,
                false,
                node.value.transform
            );
            this.ctx.uniform4fv(this.properties, node.value.properties);
            // The count is ((number of floats in buffer) * (4 bytes per float) / (72 bytes per triangle)) * (3 indices per triangle).
            let count = this.models[node.value.id].length / 6;
            this.ctx.drawArrays(this.ctx.TRIANGLES, 0, count);
            node = node.next;
        }
    }
    /*
        Parses the component data file.

        body: The body to parse as a component data file.
    */
    parseComponentDataFile(body)
    {
        const data = new Uint8Array(body);
        const view = new DataView(data.buffer);
        let index = 0;
        const modelsCount = view.getInt16(index, true);
        index += 2;
        const propsCount = view.getInt16(index, true);
        index += 2;
        if (modelsCount > 0)
        {
            for (let i = 0; i < modelsCount; i++)
            {
                const id = view.getInt16(index, true);
                index += 2;
                const size = view.getInt32(index, true);
                index += 4;
                this.models[id] = new Float32Array(data.buffer.slice(index, index + size));
                index += size;
            }
        }
        if (propsCount > 0)
        {
            const decoder = new TextDecoder();
            for (let i = 0; i < propsCount; i++)
            {
                const length = view.getUint16(index, true);
                index += 2;
                if (length == 0)
                    index = this.setProperties(this.root, view, index);
                else
                {
                    const pathData = new Int8Array(data.buffer, index, length);
                    index += length;
                    const path = decoder.decode(pathData);
                    index = this.setProperties(this.root.getChild(path), view, index);
                }
            }
        }
    }
    /*
        Sets the component properties if they exist in the given input.

        component: The component to update.
        view: The data view to use.
        index: The index in the view to use.
    */
    setProperties(component, view, index)
    {
        const updatedProps = view.getUint8(index, true);
        index++;
        if ((updatedProps & 1) != 0)
        {
            const hiddenState = view.getUint8(index, true) == 1
            index++;
            this.needsRebuild ||= component.isHidden != hiddenState;
            component.isHidden = hiddenState;
        }
        if ((updatedProps & 1 << 1) != 0)
        {
            component.id = view.getInt16(index, true);
            index += 2;
            this.ctx.bindBuffer(this.ctx.ARRAY_BUFFER, component.vertexBuffer);
            this.ctx.bufferData(
                this.ctx.ARRAY_BUFFER,
                this.models[component.id],
                this.ctx.STATIC_DRAW
            );
        }
        if ((updatedProps & 1 << 2) != 0)
        {
            for (let i = 0; i < 4; i++)
            {
                component.properties[i] = view.getUint8(index, true) / 255.0;
                index++;
            }
        }
        if ((updatedProps & 1 << 3) != 0)
        {
            component.transform[0] = view.getFloat32(index, true);
            component.transform[1] = view.getFloat32(index + 4 * 3, true);
            component.transform[2] = view.getFloat32(index + 4 * 6, true);
            component.transform[4] = view.getFloat32(index + 4, true);
            component.transform[5] = view.getFloat32(index + 4 * 4, true);
            component.transform[6] = view.getFloat32(index + 4 * 7, true);
            component.transform[8] = view.getFloat32(index + 4 * 2, true);
            component.transform[9] = view.getFloat32(index + 4 * 5, true);
            component.transform[10] = view.getFloat32(index + 4 * 8, true);
            component.transform[12] = view.getFloat32(index + 4 * 9, true);
            component.transform[13] = view.getFloat32(index + 4 * 10, true);
            component.transform[14] = view.getFloat32(index + 4 * 11, true);
            index += 48;
        }
        return index;
    }
}