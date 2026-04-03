# OpenModelViewFramework
This repository contains a collection of libraries and applications for displaying 3D models in a browser. The web application uses three files, glMatrix, and WebGL to represent and display 3D models. A demo can be viewed here.
## Assembly Data File (.adata)
An assembly data file contains each assembly step and indicates which components are in each one. It also includes any assembly step specific component transforms, explode line start and end points,
and explode line properties.
```c
struct AssemblyDataFile
{
    uint8 lineStyle;
    uint8 lineLength;
    uint8 lineThickness;
    uint8 properties[4];
    uint8 stepCount;
    struct AssemblyStep steps[];
};

struct AssemblyStep
{
    uint8 nameLength;
    int8 name[];
    int16 lineCount;
    // Present if lineCount > 0.
    struct Line lines[];
    int16 componentCount;
    struct AssemblyStepComponent components[];
};

struct Line
{
    struct Point start;
    struct Point end;
};

struct Point
{
    float x;
    float y;
    float z;
};

struct AssemblyStepComponent
{
    uint8 nameLength;
    int8 name[];
    uint8 hasTransform;
    // Present if hasTransform = 1.
    float transform[3];
};
```
## Component Data File (.cdata)
A component data file stores viewable geometry and any component properties that should be updated. If the compressed format is used, the first model geometry ID is set to 0 and the following model geometry IDs are incremented sequentially by 1.
```c
struct ComponentDataFile
{
    uint8 useCompressedFormat;
    // Present if useCompressedFormat = 0.
    int16 propertyCount;
    // Present if propertyCount > 0.
    struct ComponentProperties properties[];
    int16 modelCount;
    // Present if useCompressedFormat = 0 and modelCount > 0.
    struct Model models[];
    // Present if useCompressedFormat = 1 and modelCount > 0.
    struct ModelGeometry geometry[];
};

struct ComponentProperties
{
    int16 pathLength;
    int8 path[];
    uint8 updatedProperties;
    // The following members are present if the corresponding bit is set in updatedProperties.
    uint8 isHidden;
    int16 id;
    uint8 properties[4];
    float transform[12];
};

struct Model
{
    int16 id;
    struct ModelGeometry geometry;
};

struct ModelGeometry
{
    uint32 triangleCount;
    struct Triangle triangles[];
};

struct Triangle
{
    float n0[3];
    float p0[3];
    float n1[3];
    float p1[3];
    float n2[3];
    float p2[3];
};
```
## Component Tree File (.ctree)
A component tree file stores the CAD model hierarchy, component locations relative to the top level assembly, component color and reflection properties, and model geometry IDs.
```c
struct ComponentTreeFile
{
    static float boundingBox[6];
    int16 id;
    uint8 isHidden;
    uint8 nameLength;
    int8 name[];
    // For parts only.
    uint8 properties[4];
    // For parts only.
    float transform[12];
    // For assemblies only.
    int16 childrenCount;
    // For assemblies only.
    struct ComponentTreeFile children[];
}
```
## Web Application
The web application is available through a CDN.
### HTML:
```html
<!DOCTYPE html>
<html>
<head>
    <title>3D Viewer</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/gl-matrix/2.8.1/gl-matrix-min.js"
        integrity="sha512-zhHQR0/H5SEBL3Wn6yYSaTTZej12z0hVZKOv3TwCUXT1z5qeqGcXJLLrbERYRScEDDpYIJhPC1fk31gqR783iQ=="
        crossorigin="anonymous"
        defer>
    </script>
    <script src=""
        integrity=""
        crossorigin="anonymous"
        defer>
    </script>
</head>
<body>
    <canvas id="model-viewer"></canvas>
</body>
</html>
```
### JS:
```js
let viewer;

function createViewer()
{
    // Send a request to retrieve the assembly data file.
    // let data = ...
    const assemblyData = new AssemblyData(data);
    // Send a request to retrieve the component data file.
    // data = ...
    const componentData = new ComponentData(data);
    // Send a request to retrieve the component tree file.
    // data = ...
    const component = Component.parse(data);
    const camera = new Camera(Component.getIsometricCameraPosition(), Component.boundingBox, .0005, .005);
    const light = new Light(0x151515, 0xC8C8C8, 0xFFFFFF);
    viewer = new ModelViewer(component, assemblyData, componentData, camera, light);
}
```
## CAD Application Support
This repository contains CAD application specific code to generate the necessary model data for the web application and interface with any custom product configurators. Currently, only support for SolidWorks has been
implemented.
### SolidWorks
OpenModelViewFramework.SolidWorks.Util.exe is a command line application that creates the necessary model data for the web application from SolidWorks models. Creating an adata file requires a specific structure in the feature tree. Each assembly step is represented by a feature folder. The components within a folder belong to the assembly step. An exploded view that is associated with an assembly step should have the same name as the assembly step. The following options are available:
```txt
-ad <name>: Creates an adata file and a json file using the sldasm file.
```
```txt
-ad-json <json file name>: Creates an adata file using the json file.
```
```txt
-cd <name>: Creates a cdata file using the specified name and every stl file in the current folder.
```
```txt
-ct <name.sldprt | name.sldasm> <property>: Creates a ctree file using the model file and property. The property should resolve to Yes or No. stl files must exist in the current folder.
```
```txt
-stl <property>: Creates an stl file for every configuration of each part in the current folder filtered by the specified property. The property should resolve to Yes or No.
```
> [!NOTE]
> Explode line data can't currently be retrieved using the application. That information must be manually added. Modify the created json file and then run the application with the -ad-json option.
