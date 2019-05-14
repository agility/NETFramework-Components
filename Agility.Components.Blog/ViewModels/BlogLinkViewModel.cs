using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using Agility.Web;

namespace Agility.Components.Blog.ViewModels
{
    public class BlogLinkViewModel
    {
        public List<BlogLinkItem> Items { get; set; }
        public AgilityContentItem Configuration { get; set; }
        public bool ShowCount { get; set; }
        public bool SkipZeroPosts { get; set; }
    }

    public class BlogLinkItem
    {
        public string Title { get; set; }
        public string Url { get; set; }
        public int PostCount { get; set; }

        public string Excerpt { get; set; }

        public string ImageUrl { get; set; }

        public string ImageLabel { get; set; }
    }
}
