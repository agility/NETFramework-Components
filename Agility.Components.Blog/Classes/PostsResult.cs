using Agility.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Agility.Components.Blog.Classes
{
    public class PostsResult
    {
        public List<AgilityContentItem> Posts { get; set; }
        public int TotalCount { get; set; }
    }
}
