using Agility.Web;
using Agility.Web.Extensions;
using Agility.Web.Objects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;
using System.Web.Mvc;
using Agility.Components.Blog.Extensions;
using Agility.Web.Utils;
using Agility.Web.Components;
using Agility.Components.Blog.ViewModels;
using Agility.UGC.API.WCF.AgilityUGC;
using Agility.UGC.API.WCF;

namespace Agility.Components.Blog.Classes
{
    public static class BlogUtils
    {

        public static void EnsureBlogCSSLoaded()
        {
            if (!BlogContext.BlogCSSLoaded)
            {
                if (AgilityContext.Page != null)
                {
                    AgilityContext.Page.MetaTagsRaw += string.Format("{0}{1}", Environment.NewLine, AgilityComponents.CSS("blog"));
                    BlogContext.BlogCSSLoaded = true;
                }
            }
        }

        public static void EnsureBlogJSLoaded()
        {
            if (!BlogContext.BlogJSLoaded)
            {
                if (AgilityContext.Page != null)
                {
                    AgilityContext.Page.CustomAnalyticsScript += string.Format("{0}{1}", Environment.NewLine, AgilityComponents.JS("blog"));
                    BlogContext.BlogJSLoaded = true;
                }
            }
        }

        
        public static AgilityContentItem GetBlogConfig(string blogConfigReferenceName)
        {
            AgilityContentItem blogConfig = null;
            IAgilityContentRepository<AgilityContentItem> blogPosts = null;
            IAgilityContentRepository<AgilityContentItem> blogCategories = null;
            IAgilityContentRepository<AgilityContentItem> blogTags = null;
            IAgilityContentRepository<AgilityContentItem> blogAuthors = null;

            GetBlogConfig(blogConfigReferenceName,out blogConfig, out blogPosts, out blogCategories, out blogTags, out blogAuthors);
            return blogConfig;
        }

        public static void GetBlogConfig(
            string blogConfigReferenceName,
            out AgilityContentItem blogConfig,
            out IAgilityContentRepository<AgilityContentItem> blogPosts,
            out IAgilityContentRepository<AgilityContentItem> blogCategories,
            out IAgilityContentRepository<AgilityContentItem> blogTags,
            out IAgilityContentRepository<AgilityContentItem> blogAuthors) 
        {
            blogConfig = new AgilityContentRepository<AgilityContentItem>(blogConfigReferenceName).Item("");

            string blogPostsRef = blogConfig["BlogPosts"] as string;
            blogPosts = new AgilityContentRepository<AgilityContentItem>(blogPostsRef);

            string blogCategoriesRef = blogConfig["BlogCategories"] as string;
            blogCategories = new AgilityContentRepository<AgilityContentItem>(blogCategoriesRef);

            string blogTagsRef = blogConfig["BlogTags"] as string;
            blogTags = new AgilityContentRepository<AgilityContentItem>(blogTagsRef);

            string blogAuthorsRef = blogConfig["BlogAuthors"] as string;
            blogAuthors = new AgilityContentRepository<AgilityContentItem>(blogAuthorsRef);
        }

        public static string GetCommaSeperatedIDsFromList(List<AgilityContentItem> lst)
        {
            if (lst == null) return string.Empty;
            List<string> ids = lst.Select(i => i.ContentID.ToString()).ToList();
            if (!ids.Any()) return string.Empty;
            return string.Join(",", ids);
        }

        public static string GetSqlContainsStatement(string fieldName, List<AgilityContentItem> items, char delimiter)
        {
            var values = GetCommaSeperatedIDsFromList(items);
            return GetSqlContainsStatement(fieldName, values, delimiter);
        }

        public static string GetSqlContainsStatement(string fieldName, object obj_values, char delimiter)
        {
            string values = string.Format("{0}", obj_values);
            return GetSqlContainsStatement(fieldName, values, delimiter);
        }


        public static string GetSqlContainsStatement(string fieldName, string commaSeperatedIDs, char delimiter)
        {
            if (string.IsNullOrEmpty(commaSeperatedIDs)) return "";

            List<string> ids = commaSeperatedIDs.Split(',').ToList();
            var sb = new StringBuilder();
            foreach (var value in ids)
            {
                sb.Append(sb.Length > 0 ? " OR " : "");
                sb.Append(string.Format("('{2}'+{0}+'{2}' like '%{2}{1}{2}%')", fieldName, value, delimiter));
            }
            return sb.ToString();
        }

        public static string GetSqlBetweenMonthRangeStatement(string fieldName, DateTime date)
        {
            DateTime startDate = new DateTime(date.Year, date.Month, 1);
            DateTime endDate = startDate.AddMonths(1).AddDays(-1);

            string str = string.Format(
                "{0} >= '{1}' AND {0} <= '{2}'", 
                fieldName, 
                startDate.ToString("yyyy-MM-dd hh:mm:ss"),
                endDate.ToString("yyyy-MM-dd hh:mm:ss"));

            return str;
        }

        public static bool IsAttachmentEmpty(Attachment attachment)
        {
            return attachment == null || string.IsNullOrEmpty(attachment.URL);
        }

        public static bool HasPostImage(AgilityContentItem blogConfig, AgilityContentItem post, PostImageType type)
        {
            return !IsAttachmentEmpty(GetPostImage(blogConfig, post, type));
        }

        public static string GetTranscodedUrl(Attachment attachment, int thumbnailWidth = 0, int thumbnailHeight = 0, int cropType = 0)
        {
            string url = string.Empty;

            if (attachment != null && !string.IsNullOrEmpty(attachment.URL))
            {
                url = attachment.URL;

                if (thumbnailWidth > 0 || thumbnailHeight > 0)
                {
                    url = string.Format("{0}?", url);

                    if (thumbnailWidth > 0)
                    {
                        url = string.Format("{0}w={1}", url, thumbnailWidth);
                    }

                    if (thumbnailHeight > 0)
                    {
                        if (thumbnailWidth > 0)
                        {
                            url = url + "&";
                        }
                        url = string.Format("{0}h={1}", url, thumbnailHeight);
                    }
                    if (cropType > 0)
                    {
                        url = string.Format("{0}&c={1}", url, cropType);
                    }
                }
            }

            return url;
        }

        public static string GetPostImageAlt(AgilityContentItem blogConfig, AgilityContentItem post, PostImageType type) {
            string altText = "";
            var att = GetPostImage(blogConfig, post, type);

            if(att != null) {
                altText = att.Label;
            }

            return altText;
        }

        public static Attachment GetPostImage(AgilityContentItem blogConfig, AgilityContentItem post, PostImageType type) {

            string listingFieldName = "ListingImageOverride";
            string detailsFieldName = "PostImage";
            string defaultFieldName = "DefaultPostImage";
            Attachment att = null;

            if (type.Equals(PostImageType.Listing))
            {
                att = post.GetAttachment(listingFieldName);

                if (att == null)
                {
                    att = post.GetAttachment(detailsFieldName);
                }
            }

            if (type.Equals(PostImageType.Details))
            {
                att = post.GetAttachment(detailsFieldName);
            }


            if (att == null)
            {
                //try to get attachment from default image
                att = blogConfig.GetAttachment(defaultFieldName);
            }

            return att;
        }

        public static string GetPostImageUrl(AgilityContentItem blogConfig, AgilityContentItem post, PostImageType type, int width = 0, int height = 0)
        {
            string url = "";
            var att = GetPostImage(blogConfig, post, type);

            if (att != null)
            {
                url = GetTranscodedUrl(att, width, height);
            }

            return url;
        }

        public static string GetAuthorImageUrl(AgilityContentItem blogConfig, AgilityContentItem author, int width = 0, int height = 0)
        {
            var att = GetAuthorImage(blogConfig, author);
            if (att != null)
            {
                return GetTranscodedUrl(att, width, height);
            }
            else
            {
                return "";
            }
        }

        public static string GetAuthorImageAlt(AgilityContentItem blogConfig, AgilityContentItem author)
        {
            var att = GetAuthorImage(blogConfig, author);
            if (att != null)
            {
                return att.Label;
            }
            else
            {
                return "";
            }
        }

        public static Attachment GetAuthorImage(AgilityContentItem blogConfig, AgilityContentItem author)
        {
            string authorFieldName = "Image";
            string defaultFieldName = "DefaultAuthorImage";
            Attachment att = null;
            att = author.GetAttachment(authorFieldName);
            if (att == null)
            {
                att = blogConfig.GetAttachment(defaultFieldName);
            }

            return att;
        }

        public static AgilityContentItem GetItemByID(object obj_referenceName, object obj_id)
        {
            int id = 0;
            int.TryParse(obj_id.ToString(), out id);
            AgilityContentItem item = null;
            string referenceName = obj_referenceName as string;

            if (id > 0)
            {
                item = GetItemByID(referenceName, id);
            }

            return item;
        }

        public static AgilityContentItem GetItemByID(string referenceName, int id)
        {
            AgilityContentItem item = null;

            if (id > 0)
            {
                item = new AgilityContentRepository<AgilityContentItem>(referenceName).GetByID(id);
            }

            return item;
        }

        public static List<AgilityContentItem> GetItemsByIDs(object obj_referenceName, object obj_commaIDs)
        {
            string referenceName = obj_referenceName as string;
            string commaIDs = obj_commaIDs as string;
            return GetItemsByIDs(referenceName, commaIDs);
        }

        public static List<AgilityContentItem> GetItemsByIDs(string referenceName, string commaIDs)
        {
            List<AgilityContentItem> items = new List<AgilityContentItem>();

            if (!string.IsNullOrEmpty(commaIDs))
            {
                items = new AgilityContentRepository<AgilityContentItem>(referenceName).GetByIDs(commaIDs).ToList();
            }

            return items;
        }

        public static string GetAbsoluteUrl(string relativeUrl)
        {
            if (string.IsNullOrEmpty(relativeUrl))
                return relativeUrl;

            if (HttpContext.Current == null)
                return relativeUrl;

            if (relativeUrl.StartsWith("/"))
                relativeUrl = relativeUrl.Insert(0, "~");
            if (!relativeUrl.StartsWith("~/"))
                relativeUrl = relativeUrl.Insert(0, "~/");

            var url = HttpContext.Current.Request.Url;
            var port = url.Port != 80 ? (":" + url.Port) : String.Empty;

            return String.Format("{0}://{1}{2}{3}",
                url.Scheme, url.Host, port, VirtualPathUtility.ToAbsolute(relativeUrl));
        }

        public static bool GetBool(object obj_bool)
        {
            bool value = false;

            if(obj_bool == null) return false;

            bool.TryParse(obj_bool.ToString(), out value);

            return value;
        }

        public static string GetPostDescription(AgilityContentItem post, string excerptFieldName, object obj_autoExcerptLength, int overrideExcerptLength)
        {
            if (overrideExcerptLength > 0)
            {
                return GetPostDescription(post, excerptFieldName, overrideExcerptLength, true);
            }
            else
            {
                return GetPostDescription(post, excerptFieldName, obj_autoExcerptLength);
            }
        }

        public static string GetPostDescription(AgilityContentItem post, string excerptFieldName, object obj_autoExcerptLength)
        {
            int trimLength;
            int.TryParse(obj_autoExcerptLength as string, out trimLength);
            return GetPostDescription(post, excerptFieldName, trimLength);
        }

        public static string GetPostDescription(AgilityContentItem post, string excerptFieldName, int autoExcerptLength, bool trimExcerpt = false)
        {
            string excerpt = post[excerptFieldName] as string;

            if (autoExcerptLength < 10)
            {
                autoExcerptLength = 160;
            }

            if (string.IsNullOrEmpty(excerpt))
            {
                excerpt = post["Textblob"] as string;
                excerpt = excerpt.Truncate(autoExcerptLength, "...", true, true);
            }
            else if(trimExcerpt)
            {
                excerpt = excerpt.Truncate(autoExcerptLength, "...", true, true);
            }

            return excerpt;
        }

        public static IEnumerable<T> PickRandomItems<T>(IEnumerable<T> list, int maxCount)
        {
            Random random = new Random(DateTime.Now.Millisecond);

            Dictionary<double, T> randomSortTable = new Dictionary<double, T>();

            foreach (var item in list)
            {
                randomSortTable[random.NextDouble()] = item;
            }

            return randomSortTable.OrderBy(KVP => KVP.Key).Take(maxCount).Select(KVP => KVP.Value);
        }


        public static List<AgilityContentItem> GetPosts(IAgilityContentRepository<AgilityContentItem> postsRepo, string filter, string sort, int take, int skip)
        {
            var posts = GetPosts(postsRepo, -1, "", "", "", filter, sort, take, skip);
            return posts;
        }

        public static List<AgilityContentItem> GetPosts(IAgilityContentRepository<AgilityContentItem> postsRepo, int authorID, string postsIDs, string categoriesIDs, string tagsIDs, string appendFilter, string sort, int take, int skip)
        {
            int totalCount;
            var posts = GetPosts(postsRepo, authorID, postsIDs, categoriesIDs, tagsIDs, appendFilter, sort, take, skip, out totalCount);
            return posts;
        }

        public static List<AgilityContentItem> GetPosts(IAgilityContentRepository<AgilityContentItem> postsRepo, AgilityContentItem author, List<AgilityContentItem> posts, List<AgilityContentItem> categories, List<AgilityContentItem> tags, string appendFilter, string sort, int take, int skip, out int totalCount)
        {
            int authorID = 0;
            if (author != null)
            {
                authorID = author.ContentID;
            }
            string postsIDs = GetCommaSeperatedIDsFromList(posts);
            string categoriesIDs = GetCommaSeperatedIDsFromList(categories);
            string tagsIDs = GetCommaSeperatedIDsFromList(tags);

            return GetPosts(postsRepo, authorID, postsIDs, categoriesIDs, tagsIDs, appendFilter, sort, take, skip, out totalCount);
        }

        private static object _getPostsCacheLock = new object();
        public static List<AgilityContentItem> GetPosts(IAgilityContentRepository<AgilityContentItem> postsRepo, int authorID, string postsIDs, string categoriesIDs, string tagsIDs, string appendFilter, string sort, int take, int skip, out int totalCount)
        {
            string cacheKey = string.Format("Agility.Components.Blog.GetPosts_{0}_{1}_{2}_{3}_{4}_{5}_{6}_{7}_{8}", postsRepo.ContentReferenceName, postsIDs, authorID, categoriesIDs, tagsIDs, appendFilter, sort, take, skip);
            PostsResult postsResult = AgilityDependencyCache.Select(cacheKey) as PostsResult;

            if (postsResult != null)
            {
                totalCount = postsResult.TotalCount;
                return postsResult.Posts;
            }

            lock (_getPostsCacheLock)
            {
                if (postsResult != null)
                {
                    totalCount = postsResult.TotalCount;
                    return postsResult.Posts;
                }

                StringBuilder sbFilter = new StringBuilder();
                var posts = new List<AgilityContentItem>();
                if (authorID > 0)
                {
                    sbFilter.AppendFormat("AuthorID = {0}", authorID);
                }

                if (!string.IsNullOrEmpty(postsIDs))
                {
                    if (sbFilter.Length > 0) sbFilter.Append(" AND ");
                    sbFilter.AppendFormat("ContentID in ({0})", postsIDs);
                }

                if (!string.IsNullOrEmpty(categoriesIDs))
                {
                    if (sbFilter.Length > 0) sbFilter.Append(" AND ");
                    sbFilter.Append(BlogUtils.GetSqlContainsStatement("CategoriesIDs", categoriesIDs, ','));
                }

                if (!string.IsNullOrEmpty(tagsIDs))
                {
                    if (sbFilter.Length > 0) sbFilter.Append(" AND ");
                    sbFilter.Append(BlogUtils.GetSqlContainsStatement("BlogTagsIDs", tagsIDs, ','));
                }

                if (!string.IsNullOrEmpty(appendFilter))
                {
                    if (sbFilter.Length > 0) sbFilter.Append(" AND ");
                    sbFilter.Append(appendFilter);
                }

                string rowFilter = sbFilter.ToString();
                posts = postsRepo.Items(rowFilter, sort, take, skip, out totalCount);

                postsResult = new PostsResult();
                postsResult.TotalCount = totalCount;
                postsResult.Posts = posts;

                //cache it, but clear cache when the Blog Post list is changed
                AgilityDependencyCache.Insert(cacheKey, postsResult, new List<string> { postsRepo.ContentReferenceName }, DateTime.Now.AddHours(1));

                return postsResult.Posts;
            }
        }

        public static List<AgilityContentItem> GetRelatedPosts(AgilityContentItem post, IAgilityContentRepository<AgilityContentItem> posts, bool randomize, int limit)
        {
            List<AgilityContentItem> relatedPosts = null;
            int maxLimit = 100;

            switch (post["RelatePostsBy"] as string)
            {
                case "BlogTags":
                    relatedPosts = GetPosts(posts, -1, "", "", post["BlogTagsIDs"] as string, "", "", maxLimit, 0);
                    break;

                case "BlogPosts":
                    string relatedPostsIDs = post["RelatedPostsIDs"] as string;
                    if(!string.IsNullOrEmpty(relatedPostsIDs)) {
                        relatedPosts = GetPosts(posts, -1, relatedPostsIDs, "", "", "", "", maxLimit, 0);
                    }
                    randomize = false;
                    break;

                default:
                    //BlogCategories
                    relatedPosts = GetPosts(posts, -1, "", post["CategoriesIDs"] as string, "", "", "", maxLimit, 0);
                    break;
            }

            //ensure the current post isn't relating to itself
            relatedPosts.RemoveAll(i => i.ContentID == post.ContentID);

            if (randomize) {
                relatedPosts = BlogUtils.PickRandomItems<AgilityContentItem>(relatedPosts, limit).ToList();
            }

            return relatedPosts;
        }

        public static int GetPostCountByDate(IAgilityContentRepository<AgilityContentItem> posts, DateTime month)
        {
            string filter = BlogUtils.GetSqlBetweenMonthRangeStatement("Date", month);
            return GetPostCount(posts, filter);
        }

        public static int GetPostCount(IAgilityContentRepository<AgilityContentItem> posts, string filter = "")
        {
            int count = 0;
            GetPosts(posts, -1, "", "", "", filter, "", 0, 0, out count);
            return count;
        }

        public static int GetPostCount(IAgilityContentRepository<AgilityContentItem> posts, AgilityContentItem item, string appendFilter = "")
        {
            int count = 0;
            
            if (item.IsBlogCategory())
            {
                GetPosts(posts, -1, "", item.ContentID.ToString(), "", appendFilter, "", 0, 0, out count);
            }

            if (item.IsBlogTag())
            {
                GetPosts(posts, -1, "", "", item.ContentID.ToString(), appendFilter, "", 0, 0, out count);
            }

            return count;
        }

        public static string GetPagedUrl(string queryStringParam, int pageNumber, bool useAbsolutePath)
        {
            string url = "";
            var qs = HttpUtility.ParseQueryString(HttpContext.Current.Request.QueryString.ToString());
            qs.Set(queryStringParam, pageNumber.ToString());

            if (pageNumber != 1)
            {
                url = string.Format("{0}?{1}", HttpContext.Current.Request.Path, qs.ToString());
            }
            else
            {
                url = HttpContext.Current.Request.Path;
            }

            if (useAbsolutePath)
            {
                url = GetAbsoluteUrl(url);
            }

            return url;
        }

        private static object _getBlogLinksCountsCacheLock = new object();
        public static List<BlogLinkItem> GetBlogLinksWithPostCounts(AgilityContentItem blogConfig, IAgilityContentRepository<AgilityContentItem> postsRepo, List<DateTime> blogLinksDates, bool getCounts)
        {
            return GetBlogLinksWithPostCounts(blogConfig, postsRepo, null, blogLinksDates, getCounts);
        }
        public static List<BlogLinkItem> GetBlogLinksWithPostCounts(AgilityContentItem blogConfig, IAgilityContentRepository<AgilityContentItem> postsRepo, IAgilityContentRepository<AgilityContentItem> blogLinksRepo, bool getCounts)
        {
            return GetBlogLinksWithPostCounts(blogConfig, postsRepo, blogLinksRepo, null, getCounts);
        }
        public static List<BlogLinkItem> GetBlogLinksWithPostCounts(AgilityContentItem blogConfig, IAgilityContentRepository<AgilityContentItem> postsRepo, IAgilityContentRepository<AgilityContentItem> blogLinksRepo, List<DateTime> blogLinksDates, bool getCounts)
        {
            //blog links can be either Categories or Tags
            var cacheKey = string.Format("Agility.Components.Blog.GetBlogLinksWithPostCounts_{0}_{1}_{2}_{3}", blogConfig.ContentID, postsRepo.ContentReferenceName, (blogLinksRepo != null ? blogLinksRepo.ContentReferenceName : ""), (blogLinksDates != null ? blogLinksDates.Count : 0));
            List<BlogLinkItem> links = HttpContext.Current.Cache[cacheKey] as List<BlogLinkItem>;

            if (links != null)
            {
                return links;
            }

            lock (_getBlogLinksCountsCacheLock)
            {
                if (links != null)
                {
                    return links;
                }

                

                if (blogLinksDates != null && blogLinksDates.Any())
                {
                    links = blogLinksDates.Select(i => new BlogLinkItem()
                    {
                        Title = i.ToString("MMMM yyyy"),
                        Url = string.Format("{0}?month={1}", BlogContext.GetBlogRootPath(blogConfig), i.ToString("MM-yyyy")),
                        PostCount = (getCounts ? BlogUtils.GetPostCountByDate(postsRepo, i) : 0),
                    }).ToList();
                }
                else if(blogLinksRepo != null)
                {
                    var items = blogLinksRepo.Items();
                    links = items.Select(i => new BlogLinkItem()
                    {
                        Title = i["Title"] as string,
                        Url = i.BlogDynamicUrl(blogConfig, null),
                        PostCount = (getCounts ? BlogUtils.GetPostCount(postsRepo, i) : 0),
                        ImageUrl = GetBlogPostListingImageUrl(i),
                        ImageLabel = GetBlogPostListingImageTitle(i),
                        Excerpt = ""

                    }).ToList();
                }

                HttpContext.Current.Cache.Add(cacheKey, links, null, DateTime.Now.AddHours(2), System.Web.Caching.Cache.NoSlidingExpiration, System.Web.Caching.CacheItemPriority.High, null);

                return links;
            }
        }

        public static List<AgilityContentItem> GetMostViewedBlogPosts(IAgilityContentRepository<AgilityContentItem> postsRepo, int take)
        {
            List<AgilityContentItem> posts = new List<AgilityContentItem>();
            try
            {
                using (Agility_UGC_API_WCFClient client = UGCAPIUtil.GetAPIClient("http://ugc.agilitycms.com/agility-ugc-api-wcf.svc", TimeSpan.FromSeconds(10)))
                {

                    DataServiceAuthorization dsa = UGCAPIUtil.GetDataServiceAuthorization(-1);
                    var searchStats = client.GetStats(dsa, "WCM", "PageViews", postsRepo.ContentReferenceName, postsRepo.LanguageCode, -1, DateTime.Now.AddYears(-1), DateTime.Now);
                    var results = searchStats.Items;
                    var postsIDs = results.Take(take).Select(i => i.ItemID.ToString());
                    string postsIDsCommas = string.Join(",", postsIDs);
                    posts = GetPosts(postsRepo, -1, postsIDsCommas, "", "", "", "", take, 0);
                }
            }
            catch(Exception ex)
            {
                Agility.Web.Tracing.WebTrace.WriteException(ex);
                return null;
            }

            return posts;
            
        }

        private static Attachment GetBlogPostListingImage(AgilityContentItem contentItem)
        {
            Attachment resultListingImage = null;

            if (contentItem != null)
            {
                var postImage = contentItem.GetAttachment("PostImage");

                var listingImage = contentItem.GetAttachment("ListingImageOverride");

                resultListingImage = postImage ?? resultListingImage;
            }

            return resultListingImage;
        }

        private static string GetBlogPostListingImageUrl(AgilityContentItem contentItem)
        {
            var url = string.Empty;

            var listingImage = GetBlogPostListingImage(contentItem);

            if (listingImage != null)
            {
                url = listingImage.URL;
            }

            return url;
        }

        private static string GetBlogPostListingImageTitle(AgilityContentItem contentItem)
        {
            var label = string.Empty;

            var listingImage = GetBlogPostListingImage(contentItem);

            if (listingImage != null)
            {
                label = listingImage.Label;
            }

            return label;
        }
    }
}
