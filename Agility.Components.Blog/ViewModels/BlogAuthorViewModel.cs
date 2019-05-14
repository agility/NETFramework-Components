using Agility.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Agility.Components.Blog.ViewModels
{
    public class BlogAuthorViewModel
    {
        public AgilityContentItem Author { get; set; }
        public List<AgilityContentItem> Posts { get; set; }
        public BlogPaginationViewModel Pagination { get; set; }
        public AgilityContentItem Configuration { get; set; }
        public AgilityContentItem Module { get; set; }
    }
}
