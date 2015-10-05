using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.WebPages;
using System.Diagnostics;
using WebMatrix.Data;

/// <summary>
/// Summary description for Global
/// </summary>
public sealed class GlobalData
{
    private int _LoadCounter = 0;
    private bool _AjaxCall = false;
    private List<string> _RunOnce = new List<string>();
    private List<string> _RequiredSections = new List<string>();
    private List<RenderElement> _RenderElements = new List<RenderElement>();
    private List<string> _RequestedElements;
    private Dictionary<string, string> _RequestedElementIDs;
    private Dictionary<string, int> _UniqueIDs = new Dictionary<string, int>();

    public string PageType;
    public Dictionary<string, string> AJAX = new Dictionary<string, string>();
    public List<RenderElement> RenderElements
    {
        get { return _RenderElements; }
        protected set { _RenderElements = value; }
    }
    public List<string> RemainingSections
    {
        get { return _RequiredSections; }
        protected set { _RequiredSections = value; }
    }

    public GlobalData()
    {

    }
    public void GetLayout(string PageType)
    {
        Database DB = Database.Open("local");
        string Query = "select distinct name from dm_sections where page = @0";
        foreach (var row in DB.Query(Query, PageType))
        {
            _RequiredSections.Add(row.name);
        }

        Query = "exec pr_returnPageLayout @0";
        foreach (var row in DB.Query(Query, PageType))
        {
            _RenderElements.Add(new RenderElement(row.type, row.name, row.value, row.updateOn));
        }
        this.PageType = PageType.ToLower();
    }

    public void RenderableRequests(string UpdateEvent)
    {
        _AjaxCall = true;

        int i = 0;
        while (i < _RenderElements.Count())
        {
            if (_RenderElements[i].UpdateOn.IndexOf(UpdateEvent) > -1)
            {
                i++;
            }
            else
            {
                _RenderElements.RemoveAt(i);

            }
        }
    }
    public void RenderedSection(string Section)
    {
        _RequiredSections.Remove(Section);
    }

    public List<string> GetNonRenderedSections()
    {
        List<string> r = _RequiredSections.Except(_RenderElements.Where(x => x.Type.ToLower() == "section").Select(x => x.Name).ToList()).ToList();
        return r;
    }

    public static GlobalData Current
    {
        get
        {
            var globalData = HttpContext.Current.Items["GlobalData"] as GlobalData;
            if (globalData == null)
            {
                globalData = new GlobalData();
                HttpContext.Current.Items["GlobalData"] = globalData;
            }
            return globalData;
        }
    }
    public string GetLoadCount()
    {
        _LoadCounter++;
        return "Counter has incremented " + _LoadCounter.ToString() + " times";
    }

    public bool SectionRequired(string Section)
    {
        return (_RenderElements.Where(x => x.Type == "section").Where(x2 => x2.Name == Section).Count() > 0);
    }


    public string GenerateUniqueID(string Seed)
    {
        string r = Seed;
        if (_UniqueIDs.ContainsKey(Seed))
        {
            _UniqueIDs[Seed]++;
            r = Seed + _UniqueIDs[Seed];
        }
        else
        {
            _UniqueIDs.Add(Seed, 1);
        }

        return r;
    }

    public void RunOnce(Action MethodName)
    {
        if (_RunOnce.Contains(MethodName.Method.Name))
            return;
        MethodName();
        _RunOnce.Add(MethodName.Method.Name);
    }
    public void RunOnce(Action<string> MethodName, string Arguments)
    {
        if (_RunOnce.Contains(MethodName.Method.Name))
            return;
        MethodName(Arguments);
        _RunOnce.Add(MethodName.Method.Name);
    }
    public void RunOnce(Action<dynamic> MethodName, dynamic Arguments)
    {
        if (_RunOnce.Contains(MethodName.Method.Name))
            return;
        MethodName(Arguments);
        _RunOnce.Add(MethodName.Method.Name);
    }

}
public class RenderElement
{
    public string Type;
    public string Name;
    public string Arguments;
    public string UpdateOn;

    public RenderElement(string type, string name, string arguments, string update)
    {
        Type = type;
        Name = name;
        Arguments = arguments;
        UpdateOn = update;

    }

}