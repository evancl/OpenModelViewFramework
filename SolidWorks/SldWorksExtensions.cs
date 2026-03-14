namespace OpenModelViewFramework;

public static class SldWorksExtensions
{
    /*
        Creates an assembly data instance using the model with the given file name.

        app: The SOLIDWORKS application.
        name: The file name.
    */
    public static AssemblyData CreateAssemblyData(this SldWorks app, string name)
    {
        if (!File.Exists(name))
            throw new Exception($"SldWorks.CreateAssemblyData error: {name} doesn't exist.");
        var extension = Path.GetExtension(name);
        int documentType;
        if (extension == ".sldasm")
            documentType = (int)swDocumentTypes_e.swDocASSEMBLY;
        else if (extension == ".sldprt")
            documentType = (int)swDocumentTypes_e.swDocPART;
        else
            throw new Exception("SldWorks.CreateAssemblyData error: Acceptable document types are .sldasm and .sldprt.");
        var directory = System.IO.Directory.GetCurrentDirectory();
        int errors = 0, warnings = 0;
        var document = app.OpenDoc6(
            $"{directory}\\{name}",
            documentType,
            (int)swOpenDocOptions_e.swOpenDocOptions_Silent,
            String.Empty,
            ref errors,
            ref warnings
        );
        if (errors != 0)
            throw new Exception($"SldWorks.CreateAssemblyData error: Failed to open {name}. Errors: {errors}.");
        document = (ModelDoc2)app.ActivateDoc3(
            $"{directory}\\{name}",
            false,
            (int)swRebuildOnActivation_e.swRebuildActiveDoc,
            ref errors
        );
        if (errors == (int)swActivateDocError_e.swGenericActivateError)
            throw new Exception($"SldWorks.CreateAssemblyData error: Failed to activate {name}. Errors: {errors}.");
        var config = document.ConfigurationManager.ActiveConfiguration;
        var assembly = (AssemblyDoc)document;
        var viewNames = (string[])assembly.GetExplodedViewNames2(config.Name);
        var folders = document.FeatureManager.GetFolders();
        if (folders.Count == 0)
            throw new Exception($"SldWorks.CreateAssemblyData error: No folders were found in {name}.");
        var data = new AssemblyData(folders.Count);
        for (var i = 0; i < folders.Count; i++)
        {
            name = ((Feature)folders[i].Object).Name;
            Line[] lines;
            List<AssemblyStepComponent> components;
            if (viewNames.Contains(name))
            {
                assembly.ShowExploded2(true, name);
                lines = document.GetExplodeLines(name);
                components = item.GetAssemblyComponents(document, true);
                assembly.ShowExploded2(false, name);
            }
            else
            {
                lines = null;
                components = item.GetAssemblyComponents(document, false);
            }
            data.Steps[i] = new AssemblyStep(name, lines, components);
        }
        return data;
    }
    /*
        Creates an stl file for every configuration of each filtered part in the current folder.

        app: The SOLIDWORKS application.
        property: The name of the document property that determines if an stl file should be exported. The property should resolve to "Yes" or "No".
    */
    public static void ExportStlFiles(this SldWorks app, string property)
    {
        var directory = Directory.GetCurrentDirectory();
        var files = Directory.GetFiles(
            directory,
            "*.sldprt",
            SearchOption.AllDirectories
        );
        int errors = 0, warnings = 0;
        foreach (var file in files)
        {
            var document = app.OpenDoc6(
                file,
                (int)swDocumentTypes_e.swDocPART,
                (int)swOpenDocOptions_e.swOpenDocOptions_Silent,
                String.Empty,
                ref errors,
                ref warnings
            );
            if (errors != 0)
                throw new Exception($"SldWorks.ExportSTLFiles error: Failed to open {file}. Errors: {errors}.");
            document = (ModelDoc2)app.ActivateDoc3(
                file,
                false,
                (int)swRebuildOnActivation_e.swRebuildActiveDoc,
                ref errors
            );
            if (errors == (int)swActivateDocError_e.swGenericActivateError)
                throw new Exception($"SldWorks.ExportSTLFiles error: Failed to activate {file}. Errors: {errors}.");
            var manager = document.Extension.CustomPropertyManager[String.Empty];
            var result = manager.Get6(
                property,
                false,
                out _,
                out string viewable,
                out _,
                out _
            );
            if (result != (int)swCustomInfoGetResult_e.swCustomInfoGetResult_ResolvedValue || viewable != "Yes")
            {
                app.CloseDoc(file);
                continue;
            }
            var path = $"{directory}\\{Path.GetFileNameWithoutExtension(file)}";
            var names = (object[])document.GetConfigurationNames();
            var data = app.GetExportFileData((int)swExportDataFileType_e.swExportPdfData);
            foreach (var name in names)
            {
                if ((string)name != document.ConfigurationManager.ActiveConfiguration.Name)
                    document.ShowConfiguration2((string)name);
                document.Extension.SaveAs3(
                    $"{path} ({(string)name}).stl",
                    (int)swSaveAsVersion_e.swSaveAsCurrentVersion,
                    (int)swSaveAsOptions_e.swSaveAsOptions_Silent,
                    data,
                    document.Extension.GetAdvancedSaveAsOptions((int)swSaveWithReferencesOptions_e.swSaveWithReferencesOptions_None),
                    ref errors,
                    ref warnings
                );
                if (errors != 0)
                    throw new Exception($"SldWorks.ExportSTLFiles error: Failed to save {path} ({(string)name}).stl. Errors: {errors}.");
            }
            app.CloseDoc(file);
        }
    }
    /*
        Checks if the file is open.

        app: The SOLIDWORKS application.
        path: The path of the file.
    */
    private static bool IsOpen(this SldWorks app, string path)
    {
        var documents = (object[])app.GetDocuments();
        for (var i = 0; i < documents.Length; i++)
        {
            if (path == ((ModelDoc2)documents[i]).GetPathName())
                return true;
        }
        return false;
    }
    /*
        Gets the default transform.

        app: The SOLIDWORKS application.
    */
    private static MathTransform GetDefaultTransform(this SldWorks app)
    {
        var math = (MathUtility)app.GetMathUtility();
        double[] data =
        {
            0,
            0,
            0
        };
        var translation = (MathVector)math.CreateVector(data);
        data =
        [
            1,
            0,
            0
        ];
        var x = (MathVector)math.CreateVector(data);
        data =
        [
            0,
            1,
            0
        ];
        var y = (MathVector)math.CreateVector(data);
        data =
        [
            0,
            0,
            1
        ];
        var z = (MathVector)math.CreateVector(data);
        var transform = math.ComposeTransform(
            x,
            y,
            z,
            translation,
            1
        );
        return transform;
    }
    /*
        Creates a component tree using the model with the given file name.

        app: The SOLIDWORKS application.
        name: The file name.
        property: The name of the document property that determines if an stl file should be referenced. The property should resolve to "Yes" or "No".
    */
    public static Component CreateComponentTree(this SldWorks app, string name, string property)
    {
        if (!File.Exists(name))
            throw new Exception($"SldWorks.CreateComponentTree error: {name} doesn't exist.");
        var extension = Path.GetExtension(name);
        int documentType;
        if (extension == ".sldasm")
            documentType = (int)swDocumentTypes_e.swDocASSEMBLY;
        else if (extension == ".sldprt")
            documentType = (int)swDocumentTypes_e.swDocPART;
        else
            throw new Exception("SldWorks.CreateComponentTree error: Acceptable document types are .sldasm and .sldprt.");
        var directory = System.IO.Directory.GetCurrentDirectory();
        var files = System.IO.Directory.GetFiles(
            directory,
            "*.stl",
            SearchOption.AllDirectories
        );
        if (files.Length == 0 || files.Length > short.MaxValue)
            throw new Exception($"SldWorks.CreateComponentTree error: stl file count must be between 1 and {short.MaxValue} inclusive.");
        files = files.Select(Path.GetFileNameWithoutExtension).ToArray();
        Array.Sort(files);
        int errors = 0, warnings = 0;
        var document = app.OpenDoc6(
            $"{directory}\\{name}",
            documentType,
            (int)swOpenDocOptions_e.swOpenDocOptions_Silent,
            String.Empty,
            ref errors,
            ref warnings
        );
        if (errors != 0)
            throw new Exception($"SldWorks.CreateComponentTree error: Failed to open {name}. Errors: {errors}.");
        document = (ModelDoc2)app.ActivateDoc3(
            $"{directory}\\{name}",
            false,
            (int)swRebuildOnActivation_e.swRebuildActiveDoc,
            ref errors
        );
        if (errors == (int)swActivateDocError_e.swGenericActivateError)
            throw new Exception($"SldWorks.CreateComponentTree error: Failed to activate {name}. Errors: {errors}.");
        var component = app.CreateComponentTree(
            document,
            files,
            String.Empty,
            Path.GetFileNameWithoutExtension(document.GetPathName()),
            property,
            "Default",
            app.GetDefaultTransform(),
            false
        );
        if (component == null)
            throw new Exception($"SldWorks.CreateComponentTree error: No viewable components in {document.GetPathName()}.");
        return component;
    }
    /*
        Creates a component tree by traversing the model's component tree.

        app: The SOLIDWORKS application.
        document: The model document.
        files: The stl file names sorted in ascending order.
        componentPath: The component path relative to the root.
        componentName: The component name.
        property: The name of the document property that determines if an stl file should be referenced. The property should resolve to "Yes" or "No".
        config: The component configuration.
        transform: The component transform.
        isHidden: Indicates if the component is hidden.
    */
    private static Component CreateComponentTree(this SldWorks app, ModelDoc2 document, string[] files, string componentPath, string componentName, string property, string config, MathTransform transform, bool isHidden)
    {
        var manager = document.Extension.CustomPropertyManager[String.Empty];
        var result = manager.Get6(
            property,
            false,
            out _,
            out string viewable,
            out _,
            out _
        );
        if (result != (int)swCustomInfoGetResult_e.swCustomInfoGetResult_ResolvedValue || viewable != "Yes")
        {
            app.CloseDoc(document.GetPathName());
            return null;
        }
        var resolvedID = manager.Get6(
            "CLSID",
            false,
            out _,
            out string clsid,
            out _,
            out _
        );
        Component component;
        if (document.GetType() == (int)swDocumentTypes_e.swDocASSEMBLY)
        {
            var assemblyDoc = (AssemblyDoc)document;
            var childComponents = (object[])assemblyDoc.GetComponents(true);
            if (childComponents.Length == 0 || childComponents.Length > short.MaxValue)
                throw new AppException($"SldWorks.CreateComponentTree error: Component count must be between 1 and {short.MaxValue} inclusive in {document.GetPathName()}.");
            var children = new Component[childComponents.Length];
            int errors = 0, warnings = 0, index = 0;
            for (var i = 0; i < childComponents.Length; i++)
            {
                var childComponent = (Component2)childComponents[i];
                var childComponentName = childComponent.GetName(document);
                if (!app.IsOpen(childComponent.GetPathName()))
                {
                    app.OpenDoc6(
                        childComponent.GetPathName(),
                        Path.GetExtension(childComponent.GetPathName()) == "sldprt" ? (int)swDocumentTypes_e.swDocPART : (int)swDocumentTypes_e.swDocASSEMBLY,
                        (int)swOpenDocOptions_e.swOpenDocOptions_Silent,
                        String.Empty,
                        ref errors,
                        ref warnings
                    );
                    if (errors != 0)
                        throw new AppException($"SldWorks.CreateComponentTree error: Failed to open {childComponent.GetPathName()}. Errors: {errors}.");
                }
                var childComponentDocument = (ModelDoc2)app.ActivateDoc3(
                    childComponent.GetPathName(),
                    false,
                    (int)swRebuildOnActivation_e.swRebuildActiveDoc,
                    ref errors
                );
                if (errors == (int)swActivateDocError_e.swGenericActivateError)
                    throw new AppException($"SldWorks.CreateComponentTree error: Failed to activate {childComponent.GetPathName()}. Errors: {errors}.");
                manager = childComponentDocument.Extension.CustomPropertyManager[String.Empty];
                result = manager.Get6(
                    property,
                    false,
                    out _,
                    out viewable,
                    out _,
                    out _
                );
                if (result != (int)swCustomInfoGetResult_e.swCustomInfoGetResult_ResolvedValue || viewable != "Yes")
                {
                    app.CloseDoc(childComponent.GetPathName());
                    continue;
                }
                var childComponentHidden = childComponent.Visible == (int)swComponentVisibilityState_e.swComponentHidden ||
                    childComponent.GetSuppression2() == (int)swComponentSuppressionState_e.swComponentSuppressed;
                component = app.CreateComponentTree(
                    childComponentDocument,
                    files,
                    $"{componentPath}/{childComponentName}"
                    childComponentName,
                    property,
                    childComponent.ReferencedConfiguration,
                    (MathTransform)transform.Multiply(childComponent.Transform2),
                    childComponentHidden
                );
                if (component != null)
                {
                    children[index] = component;
                    index++;
                }
            }
            if (index != childComponents.Length)
            {
                if (index == 0)
                    throw new Exception($"SldWorks.CreateComponentTree error: No viewable components in {document.GetPathName()}.");
                Array.Resize(children, index);
            }
            if (resolvedID == (int)swCustomInfoGetResult_e.swCustomInfoGetResult_ResolvedValue)
            {
                var type = Type.GetTypeFromCLSID(new Guid(clsid), true);
                component = (Component)Activator.CreateInstance(
                    type,
                    [
                        isHidden,
                        componentName,
                        componentPath,
                        children
                    ]
                );
            }
            else
            {
                component = new Assembly(
                    isHidden,
                    componentName,
                    componentPath,
                    children
                );
            }
        }
        else
        {
            var fileName = $"{Path.GetFileNameWithoutExtension(document.GetPathName())} ({config})";
            var id = (short)Array.BinarySearch(files, fileName);
            if (id < 0)
                throw new Exception($"SldWorks.CreateComponentTree error: Failed to find \"{fileName}\" in files.");
            var materialProperties = (double[])document.MaterialPropertyValues;
            byte[] componentProperties =
            {
                (byte)(materialProperties[0] * 255),
                (byte)(materialProperties[1] * 255),
                (byte)(materialProperties[2] * 255),
                (byte)(materialProperties[6] * 255)
            };
            if (resolvedID == (int)swCustomInfoGetResult_e.swCustomInfoGetResult_ResolvedValue)
            {
                var type = Type.GetTypeFromCLSID(new Guid(clsid), true);
                component = (Component)Activator.CreateInstance(
                    type,
                    [
                        id,
                        isHidden,
                        componentName,
                        componentPath,
                        componentProperties,
                        transform.GetData()
                    ]
                );
            }
            else
            {
                component = new Part(
                    id,
                    isHidden,
                    componentName,
                    componentPath,
                    componentProperties,
                    transform.GetData()
                );
            }
        }
        app.CloseDoc(document.GetPathName());
        return component;
    }
}