class ModelViewer
{
    /*
        Class constructor.

        root: The root component.
        assemblyData: The assembly data.
        componentData: The component data.
        camera: The camera to use.
        light: The light to use.
    */
    constructor(root, assemblyData, componentData, camera, light)
    {
        // Root component.
        this.root = root;
        // Assembly data.
        this.assemblyData = assemblyData;
        // Model geometry.
        this.models = componentData.models;
        // The orthographic camera.
        this.camera = camera;
        // The light.
        this.light = light;
        // Hidden components.
        this.hiddenComponents = new LinkedList();
        // Visible components.
        this.visibleComponents = new LinkedList();
        // Canvas element.
        this.viewer = document.querySelector("#model-viewer");
        var self = this;
        this.viewer.addEventListener("wheel", (event) => { self.onZoom(self, event); });
        this.viewer.addEventListener("mousemove", (event) => { self.onRotate(self, event); });
        this.viewer.addEventListener("mousedown", (event) => { self.onStartRotate(self, event); });
        this.viewer.addEventListener("mouseup", (event) => { self.onStopRotate(self); });
        // Indicates if the model is being rotated.
        this.isRotating = false;
        // Explode line scale.
        this.lineScale = .001 * (this.camera.right - this.camera.left);
        // Cursor x position.
        this.cursorX = 0;
        // Cursor y position.
        this.cursorY = 0;
        // Viewer context.
        this.ctx = this.viewer.getContext("webgl2", { antialias: true });
        if (this.ctx === null)
            throw new Error("ModelViewer.constructor error: Failed to initialize viewer.");
        const props = this.viewer.getBoundingClientRect();
        // Left side of the viewer.
        this.left = props.left + document.documentElement.scrollLeft;
        // Top of the viewer.
        this.top = props.top + document.documentElement.scrollTop;
        this.ctx.canvas.width = props.width;
        this.ctx.canvas.height = props.height;
        this.ctx.viewport(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.clearColor(0, 0, 0, 0);
        this.ctx.enable(this.ctx.DEPTH_TEST);
        this.ctx.depthFunc(this.ctx.LEQUAL);
        // The shader program.
        this.shaderProgram = this.configureShaders();
        this.ctx.useProgram(this.shaderProgram);
        // Vertex normal vector location.
        this.vertexNormal = this.ctx.getAttribLocation(this.shaderProgram, "vertexNormal");
        // Vertex position vector location.
        this.vertexPosition = this.ctx.getAttribLocation(this.shaderProgram, "vertexPosition");
        // Camera position vector location.
        this.cameraPosition = this.ctx.getUniformLocation(this.shaderProgram, "cameraPosition");
        // Ambient light color vector location.
        this.ambientLight = this.ctx.getUniformLocation(this.shaderProgram, "ambientLight");
        // Diffuse light color vector location.
        this.diffuseLightColor = this.ctx.getUniformLocation(this.shaderProgram, "diffuseLightColor");
        // Diffuse light direction vector location.
        this.diffuseLightVector = this.ctx.getUniformLocation(this.shaderProgram, "diffuseLightVector");
        // Specular light color vector location.
        this.specularLightColor = this.ctx.getUniformLocation(this.shaderProgram, "specularLightColor");
        // Specular light position vector location.
        this.specularLightPosition = this.ctx.getUniformLocation(this.shaderProgram, "specularLightPosition");
        // Model matrix location.
        this.model = this.ctx.getUniformLocation(this.shaderProgram, "modelMatrix");
        // Translation matrix location.
        this.translation = this.ctx.getUniformLocation(this.shaderProgram, "translationMatrix");
        // View matrix location.
        this.view = this.ctx.getUniformLocation(this.shaderProgram, "viewMatrix");
        // Projection matrix location.
        this.projection = this.ctx.getUniformLocation(this.shaderProgram, "projectionMatrix");
        // Color and reflection vector location.
        this.properties = this.ctx.getUniformLocation(this.shaderProgram, "properties");
        this.ctx.uniform3fv(this.cameraPosition, this.camera.position);
        this.ctx.uniform3fv(this.ambientLight, this.light.ambient);
        this.ctx.uniform3fv(this.diffuseLightColor, this.light.diffuse);
        this.ctx.uniform3fv(this.diffuseLightVector, this.light.diffuseVector);
        this.ctx.uniform3fv(this.specularLightColor, this.light.specular);
        this.ctx.uniform3fv(this.specularLightPosition, this.light.specularPosition);
        this.ctx.uniformMatrix4fv(this.translation, false, Component.translation);
        this.ctx.uniformMatrix4fv(this.view, false, this.camera.view);
        this.ctx.uniformMatrix4fv(this.projection, false, this.camera.projection);
        // Indicates if the visible component list has been updated.
        this.needsRebuild = false;
        // Indicates if the model is in an exploded state.
        this.isExploded = false;
        this.createBuffers(this.root, false);
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
        // Displayed assembly step.
        if (this.assemblyData == null)
            this.assemblyStep = 0;
        else
        {
            this.assemblyStep = this.assemblyData.steps.length - 1;
            for (let i = 0; i < this.assemblyData.steps.length; i++)
            {
                for (let j = 0; j < this.assemblyData.steps[i].components.length; j++)
                {
                    const component = this.assemblyData.steps[i].components[j];
                    if (component.transform != null)
                        this.root.getChild(component.name).setExplodedAndCollapsed(component.transform);
                }
                if (this.assemblyData.steps[i].lines != null)
                {
                    for (let j = 0; j < this.assemblyData.steps[i].lines.length; j++)
                    {
                        const line = this.assemblyData.steps[i].lines[j];
                        line.createLine(this);
                    }
                }
            }
        }
    }
    // Vertex shader source code.
    static vertexShaderSource =
    `
        attribute vec3 vertexPosition;
        attribute vec3 vertexNormal;
        uniform mat4 modelMatrix;
        uniform mat4 translationMatrix;
        uniform mat4 viewMatrix;
        uniform mat4 projectionMatrix;
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
            gl_Position = projectionMatrix * viewMatrix * translationMatrix * modelMatrix * vec4(vertexPosition, 1.0);
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
        Creates a buffer for the specified component or every child component that has a model. Components are added to
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
                new Float32Array(this.models[component.id]),
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
            const message = `ModelViewer.configureShaders error: Failed to load shader. Log: ${this.ctx.getShaderInfoLog(vertexShader)}`;
            this.ctx.deleteShader(vertexShader);
            throw new Error(message);
        }
        const fragmentShader = this.loadShader(this.ctx.FRAGMENT_SHADER, ModelViewer.fragmentShaderSource);
        if (!this.ctx.getShaderParameter(fragmentShader, this.ctx.COMPILE_STATUS))
        {
            const message = `ModelViewer.configureShaders error: Failed to load shader. Log: ${this.ctx.getShaderInfoLog(fragmentShader)}`;
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
            throw new Error(`ModelViewer.configureShaders error: Failed to initialize shader program. Log: ${this.ctx.getProgramInfoLog(shaderProgram)}`);
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
            self.camera.view
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
        const props = self.viewer.getBoundingClientRect();
        self.left = props.left + document.documentElement.scrollLeft;
        self.top = props.top + document.documentElement.scrollTop;
        const left = self.camera.left;
        const right = self.camera.right;
        self.camera.zoomCamera(self, event);
        self.lineScale *= (self.camera.right - self.camera.left) / (right - left);
        if (self.isExploded)
            self.assemblyData.steps[self.assemblyStep].updateLines(self);
        self.ctx.uniformMatrix4fv(
            self.projection,
            false,
            self.camera.projection
        );
        self.render();
    }
    /*
        Shows the components in and optionally before the assembly step specified by index.

        index: The assembly step to show.
        showPrevious: Indicates if the components in previous steps should be shown.
    */
    showAssemblyStep(index, showPrevious)
    {
        if (this.assemblyData == null)
            throw new Error("ModelViewer.showAssemblyStep error: Assembly data is null.");
        else if (index < 0 || index >= this.assemblyData.steps.length)
            throw new Error(`ModelViewer.showAssemblyStep error: Index must be greater than or equal to 0 and less than ${this.assemblyData.steps.length}.`);
        else if (this.isExploded)
            this.collapse();
        this.root.hideChildren();
        this.assemblyStep = index;
        if (showPrevious)
        {
            for (let i = 0; i <= this.assemblyStep; i++)
            {
                for (let j = 0; j < this.assemblyData.steps[i].components.length; j++)
                    this.root.getChild(this.assemblyData.steps[i].components[j].name).isHidden = false;
            }
        }
        else
        {
            for (let i = 0; i < this.assemblyData.steps[this.assemblyStep].components.length; i++)
                this.root.getChild(this.assemblyData.steps[this.assemblyStep].components[i].name).isHidden = false;
        }
        this.visibleComponents = this.root.getVisibleComponents();
        this.render();
    }
    // Places the model in an exploded state.
    explode()
    {
        if (this.assemblyData == null)
            throw new Error("ModelViewer.explode error: Assembly data is null.");
        else if (this.isExploded)
            return;
        const components = this.assemblyData.steps[this.assemblyStep].components;
        for (let i = 0; i < components.length; i++)
        {
            if (components[i].transform != null)
                this.root.getChild(components[i].name).explode();
        }
        this.isExploded = true;
        this.assemblyData.steps[this.assemblyStep].updateLines(this);
        this.render();
    }
    // Places the model in a collapsed state.
    collapse()
    {
        if (this.assemblyData == null)
            throw new Error("ModelViewer.collapse error: Assembly data is null.");
        else if (!this.isExploded)
            return;
        const components = this.assemblyData.steps[this.assemblyStep].components;
        for (let i = 0; i < components.length; i++)
        {
            if (components[i].transform != null)
                this.root.getChild(components[i].name).collapse();
        }
        this.isExploded = false;
        this.render();
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
            this.ctx.drawArrays(this.ctx.TRIANGLES, 0, this.models[node.value.id].length / 6);
            node = node.next;
        }
        if (this.isExploded && this.assemblyData.steps[this.assemblyStep].lines != null)
        {
            this.ctx.uniform4fv(this.properties, this.assemblyData.properties);
            for (let i = 0; i < this.assemblyData.steps[this.assemblyStep].lines.length; i++)
            {
                const line = this.assemblyData.steps[this.assemblyStep].lines[i];
                this.ctx.bindVertexArray(line.vertexArray);
                for (let j = 0; j < line.translations.length; j++)
                {
                    line.transform[12] = line.translations[j][0];
                    line.transform[13] = line.translations[j][1];
                    line.transform[14] = line.translations[j][2];
                    this.ctx.uniformMatrix4fv(
                        this.model,
                        false,
                        line.transform
                    );
                    // The count is ((number of floats in buffer) * (4 bytes per float) / (72 bytes per triangle)) * (3 indices per triangle).
                    this.ctx.drawArrays(this.ctx.TRIANGLES, 0, line.model.length / 6);
                }
                if (line.partial != null)
                {
                    this.ctx.bindVertexArray(line.partialVertexArray);
                    line.transform[12] = line.partialTranslation[0];
                    line.transform[13] = line.partialTranslation[1];
                    line.transform[14] = line.partialTranslation[2];
                    this.ctx.uniformMatrix4fv(
                        this.model,
                        false,
                        line.transform
                    );
                    // The count is ((number of floats in buffer) * (4 bytes per float) / (72 bytes per triangle)) * (3 indices per triangle).
                    this.ctx.drawArrays(this.ctx.TRIANGLES, 0, line.partial.length / 6);
                }
            }
        }
    }
    /*
        Parses the component data file and updates the existing components and models.

        body: The body to parse as a component data file. The uncompressed format must be used.
    */
    update(body)
    {
        const data = new Uint8Array(body);
        const view = new DataView(data.buffer);
        let index = 0;
        const useCompressedFormat = view.getUint8(index, true) == 1;
        if (useCompressedFormat)
            throw new Error("ModelViewer.update error: Compressed format isn't supported.");
        index++;
        let count = view.getInt16(index, true);
        index += 2;
        const ids = new Array();
        if (count > 0)
        {
            const decoder = new TextDecoder();
            for (let i = 0; i < count; i++)
            {
                const length = view.getUint16(index, true);
                index += 2;
                if (length == 0)
                    index = this.setProperties(this.root, view, index, ids);
                else
                {
                    const pathData = new Int8Array(data.buffer, index, length);
                    index += length;
                    const path = decoder.decode(pathData);
                    index = this.setProperties(this.root.getChild(path), view, index, ids);
                }
            }
            if (this.needsRebuild)
            {
                this.visibleComponents = this.root.getVisibleComponents();
                this.needsRebuild = false;
            }
        }
        count = view.getInt16(index, true);
        index += 2;
        if (count > 0)
        {
            for (let i = 0; i < count; i++)
            {
                const id = view.getInt16(index, true);
                index += 2;
                const size = view.getInt32(index, true) * 72;
                index += 4;
                this.models[id] = new Float32Array(data.buffer.slice(index, index + size));
                index += size;
                ids.push(id);
            }
        }
        this.root.bind(ids, this);
    }
    /*
        Sets the component properties if they exist in the given input.

        component: The component to update.
        view: The data view to use.
        index: The index in the view to use.
        ids: The updated IDs.
    */
    setProperties(component, view, index, ids)
    {
        const updatedProps = view.getUint8(index, true);
        index++;
        if ((updatedProps & 1) != 0)
        {
            const isHidden = view.getUint8(index, true) == 1;
            index++;
            this.needsRebuild ||= component.isHidden != isHidden;
            component.isHidden = isHidden;
        }
        if ((updatedProps & 1 << 1) != 0)
        {
            component.id = view.getInt16(index, true);
            index += 2;
            ids.push(component.id);
        }
        if ((updatedProps & 1 << 2) != 0)
        {
            for (let i = 0; i < 4; i++)
            {
                component.properties[i] = view.getUint8(index, true) / 255;
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
