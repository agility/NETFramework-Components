using Agility.Components.Blog.Classes;
using Agility.Web;
using Agility.Web.Objects;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Agility.Components.Blog.ViewModels
{
    public class PostImageViewModel
    {
        public AgilityContentItem Configuration { get; set; }
        public AgilityContentItem Post { get; set; }
        public PostImageType Type { get; set; }
        public int Width { get; set; }
        public int Height { get; set; }
    }
}
