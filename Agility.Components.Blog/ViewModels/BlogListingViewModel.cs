using Agility.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Agility.Components.Blog.ViewModels
{
    public class BlogListingViewModel
    {
        public string Title { get; set; }
        public AgilityContentItem Module { get; set; }
        public List<AgilityContentItem> Posts { get; set; }
        public AgilityContentItem Configuration { get; set; }
        public AgilityContentItem CurrentCategory { get; set; }
        public BlogPaginationViewModel Pagination { get; set; }
    }
}
