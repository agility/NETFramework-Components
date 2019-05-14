/// <reference path="Agility.UGC.API.js" />
Agility.RegisterNamespace("Agility.Components.Blog");

//Init
$(document).ready(function () {
    var $container = $('.agility-blg-post-details-module');
    if ($container.length > 0) {
        Agility.Components.Blog.InitPostDetails($container);
    }
});


(function (Blog) {
    Blog.InitPostDetails = function ($container) {
        this.$PostDetailsContainer = $container;

        var contentID = $container.data('contentid'); // i.e. 3216
        var itemTypeName = $container.data('referencename'); //i.e. "BlogPost"
        var languageCode = $container.data('languagecode'); //i.e. "en-us"

        //save page view
        var statInsertArg = new Agility.UGC.API.StatInsertArg();
        statInsertArg.itemType = "WCM"; 
        statInsertArg.statTypeName = "PageViews"; 
        statInsertArg.itemTypeName = itemTypeName; 
        statInsertArg.languageCode = languageCode;
        statInsertArg.itemID = 3216;
        statInsertArg.statCount = 1;

        Agility.UGC.API.InsertStat(statInsertArg, function (data) { });

    };

    

    Blog.$PostDetailsContainer = null;

})(Agility.Components.Blog);

