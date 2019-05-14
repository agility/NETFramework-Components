using Agility.Web;
using Agility.Web.Extensions;
using Agility.Web.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Runtime.Serialization;
using System.Globalization;
using Agility.Components.Blog.Classes;
using System.Text;
using Agility.Components.Blog.ViewModels;
using Agility.Components.Blog.Extensions;
using Agility.Web.Objects;
using Agility.Web.Components;

namespace Agility.Components.Blog.Controllers
{
    public class Agility_BlogController : Agility_BlogAbstractController
    {

        public ActionResult BlogListing(AgilityContentItem module)
        {
            HttpContext.Response.Cache.VaryByParams["month"] = true;
            HttpContext.Response.Cache.VaryByParams[BlogContext.PagingQueryStringKey] = true;

            /*
             * check querystrings for filtering by "month"
             * check module for any specific filters being set (by category(s) or by tag(s))
             * check current dynamic page item and identify if its a category or tag, if so override any previous filter
             * get all blog posts by passing in filter and paging logic
             * create a viewmodel that contains posts, the module, and blog configuration
             * return partial view in inline code or local files (dependant on setting in BlogUtils)
             */

            #region --- Get Blog Config and Repos ---
            var blogConfigRef = module["BlogConfiguration"] as string;
            AgilityContentItem blogConfig = null;
            IAgilityContentRepository<AgilityContentItem> blogPosts = null;
            IAgilityContentRepository<AgilityContentItem> blogCategories = null;
            IAgilityContentRepository<AgilityContentItem> blogTags = null;
            IAgilityContentRepository<AgilityContentItem> blogAuthors = null;
            BlogUtils.GetBlogConfig(blogConfigRef, out blogConfig, out blogPosts, out blogCategories, out blogTags, out blogAuthors);
            #endregion

            #region --- Determine Filters ---
            DateTime filterMonth = DateTime.MinValue;
            var categories = new List<AgilityContentItem>();
            var tags = new List<AgilityContentItem>();

            //check for month
            string monthQS = Request.QueryString["month"] as string; //look for month=05-2015
            if (!string.IsNullOrEmpty(monthQS))
            {
                try
                {
                    filterMonth = DateTime.ParseExact(monthQS, "MM-yyyy", CultureInfo.InvariantCulture);
                }
                catch (FormatException ex)
                {
                    Agility.Web.Tracing.WebTrace.WriteInfoLine(ex.ToString());
                }
            }

            //check for dynamic item
            var dynamicItem = ResolveBlogCategory();
            var node = SiteMap.CurrentNode;
            if (dynamicItem != null)
            {
                if (dynamicItem.IsBlogTag())
                {
                    tags.Add(dynamicItem);
                }
                else if (dynamicItem.IsBlogCategory())
                {
                    categories.Add(dynamicItem);
                }
                else
                {
                    //this is on some other dynamic page item, ignore it
                    dynamicItem = null;
                }
            }


            //skip module settings if we have a dynamic item set, else check
            if (dynamicItem == null)
            {
                string categoryIDs = module["FilterByCategoriesIDs"] as string;
                string tagsIDs = module["FilterByTagsIDs"] as string;

                if (!string.IsNullOrEmpty(categoryIDs))
                {
                    var categoriesFromModule = blogCategories.GetByIDs(categoryIDs);
                    if (categoriesFromModule != null && categoriesFromModule.Any())
                    {
                        categories.AddRange(categoriesFromModule);
                    }
                }

                if (!string.IsNullOrEmpty(tagsIDs))
                {
                    var tagsFromModule = blogTags.GetByIDs(tagsIDs);
                    if (tagsFromModule != null && tagsFromModule.Any())
                    {
                        tags.AddRange(tagsFromModule);
                    }
                }
            }
            string dateFilter = "";
            if (filterMonth != DateTime.MinValue)
            {
                dateFilter = BlogUtils.GetSqlBetweenMonthRangeStatement("Date", filterMonth);
            }
            #endregion --- End Determine Filters ---

            #region --- Get Posts and set Pagination ---
            int pageSize = 10;
            int.TryParse(string.Format("{0}", module["PageSize"]), out pageSize);
            if(pageSize < 1) pageSize = 10;
            int pageNumber = 1;
            int.TryParse(Request.QueryString[BlogContext.PagingQueryStringKey] as string, out pageNumber);
            if (pageNumber < 1) pageNumber = 1;
            int skip = (pageNumber * pageSize) - pageSize;
            int totalCount = 0;

            //get the posts
            List<AgilityContentItem> posts = BlogUtils.GetPosts(blogPosts, null, null, categories, tags, dateFilter, "Date Desc", pageSize, skip, out totalCount);
            var pagination = new BlogPaginationViewModel(pageNumber, pageSize, totalCount, true, 5, BlogContext.PagingQueryStringKey, "agility-active", "agility-disabled");
            #endregion

            #region --- Set Title ---
            //cannot set Page Title from child controller action and no way of knowing how the website layout is setting the title...
            //best we can do is utilize the Page Title from the Dynamic Page settings and set the <h1> on the module
            string title = module["DefaultTitle"] as string;
            if (dynamicItem != null)
            {
                title = dynamicItem["Title"] as string;
            }
            if (filterMonth != DateTime.MinValue)
            {
                if (!string.IsNullOrEmpty(title))
                {
                    title += ": ";
                }
                title += filterMonth.ToString("MMMM yyyy");
            }
            #endregion

            #region --- Set ViewModel ---
            var model = new BlogListingViewModel();
            model.Module = module;
            model.Posts = posts;
            model.Title = title;
            model.Configuration = blogConfig;
            model.CurrentCategory = categories.FirstOrDefault();
            model.Pagination = pagination;
            #endregion

            return PartialView(AgilityComponents.TemplatePath("Blog-ListingModule"), model);
        }

        public ActionResult BlogDetails(AgilityContentItem module)
        {
            #region --- Get Blog Config and Repos ---
            var blogConfigRef = module["BlogConfiguration"] as string;
            AgilityContentItem blogConfig = null;
            IAgilityContentRepository<AgilityContentItem> blogPosts = null;
            IAgilityContentRepository<AgilityContentItem> blogCategories = null;
            IAgilityContentRepository<AgilityContentItem> blogTags = null;
            IAgilityContentRepository<AgilityContentItem> blogAuthors = null;
            BlogUtils.GetBlogConfig(blogConfigRef, out blogConfig, out blogPosts, out blogCategories, out blogTags, out blogAuthors);
            #endregion

            #region --- Resolve Dynamic Post and Category (if any) ---

            var post = ResolveBlogPostDetails();

            if (post == null || !post.IsBlogPost()) {
                Agility.Web.Tracing.WebTrace.WriteErrorLine("Cannot resolve current dynamic item to a Blog Posts.");
                return null;
            }

            var currentNode = SiteMap.CurrentNode;
            AgilityContentItem currentCategory = null;
            if (currentNode != null && currentNode.ParentNode != null)
            {
                currentCategory = AgilityContext.GetDynamicPageItem<AgilityContentItem>(currentNode.ParentNode);
            }

            //only set category if the parent dynamic item is a category
            if (currentCategory != null && !currentCategory.IsBlogCategory())
            {
                currentCategory = null;
            }
            #endregion


            #region --- Get Related Posts ---
            int relatedPostsLimit;
            int.TryParse(string.Format("{0}", module["RelatedPostsLimit"]), out relatedPostsLimit);
            if (relatedPostsLimit < 0) {
                relatedPostsLimit = 0;
            }
            var relatedPosts = BlogUtils.GetRelatedPosts(post, blogPosts, true, relatedPostsLimit);
            #endregion

            #region --- Set SEO Properties ---
            string canonicalUrl = post.BlogDynamicUrl(blogConfig, currentCategory);
            AgilityContext.CanonicalLink = BlogUtils.GetAbsoluteUrl(canonicalUrl);
            
            //Enables image for twitter cards - but twitter cards need to be enabled ...
            //to enable twitter cards include setting in app settings in web.config
            AgilityContext.FeaturedImageUrl = BlogUtils.GetPostImageUrl(blogConfig, post, PostImageType.Details);

            if (string.IsNullOrEmpty(AgilityContext.Page.MetaTags))
            {
                AgilityContext.Page.MetaTags = Server.HtmlEncode(BlogUtils.GetPostDescription(post, "Excerpt", 255, true));
            }

            string websiteName = blogConfig["WebsiteName"] as string;
            if (string.IsNullOrEmpty(websiteName)) websiteName = AgilityContext.WebsiteName;
            AgilityContext.Page.MetaTagsRaw += string.Format(
                    "{6}" + 
                    "<meta property='og:title' content='{0}' />" +
                    "<meta property='og:type' content='{1}' />" +
                    "<meta property='og:url' content='{2}' />" +
                    "<meta property='og:image' content='{3}' />" +
                    "<meta property='og:site_name' content='{4}' />" +
                    "<meta property='og:description' content='{5}' />",
                    Server.HtmlEncode(AgilityContext.Page.Title),
                    "article",
                    Request.Url.ToString(),
                    BlogUtils.GetPostImageUrl(blogConfig, post, PostImageType.Details),
                    websiteName,
                    Server.HtmlEncode(AgilityContext.Page.MetaTags),
                    Environment.NewLine
                );
            #endregion

            #region --- Set ViewModel ---
            var model = new PostViewModel();
            model.Configuration = blogConfig;
            model.Post = post;
            model.RelatedPosts = relatedPosts;
            model.CurrentCategory = currentCategory;
            model.Module = module;
            model.Categories = BlogUtils.GetItemsByIDs(blogCategories.ContentReferenceName, post["CategoriesIDs"]);;
            model.Tags = BlogUtils.GetItemsByIDs(blogTags.ContentReferenceName, post["BlogTagsIDs"]);;
            #endregion

            return PartialView(AgilityComponents.TemplatePath("Blog-PostDetailsModule"), model);
        }

        public ActionResult BlogCategories(AgilityContentItem module)
        {
            #region --- Get Blog Config and Repos ---
            var blogConfigRef = module["BlogConfiguration"] as string;
            AgilityContentItem blogConfig = null;
            IAgilityContentRepository<AgilityContentItem> blogPosts = null;
            IAgilityContentRepository<AgilityContentItem> blogCategories = null;
            IAgilityContentRepository<AgilityContentItem> blogTags = null;
            IAgilityContentRepository<AgilityContentItem> blogAuthors = null;
            BlogUtils.GetBlogConfig(blogConfigRef, out blogConfig, out blogPosts, out blogCategories, out blogTags, out blogAuthors);
            #endregion

            var model = new BlogLinkViewModel();
            model.ShowCount = BlogUtils.GetBool(blogConfig["ShowPostCounts"]);
            model.Items = BlogUtils.GetBlogLinksWithPostCounts(blogConfig, blogPosts, blogCategories, model.ShowCount);
            model.Configuration = blogConfig;

            return PartialView(AgilityComponents.TemplatePath("Blog-CategoriesModule"), model);
        }

        public ActionResult BlogHistory(AgilityContentItem module)
        {
            #region --- Get Blog Config and Repos ---
            var blogConfigRef = module["BlogConfiguration"] as string;
            AgilityContentItem blogConfig = null;
            IAgilityContentRepository<AgilityContentItem> blogPosts = null;
            IAgilityContentRepository<AgilityContentItem> blogCategories = null;
            IAgilityContentRepository<AgilityContentItem> blogTags = null;
            IAgilityContentRepository<AgilityContentItem> blogAuthors = null;
            BlogUtils.GetBlogConfig(blogConfigRef, out blogConfig, out blogPosts, out blogCategories, out blogTags, out blogAuthors);
            #endregion

            int numMonthsToDisplay;
            int.TryParse(string.Format("{0}", blogConfig["BlogHistoryMonthsMax"]), out numMonthsToDisplay);

            if (numMonthsToDisplay < 1)
            {
                numMonthsToDisplay = 12;
            }

            var months = new List<DateTime>();
            for (var i = 0; i < numMonthsToDisplay; i++)
            {
                var month = DateTime.Now.AddMonths(-i);
                months.Add(month);
            }

            var model = new BlogLinkViewModel();
            model.ShowCount = model.ShowCount = BlogUtils.GetBool(blogConfig["ShowPostCounts"]);
            model.Items = BlogUtils.GetBlogLinksWithPostCounts(blogConfig, blogPosts, months, model.ShowCount);
            model.SkipZeroPosts = true;
            model.Configuration = blogConfig;

            return PartialView(AgilityComponents.TemplatePath("Blog-HistoryModule"), model);
        }

        public ActionResult BlogRecent(AgilityContentItem module)
        {
            #region --- Get Blog Config and Repos ---
            var blogConfigRef = module["BlogConfiguration"] as string;
            AgilityContentItem blogConfig = null;
            IAgilityContentRepository<AgilityContentItem> blogPosts = null;
            IAgilityContentRepository<AgilityContentItem> blogCategories = null;
            IAgilityContentRepository<AgilityContentItem> blogTags = null;
            IAgilityContentRepository<AgilityContentItem> blogAuthors = null;
            BlogUtils.GetBlogConfig(blogConfigRef, out blogConfig, out blogPosts, out blogCategories, out blogTags, out blogAuthors);
            #endregion

            int recentPostsLimit;
            int.TryParse(string.Format("{0}", blogConfig["RecentPostsMax"]), out recentPostsLimit);

            if (recentPostsLimit < 1)
            {
                recentPostsLimit = 12;
            }

            var posts = BlogUtils.GetPosts(blogPosts, "", "Date Desc", recentPostsLimit, 0);

            var model = new BlogLinkViewModel();
            model.ShowCount = false;
            model.Items = posts.Select(i => new BlogLinkItem()
            {
                Title = i["Title"] as string,
                Url = i.BlogDynamicUrl(blogConfig, null),
                Excerpt = BlogUtils.GetPostDescription(i, "Excerpt", blogConfig["AutoExcerptLength"])
            }).ToList();
            model.Configuration = blogConfig;

            return PartialView(AgilityComponents.TemplatePath("Blog-RecentPostsModule"), model);
        }

        public ActionResult BlogTags(AgilityContentItem module)
        {
            #region --- Get Blog Config and Repos ---
            var blogConfigRef = module["BlogConfiguration"] as string;
            AgilityContentItem blogConfig = null;
            IAgilityContentRepository<AgilityContentItem> blogPosts = null;
            IAgilityContentRepository<AgilityContentItem> blogCategories = null;
            IAgilityContentRepository<AgilityContentItem> blogTags = null;
            IAgilityContentRepository<AgilityContentItem> blogAuthors = null;
            BlogUtils.GetBlogConfig(blogConfigRef, out blogConfig, out blogPosts, out blogCategories, out blogTags, out blogAuthors);
            #endregion

            var model = new BlogLinkViewModel();
            model.ShowCount = BlogUtils.GetBool(blogConfig["ShowPostCounts"]);
            model.Items = BlogUtils.GetBlogLinksWithPostCounts(blogConfig, blogPosts, blogTags, model.ShowCount);
            model.Configuration = blogConfig;

            return PartialView(AgilityComponents.TemplatePath("Blog-TagsModule"), model);
        }

        public ActionResult BlogAuthorDetails(AgilityContentItem module)
        {
            HttpContext.Response.Cache.VaryByParams[BlogContext.PagingQueryStringKey] = true;

            #region --- Get Blog Config and Repos ---
            var blogConfigRef = module["BlogConfiguration"] as string;
            AgilityContentItem blogConfig = null;
            IAgilityContentRepository<AgilityContentItem> blogPosts = null;
            IAgilityContentRepository<AgilityContentItem> blogCategories = null;
            IAgilityContentRepository<AgilityContentItem> blogTags = null;
            IAgilityContentRepository<AgilityContentItem> blogAuthors = null;
            BlogUtils.GetBlogConfig(blogConfigRef, out blogConfig, out blogPosts, out blogCategories, out blogTags, out blogAuthors);
            #endregion

            var author = AgilityContext.GetDynamicPageItem<AgilityContentItem>();
            if (!author.IsBlogAuthor()) return null;


            #region --- Get Posts and set Pagination ---
            List<AgilityContentItem> posts = null;
            BlogPaginationViewModel pagination = null;

            if (BlogUtils.GetBool(module["DisplayRecentBlogPosts"]))
            {
                int pageSize = 10;
                int.TryParse(string.Format("{0}", module["PageSize"]), out pageSize);
                if (pageSize < 1) pageSize = 10;
                int pageNumber = 1;
                int.TryParse(Request.QueryString[BlogContext.PagingQueryStringKey] as string, out pageNumber);
                if (pageNumber < 1) pageNumber = 1;
                int skip = (pageNumber * pageSize) - pageSize;
                int totalCount = 0;

                //get the posts
                posts = BlogUtils.GetPosts(blogPosts, author.ContentID, "", "", "", "", "Date Desc", pageSize, skip, out totalCount);
                pagination = new BlogPaginationViewModel(pageNumber, pageSize, totalCount, true, 5, BlogContext.PagingQueryStringKey, "agility-active", "agility-disabled");
            }
            #endregion

            var model = new BlogAuthorViewModel();
            model.Author = author;
            model.Posts = posts;
            model.Module = module;
            model.Configuration = blogConfig;
            model.Pagination = pagination;

            return PartialView(AgilityComponents.TemplatePath("Blog-AuthorDetailsModule"), model);
        }

        public ActionResult FeaturedBlogPost(AgilityContentItem module)
        {
            #region --- Get Blog Config and Repos ---
            var blogConfigRef = module["BlogConfiguration"] as string;
            AgilityContentItem blogConfig = null;
            IAgilityContentRepository<AgilityContentItem> blogPosts = null;
            IAgilityContentRepository<AgilityContentItem> blogCategories = null;
            IAgilityContentRepository<AgilityContentItem> blogTags = null;
            IAgilityContentRepository<AgilityContentItem> blogAuthors = null;
            BlogUtils.GetBlogConfig(blogConfigRef, out blogConfig, out blogPosts, out blogCategories, out blogTags, out blogAuthors);
            #endregion

            string postIDs = module["PostIDs"] as string;
            var post = BlogUtils.GetItemsByIDs(blogPosts.ContentReferenceName, postIDs).FirstOrDefault();

            if (post == null) return null;

            var model = new PostViewModel();
            model.Configuration = blogConfig;
            model.Post = post;

            return PartialView(AgilityComponents.TemplatePath("Blog-FeaturedPostModule"), model);
        }

        protected virtual AgilityContentItem ResolveBlogPostDetails()
        {
            var post = AgilityContext.GetDynamicPageItem<AgilityContentItem>();

            return post;
        }

        protected virtual AgilityContentItem ResolveBlogCategory()
        {
            var post = AgilityContext.GetDynamicPageItem<AgilityContentItem>();

            return post;
        }
    }
}
