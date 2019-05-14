using Agility.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Agility.Components.Blog.ViewModels
{
    public class PostViewModel
    {
        public AgilityContentItem Configuration { get; set; }
        public AgilityContentItem Post { get; set; }
        public AgilityContentItem CurrentCategory { get; set; }
        public List<AgilityContentItem> RelatedPosts { get; set; }
        public AgilityContentItem Module { get; set; }
        public List<AgilityContentItem> Categories { get; set; }
        public List<AgilityContentItem> Tags { get; set; }
        public int OverrideExcerptLength { get; set; }
        public int ListedImageHeight { get; set; }
        public int ListedImageWidth { get; set; }
    }
}
