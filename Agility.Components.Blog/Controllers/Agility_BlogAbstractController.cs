using Agility.Components.Blog.Classes;
using Agility.Web;
using Agility.Web.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Agility.Components.Blog.Controllers
{
    public class Agility_BlogAbstractController : Controller
    {

        protected override void OnActionExecuting(ActionExecutingContext filterContext)
        {
            base.OnActionExecuting(filterContext);
            AgilityComponents.EnsureBaseCSSLoaded();
            BlogUtils.EnsureBlogCSSLoaded();
            BlogUtils.EnsureBlogJSLoaded();
        }

    }
}
