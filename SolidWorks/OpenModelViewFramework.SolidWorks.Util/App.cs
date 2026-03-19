using SolidWorks.Interop.sldworks;
using System.Diagnostics;
using OpenModelViewFramework.Library;
using OpenModelViewFramework.SolidWorks.Library;

namespace OpenModelViewFramework.SolidWorks.Util;

class App
{
    // The SOLIDWORKS app.
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
                    Instance.CreateAssemblyData(args[1]).CreateFile(Path.GetFileNameWithoutExtension(args[1]));
                    break;
                case "-cd":
                    var data = new ComponentData();
                    data.CreateFile(args[1], true);
                    break;
                case "-ct":
                    CreateProcess();
                    var component = Instance.CreateComponentTree(args[1], args[2]);
                    component.CreateComponentTreeFile();
                    break;
                case "-stl":
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
    // Creates a SOLIDWORKS process.
    void CreateProcess()
    {
        var instances = Process.GetProcessesByName("sldworks");
        if (instances.Length != 0)
            throw new Exception("Please terminate any open SOLIDWORKS processes before running this application.");
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
            Console.WriteLine("-ad <name.sldprt | name.sldasm>: Creates an assembly data file (.adata) using the specified model file.");
            Console.WriteLine("-cd <name>: Creates a component data file (.cdata) using the specified name and every stl file in the current folder.");
            Console.WriteLine("-ct <name.sldprt | name.sldasm> <property>: Creates a component tree file (.ctree) using the specified model file and property.");
            Console.WriteLine("-stl <property>: Generates a stereolithography file (.stl) for every configuration of each part in the current folder filtered by the specified property.");
            return;
        }
        var app = new App();
        app.Run(args);
    }
}