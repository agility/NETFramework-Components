/// <reference path="http://manager-beta.agilitycms.com/Scripts/Site/1-1-global.js" />
/// <reference path="http://manager-beta.agilitycms.com/Scripts/Site/1-2-1-data-access.js" />


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