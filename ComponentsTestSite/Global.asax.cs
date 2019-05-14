using Agility.Web;
using MVC4SampleSite.App_Start;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Http;
using System.Web.Mvc;
using System.Web.Optimization;
using System.Web.Routing;

namespace MVC4SampleSite
{
    // Note: For instructions on enabling IIS6 or IIS7 classic mode, 
    // visit http://go.microsoft.com/?LinkId=9394801
    public class MvcApplication : System.Web.HttpApplication
    {
        public override string GetVaryByCustomString(HttpContext context, string custom)
        {
            /*
             * Handle OutputCache
             * AgilityCacheControl is a special "VaryByCustom" value that is added in the Agility Controller
             */

            if (string.Compare(custom, "AgilityCacheControl", true) == 0)
            {
                string s = Data.GetAgilityVaryByCustomString(context);
                s = string.Format("{0}.{1}", s, context.Request.Url.Host);
                return s;

            }

            return base.GetVaryByCustomString(context, custom);
        }

        protected void Application_Start()
        {
            AreaRegistration.RegisterAllAreas();

            WebApiConfig.Register(GlobalConfiguration.Configuration);
            FilterConfig.RegisterGlobalFilters(GlobalFilters.Filters);
            RouteConfig.RegisterRoutes(RouteTable.Routes);

            BundleConfig.RegisterBundles(BundleTable.Bundles);

            /*
            * Enable this to allow Agility module output templates 
            * to be coded in the content manager and compiled without physical files
            */
            System.Web.Hosting.HostingEnvironment.RegisterVirtualPathProvider(new Agility.Web.Mvc.AgilityInlineModuleProvider());
        }

        protected void Application_Error(object sender, EventArgs e)
        {
            Exception ex = Server.GetLastError();

            if (ex != null)
            {
                Agility.Web.Tracing.WebTrace.HandleApplicationError();
            }

        }
    }
}