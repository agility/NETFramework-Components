Agility.RegisterNamespace("Agility.Components.Comments");

//Init
$(document).ready(function () {
    Agility.Components.Comments.Init();
});


(function (Comments) {
    Comments.Init = function ($container) {
        var self = this;
        self.$Container = $('.agility-comments-module')

        if (self.$Container.length > 0) {

            if (!Agility.UGC.API.Initialized) {
                //todo: load from cdn
                return;
            }

            self.SetOptions();
            self.CheckForLoggedInUser(function (isLoggedIn, profile) {
                if (isLoggedIn) {
                    self.CurrentProfile = profile;

                }
                self.ToggleLoggedInView(true);
                self.SetUserProperties();
                self.PopulateCommentsList(function (data) {
                    self.CreatePager(data);
                    self.BindUi();
                });

            });
        }
    };

    Comments.Options = null;

    Comments.SetOptions = function () {
        var self = this;
        self.Options = {
            RelatedContentID: self.$Container.data('content-id'),
            RecordTypeName: self.$Container.data('recordtypename'),
            ProfileRecordTypeName: self.$Container.data('profile-recordtypename'),
            PageSize: self.$Container.data('pagesize'),
            SortDropdownContainerID: "#agility-comments-sort",
            DefaultSort: self.$Container.data('default-sort'),
            SuccessContainer: ".agility-comments-submission-success",
            UGCErrorContainer: ".agility-comments-submission-error",
            ValidationSummaryContainer: ".agility-comments-validation-container",
            CommentValidationContainer: ".agility-comments-validation",
            SubmitCommentButton: ".agility-comments-submit-btn",
            LogoutButton: ".agility-comments-logout-btn",
            LoadingElementID: "#agility-comments-loader",
            IDContainer: ".agility-comments-id-required",
            IDRequiredMessage: self.$Container.data('id-required-message'),
            TwitterConnect: ".agility-comments-twitter-connect",
            FacebookConnect: ".agility-comments-facebook-connect",
            ProfileDetailsContainer: ".agility-comments-profile-details",
            ProfileDetailsExpandedContainer: ".agility-comments-profile-details-expanded",
            NameTextbox: ".agility-comments-name-txt",
            EmailTextbox: '.agility-comments-email-txt',
            ProfileSaveBtn: '.agility-comments-profile-save-btn',
            ReplyBtn: '.agility-comments-reply-btn',
            CancelReplyBtn: '.agility-comments-cancel-reply-btn',
            ReplyContainer: '.agility-comments-reply-container',
            ChildCommentsContainer: '.agility-comments-child-comment-container',
            UserName: ".agility-comments-user-name",
            UserAvatar: ".agility-comments-current-avatar",
            CommentAvatarContainerClass: ".agility-comments-avatar",
            CommentsSubmitContainer: ".agility-comments-actions-container",
            CommentsBottomInputBar: ".agility-comments-submit-container",
            CommentsNewContainer: '.agility-comments-new-container',
            CommentsMainSubmitContainer: '#agility-comments-add',
            DateFormat: self.$Container.data('dateformat'),
            CommentsContainerID: '#agility-comments-container',
            CommentsListContainerID: '#agility-comments-list',
            CommentNameContainerClass: ".agility-comments-name",
            CommentDateContainerClass: ".agility-comments-date",
            CommentPostContainerClass: ".agility-comments-post",
            CommentRowTemplateID: "#agility-comments-row-template",
            CommentRowClass: ".agility-comments-row",
            PagerContainerID: "#agility-comments-pager-container",
            CommentRequiredMessage: self.$Container.data('comment-required-message'),
            CommentTextArea: ".agility-comments-input",
            NoCommentsLabel: self.$Container.data('no-comments-message'),
            AllowedHtmlTags: self.$Container.data('allowed-html-tags'),
            PaginationClass: "agility-pagination",
            CommentCountElement: ".agility-comments-count",
            CommentsConfigReferenceName: self.$Container.data('comments-config-referencename'),
            LoginLoader: ".agility-comments-login-loader",
            EmailRequired: self.$Container.data('email-required'),
            EmailRequiredMessage: self.$Container.data('email-required-message'),
            EmailUniqueMessage: self.$Container.data('email-unique-message'),
            UserAvatarDefaultPhoto: self.$Container.data('default-user-avatar'),
        }
    };

    Comments.$Container = null;

    Comments.CurrentComments = new Array();

    Comments.PageNumber = 1;

    Comments.CurrentProfile = null;

    Comments.BindUi = function () {
        var self = this;
        self.BindSocialLogin();

        //sort drop down
        $(self.Options.SortDropdownContainerID + ' a').click(function (e) {

            var originalSort = self.Options.DefaultSort;

            $(".drop-val", $(self.Options.SortDropdownContainerID)).text($(this).text());
            $(".drop-val", $(self.Options.SortDropdownContainerID)).val($(this).text());

            if ($(this).data('value') == 'DESC') {
                self.Options.DefaultSort = 'DESC';
            }

            if ($(this).data('value') == 'ASC') {
                self.Options.DefaultSort = 'ASC';
            }

            if (originalSort != self.Options.DefaultSort) {
                self.PopulateCommentsList(self.CreatePager);
            }
        });

        //hide success message 
        $(self.Options.SuccessContainer).hide();

        //show expanded profile fields when name clicked
        $(self.Options.NameTextbox).focus(function () {
            //show expanded
            self.ShowExpandedProfileDetails();
        });


        //show id options when the comment textbox is focused
        $(self.Options.CommentTextArea).focus(function () {
            var $container = self.GetSubmitContainer($(this));

            if (self.CurrentProfile == null) {
                //show expanded
                $(self.Options.IDContainer, $container).slideDown();
                $(self.Options.CommentsBottomInputBar, $container).show();
                $(self.Options.CommentTextArea, $container).addClass('clicked');
            }

        });

        //validate profile details on profile save
        $(self.Options.ProfileSaveBtn).click(function () {
            var $container = self.GetSubmitContainer($(this));
            self.SetLoggingInContainer($container);
            self.ValidateSubmitProfileDetails($(this));
        });

        //main comment submit button
        $(self.Options.SubmitCommentButton).click(function () {

            var submissionType = "NewComment";
            var parentRecordID = null;

            var $container = self.GetSubmitContainer($(this));

            if ($container.parent(self.Options.ReplyContainer).length == 1) {
                submissionType = "ReplyComment";
                var $parentCommentRow = $container.parents(self.Options.CommentRowClass);
                if ($parentCommentRow.length > 0) {
                    parentRecordID = $parentCommentRow.data('contentid');
                }
            }

            if (self.CurrentProfile != null) {

                if (self.CurrentProfile.AgilityCommentsName.length > 0) {

                    //check if this passes email validation (returns true if email not required)
                    self.PassesEmailValidation(function (isValid) {
                        if (isValid) {
                            self.SubmitComment({
                                userProfile: self.CurrentProfile,
                                submissionType: submissionType,
                                commentStr: $(self.Options.CommentTextArea, $container).val(),
                                parentRecordID: parentRecordID,
                                callback: function () {
                                    $(self.Options.SubmitCommentButton, $container).show();
                                    $(self.Options.LoadingElementID, $container).hide();
                                }
                            }, $container);
                        } else {
                            //email doesn't validate
                            $(self.Options.LoadingElementID).hide();
                            self.ThrowValidationErrors("NoEmail", self.Options.EmailRequiredMessage, $container);
                            $(self.Options.IDContainer, $container).slideDown();
                            self.ShowExpandedProfileDetails();
                        }
                    });


                } else {
                    //name doesn't validate
                    $(self.Options.LoadingElementID).hide();
                    self.ThrowValidationErrors("NoName", self.Options.IDRequiredMessage, $container);
                    $(self.Options.IDContainer, $container).slideDown();
                    self.ShowExpandedProfileDetails();

                }
            } else {
                self.ThrowValidationErrors("NotLoggedIn", self.Options.IDRequiredMessage, $container)
            }

            return false;
        });

        //logout button
        $(self.Options.LogoutButton).click(function () {
            Agility.UGC.API.Logout(self.Options.ProfileRecordTypeName);
            self.CurrentProfile = null;
            self.SetUserProperties();
            self.ToggleLoggedInView();
            $(self.Options.ProfileDetailsExpandedContainer).hide();
        });

        self.BindCommentsUI();

    };

    Comments.BindCommentsUI = function () {
        var self = this;
        //reply button
        $(self.Options.ReplyBtn).click(function () {
            self.InitReply($(this));
        });

        //cancel button
        $(self.Options.CancelReplyBtn).click(function () {
            self.CancelReply($(this));
        });
    }

    Comments.BindSocialLogin = function () {
        var self = this;
        $(self.Options.TwitterConnect).click(function () {
            var $container = self.GetSubmitContainer($(this));
            self.SetLoggingInContainer($container);
            self.ShowExpandedProfileDetails();
            var w = 700;
            var h = 600;
            var left = (screen.width / 2) - (w / 2);
            var top = (screen.height / 2) - (h / 2);
            var windowFeatures = 'toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=yes, resizable=yes, copyhistory=no, width=' + w + ', height=' + h + ', top=' + top + ', left=' + left;

            var callback = "Agility.Components.Comments.TwitterCallback";

            var popup = window.open("/Agility_Comments/TwitterRedirect?callback=" + escape(callback) + "&config=" + self.Options.CommentsConfigReferenceName, "_blank", windowFeatures, true);

            return false;
        });

        var faceBookAppID = $(self.Options.FacebookConnect).data("app-id");

        //FACEBOOK CONNECTION
        if (faceBookAppID != null && faceBookAppID != "") {

            var setFacebookProperties = function (accessToken) {

                var url = "/me?access_token=" + accessToken;
                FB.api(url, function (fbProfile) {

                    /*
                        id
                    name
                    first_name
                    last_name
                    link
                    gender
                    locale
                    age_range
                    email
                    */

                    var profile = {
                        AgilityCommentsName: fbProfile.name,
                        AgilityCommentsLoginID: fbProfile.id,
                        AgilityCommentsLoginType: "facebook",
                        AgilityCommentsPhoto: '',
                        AgilityCommentsEmail: fbProfile.email //not guranteeed to come back
                    };


                    url = "me/picture?width=150&type=normal&height=150&redirect=false&access_token=" + accessToken;
                    FB.api(url, function (fbPhoto) {
                        profile.AgilityCommentsPhoto = fbPhoto.data.url;
                        self.FacebookCallback(profile);
                    });

                });
            }

            //init facebook api...
            window.fbAsyncInit = function () {
                FB.init({
                    appId: faceBookAppID,
                    status: true,
                    cookie: true,
                    xfbml: true,
                    oauth: true,
                });

                //add the click event to the login button..
                $(self.Options.FacebookConnect).click(function () {
                    var $container = self.GetSubmitContainer($(this));
                    self.SetLoggingInContainer($container);

                    self.ShowExpandedProfileDetails();
                    $(self.Options.LoginLoader).show();
                    FB.getLoginStatus(function (response) {
                        if (response.authResponse) {
                            //if they are already logged into facebook, but not the site, log them in
                            setFacebookProperties(response.authResponse.accessToken);
                        } else {
                            FB.login(function (response) {
                                if (response.authResponse) {
                                    // connected
                                    setFacebookProperties(response.authResponse.accessToken);
                                } else {
                                    // cancelled - do nothing            					

                                }
                            }, { scope: 'email' });
                        }
                    });
                });

            };

            (function (d) {
                var js, id = 'facebook-jssdk'; if (d.getElementById(id)) { return; }
                js = d.createElement('script'); js.id = id; js.async = true;
                js.src = "https://connect.facebook.net/en_US/all.js";
                d.getElementsByTagName('head')[0].appendChild(js);
            }(document));

        } else {
            $(self.Options.FacebookConnect).hide();
        }
    };

    Comments.Login = function (profile, callback, $container) {
        var self = this;
        $(self.Options.LoginLoader).show();
        var request = $.ajax({
            url: "/agility_comments/login?recordType=" + self.Options.ProfileRecordTypeName,
            type: "POST",
            dataType: "json",
            data: profile
        }).done(function (ret) {
            $(self.Options.LoginLoader).hide();
            var $container = self.GetLogginInContainer();
            if (ret.isError == true) {
                //error
                self.ThrowLoginError("Your authentication could not be processed: " + ret.message, profile.AgilityCommentsEmail, $container)
            } else {
                //success...

                if (ret.token != undefined && ret.token != null && ret.token.length > 0) {

                    //we got the token, set the cookie...
                    var cookieName = Agility.UGC.API.GetAuthCookieName();
                    cookieName += self.Options.ProfileRecordTypeName;
                    var cookieValue = new String(ret.token);
                    var cookieDate = null;
                    Agility.SetCookie(cookieName, cookieValue, cookieDate, "/", null, false)

                    //refresh api
                    Agility.UGC.API.IsAuthenticated(self.Options.ProfileRecordTypeName, function () {
                        profile.ID = ret.recordID;

                        if (ret.email) {
                            profile.AgilityCommentsEmail = ret.email;
                        }

                        if (ret.photo) {
                            profile.AgilityCommentsPhoto = ret.photo;
                        }

                        self.CurrentProfile = profile;
                        self.SetUserProperties();

                        if (profile.AgilityCommentsLoginType != "guest") { //no need to check guest, email would have been verified when initially saved
                            self.PassesEmailValidation(function (isValid) {
                                if (isValid) {
                                    self.ToggleLoggedInView();
                                }
                                if (callback && $.isFunction(callback)) {
                                    //complete the authentication
                                    callback();
                                }
                            });
                        } else {
                            if (callback && $.isFunction(callback)) {
                                //complete the authentication
                                callback();
                            }
                        }
                    });
                }
            }

        }).fail(function (jqXHR, textStatus) {
            //didn't work... show an error...
            $(self.Options.LoginLoader).hide();
            var $container = self.GetLogginInContainer();
            self.ThrowLoginError("AuthenticationError", "Your authentication could not be processed: " + ret.message, profile.AgilityCommentsEmail, $container);
        });
    };

    Comments.TwitterCallback = function (userID, screenName, name, photoUrl, email) {
        var self = this;
        var profile = {
            AgilityCommentsName: name,
            AgilityCommentsLoginID: userID,
            AgilityCommentsLoginType: "twitter",
            AgilityCommentsPhoto: photoUrl,
            AgilityCommentsEmail: email //email will only be returned if app is whitelisted by twitter AND user allows permission
        };

        self.Login(profile);
    };

    Comments.TwitterLoginViaTimeout = function (id, screenName, name, photo) {
        setTimeout(function () {
            Comments.TwitterLogin({
                id: id,
                screenName: screenName,
                name: name,
                photo: photo
            });
        }, 10);
    }

    Comments.FacebookCallback = function (profile) {
        var self = this;
        self.Login(profile);
    };

    Comments.PopulateCommentsList = function (callback, $container) {

        var self = this;

        //clear existing comments
        $(self.Options.CommentsContainerID).html('');


        var commentSearchArg = {
            RelatedContentID: self.Options.RelatedContentID,
            PageSize: self.Options.PageSize,
            RecordOffset: ((self.PageNumber - 1) * self.Options.PageSize),
            SortedField: 'CreatedOn',
            //SortDirection: self.Options.DefaultSort, //-- there is a bug when sorting and paging, need fix in UGC stored procs
            RecordTypeName: self.Options.RecordTypeName,
            State: Agility.UGC.API.RecordState.Published,
            CacheKey: "AgilityComments_" + self.Options.RelatedContentID
        };

        var $commentContainer = $(self.Options.CommentsContainerID);

        //show loading progress...
        $(self.Options.LoadingElementID, $container).show();

        Agility.UGC.API.SearchComments(commentSearchArg, function (data) {

            if (data.ResponseType == 0) {

                $(self.Options.CommentCountElement).html('(' + data.ResponseData.TotalRecords + ')');

                self.CurrentComments[self.Options.RelatedContentID] = data.ResponseData.Records;

                var relatedContentID = self.Options.RelatedContentID;
                var topLevelItems = new Array();
                var subItems = new Array();

                for (var i = 0; i < self.CurrentComments[relatedContentID].length; i++) {
                    var parentRecordID = self.CurrentComments[relatedContentID][i].ParentRecordID;
                    if (parentRecordID == null || parentRecordID == undefined || parentRecordID <= 0) {
                        topLevelItems.push(data.ResponseData.Records[i]);
                    }
                    else {
                        subItems.push(self.CurrentComments[relatedContentID][i]);
                    }
                }


                self.LoadCommentsData(0, 0, topLevelItems, subItems);

                self.FadeHtml($commentContainer, '', function () {
                    $(self.Options.LoadingElementID, $container).hide();
                });

                if (data.ResponseData.TotalRecords == 0) {
                    self.FadeHtml($commentContainer, self.Options.NoCommentsLabel);
                }

                if ($.isFunction(callback)) {
                    callback(data);
                }
            }
            else {
                self.FadeHtml($commentContainer, "Error Loading Comments: " + data.Message);
            }
        });

    };

    Comments.LoadCommentsData = function (recordID, level, topLevelItems, subItems) {
        var self = this;


        if (level > 5) {
            return "";
        }

        var childAry;
        if (level == 0 && recordID == 0) {
            childAry = topLevelItems;
        }
        else {
            childAry = $.grep(subItems, function (item) {
                return item.ParentRecordID == recordID;
            });
        }


        for (var i = 0; i < childAry.length; i++) {
            var comment = childAry[i];
            self.SetCommentHTML(comment, level);
            self.LoadCommentsData(comment.ID, level + 1, topLevelItems, subItems)
        }
    }

    Comments.SetCommentHTML = function (comment, level) {
        var self = this;

        if (level == undefined || level == null || level == NaN) {
            level = 0;
        }


        var $targetContainer = $(self.Options.CommentsContainerID);
        if (level > 0) {
            $targetContainer = $(self.Options.ChildCommentsContainer, self.Options.CommentRowClass + '[data-contentid=' + comment.ParentRecordID + ']');
        }

        var $commentRowTemplate = $(self.Options.CommentRowClass, self.Options.CommentRowTemplateID);
        var $commentRow = $commentRowTemplate.clone();
        $commentRow.appendTo($targetContainer).hide();

        $commentRow.attr('id', "pnlComment_" + comment.ID);
        $commentRow.attr('data-contentID', comment.ID);
        $commentRow.attr('data-commentLevel', comment.CommentLevel);
        $commentRow.attr('data-parentRecordID', comment.ParentRecordID);
        $commentRow.attr('data-profileID', comment.CreatedBy);

        //set reply attributes
        $(self.Options.ReplyBtn, $commentRow).attr('data-reply-id', comment.ID);
        $(self.Options.ReplyContainer, $commentRow).attr('data-reply-id', comment.ID);
        $(self.Options.CancelReplyBtn, $commentRow).attr('data-reply-id', comment.ID);


        var $commentAvatar = $(self.Options.CommentAvatarContainerClass, $commentRow);
        var photoUrl = '/agility_comments/photo/' + comment.CreatedBy;
        self.SetTranscodedThumbUrl($commentAvatar, photoUrl, comment.Name);

        //switch newlines to br tags if there are no p tags in there.
        if (comment.Comment != null && comment.Comment.indexOf("<p>") == -1) {
            comment.Comment = comment.Comment.replace(/\n/g, "<br/>");
        }

        $(self.Options.CommentNameContainerClass, $commentRow).html(comment.Name);
        $(self.Options.CommentDateContainerClass, $commentRow).html($.format.date(comment.CreatedOn, self.Options.DateFormat))
        $(self.Options.CommentPostContainerClass, $commentRow).html(comment.Comment);

        $commentRow.show();
    };

    Comments.FadeHtml = function (element, html, oncomplete) {
        element.fadeTo("fast", 0, function () {
            if (html) {
                element.html(html);
            }
            if (oncomplete) {
                oncomplete();
            }
            element.fadeTo("fast", 1);
        });
    };

    Comments.CreatePager = function (data) {
        var self = Comments;

        var numberOfPages = Math.ceil(data.ResponseData.TotalTopLevelRecords / self.Options.PageSize);

        if (numberOfPages > 1) {
            var html = "<ul class=\"" + self.Options.PaginationClass + "\">";
            html += "<li><a href=\"#\" class=\"Prev Previous agility-disabled\">&laquo;</a></li>";

            for (var i = 1; i <= numberOfPages; i++) {
                html += "<li><a class=\"Page" + ((i == 1) ? " agility-active" : "") + "\" href=\"#" + i + "\">" + i + "</a></li>";
            }

            html += "<li><a href=\"#\" class=\"Next\">&raquo;</a></li>";

            html += "</ul>";

            var pagerContainer = $(self.Options.PagerContainerID, self.$Container);
            pagerContainer.html(html);

            $("ul." + self.Options.PaginationClass + " li a", pagerContainer).click(function () {

                var targetPage = null;

                var a = $(this);

                if (a.hasClass("Previous")) {
                    targetPage = self.PageNumber - 1;
                }
                else if (a.hasClass("Next")) {
                    targetPage = self.PageNumber + 1;
                }
                else if (a.hasClass("Page")) {
                    targetPage = Number(a.attr("href").replace("#", ""));
                }

                if (!isNaN(targetPage)) {

                    targetPage = Math.max(1, targetPage);
                    targetPage = Math.min(numberOfPages, targetPage);

                    self.PageNumber = targetPage;

                    var commentsList = $(self.Options.CommentsListContainerID);
                    var commentsContainer = $(self.Options.CommentsContainerID);

                    self.ScrollToTarget(commentsList);

                    self.PopulateCommentsList(function () {
                        self.BindCommentsUI();
                    });

                    if (targetPage == 1) {
                        $("ul." + self.Options.PaginationClass + " li a.Previous", pagerContainer).hide();
                    } else {
                        $("ul." + self.Options.PaginationClass + " li a.Previous", pagerContainer).show();
                    }

                    if (targetPage == numberOfPages) {
                        $("ul." + self.Options.PaginationClass + " li a.Next", pagerContainer).hide();
                    } else {
                        $("ul." + self.Options.PaginationClass + " li a.Next", pagerContainer).show();
                    }

                    $("ul." + self.Options.PaginationClass + " li a.Page", pagerContainer).removeClass("agility-active");
                    $("ul." + self.Options.PaginationClass + " li a.Page", pagerContainer).eq(targetPage - 1).addClass("agility-active");
                }

                return false;
            });
        }
    };

    Comments.ClearValidationErrors = function () {
        var self = this;
        $(self.Options.ValidationSummaryContainer).hide();
    };

    Comments.ThrowValidationErrors = function (errorType, errorMessage, $container) {
        var self = this;

        $(self.Options.LoadingElementID, $container).hide();

        var errorsContainer = $(self.Options.ValidationSummaryContainer, $container);
        var commentValidationContainer = $(self.Options.CommentValidationContainer, $container).hide();
        var ugcErrorContainer = $(self.Options.UGCErrorContainer, $container).hide();

        var vldTimeout = errorsContainer.data("vldTimeout");
        if (vldTimeout != null) clearTimeout(vldTimeout);

        if (errorType == "NoName" || errorType == "NoEmail" || errorType == "NotLoggedIn") {
            commentValidationContainer.text(errorMessage)
            commentValidationContainer.show();
        }

        if (errorType == "NewComment") {
            ugcErrorContainer.text(errorMessage);
            ugcErrorContainer.show();
        }

        if (errorType == "SocialLogin") {
            ugcErrorContainer.text(errorMessage);
            ugcErrorContainer.show();
        }

        if (errorType == "ProfileSave") {
            ugcErrorContainer.text(errorMessage);
            ugcErrorContainer.show();
        }

        if (errorType == "AuthenticationError") {
            if (errorMessage.indexOf('must be unique and is already in this content definition') > -1) {
                errorMessage = self.Options.EmailUniqueMessage;
            }
            ugcErrorContainer.text(errorMessage);
            ugcErrorContainer.show();
        }

        errorsContainer.show()

        errorsContainer.data("vldTimeout", vldTimeout);
    };

    Comments.ThrowLoginError = function (errorMsg, email, $container) {
        var self = this;

        if (errorMsg.indexOf('must be unique and is already in this content definition') > -1 && email != undefined) {
            errorMsg = self.Options.EmailUniqueMessage;
            errorMsg = errorMsg.replace('##email##', email);
        }

        self.ThrowValidationErrors("AuthenticationError", errorMsg, $container);
    }

    Comments.SubmitComment = function (submitOptions, $container) {
        //Options: ({ userProfile: profileRecord, commentStr: commentStr, parentRecordID: parentRecordID, callback: callback, submissionType, existingCommentID });

        var self = this;
        theComment = self.EncodeComments(submitOptions.commentStr);

        if (theComment.length < 1) {

            //doesn't validate...
            self.ThrowValidationErrors(submitOptions.submissionType, self.Options.CommentRequiredMessage, $container);

            if ($.isFunction(submitOptions.callback)) {
                submitOptions.callback();
            }

        } else {

            var commentRecord = null;

            commentRecord = {
                ID: -1,
                RecordTypeName: self.Options.RecordTypeName,
                RelatedContentID: self.Options.RelatedContentID,
                ParentRecordID: submitOptions.parentRecordID,
                Name: submitOptions.userProfile.AgilityCommentsName,
                Comment: theComment,
                ExternalProfileType: submitOptions.userProfile.AgilityCommentsLoginType,
                ExternalProfileID: submitOptions.userProfile.ID
            };


            self.SaveCommentAndRefresh(commentRecord, submitOptions, $container);

        }
    };

    Comments.SaveCommentAndRefresh = function (commentRecord, submitOptions, $container) {
        var self = this;

        var cacheKey = "AgilityComments_" + commentRecord.RelatedContentID;

        //show loading
        $(self.Options.LoadingElementID).show();

        //save the comment...
        Agility.UGC.API.SaveRecord(commentRecord, function (data) {

            var success = (data.ResponseType == Agility.UGC.API.ResponseType.OK);

            if (success) {
                self.ResetForm();
                var hideTimeout = $(self.Options.SuccessContainer, $container).data("hideTimeout");
                if (hideTimeout != null) clearTimeout(hideTimeout);
                $(self.Options.SuccessContainer, $container).show();
                hideTimeout = setTimeout(function () {
                    $(self.Options.SuccessContainer, $container).fadeOut();
                }, 10000);

                $(self.Options.SuccessContainer, $container).data("hideTimeout", hideTimeout);

                var commentID = data.ResponseData;

                if ($.isFunction(submitOptions.callback)) {
                    submitOptions.callback();
                }

                //refresh the list...
                self.PopulateCommentsList(function (data) {
                    //scroll to target
                    var $submittedComment = $(self.Options.CommentRowClass + '[data-contentid=' + commentID + ']');
                    self.ScrollToTarget($submittedComment);
                    self.BindCommentsUI();
                    self.CreatePager(data);
                });
            }
            else {
                self.ThrowValidationErrors(submitOptions.submissionType, data.Message, $container);
            }

        }, cacheKey);

    }

    Comments.ResetForm = function () {
        $(this.Options.CommentTextArea).val("");
        $(this.Options.ValidationSummaryContainer).hide();
    }

    Comments.EncodeComments = function (originalComments) {
        var self = this;

        var tagsStr = "b,i,u";
        if (this.Options.AllowedHtmlTags != "") {
            tagsStr = this.Options.AllowedHtmlTags;
        }
        var tagNames = tagsStr.split(",");

        var allowed = "";
        for (var i in tagNames) {
            allowed += "<" + $.trim(tagNames[i]) + ">";
        }

        allowed = (((allowed || "") + "").toLowerCase().match(/<[a-z][a-z0-9]*>/g) || []).join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)
        var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
            commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

        originalComments = self.ReplaceURLWithHTMLLinks(originalComments);

        return originalComments.replace(commentsAndPhpTags, '').replace(tags, function ($0, $1) {
            return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
        });
    }

    Comments.ReplaceURLWithHTMLLinks = function (text) {
        var exp = /((href|src)=["']|)(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
        return text.replace(exp, function () {
            return arguments[1] ?
                    arguments[0] :
                    "<a rel='nofollow' target='_blank' href=\"" + arguments[3] + "\">" + arguments[3] + "</a>"
        });
    };

    Comments.GetCount = function (contentID, commentsRecordTypeName, callback) {

        var searchArg = {
            RelatedContentID: contentID,
            PageSize: 1,
            RecordOffset: 0,
            RecordTypeName: commentsRecordTypeName,
            State: Agility.UGC.API.RecordState.Published
        };

        Agility.UGC.API.SearchComments(searchArg, function (data) {
            var count = 0;
            if (data.ResponseType == 0) count = data.ResponseData.TotalRecords;

            return callback(count);
        });
    };

    Comments.GetThumbnailUrl = function (imgSrc, width, height, type) {
        var thumb = "";

        if (imgSrc != null && imgSrc != undefined && imgSrc.length > 0) {
            if (!width) {
                width = 0;
            }
            if (!height) {
                height = 0;
            }
            if (!type) {
                type = 0;
            }

            if (width > 0 || height > 0) {
                thumb = imgSrc + '?';
                if (width > 0) {
                    thumb += 'w=' + width;
                }
                if (height > 0) {
                    if (width > 0) {
                        thumb += '&';
                    }
                    thumb += 'h=' + height;
                }
                if (type > 0) {
                    thumb += '&c=' + type;
                }
            }
        }

        return thumb;
    }

    Comments.CheckForProfileAndSave = function (name, email, type, callback) {
        var self = this;

        var profile = {
            AgilityCommentsName: name,
            AgilityCommentsEmail: email
        }

        if (type == "guest") {
            var login = name;
            if (email && email.length > 0) {
                login = email;
            }
            var password = login;

            profile.AgilityCommentsLoginID = login;
            profile.AgilityCommentsLoginPassword = password;
            profile.AgilityCommentsLoginType = type;
        } else {
            //use existing properties
            profile.AgilityCommentsLoginID = self.CurrentProfile.AgilityCommentsLoginID;
            profile.AgilityCommentsLoginPassword = self.CurrentProfile.AgilityCommentsLoginPassword;
            profile.AgilityCommentsLoginType = self.CurrentProfile.AgilityCommentsLoginType;
        }

        self.Login(profile, function () {
            callback();
        });

    }

    Comments.ToggleLoggedInView = function (hideIDContainer) {

        var self = this;

        if (self.CurrentProfile != null) {

            $(self.Options.IDContainer).slideUp();
            $(self.Options.CommentsSubmitContainer).show();
            Comments.ClearValidationErrors();
            $(self.Options.CommentsBottomInputBar).show();
            $(self.Options.CommentTextArea).addClass('clicked');

        } else {
            if (hideIDContainer == null || hideIDContainer == undefined || hideIDContainer == false) {
                $(self.Options.IDContainer).slideDown();
            }
            $(self.Options.CommentsSubmitContainer).hide();
        }
    };

    Comments.SetUserProperties = function () {
        var self = this;
        if (self.CurrentProfile != null) {
            $(self.Options.NameTextbox).val(self.CurrentProfile.AgilityCommentsName);
            $(self.Options.NameTextbox).attr('disabled', 'disabled');

            if (self.CurrentProfile.AgilityCommentsPhoto && self.CurrentProfile.AgilityCommentsPhoto.length > 0) {
                photo = self.CurrentProfile.AgilityCommentsPhoto;
            } else {
                photo = self.Options.UserAvatarDefaultPhoto
            }
            self.SetTranscodedThumbUrl($(self.Options.UserAvatar), photo, self.CurrentProfile.AgilityCommentsName);

            $(self.Options.EmailTextbox).val(self.CurrentProfile.AgilityCommentsEmail);
            $(self.Options.UserName).html(self.CurrentProfile.AgilityCommentsName);
        } else {
            $(self.Options.NameTextbox).val('');
            $(self.Options.NameTextbox).removeAttr('disabled');
            if (self.Options.UserAvatarDefaultPhoto && self.Options.UserAvatarDefaultPhoto.length > 0) {
                self.SetTranscodedThumbUrl($(self.Options.UserAvatar), self.Options.UserAvatarDefaultPhoto);
            }
            $(self.Options.EmailTextbox).val('');
            $(self.Options.UserName).html('');
        }
    };

    Comments.SetTranscodedThumbUrl = function ($img, src, name) {

        if (src.indexOf('fbcdn-profile') > 1) {
            src = src;
        } else {
            src += $img.data('thumb');
        }

        $img.attr('src', src);

        if (name && name.length > 0) {
            $img.attr('alt', name);
            $img.attr('title', name);
        }

        $img.show();
    };

    Comments.ShowExpandedProfileDetails = function () {
        var self = this;
        //show expanded
        $(self.Options.ProfileDetailsExpandedContainer).show();
    };

    Comments.CheckForLoggedInUser = function (callback) {
        var self = this;
        Agility.UGC.API.IsAuthenticated(self.Options.ProfileRecordTypeName, function (isAuthenticatedData) {
            if ((isAuthenticatedData.ResponseType == Agility.UGC.API.ResponseType.OK) && isAuthenticatedData.ResponseData) {
                var profileRecordID = isAuthenticatedData.ResponseData;

                Agility.UGC.API.GetRecord(profileRecordID, function (profileRecord) {
                    if (profileRecord.ResponseType == Agility.UGC.API.ResponseType.OK) {
                        callback(true, profileRecord.ResponseData);
                    } else {
                        callback(false);
                    }
                });

            } else {
                //not authenticated
                callback(false);
            }
        });
    };

    Comments.ValidateSubmitProfileDetails = function ($submitElem) {

        var self = this;
        self.ClearValidationErrors();

        var $container = $submitElem.parents(self.Options.CommentsNewContainer);
        var name = $(self.Options.NameTextbox, $container).val();
        var email = $(self.Options.EmailTextbox, $container).val();

        if (name.length > 0) {

            self.PassesEmailValidation(email, function (isValid) {
                if (isValid) {
                    var type = "guest";

                    if (self.CurrentProfile != null) {
                        type = self.CurrentProfile.AgilityCommentsLoginType;
                    }

                    //save the profile
                    self.CheckForProfileAndSave(name, email, type, function (profile) {
                        Comments.ToggleLoggedInView();
                    });

                } else {
                    self.ThrowValidationErrors("NoEmail", self.Options.EmailRequiredMessage, $container);
                }

            });


        } else {
            self.ThrowValidationErrors("NoName", self.Options.IDRequiredMessage, $container);
        }
    };

    Comments.PassesEmailValidation = function (email, callback) {
        var self = this;
        //handle params
        if (callback === undefined && email != undefined && $.isFunction(email)) {
            callback = email;
            email = undefined;
        }
        if (email === undefined) {
            if (self.CurrentProfile != null) {
                email = self.CurrentProfile.AgilityCommentsEmail; //could be undefined if logged in user has no email address
            }
        }

        if (email === undefined) {
            email = "";
        }


        if (self.Options.EmailRequired) {
            self.IsEmailAddressValid(email, function (isValid) {
                callback(isValid);
            });
        } else {
            callback(true);
        }

    };

    Comments.IsEmailAddressValid = function (email, callback) {
        var self = this;
        var isValid = false;
        if (email && email.length > 0) {
            var re = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
            isValid = re.test(email);

            if (isValid) {
                //passed regex, now needs to pass custom validator
                self.CustomEmailValidator(email, function (isValid) {
                    callback(isValid);
                })
            } else {
                //did not pass regex
                callback(isValid);
            }

        } else {
            //email not set
            callback(false);
        }

    };

    Comments.CustomEmailValidator = function (email, callback) {
        //ADD ANY CUSTOM VALIDATION LOGIC HERE
        callback(true);
    };

    Comments.InitReply = function ($replyElem) {
        var self = this;

        //cancel any existing replies
        Comments.CancelReply();

        //clear any existing validation errors
        self.ClearValidationErrors();

        var replyID = $replyElem.data('reply-id');
        var $commentContainer = self.GetCommentRowContainer($replyElem);

        //clone the submit row
        var $submitCopy = $(self.Options.CommentsMainSubmitContainer).clone(true);
        //clear the id
        $submitCopy.attr('id', '');

        //only get the reply container for this comment (no comments below this one)
        var $replyContainer = $(self.Options.ReplyContainer + '[data-reply-id=' + replyID + ']', $commentContainer);

        $submitCopy.appendTo($replyContainer);
        $(self.Options.CancelReplyBtn + '[data-reply-id=' + replyID + ']', $commentContainer).show();


    };

    Comments.CancelReply = function ($elem) {
        var self = this;

        if ($elem && $elem.length > 0) {
            var $container = $elem.parents(self.Options.CommentRowClass);
            $(self.Options.CommentsNewContainer, $container).remove();
            $(self.Options.CancelReplyBtn, $container).hide();
        } else {
            //cancel all replies
            var $container = $(self.Options.CommentsListContainerID);
            $(self.Options.CommentsNewContainer, $container).remove();
            $(self.Options.CancelReplyBtn, $container).hide();
        }
    };

    Comments.GetSubmitContainer = function ($elem) {
        var self = this;
        return $elem.parents(self.Options.CommentsNewContainer);
    };

    Comments.GetCommentRowContainer = function ($elem) {
        var self = this;
        return $elem.parents(self.Options.CommentRowClass)[0];
    };

    Comments.ScrollToTarget = function ($target) {
        var self = this;
        if (!$target || $target.length == 0) {
            $target = self.$Container;
        }
        $('html, body').animate({
            scrollTop: $target.offset().top,
            complete: function () {
                $target.fadeTo("fast", 0.7);
            }
        }, 500);
    }

    Comments.SetLoggingInContainer = function ($container) {
        var self = this;
        $(self.Options.CommentsNewContainer).removeClass('agility-logging-in');
        $container.addClass('agility-logging-in');
    };

    Comments.GetLogginInContainer = function () {
        var self = this;
        return $(self.Options.CommentsNewContainer + '.agility-logging-in');
    };


})(Agility.Components.Comments);


/*! jquery-dateFormat 10-05-2014 */
var DateFormat = {}; !function (a) { var b = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"], c = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], d = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"], e = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], f = { Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06", Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12" }, g = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.?\d{0,3}[Z\-+]?(\d{2}:?\d{2})?/; a.format = function () { function a(a) { return b[parseInt(a, 10)] || a } function h(a) { return c[parseInt(a, 10)] || a } function i(a) { var b = parseInt(a, 10) - 1; return d[b] || a } function j(a) { var b = parseInt(a, 10) - 1; return e[b] || a } function k(a) { return f[a] || a } function l(a) { var b, c, d, e, f, g = a, h = ""; return -1 !== g.indexOf(".") && (e = g.split("."), g = e[0], h = e[1]), f = g.split(":"), 3 === f.length ? (b = f[0], c = f[1], d = f[2].replace(/\s.+/, "").replace(/[a-z]/gi, ""), g = g.replace(/\s.+/, "").replace(/[a-z]/gi, ""), { time: g, hour: b, minute: c, second: d, millis: h }) : { time: "", hour: "", minute: "", second: "", millis: "" } } function m(a, b) { for (var c = b - String(a).length, d = 0; c > d; d++) a = "0" + a; return a } return { parseDate: function (a) { var b = { date: null, year: null, month: null, dayOfMonth: null, dayOfWeek: null, time: null }; if ("number" == typeof a) return this.parseDate(new Date(a)); if ("function" == typeof a.getFullYear) b.year = String(a.getFullYear()), b.month = String(a.getMonth() + 1), b.dayOfMonth = String(a.getDate()), b.time = l(a.toTimeString()); else if (-1 != a.search(g)) values = a.split(/[T\+-]/), b.year = values[0], b.month = values[1], b.dayOfMonth = values[2], b.time = l(values[3].split(".")[0]); else switch (values = a.split(" "), 6 === values.length && isNaN(values[5]) && (values[values.length] = "()"), values.length) { case 6: b.year = values[5], b.month = k(values[1]), b.dayOfMonth = values[2], b.time = l(values[3]); break; case 2: subValues = values[0].split("-"), b.year = subValues[0], b.month = subValues[1], b.dayOfMonth = subValues[2], b.time = l(values[1]); break; case 7: case 9: case 10: b.year = values[3], b.month = k(values[1]), b.dayOfMonth = values[2], b.time = l(values[4]); break; case 1: subValues = values[0].split(""), b.year = subValues[0] + subValues[1] + subValues[2] + subValues[3], b.month = subValues[5] + subValues[6], b.dayOfMonth = subValues[8] + subValues[9], b.time = l(subValues[13] + subValues[14] + subValues[15] + subValues[16] + subValues[17] + subValues[18] + subValues[19] + subValues[20]); break; default: return null } return b.date = new Date(b.year, b.month - 1, b.dayOfMonth), b.dayOfWeek = String(b.date.getDay()), b }, date: function (b, c) { try { var d = this.parseDate(b); if (null === d) return b; for (var e = (d.date, d.year), f = d.month, g = d.dayOfMonth, k = d.dayOfWeek, l = d.time, n = "", o = "", p = "", q = !1, r = 0; r < c.length; r++) { var s = c.charAt(r), t = c.charAt(r + 1); if (q) "'" == s ? (o += "" === n ? "'" : n, n = "", q = !1) : n += s; else switch (n += s, p = "", n) { case "ddd": o += a(k), n = ""; break; case "dd": if ("d" === t) break; o += m(g, 2), n = ""; break; case "d": if ("d" === t) break; o += parseInt(g, 10), n = ""; break; case "D": g = 1 == g || 21 == g || 31 == g ? parseInt(g, 10) + "st" : 2 == g || 22 == g ? parseInt(g, 10) + "nd" : 3 == g || 23 == g ? parseInt(g, 10) + "rd" : parseInt(g, 10) + "th", o += g, n = ""; break; case "MMMM": o += j(f), n = ""; break; case "MMM": if ("M" === t) break; o += i(f), n = ""; break; case "MM": if ("M" === t) break; o += m(f, 2), n = ""; break; case "M": if ("M" === t) break; o += parseInt(f, 10), n = ""; break; case "y": case "yyy": if ("y" === t) break; o += n, n = ""; break; case "yy": if ("y" === t) break; o += String(e).slice(-2), n = ""; break; case "yyyy": o += e, n = ""; break; case "HH": o += m(l.hour, 2), n = ""; break; case "H": if ("H" === t) break; o += parseInt(l.hour, 10), n = ""; break; case "hh": hour = 0 === parseInt(l.hour, 10) ? 12 : l.hour < 13 ? l.hour : l.hour - 12, o += m(hour, 2), n = ""; break; case "h": if ("h" === t) break; hour = 0 === parseInt(l.hour, 10) ? 12 : l.hour < 13 ? l.hour : l.hour - 12, o += parseInt(hour, 10), n = ""; break; case "mm": o += m(l.minute, 2), n = ""; break; case "m": if ("m" === t) break; o += l.minute, n = ""; break; case "ss": o += m(l.second.substring(0, 2), 2), n = ""; break; case "s": if ("s" === t) break; o += l.second, n = ""; break; case "S": case "SS": if ("S" === t) break; o += n, n = ""; break; case "SSS": o += l.millis.substring(0, 3), n = ""; break; case "a": o += l.hour >= 12 ? "PM" : "AM", n = ""; break; case "p": o += l.hour >= 12 ? "p.m." : "a.m.", n = ""; break; case "E": o += h(k), n = ""; break; case "'": n = "", q = !0; break; default: o += s, n = "" } } return o += p } catch (u) { return console && console.log && console.log(u), b } }, prettyDate: function (a) { var b, c, d; return ("string" == typeof a || "number" == typeof a) && (b = new Date(a)), "object" == typeof a && (b = new Date(a.toString())), c = ((new Date).getTime() - b.getTime()) / 1e3, d = Math.floor(c / 86400), isNaN(d) || 0 > d ? void 0 : 60 > c ? "just now" : 120 > c ? "1 minute ago" : 3600 > c ? Math.floor(c / 60) + " minutes ago" : 7200 > c ? "1 hour ago" : 86400 > c ? Math.floor(c / 3600) + " hours ago" : 1 === d ? "Yesterday" : 7 > d ? d + " days ago" : 31 > d ? Math.ceil(d / 7) + " weeks ago" : d >= 31 ? "more than 5 weeks ago" : void 0 }, toBrowserTimeZone: function (a, b) { return this.date(new Date(a), b || "MM/dd/yyyy HH:mm:ss") } } }() }(DateFormat), function (a) { a.format = DateFormat.format }(jQuery);