using Agility.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace Agility.Components.Blog.Classes
{
    public static class BlogContext
    {

        public static string DefaultRootPage = "~/blog";

        public static string GetBlogRootPath(AgilityContentItem blogConfig)
        {
            string rootPage = Data.UrlEval(blogConfig["RootPage"] as string, "url");
            if (string.IsNullOrEmpty(rootPage))
            {
                rootPage = DefaultRootPage;
            }
            return rootPage;
        }

        public static string GetDynamicBlogCategoryPath(AgilityContentItem blogConfig)
        {
            return string.Format("{0}/category-details", GetBlogRootPath(blogConfig));
        }

        public static string GetDynamicDefaultBlogPostPath(AgilityContentItem blogConfig)
        {
            return string.Format("{0}/post/post-details", GetBlogRootPath(blogConfig));
        }

        public static string GetDynamicCategoryBlogPostPath(AgilityContentItem blogConfig, AgilityContentItem category, bool includeDynamicCategoryNameInPath = false)
        {
            string url = "";
            string categoryPath = GetDynamicBlogCategoryPath(blogConfig);

            if (includeDynamicCategoryNameInPath)
            {
                var d = Data.GetDynamicPageItem(GetDynamicBlogCategoryPath(blogConfig), category.ReferenceName, category.Row);

                if (d != null)
                {
                    categoryPath = string.Format(
                        "{0}/{1}",
                        categoryPath.Substring(0, categoryPath.LastIndexOf('/')), d.Name).ToLowerInvariant();
                }
            }

            url = string.Format("{0}/post-details", categoryPath);

            return url;
        }

        public static string GetDynamicBlogAuthorPath(AgilityContentItem blogConfig)
        {
            return string.Format("{0}/author/author-details", GetBlogRootPath(blogConfig));
        }

        public static string GetDynamicBlogTagPath(AgilityContentItem blogConfig)
        {
            return string.Format("{0}/tag/tag-details", GetBlogRootPath(blogConfig));
        }

        public static string PagingQueryStringKey = "b_page";

       

        public static string BlogCSSContextKey = "Agility.Components.Blog.CSS";
        public static bool BlogCSSLoaded
        {
            get
            {
                bool isLoaded;
                bool.TryParse(string.Format("{0}", HttpContext.Current.Items[BlogCSSContextKey]), out isLoaded);
                return isLoaded;
            }
            set
            {
                HttpContext.Current.Items[BlogCSSContextKey] = value;
            }
        }

        public static string BlogJSContextKey = "Agility.Components.Blog.JS";
        public static bool BlogJSLoaded
        {
            get
            {
                bool isLoaded;
                bool.TryParse(string.Format("{0}", HttpContext.Current.Items[BlogJSContextKey]), out isLoaded);
                return isLoaded;
            }
            set
            {
                HttpContext.Current.Items[BlogJSContextKey] = value;
            }
        }
    }
}
