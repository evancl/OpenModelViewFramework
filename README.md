# OpenModelViewFramework
This repository contains a collection of libraries and applications for displaying 3D models in a browser. The WebGL application uses three file types to represent a CAD model. You can use these files types to create
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
A component data file stores viewable geometry in a CAD model and any component properties that are to be updated.
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
A component tree file stores the CAD model hierarchy, component locations relative to the top level CAD model, component color and reflection properties, and viewable geometry references.
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
## Common Library
OpenModelViewFramework.Library.dll contains application code that is independent of any CAD application.
## WebGL Application
The web application is available through a CDN. Simply include the following code in your product viewer's webpage:
<script>...</script>
### General Usage
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
