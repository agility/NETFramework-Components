using Agility.Web;
using Agility.Web.Components;
using Agility.Web.Objects;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Runtime.Serialization.Json;
using System.Text;

namespace Agility.Components.Comments.Classes
{
    public static class CommentsUtils
    {
        public static void EnsureCommentsCSSLoaded()
        {
            if (!CommentsContext.CommentsCSSLoaded)
            {
                if (AgilityContext.Page != null)
                {
                    AgilityContext.Page.MetaTagsRaw += string.Format("{0}{1}", Environment.NewLine, AgilityComponents.CSS("comments"));
                    CommentsContext.CommentsCSSLoaded = true;
                }
            }
        }

        public static void EnsureCommentsJSLoaded()
        {
            if (!CommentsContext.CommentsJSLoaded)
            {
                if (AgilityContext.Page != null)
                {
                    AgilityContext.Page.CustomAnalyticsScript += string.Format("{0}{1}", Environment.NewLine, AgilityComponents.JS("comments"));
                    CommentsContext.CommentsJSLoaded = true;
                }
            }
        }

        public static bool GetBool(object obj_bool)
        {
            bool value = false;

            if(obj_bool == null) return false;

            bool.TryParse(obj_bool.ToString(), out value);

            return value;
        }

        public static string GetAttachmentUrl(Attachment att)
        {
            string url = "";
            if(att != null) {
                url = att.URL;
            }

            return url;
        }

        public static string GetTranscodedUrl(string url, int thumbnailWidth = 0, int thumbnailHeight = 0, int cropType = 0)
        {
            if (thumbnailWidth > 0 || thumbnailHeight > 0)
            {
                url = string.Format("{0}?", url);

                if (thumbnailWidth > 0)
                {
                    url = string.Format("{0}w={1}", url, thumbnailWidth);
                }

                if (thumbnailHeight > 0)
                {
                    if (thumbnailWidth > 0)
                    {
                        url = url + "&";
                    }
                    url = string.Format("{0}h={1}", url, thumbnailHeight);
                }
                if (cropType > 0)
                {
                    url = string.Format("{0}&c={1}", url, cropType);
                }
            }

            return url;
        }

        public static string GetTranscodedUrl(Attachment attachment, int thumbnailWidth = 0, int thumbnailHeight = 0, int cropType = 0)
        {
            string url = string.Empty;

            if (attachment != null && !string.IsNullOrEmpty(attachment.URL))
            {
                url = attachment.URL;

                return GetTranscodedUrl(url, thumbnailWidth, thumbnailHeight, cropType);
            }
            else
            {
                return string.Empty;
            }

        }

        public static string CopyAndUploadPhoto(string originalUrl)
        {
            Guid guid = Guid.NewGuid();
            string folderName = "agilityugc/profiles/" + guid;

            try
            {
                var req = WebRequest.Create(originalUrl);
                using (var resp = req.GetResponse())
                {
                    using (var stream = resp.GetResponseStream())
                    {
                        string contentType = resp.ContentType;
                        string possibleFilename = Path.GetFileName(resp.ResponseUri.AbsolutePath);

                        string filename = string.Empty;
                        if (Path.HasExtension(possibleFilename))
                        {
                            filename = possibleFilename;
                        }
                        else
                        {
                            //add an extension
                            if (contentType == "image/jpeg") filename = possibleFilename + ".jpg";
                            if (contentType == "image/png") filename = possibleFilename + ".png";
                            if (contentType == "image/gif") filename = possibleFilename + ".gif";

                            if (string.IsNullOrEmpty(filename)) filename = possibleFilename;
                        }


                        var retStr = ServerAPI.UploadMedia(folderName, filename, contentType, stream);
                        var retObj = DeserializeJSONObject<APIResult<APIMediaResult>>(retStr);
                        if (!retObj.IsError)
                        {
                            //return the new url of the saved image in blob storage
                            return retObj.ResponseData.Url;
                        }

                    }
                }
            }
            catch (Exception ex)
            {
                Agility.Web.Tracing.WebTrace.WriteException(ex, "Could not retrieve Profile Image from social network, or could not save image to blob storage");
            }

            //return an empty url if there's an issue
            return string.Empty;
        }

        public static T DeserializeJSONObject<T>(string json)
        {
            var ds = new DataContractJsonSerializer(typeof(T));
            var msnew = new MemoryStream(Encoding.UTF8.GetBytes(json));
            var obj = (T)ds.ReadObject(msnew);
            return obj;
        }
    }
}
