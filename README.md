# Agility .NET Framework Components
This repository represents the source code for the Agility Blog and Comments components. It also contains a sample ASP.NET MVC4 site to illustrate how they interface with a website.

## Demo Website
You can view an example *vanilla* implementation of the Blog and Comments components on this site:
[Demo Site](http://components-blank-mvc-test.stage.publishwithagility.com)

## Requirements
In order to use this, you need:
- An active Agility instance, targeting the ASP.NET MVC Framework
- The required Content/Module Definitions, Pages, and Inline Code files created in your Agility instance - this can be setup for you by contacting *support@agilitycms.com*
- The **Blog Component** depends on a Custom Field Type named *URL*
- The **Website Name** (websiteName) of your Agility instance
- The **Website Security Key** (securityKey) for your Agility instance
- The **Agility UGC Key** (Agility_API_Key) for your Agility instance
- The **Agility UGC Password** (Agility_API_Password) for your Agility instance

## Component Architecture
These components are designed to be portable and can easily be added to any new or existing ASP.NET MVC website.

Each component type (i.e. **Blog** or **Comments**) are self-contained in their own .NET project. They each have their own MVC controllers and actions that correspond to the **Output Type** of the associated modules for each component. The MVC website needs to have a reference to the Component .NET project (i.e. Blog and/or Comments).

Unlike a typical Agility MVC integration, these components do not rely on using strongly-typed objects. This means you can add these components to your website without even downloading the strongly-typed API for the Modules/Content Definitions.


### Frontend Architecture
While the backend of these components are abstracted away into seperate .NET projects, the entire frontend (cshtml, CSS, and JS) is managed within your target MVC website. This enables you to re-use the same backend for various websites, while you can still customize the look and feel for each website.

These files can be managed in **Inline Code** (within your Agility Instance) or you can have these directly integrated into your MVC website source code.


## Getting Started
You must have the appropriate Module/Content Definitions, Pages, Page Template, and Inline Code files setup in your Agility before you can connect this to your website. 
1. Clone this repository
2. Open the *Components.sln* file in the root of the repo
3. Open the /ComponentsTestSite/web.config file and set your **websiteName**, and **securityKey**
```
...
  <agility.web>
    <settings applicationName="Agility Sample MVC4" developmentMode="true" contentCacheFilePath="c:\AgilityContent\" debugAgilityComponentFiles="false">
      <websites>
        <add websiteName="{{websiteName}}" securityKey="{{securityKey}}" />
      </websites>
      <trace traceLevel="Warning" logFilePath="c:\AgilityLogs\SampleMVC4.log" emailErrors="false" />
    </settings>
  </agility.web>
...
```
4. Set the **Agility_API_Key** (UGC Key) and **Agility_API_Password** (UGC Password)
```
<appSettings>
    <!-- Start Agility App Settings -->
    <add key="Agility_API_Url" value="https://ugc.agilitycms.com/Agility-UGC-API-JSONP.svc" />
    <add key="Agility_API_Key" value="{{Agility_API_KEY}}" />
    <add key="Agility_API_Password" value="{{Agility_API_Password}}" />
</appSettings>
```
5. **Build and Run** the MVC4 website by clicking *Debug* > *Start/Start Without Debugging*
6. If your instance only has the */blog* pages in the page tree, then the */blog* page will be the default homepage, otherwise navigate directly to *http://localhost:{port}/blog*


## Blog Component
The Blog Component consists of the following **Modules**:
- **Blog Author Details** - Displays the details of an Author. To be used on the dynamic "author-details" page only.
- **Blog Categories** - Displays all Blog Categories. Can be added to any page in any content zone.
- **Blog Details** - Displays the details of Blog Posts. To be used on a dynamic "blog-details" page only.
- **Blog History** - Displays a list of months that can be used to filter the blog listing. Can be added to any page in any content zone.
- **Blog Listing** - Lists Blog Posts, optionally filtered by Category(s) and Tag. Used on main blog listing, dynamic listing by category, and dynamic  listing by tag pages. Additionally, can be used on other static pages.
- **Blog Tags** - Displays all Blog Tags. Can be added to any page in any content zone.
- **Featured Blog Post** - Displays a featured Blog Post. Can be added to any page in any content zone.
- **Recent Blog Posts** - Displays a featured Blog Post. Can be added to any page in any content zone.

Its **Content Definitions**:
- **Blog Author** - Defines a Blog Author.
- **Blog Category** - Defines a Blog Category.
- **Blog Configuration** - Configures this instance of the Blog Component.
- **Blog Post** - Defines a Blog Post.
- **Blog Tag** - Defines a Blog Tag.

Its **Shared Content Items/Lists**:
- **Dynamic Page Lists**
  - Blog Authors
  - Blog Categories
  - Blog Posts
  - Blog Tags
- **Shared Content**
  - Blog Configuration

### Blog Component Frontend Dependancies
By default, the components engine will assume all dependant Views, JS, and CSS will be loaded from **Inline Code**. 

When using **Inline Code**, the following files are dependancies of the Blog Component:
- **CSS**
  - agility-base
  - agility-blog
- **JS**
  - agility
  - agility.ugc.api
  - custom-field-types (to enable the **URL** Custom Field Type for Manager Input Forms)
- **Templates**
  - agility-blog-AuthorDetailsModule
  - agility-blog-AuthorImage 
  - agility-blog-CategoriesModule
  - agility-blog-FeaturedPostModule
  - agility-blog-HistoryModule
  - agility-blog-Links
  - agility-blog-ListedPost
  - agility-blog-ListedPostMini
  - agility-blog-Pagination
  - agility-blog-PostAttributes
  - agility-blog-PostDetailsModule
  - agility-blog-PostExcerpt
  - agility-blog-PostImage
  - agility-blog-RecentPostsModule
  - agility-blog-TagsModule
- **Page Templates**
  - Blog Template

If you wish to use code within your project and NOT use Inline Code, you can change this behaviour by setting *debugAgilityComponentFiles="true"* property in the MVC website web.config:
```
<agility.web>
    <settings ... debugAgilityComponentFiles="true">
    ...
    </settings>
</agility.web>
```

Setting **debugAgilityComponentFiles="true" will instruct the component engine to look for files within the /Agility.Components.Filtes directory within the website source code

When using the */Agility.Components.Files* directory, the following files are dependancies:
- Agility.Components.Files (folder)
  - **CSS**
    - agility-base.css
    - agility-blog.css
  - **JS**
    - agility.js (still loaded from Inline Code, by default, controlled by page template)
    - agility.ugc.api.js (still loaded from Inline Code, by default, controlled by page template)
  - **Views**
    - agility-blog-AuthorDetailsModule.cshtml
    - agility-blog-AuthorImage.cshtml
    - agility-blog-CategoriesModule.cshtml
    - agility-blog-FeaturedPostModule.cshtml
    - agility-blog-HistoryModule.cshtml
    - agility-blog-Links.cshtml
    - agility-blog-ListedPost.cshtml
    - agility-blog-ListedPostMini.cshtml
    - agility-blog-Pagination.cshtml
    - agility-blog-PostAttributes.cshtml
    - agility-blog-PostDetailsModule.cshtml
    - agility-blog-PostExcerpt.cshtml
    - agility-blog-PostImage.cshtml
    - agility-blog-RecentPostsModule.cshtml
    - agility-blog-TagsModule.cshtml

**Note:** The *Blog Template* will still use its Inline Code file if it is still configured that way in Agility. You can optionally change the *Output Template* for that to be a *Partial View* in your MVC website. The default code in the *Blog Template* will also try and load the **agility.js** and **agility.ugc.api.js** file from Inline Code. You can modify this behaviour by removing the the code loading those files and integrating those JS dependancies in your website bundle.

Default *Blog Template* code (for illustration purposes):
```
@using Agility.Components.Blog.Classes
<div id="agility-blg-template">
    <div class="agility-container">
        <div class="agility-row">
            <div id="agility-blg-topzone" class="agility-col-xs-12">
                @{Html.RenderContentZone("TopContentZone");}
            </div>
            
            <div id="agility-blg-mainzone" class="agility-col-sm-9 agility-col-sm-push-3">
                @{Html.RenderContentZone("MainContentZone");}
            </div>
            
            <div id="agility-blg-sidebarzone" class=" agility-col-sm-3 agility-col-sm-pull-9">
                @{Html.RenderContentZone("SidebarContentZone");}
            </div>
        </div>
    </div>
</div>

@* Comment out these scripts if they are natively loaded on the site *@
@*@Html.AgilityJavascript("agility")
@Html.AgilityJavascript("agilityugcapi")*@ 
```
 
### Enabling the URL Custom Field Type
The Blog component depends on a [Custom Field Type](https://github.com/agility/CustomFields) called **URL**. It is used to auto-generated a friendly URL slug based on the title of a Blog Post.
1. Ensure you have an Inline Code file that you can use for registering custom fields
2. Ensure the following code has been added to the file:
```javascript
(function () {

    var FriendlyURLFormField = function () {
        var self = this;

        self.Label = "URL";
        self.ReferenceName = "URL";

        self.Render = function (options) {
            /// <summary>
            ///  The Render handler for this field.  Create any elements and bindings that you might need, pull down resources.
            /// </summary>
            /// <param name="options" type="ContentManager.Global.CustomInputFieldParams">The options used to render this field.</param>

            //get our base element

            var $pnl = $(".friendly-url-field", options.$elem);

            var relatedField = "Title";

            if ($pnl.size() == 0) {

                //pull down the html template and load it into the element
                $.get("http://dehd7rclpxx3r.cloudfront.net/custom-input/blog-component/Blog-CustomFieldTypes-URL.html", function (htmlContent) {

                    options.$elem.append(htmlContent)
                    $pnl = $(".friendly-url-field", options.$elem);
                    var label = self.Label;

                    //bind our viewmodel to this
                    var viewModel = new function () {
                        var self = this;

                        self.RelatedField = relatedField;

                        self.makeFriendlyString = function (s) {
                            if (s) {
                                var r = s.toLowerCase();
                                r = r.replace(new RegExp("\\s", 'g'), "-");
                                r = r.replace(new RegExp("[àáâãäå]", 'g'), "a");
                                r = r.replace(new RegExp("æ", 'g'), "ae");
                                r = r.replace(new RegExp("ç", 'g'), "c");
                                r = r.replace(new RegExp("[èéêë]", 'g'), "e");
                                r = r.replace(new RegExp("[ìíîï]", 'g'), "i");
                                r = r.replace(new RegExp("ñ", 'g'), "n");
                                r = r.replace(new RegExp("[òóôõö]", 'g'), "o");
                                r = r.replace(new RegExp("œ", 'g'), "oe");
                                r = r.replace(new RegExp("[ùúûü]", 'g'), "u");
                                r = r.replace(new RegExp("[ýÿ]", 'g'), "y");

                                r = r.replace(new RegExp("[^\\w\\-@-]", 'g'), "-");
                                r = r.replace(new RegExp("--+", 'g'), "-");


                                if (r.lastIndexOf("-") > 0 && r.lastIndexOf("-") == r.length - 1) {
                                    r = r.substring(0, r.length - 1);
                                }
                            }

                            return r;
                        };
                        self.regenerateUrl = function () {
                            ContentManager.ViewModels.Navigation.messages().show("By changing the URL you could create broken links.\nWe recommend you add in a URL redirection from the old URL to the new URL.\nAre you sure you wish to continue?", "Re-generate URL",
                               ContentManager.Global.MessageType.Question, [{
                                   name: "OK",
                                   defaultAction: true,
                                   callback: function () {
                                       var friendlyStr = self.makeFriendlyString(options.contentItem.Values[self.RelatedField]());
                                       self.value(friendlyStr);
                                   }
                               },
                               {
                                   name: "Cancel",
                                   cancelAction: true,
                                   callback: function () {
                                       //do nothing...
                                   }
                               }]);
                        }

                        //subscribe to the title changes
                        options.contentItem.Values[self.RelatedField].subscribe(function (newVal) {
                            //auto generate if this is a new item
                            if (options.contentItem.ContentID() < 0) {
                                var friendlyStr = self.makeFriendlyString(newVal);
                                self.value(friendlyStr);
                            }

                        });

                        self.value = options.fieldBinding;
                        self.contentID = options.contentItem.ContentID;
                    }

                    ko.applyBindings(viewModel, $pnl.get(0));

                });
            }

        }
    }
    ContentManager.Global.CustomInputFormFields.push(new FriendlyURLFormField());
})();
```
3. In **Settings** > **Customization/Development** > **Developer Framework** in the Agility Content Manager, ensure your *Input Form Customization* file is pointing to your *Inline Code File*.

For see [Custom Fields](https://github.com/agility/CustomFields) for more information on how this works.

### Customizing the Blog Component
Customizing the Blog Component can be done in several ways:
1. Using CSS, apply custom styles
2. Modify the Views/Templates (.cshtml or Inline Code) HTML code directly
3. Add or remove properties in the Module/Content Definitions
4. Modify the Controller Action Results for the Modules to implement more advanced functionality

## Comments Component
The Comments Component consists of the following **Modules**:
- **Comments** - Displays the comments for the current dynamic page item.


Its **Content Definitions**:
- **Comments Configuration** - Allows you to configure the labels and functionality within comments.

Its **Shared Content Items/Lists**:
- **Shared Content**
  - Comments Configuration

### Comments Component Frontend Dependancies
By default, the components engine will assume all dependant Views, JS, and CSS will be loaded from **Inline Code**. 

When using **Inline Code**, the following files are dependancies of the Comments Component:
- **CSS**
  - agility-base
  - agility-comments
- **JS**
  - agility
  - agility.ugc.api
- **Templates**
  - agility-comments-CommentsModule

If you wish to use code within your project and NOT use Inline Code, you can change this behaviour by setting *debugAgilityComponentFiles="true"* property in the MVC website web.config:
```
<agility.web>
    <settings ... debugAgilityComponentFiles="true">
    ...
    </settings>
</agility.web>
```

Setting **debugAgilityComponentFiles="true" will instruct the component engine to look for files within the /Agility.Components.Filtes directory within the website source code

When using the */Agility.Components.Files* directory, the following files are dependancies:
- Agility.Components.Files (folder)
  - **CSS**
    - agility-base.css
    - agility-comments.css
  - **JS**
    - agility-comments.js
  - **Views**
    - agility-comments-Module.cshtml

**Note:** Comments are typically loaded on the same Page Template that the Blog Component uses. The *Blog Template* will still use its Inline Code file if it is still configured that way in Agility. You can optionally change the *Output Template* for that to be a *Partial View* in your MVC website. The default code in the *Blog Template* will also try and load the **agility.js** and **agility.ugc.api.js** file from Inline Code. You can modify this behaviour by removing the the code loading those files and integrating those JS dependancies in your website bundle.

Default *Blog Template* code (for illustration purposes):
```
@using Agility.Components.Blog.Classes
<div id="agility-blg-template">
    <div class="agility-container">
        <div class="agility-row">
            <div id="agility-blg-topzone" class="agility-col-xs-12">
                @{Html.RenderContentZone("TopContentZone");}
            </div>
            
            <div id="agility-blg-mainzone" class="agility-col-sm-9 agility-col-sm-push-3">
                @{Html.RenderContentZone("MainContentZone");}
            </div>
            
            <div id="agility-blg-sidebarzone" class=" agility-col-sm-3 agility-col-sm-pull-9">
                @{Html.RenderContentZone("SidebarContentZone");}
            </div>
        </div>
    </div>
</div>

@* Comment out these scripts if they are natively loaded on the site *@
@*@Html.AgilityJavascript("agility")
@Html.AgilityJavascript("agilityugcapi")*@ 
```

### Customizing the Comments Component
Customizing the Comments Component can be done in several ways:
1. Using CSS, apply custom styles
2. Modify the JavaScript used to render and submit comments
2. Modify the Views/Templates (.cshtml or Inline Code) HTML code directly
3. Add or remove properties in the Module/Content Definitions
4. Modify the Controller Action Results for the Modules to implement more advanced functionality

**Note:** If you change the HTML classes and HTML structure, this may break the default functionality of the Comments component. See the *agility-comments.js* file for details.

