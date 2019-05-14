
using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;
using System.Web.Optimization;

namespace MVC4SampleSite.App_Start
{
	public class BundleConfig
	{
		internal static void RegisterBundles(BundleCollection bundles)
		{


            bundles.Add(new StyleBundle("~/bundles/css")
                .Include(
                    "~/Content/css/site.css"
                    )
                );


            bundles.Add(new ScriptBundle("~/bundles/js")
                .Include("~/Scripts/jquery-1.10.2.js")
            );


            if (string.Equals(ConfigurationManager.AppSettings["EnableMinification"], "true", StringComparison.CurrentCultureIgnoreCase))
			{
				BundleTable.EnableOptimizations = true;
			}
			else
			{
				BundleTable.EnableOptimizations = false;
			}

		}
	}
}