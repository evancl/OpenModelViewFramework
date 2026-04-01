# OpenModelViewFramework
This repository contains a collection of libraries and applications for displaying 3D models in a browser. The web application uses three files and WebGL to represent and display a CAD model. You can use these files to create
3D views of CAD models like the following:
## Assembly Data File (.adata)
An assembly data file contains each assembly step and indicates which components are in each one. It also includes any assembly step specific component transforms, explode line start and end points,
and explode line properties.
```c
// General structure.
struct AssemblyDataFile
{
    byte LineStyle;
    byte LineLength;
    byte LineThickness;
    byte Properties[4];
    byte StepsCount;
    struct AssemblyStep Steps[];
}
```
## Component Data File (.cdata)
A component data file stores viewable geometry and any component properties that should be updated.
```c
// General structure.
struct ComponentDataFile
{
    byte UseCompressedFormat;
    short PropertiesCount;
    struct ComponentProperty Properties[];
    short ModelsCount;
    struct Model Models[];
}
```
## Component Tree File (.ctree)
A component tree file stores the CAD model hierarchy, component locations relative to the top level assembly, component color and reflection properties, and viewable geometry references.
```c
// General structure.
struct ComponentTreeFile
{
    short Id;
    byte IsHidden;
    byte NameLength;
    byte Name[];
    byte Properties[4];
    float Transform[12];
    short ChildrenCount;
    struct ComponentTreeFile Children[];
}
```
## Web Application
The web application is available through a CDN. Simply include the following code in your product viewer's webpage:
<script>...</script>
### General Usage:
```js
let viewer;

function createViewer()
{
    // Send a request to your server to retrieve the assembly data file.
    let assemblyData;
    // Send a request to your server to retrieve the component data file.
    let componentData;
    // Send a request to your server to retrieve the component tree file.
    let component;
    const camera = new Camera();
    const light = new Light();
    viewer = new ModelViewer(component, assemblyData, componentData, camera, light);
}
```
## CAD Application Support
This repository contains CAD application specific code to generate the necessary model data for the web viewer and interface with any custom product configurators. Currently, only support for SolidWorks has been
implemented.
### SolidWorks
Use OpenModelViewFramework.SolidWorks.Library.dll to create common objects from SolidWorks models.\
Use OpenModelViewFramework.SolidWorks.Util.exe to create the necessary data for the web viewer.
