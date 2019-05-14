
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


			//bundles.Add(new StyleBundle("~/bundles/css")
			//	.Include(
			//		"~/Content/css/bootstrap.min.css",
   //                 "~/Content/css/bootstrap-theme.min.css",
			//		"~/Content/css/font-awesome.min.css",
   //                 "~/Content/css/bootstrap-tour.css",
   //                 "~/Content/css/jquery.snippet.css",
   //                 "~/Content/css/tour.css",
			//		"~/Content/css/site.css"
			//		)
			//	);


			//bundles.Add(new ScriptBundle("~/bundles/js")
			//	.Include("~/Scripts/jquery-1.10.2.js",
			//			"~/Scripts/bootstrap.js",
   //                     "~/Scripts/SwfUpload/swfupload.js",
			//			"~/Scripts/jquery.scrollTo.min.js",
			//			"~/Scripts/Agility.js",
			//			"~/Scripts/Agility.UGC.API.js",
			//			"~/Scripts/Agility.CMS.API.js",
   //                     "~/Scripts/jquery.cookie.js",
   //                     "~/Scripts/bootstrap-tour.js",
   //                     "~/Scripts/jquery.snippet.js",
   //                     "~/Scripts/sh_csharp.js",
   //                     "~/Scripts/jquery.tmpl.js")
   //                     .IncludeDirectory("~/Scripts/Site", "*.js")
			//);
			

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