using Agility.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace Agility.Components.Comments.ViewModels
{
    public class CommentsViewModel
    {
        public string CommentsRecordTypeName { get; set; }
        public int RelatedContentID { get; set; }
        public AgilityContentItem Config { get; set; }
        public bool FacebookLoginEnabled { get; set; }
        public bool TwitterLoginEnabled { get; set; }
        public bool GuestLoginEnabled { get; set; }
    }
}
