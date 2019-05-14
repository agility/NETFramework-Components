using Agility.Components.Comments.Classes;
using Agility.Web;
using Agility.Web.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Agility.Components.Comments.Controllers
{
    public class Agility_CommentsAbstractController : Controller
    {

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
            AgilityComponents.EnsureBaseCSSLoaded();
            CommentsUtils.EnsureCommentsCSSLoaded();
            CommentsUtils.EnsureCommentsJSLoaded();
        }

    }
}
