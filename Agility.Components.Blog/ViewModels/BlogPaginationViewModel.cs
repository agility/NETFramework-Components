using Agility.Components.Blog.Classes;
using Agility.Web;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web;

namespace Agility.Components.Blog.ViewModels
{

    public class BlogPaginationViewModel
    {

        public BlogPaginationViewModel(int pageNumber,
            int pageSize,
            int totalCount,
            bool showLastPage,
            int lengthOfPager = 5,
            string queryStringParam = "page",
            string activeClass = "active",
            string disabledClass = "disabled",
            string nextLabel = "Next",
            string prevLabel = "Previous"
            )
        {
            Page = pageNumber;
            PageSize = pageSize;
            TotalCount = totalCount;
            NumberOfPages = (int)Math.Ceiling((double)TotalCount / PageSize);
            LengthOfPager = lengthOfPager;
            QueryStringParam = queryStringParam;
            ActiveClass = activeClass;
            DisabledClass = disabledClass;
            NextLabel = nextLabel;
            PreviousLabel = prevLabel;
            ShowLastPage = showLastPage;
            
            //set start and end range indexes
            double result = (double)Page / LengthOfPager;
            StartRangeIndex = (int)(Math.Floor(result) * LengthOfPager);

            if (Page % LengthOfPager == LengthOfPager)
            {
                StartRangeIndex = StartRangeIndex + LengthOfPager;
            }

            if (StartRangeIndex == 0)
            {
                StartRangeIndex = 1;
            }

            EndRangeIndex = StartRangeIndex + (LengthOfPager - 1);

            //set rel/prev for seo
            string relPrev = "";
            if (Page > 1)
            {
                relPrev = string.Format("<link rel=\"prev\" href=\"{0}\" />", BlogUtils.GetPagedUrl(QueryStringParam, Page -1, true));
            }

            if (Page != NumberOfPages && NumberOfPages != 0)
            {
                if (relPrev.Length > 0) relPrev += Environment.NewLine;
                relPrev += string.Format("<link rel=\"next\" href=\"{0}\" />", BlogUtils.GetPagedUrl(QueryStringParam, Page + 1, true));
            }

            AgilityContext.Page.MetaTagsRaw += relPrev;

        }

        public int NumberOfPages { get; set; }
        public int TotalCount { get; set; }
        public int PageSize { get; set; }
        public int Page { get; set; }
        public int LengthOfPager { get; set; }
        public int StartRangeIndex { get; set; }
        public int EndRangeIndex { get; set; }
        public string QueryStringParam { get; set; }
        public string ActiveClass { get; set; }
        public string DisabledClass { get; set; }
        public string NextLabel { get; set; }
        public string PreviousLabel { get; set; }
        public bool ShowLastPage { get; set; }
    }
}
