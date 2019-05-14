using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace Agility.Components.Comments.Classes
{
    public static class CommentsContext
    {
        public static string CommentsCSSContextKey = "Agility.Components.Comments.CSS";
        public static bool CommentsCSSLoaded
        {
            get
            {
                bool isLoaded;
                bool.TryParse(string.Format("{0}", HttpContext.Current.Items[CommentsCSSContextKey]), out isLoaded);
                return isLoaded;
            }
            set
            {
                HttpContext.Current.Items[CommentsCSSContextKey] = value;
            }
        }

        public static string CommentsJSContextKey = "Agility.Components.Comments.JS";
        public static bool CommentsJSLoaded
        {
            get
            {
                bool isLoaded;
                bool.TryParse(string.Format("{0}", HttpContext.Current.Items[CommentsJSContextKey]), out isLoaded);
                return isLoaded;
            }
            set
            {
                HttpContext.Current.Items[CommentsJSContextKey] = value;
            }
        }
    }
}
