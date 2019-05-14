using Agility.Components.Comments.Classes;
using Agility.Web;
using Agility.Web.Extensions;
using Agility.Web.Components;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using Agility.Components.Comments.ViewModels;
using Agility.UGC.API.WCF.AgilityUGC;
using Agility.UGC.API.WCF;
using System.Net;
using System.Text;
using System.Web.Security;
using System.Runtime.Serialization.Json;
using System.IO;

namespace Agility.Components.Comments.Controllers
{
    public class Agility_CommentsController : Agility_CommentsAbstractController
    {

        public ActionResult Comments(AgilityContentItem item)
        {
            var dynamicItem = ResolveBlogPostDetails();
            var configReferenceName = item["CommentsConfiguration"] as string;
            var config = new AgilityContentRepository<AgilityContentItem>(configReferenceName).Item("");

            if (config == null || dynamicItem == null || string.IsNullOrEmpty(dynamicItem.CommentsRecordTypeName())) return null;

            var model = new CommentsViewModel();
            model.CommentsRecordTypeName = dynamicItem.CommentsRecordTypeName();
            model.RelatedContentID = dynamicItem.ContentID;
            model.Config = config;
            model.FacebookLoginEnabled = (CommentsUtils.GetBool(config["EnableFacebookLogin"]) && !string.IsNullOrEmpty(config["FacebookAppID"] as string));
            model.TwitterLoginEnabled = (CommentsUtils.GetBool(config["EnableTwitterLogin"]) && !string.IsNullOrEmpty(config["TwitterAPIConsumerKey"] as string) && !string.IsNullOrEmpty(config["TwitterAPIConsumerSecret"] as string));
            model.GuestLoginEnabled = CommentsUtils.GetBool(config["EnableGuestLogin"]);

            return PartialView(AgilityComponents.TemplatePath("Comments-Module"), model);
           
        }

        public ActionResult Photo(int id, int w, int h, string config)
        {
            
            string photoUrl = string.Empty;
            try
            {
                using (Agility_UGC_API_WCFClient client = UGCAPIUtil.GetAPIClient("http://ugc.agilitycms.com/agility-ugc-api-wcf.svc", TimeSpan.FromSeconds(10)))
                {
                    DataServiceAuthorization dsa = UGCAPIUtil.GetDataServiceAuthorization(-1);
                    Record userProfile = client.GetRecord(dsa, id, FileStorage.EdgeURL);

                    if (userProfile != null)
                    {
                        if (!string.IsNullOrEmpty(userProfile.GetValue("AgilityCommentsPhoto") as string))
                        {
                            //if photo found, use this
                            photoUrl = userProfile.GetValue("AgilityCommentsPhoto") as string;

                            photoUrl = CommentsUtils.GetTranscodedUrl(photoUrl, w, h);

                            return Redirect(photoUrl);
                        }

                    }
                }
            }
            catch (Exception ex)
            {
                Agility.Web.Tracing.WebTrace.WriteException(ex, string.Format("Error getting profile image for {0},", id));
            }

            //no profile found or no photo found
            var configReferenceName = config;

            var configRepo = new AgilityContentRepository<AgilityContentItem>(configReferenceName);

            if (configRepo != null)
            {
                var defaultImage = configRepo.Item("").GetAttachment("DefaultAvatar");
                if (defaultImage != null)
                {
                    return Redirect(CommentsUtils.GetTranscodedUrl(defaultImage.URL, w, h));
                }
            }
            return new EmptyResult();
        }

        public ActionResult TwitterRedirect(string config, string callback)
        {
            HttpContext.Response.Cache.VaryByParams["*"] = true;

            try
            {

                string configReferenceName = config;
                if (string.IsNullOrEmpty(configReferenceName) || new AgilityContentRepository<AgilityContentItem>(configReferenceName).Item("") == null)
                {
                    throw new HttpException(500, string.Format("Agility Comments Configuration Item '{0}' not found", configReferenceName));
                }

                var configItem = new AgilityContentRepository<AgilityContentItem>(configReferenceName).Item("");
                
                Uri rq = new Uri("https://api.twitter.com/oauth/request_token");

                string callbackUrl = Request.Url.ToString();
                callbackUrl = callbackUrl.Substring(0, callbackUrl.IndexOf("/", callbackUrl.IndexOf("://") + 4));
                callbackUrl = string.Format("{0}/Agility_Comments/TwitterRedirectStep2?config={1}&callback={2}", callbackUrl, configReferenceName, callback);

                OAuthBase oauth = new OAuthBase();

                string timestamp = oauth.GenerateTimeStamp();
                string nonce = oauth.GenerateNonce();

                string consumerKey = configItem["TwitterAPIConsumerKey"] as string;
                string consumerSecret = configItem["TwitterAPIConsumerSecret"] as string;

                if (string.IsNullOrWhiteSpace(consumerKey) || string.IsNullOrWhiteSpace(consumerSecret))
                {
                    throw new ApplicationException("The Twitter Consumer key or Secret has not been filled out in the Agility Comments Configuration shared content item.");
                }

                string postData = oauth.CreateCanonicalizedRequest(rq.ToString(), consumerKey, consumerSecret, callbackUrl);

                WebClient client = new WebClient();

                var authenticationHeader = oauth.CreateAuthenticationHeader(rq.ToString(), consumerKey, consumerSecret, callbackUrl);

                client.Headers.Add("Authorization", authenticationHeader);

                string response = client.UploadString(rq, postData);

                var retData = HttpUtility.ParseQueryString(response);
                string token = retData["oauth_token"];


                string redirectUrl = string.Format("https://api.twitter.com/oauth/authenticate?oauth_token={0}", HttpUtility.UrlEncode(token));

                return Redirect(redirectUrl);

            }
            catch (Exception ex)
            {
                Agility.Web.Tracing.WebTrace.WriteException(ex);
                return Content("An error occurred while contacting Twitter for authentication.  Please close this window and try again.");
            }

        }

        public ActionResult TwitterRedirectStep2(string config, string callback)
        {
            HttpContext.Response.Cache.VaryByParams["*"] = true;
            string htmlOutput = "";
            try
            {
                string configReferenceName = config;
                if (string.IsNullOrEmpty(configReferenceName) || new AgilityContentRepository<AgilityContentItem>(configReferenceName).Item("") == null)
                {
                    throw new HttpException(500, string.Format("Agility Comments Configuration Item '{0}' not found", configReferenceName));
                }

                var configItem = new AgilityContentRepository<AgilityContentItem>(configReferenceName).Item("");
                string token = Request.QueryString["oauth_token"];
                string verifier = Request.QueryString["oauth_verifier"];
                string callbackFunction = callback;

                Uri rq = new Uri("https://api.twitter.com/oauth/access_token");

                OAuthBase oauth = new OAuthBase();

                string timestamp = oauth.GenerateTimeStamp();
                string nonce = oauth.GenerateNonce();

                string consumerKey = configItem["TwitterAPIConsumerKey"] as string;
                string consumerSecret = configItem["TwitterAPIConsumerSecret"] as string;

                var postData = string.Format("{0}={1}", "oauth_verifier", verifier);

                var authorizationHeader = oauth.CreateAuthenticationAccessHeader(rq.ToString(), "POST", consumerKey, consumerSecret, token, new Dictionary<string, string> { { "oauth_verifier", verifier } });

                WebClient client = new WebClient();

                client.Headers.Add("Authorization", authorizationHeader);

                string response = client.UploadString(rq, postData);

                var retData = HttpUtility.ParseQueryString(response);
                token = retData["oauth_token"];
                string secret = retData["oauth_token_secret"];
                string userID = retData["user_id"];
                string screenName = retData["screen_name"];

                if (!string.IsNullOrWhiteSpace(secret)
                    && !string.IsNullOrWhiteSpace(token)
                    && !string.IsNullOrWhiteSpace(screenName))
                {
                    //make sure everything came back ok...
                    
                    timestamp = oauth.GenerateTimeStamp();
                    nonce = oauth.GenerateNonce();

                    //get the fullname and other details as well...
                    string requestUrl = string.Format("https://api.twitter.com/1.1/account/verify_credentials.json");
                    
                    //can't get email unless app is whitelisted https://dev.twitter.com/rest/reference/get/account/verify_credentials
                    if (CommentsUtils.GetBool(configItem["TwitterRequestEmail"]))
                    {
                        requestUrl += "?include_email=true";
                    }
                    
                    rq = new Uri(requestUrl);

                    authorizationHeader = oauth.CreateAuthenticationAccessHeader(rq.ToString(), "GET", consumerKey, consumerSecret, token, new Dictionary<string, string>(), secret);
                    client.Headers["Authorization"] = authorizationHeader;
                    response = client.DownloadString(rq);

                    TwitterUser tUser = CommentsUtils.DeserializeJSONObject<TwitterUser>(response);

                    string name = tUser.name;
                    string twitterProfileImage = tUser.profile_image_url;
                    string email = tUser.email; 

                    //save the larger version of the profile image
                    twitterProfileImage = twitterProfileImage.Replace("_normal", "_bigger");


                    StringBuilder html = new StringBuilder();
                    html.Append("<html>");
                    html.AppendLine("<head>");
                    html.AppendLine("<title>Authenticating...</title>");
                    html.AppendLine("</head>");
                    html.AppendLine("<body>");
                    if(!string.IsNullOrEmpty(userID)) {
                        html.AppendLine("<script>");
                        html.AppendLine("if(window.opener) {");
                        html.AppendFormat("window.opener.{5}(\"{0}\",\"{1}\",\"{2}\",\"{3}\",\"{4}\");", userID, screenName, name, twitterProfileImage, email, callbackFunction);
                        html.AppendLine("window.close()");
                        html.AppendLine("} else {");
                        html.AppendLine("document.write(\"An error occurred during the authenticatin process. Please close your browser and try again.\");");
                        html.AppendLine("}");
                        html.AppendLine("</script>");
                    } else {
                        html.AppendLine("<script>window.close()</script>");
                    }

                    html.AppendLine("</body>");
                    html.AppendLine("</html>");

                    htmlOutput = html.ToString();
                }

                return Content(htmlOutput);
            }
            catch (Exception ex)
            {
                Agility.Web.Tracing.WebTrace.WriteException(ex);
                return Content(ex.Message);
            }
        }


        

        [HttpPost]
        [ValidateInput(false)]
        public ActionResult Login(string recordType)
        {
            HttpContext.Response.Cache.VaryByParams["*"] = true;

            string profileRecordTypeName = recordType;
            string cacheKey = string.Format("AgilityCommentsProfileSearch_{0}", profileRecordTypeName);

            string name = Request["AgilityCommentsName"];

            string loginID = Request["AgilityCommentsLoginID"];
            string externalPhotoUrl = Request["AgilityCommentsPhoto"];
            string copiedPhotoUrl = "";
            string loginType = Request["AgilityCommentsLoginType"];
            string email = Request["AgilityCommentsEmail"];
            string search = string.Format("AgilityCommentsLoginID = '{0}'", loginID);


            using (Agility_UGC_API_WCFClient client = UGCAPIUtil.GetAPIClient("http://ugc.agilitycms.com/agility-ugc-api-wcf.svc", TimeSpan.FromSeconds(10)))
            {
                int recordID = 0;
                DataServiceAuthorization dsa = UGCAPIUtil.GetDataServiceAuthorization(-1);

                LoginResult returnObject = new LoginResult();
                returnObject.isError = false;
                try
                {
                    var searchArg = new RecordSearchArg()
                    {
                        RecordTypeName = profileRecordTypeName,
                        Search = search,
                        PageSize = 1,
                        Columns = new List<string>() { "AgilityCommentsName",
                            "AgilityCommentsLoginPassword",
                            "AgilityCommentsEmail",
                            "AgilityCommentsPhoto",
                            "AgilityCommentsExternalPhoto",
                            "AgilityCommentsLoginID",
                            "AgilityCommentsLoginType" },
                        CacheKey = cacheKey
                    };

                    var res = client.SearchRecords(dsa, searchArg);

                    //generate the user's password based on the data we have
                    string password = FormsAuthentication.HashPasswordForStoringInConfigFile(string.Format("{0}_{1}", loginType, loginID), "sha1");

                    if (res.TotalRecords == 0)
                    {
                        //the user doesn't exist yet... create
                        Record userProfile = new Record()
                        {
                            RecordTypeName = profileRecordTypeName
                        };
                        userProfile["AgilityCommentsName"] = name;
                        userProfile["AgilityCommentsLoginPassword"] = password;
                        userProfile["AgilityCommentsLoginID"] = loginID;
                        userProfile["AgilityCommentsLoginType"] = loginType;
                        if (!string.IsNullOrEmpty(email))
                        {
                            userProfile["AgilityCommentsEmail"] = email;
                        }

                        //if they have a photo from a social login
                        if (!string.IsNullOrEmpty(externalPhotoUrl))
                        {

                            copiedPhotoUrl = CommentsUtils.CopyAndUploadPhoto(externalPhotoUrl);

                            //save the new copied url (stored in blob storage now) 
                            //this could be empty if there was a network error which will force the same action again next time they login
                            userProfile["AgilityCommentsPhoto"] = copiedPhotoUrl;
                            userProfile["AgilityCommentsExternalPhoto"] = externalPhotoUrl;
                        }


                        recordID = client.SaveRecord(dsa, userProfile, cacheKey);
                    }
                    else
                    {
                        
                        bool updateProfile = false;
                        var record = new Record();
                        record.ID = res.Records[0].ID;
                        record.RecordTypeName = profileRecordTypeName;

                        copiedPhotoUrl = res.Records[0]["AgilityCommentsPhoto"] as string;
                        string oldExternalPhotoUrl = res.Records[0]["AgilityCommentsExternalPhoto"] as string;

                        if (name != null && !name.Equals(res.Records[0]["AgilityCommentsName"] as string, StringComparison.InvariantCultureIgnoreCase))
                        {
                            record["AgilityCommentsName"] = name;
                            updateProfile = true;
                        }

                        //save the record with the new password if we have to	
                        if (string.IsNullOrWhiteSpace(res.Records[0]["AgilityCommentsLoginPassword"] as string))
                        {
                            record["AgilityCommentsLoginPassword"] = password;
                            updateProfile = true;
                        }

                        //save the record with the new password if we have to	
                        if (string.IsNullOrWhiteSpace(res.Records[0]["AgilityCommentsEmail"] as string) && !string.IsNullOrEmpty(email))
                        {
                            record["AgilityCommentsEmail"] = email;
                            updateProfile = true;
                        }
                        else
                        {
                            email = res.Records[0]["AgilityCommentsEmail"] as string;
                        }

                        //if Photo is blank and we have one from social login, then replace 
                        if ((string.IsNullOrEmpty(copiedPhotoUrl) && !string.IsNullOrEmpty(externalPhotoUrl)) || (!string.IsNullOrEmpty(externalPhotoUrl)) && (!externalPhotoUrl.Equals(oldExternalPhotoUrl)))
                        {
                            copiedPhotoUrl = CommentsUtils.CopyAndUploadPhoto(externalPhotoUrl);

                            //save the new copied url (stored in blob storage now) 
                            //this could be empty if there was a network error which will force the same action again next time they login
                            record["AgilityCommentsPhoto"] = copiedPhotoUrl;
                            record["AgilityCommentsExternalPhoto"] = externalPhotoUrl;
                            updateProfile = true;
                        }
                        else
                        {
                            copiedPhotoUrl = res.Records[0]["AgilityCommentsPhoto"] as string;
                        }

                        //update profile if neccessary
                        if (updateProfile)
                        {
                            client.SaveRecord(dsa, record);
                        }

                        recordID = res.Records[0].ID;
                    }

                    //log the user in as this user and return the token...
                    string token = AuthenticateProfile(loginID, password, profileRecordTypeName);
                    if (recordID > 0)
                    {
                        returnObject.recordID = recordID;
                        
                    }

                    if (!string.IsNullOrEmpty(email))
                    {
                        returnObject.email = email;
                    }

                    if (!string.IsNullOrEmpty(copiedPhotoUrl))
                    {
                        returnObject.photo = copiedPhotoUrl;
                    }

                    returnObject.token = token;

                }
                catch (Exception ex)
                {
                    returnObject.message = string.Format("An error occurred while logging in: {0}", ex.Message);
                    returnObject.isError = true;
                }

                return Json(returnObject, JsonRequestBehavior.AllowGet);
            }
        }

        public static string AuthenticateProfile(string login, string password, string recordTypeName)
        {
            string token = "";
            using (Agility_UGC_API_WCFClient client = UGCAPIUtil.GetAPIClient("http://ugc.agilitycms.com/agility-ugc-api-wcf.svc", TimeSpan.FromSeconds(10)))
            {

                DataServiceAuthorization dsa = UGCAPIUtil.GetDataServiceAuthorization(-1);
                token = client.AuthenticateWithNamedFields(dsa, recordTypeName, login, password, "AgilityCommentsLoginID", "AgilityCommentsLoginPassword");
            }

            return token;
        }

        protected virtual AgilityContentItem ResolveBlogPostDetails()
        {
            var post = AgilityContext.GetDynamicPageItem<AgilityContentItem>();

            return post;
        }
    }

}
