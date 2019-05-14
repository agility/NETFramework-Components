using Agility.Components.Blog.Classes;
using Agility.Web;
using Agility.Web.Objects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Agility.Components.Blog.Extensions
{
    public static class AgilityContentItemExtensions
    {
        public static string BlogDynamicUrl(this AgilityContentItem item, AgilityContentItem blogConfig, AgilityContentItem currentBlogCategory = null)
        {
            string url = "";
            string nestedDynamicPageUrl = "";

            if (item.IsBlogPost())
            {
                /*
                 * Determine if we have a current blog category (i.e. from category landing pages), use that to route the post
                 * If no current blog category set, use canonical category as main url
                 * If post has no category associated at all, use default post details route (without category)
                 */

                AgilityContentItem category = null;
                if (currentBlogCategory == null)
                {
                    //use the canonical category (first category = canonical category)
                    category = BlogUtils.GetItemsByIDs(item["Categories"], item["CategoriesIDs"]).FirstOrDefault();

                } else {
                    category = currentBlogCategory;
                }

                //no category set - use default route
                if (category == null)
                {
                    url = BlogContext.GetDynamicDefaultBlogPostPath(blogConfig);
                }
                else
                {
                    url = BlogContext.GetDynamicCategoryBlogPostPath(blogConfig, category);
                    nestedDynamicPageUrl = BlogContext.GetDynamicCategoryBlogPostPath(blogConfig, category, true);
                }

            }

            if (item.IsBlogAuthor())
            {
                url = BlogContext.GetDynamicBlogAuthorPath(blogConfig);
            }

            if (item.IsBlogCategory())
            {
                url = BlogContext.GetDynamicBlogCategoryPath(blogConfig);
            }

            if (item.IsBlogTag())
            {
                url = BlogContext.GetDynamicBlogTagPath(blogConfig);
            }

            if (string.IsNullOrEmpty(url))
            {
                return "";
            }

            DynamicPageItem d = Data.GetDynamicPageItem(url, item.ReferenceName, item.Row); //must get dynamic page using static paths (no nested dynamic names that have been already formulated)

            if (!string.IsNullOrEmpty(nestedDynamicPageUrl))
            {
                url = nestedDynamicPageUrl; // do the string replacement using the dynamic formulized route
            }

            url = string.Format("{0}/{1}", url.Substring(0, url.LastIndexOf('/')), d.Name).ToLowerInvariant();

            return url;
        }

        public static bool IsBlogPost(this AgilityContentItem item)
        {
            return item.ReferenceName.EndsWith("BlogPosts");
        }

        public static bool IsBlogCategory(this AgilityContentItem item)
        {
            return item.ReferenceName.EndsWith("BlogCategories");
        }

        public static bool IsBlogTag(this AgilityContentItem item)
        {
            return item.ReferenceName.EndsWith("BlogTags");
        }

        public static bool IsBlogAuthor(this AgilityContentItem item)
        {
            return item.ReferenceName.EndsWith("BlogAuthors");
        }

    }
}
