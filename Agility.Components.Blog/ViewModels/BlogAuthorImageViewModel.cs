using Agility.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Agility.Components.Blog.ViewModels
{
    public class BlogAuthorImageViewModel
    {
        public AgilityContentItem Configuration { get; set; }
        public AgilityContentItem Author { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }
}
