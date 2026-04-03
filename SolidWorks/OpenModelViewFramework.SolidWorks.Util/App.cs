using SolidWorks.Interop.sldworks;
using System.Diagnostics;
using System.Text.Json;
using OpenModelViewFramework.Library;
using OpenModelViewFramework.SolidWorks.Library;

namespace OpenModelViewFramework.SolidWorks.Util;

class App
{
    // The SolidWorks app.
    SldWorks Instance;

    App() {}
    /*
        Runs the application.
    
        args: The arguments to use.
    */
    void Run(string[] args)
    {
        try
        {
            switch (args[0])
            {
                case "-ad":
                    if (args.Length != 2)
                        throw new Exception("App.Run error: Invalid number of arguments.");
                    CreateProcess();
                    var assemblyData = Instance.CreateAssemblyData(args[1]);
                    assemblyData.CreateFile(args[1]);
                    var options = new JsonSerializerOptions
                    {
                        WriteIndented = true,
                        IndentSize = 4
                    };
                    var jsonString = JsonSerializer.Serialize(assemblyData, options);
                    File.WriteAllText($"{System.IO.Directory.GetCurrentDirectory()}\\{args[1]}.json", jsonString);
                    break;
                case "-ad-json":
                    if (args.Length != 2)
                        throw new Exception("App.Run error: Invalid number of arguments.");
                    AssemblyData.CreateFileFromJson(args[1]);
                    break;
                case "-cd":
                    if (args.Length != 2)
                        throw new Exception("App.Run error: Invalid number of arguments.");
                    var componentData = new ComponentData();
                    componentData.CreateFile(args[1], true);
                    break;
                case "-ct":
                    if (args.Length != 3)
                        throw new Exception("App.Run error: Invalid number of arguments.");
                    CreateProcess();
                    var component = Instance.CreateComponentTree(args[1], args[2], out double[] boundingBox);
                    component.CreateComponentTreeFile(boundingBox);
                    break;
                case "-stl":
                    if (args.Length != 2)
                        throw new Exception("App.Run error: Invalid number of arguments.");
                    CreateProcess();
                    Instance.ExportStlFiles(args[1]);
                    break;
                default:
                    throw new Exception("App.Run error: Unsupported option.");
            }
        }
        catch (Exception e)
        {
            Console.WriteLine(e.Message);
            Console.WriteLine(e.StackTrace);
        }
        finally
        {
            Instance?.ExitApp();
        }
    }
    // Creates a SolidWorks process.
    void CreateProcess()
    {
        var instances = Process.GetProcessesByName("sldworks");
        if (instances.Length != 0)
            throw new Exception("Please terminate any open SolidWorks processes before running this application.");
        var programType = Type.GetTypeFromProgID("SldWorks.Application");
        Instance = (SldWorks)Activator.CreateInstance(programType);
        Instance.UserControl = true;
    }
    /*
        Entry point for this application.

        args: The application parameters.
    */
    static void Main(string[] args)
    {
        if (args.Length == 0)
        {
            Console.WriteLine("Usage:\n");
            Console.WriteLine("-ad <name>: Creates an adata file and a json file using the sldasm file.");
            Console.WriteLine("-ad-json <json file name>: Creates an adata file using the json file.");
            Console.WriteLine("-cd <name>: Creates a cdata file using the specified name and every stl file in the current folder.");
            Console.WriteLine("-ct <name.sldprt | name.sldasm> <property>: Creates a ctree file using the model file and property. The property should resolve to Yes or No. stl files must exist in the current folder.");
            Console.WriteLine("-stl <property>: Creates an stl file for every configuration of each part in the current folder filtered by the specified property. The property should resolve to Yes or No.");
            return;
        }
        var app = new App();
        app.Run(args);
    }
}