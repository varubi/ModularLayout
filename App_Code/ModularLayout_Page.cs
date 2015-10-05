using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace ModularLayout
{
    public abstract class WebViewPage : System.Web.WebPages.WebPage
    {
        public GlobalData ThisRequest = GlobalData.Current;
    }
}