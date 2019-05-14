using Agility.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;

namespace MVC4SampleSite
{
	public static class Helpers
	{
		private const string PageTitleKey = "Page-Title";

		public static IHtmlString SetPageTitle(this HtmlHelper<dynamic> helper, string title, bool onlyIfEmpty = false)
		{
			if (!helper.ViewContext.HttpContext.Items.Contains(PageTitleKey))
			{
				helper.ViewContext.HttpContext.Items[PageTitleKey] = string.Empty;
			}

			if (!onlyIfEmpty || string.IsNullOrEmpty((string)helper.ViewContext.HttpContext.Items[PageTitleKey]))
			{
				//build the page title by appending the current Agility Page 

				helper.ViewContext.HttpContext.Items[PageTitleKey] = title;
			}

			return new MvcHtmlString(string.Empty);
		}

		public static IHtmlString GetPageTitle(this HtmlHelper<dynamic> helper)
		{
			string title = helper.ViewContext.HttpContext.Items[PageTitleKey] as string;
			if (!string.IsNullOrEmpty(title))
			{
				title = title.Replace("<br/>", " - ");
			}
			return new MvcHtmlString(title);
		}

        

        private const string HttpMetaKey = "MetaTags";

        public static void SetHttpMetaVariable(string name, string value)
        {

            Dictionary<string, string> metaDictionary = HttpContext.Current.Items[HttpMetaKey] as Dictionary<string, string>;
            if (metaDictionary == null)
            {
                metaDictionary = new Dictionary<string, string>();
                HttpContext.Current.Items[HttpMetaKey] = metaDictionary;

            }

            metaDictionary[name] = value;
        }

        public static IHtmlString GetHttpMetaVariables(this HtmlHelper helper)
        {
            StringBuilder sb = new StringBuilder();
            Dictionary<string, string> ogDictionary = HttpContext.Current.Items[HttpMetaKey] as Dictionary<string, string>;
            if (ogDictionary != null)
            {
                foreach (string key in ogDictionary.Keys)
                {
                    string val = ogDictionary[key];
                    if (string.IsNullOrWhiteSpace(val)) continue;
                    sb.Append(string.Format("<meta name=\"{0}\" content=\"{1}\" />", key, val.Replace("\"", "'")));
                }
            }


            return new MvcHtmlString(sb.ToString());
        }

        
	}
}