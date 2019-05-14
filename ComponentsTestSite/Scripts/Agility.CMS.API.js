/*! Agility CMS API
*/
/// <reference path="Agility.js" />


Agility.RegisterNamespace("Agility.CMS.API");

(function(API) {

	//CONSTANTS
	API.EMPTY_GUID = "00000000-0000-0000-0000-000000000000";
	
	API.Initialized = false;

	API.APIUrl = "";

	API.OnInit = function(API_Url, API_WebsiteName) {
		/// <summary>
		/// Initialize the Agility Content Server API
		/// </summary>
		/// <param name="API_Url" type="String">The URL to the Agility Server REST API.</param>        
		/// <param name="API_WebsiteName" type="String">The Website Name.</param>        
        
		if (API_Url != undefined && API_Url != null) {
			API.APIUrl = API_Url;
		}
		API.APIWebsiteName = API_WebsiteName;		
		API.Initialized = true;

	}

	

	function checkApiIntialized(callback) {

		if (API.APIUrl == null || API.APIUrl == "" || API.APIWebsiteName == undefined) {
			callback({
				IsError: true,
				Message: "The Agility CMS API has not been initialized.",
				ResponseData: null
			});

			return false;
		}

		return true;
	}


	

	API.SelectContentItems = function(searchArg, hash, callback) {
		/// <summary>
		/// Get a list of content items based on a search criteria.
		/// </summary>
		/// <param name="searchArg" type="Object">Object with the following: referenceName, pageSize, rowOffset, searchFilter, sortField, sortDirection.</param>
		/// <param name="callback" type="Function">The method to callback to.  Has 1 parameter with the following object: {IsError, ResponseData, Message}.</param>
		/*
			referenceName
			pageSize
			rowOffset
			searchFilter
			sortField
			sortDirection
		*/		

		/*
		Filter syntax:
		To search for a field called "IntTest"
			x.xmlData.value('(CI/I/IntTest)[1]', 'int') > 1
		To search for Title:
			x.Title = 'this is a title'
		To search for TextBlob:
			x.TextBlob = 'this is a textblob'
		To search for state:
			state = 'Staging'
		
		*/


		if (!checkApiIntialized(callback)) return;
		searchArg.hash = hash;
		var url = _buildAPIUrl("SelectContentItems", searchArg);

		jQuery.getJSON(url, callback);
	}

	API.GetContentItem = function(arg, hash, callback) {
		/// <summary>
		/// Get a Content Item based on its ID and Language
		/// </summary>
		/// <param name="arg" type="Function">Object with: contentID, languageCode</param>
		/// <param name="callback" type="Function">The method to callback to.  Has 1 parameter with the following object: {IsError, ResponseData, Message}.</param>      

		if (!checkApiIntialized(callback)) return;

		/*
		
		*/

		arg.hash = hash;

		var url = _buildAPIUrl("GetContentItem", arg);

		jQuery.getJSON(url, callback);
	}

	API.RequestApproval = function(arg, hash, callback) {
		/// <summary>
		/// Request approval for a piece of content.
		/// </summary>
		/// <param name="arg" type="Function">Object with: contentID, languageCode</param>
		/// <param name="callback" type="Function">The method to callback to.  Has 1 parameter with the following object: {IsError, ResponseData, Message}.</param>      

		if (!checkApiIntialized(callback)) return;

		arg.hash = hash;

		var url = _buildAPIUrl("RequestApproval",arg);
		jQuery.getJSON(url, callback);
	}


	API.GetThumbnailRootUrl = function(hash, callback) {
		if (!checkApiIntialized(callback)) return;

		var arg = {hash: hash};

		var url = _buildAPIUrl("GetThumbnailRootUrl", arg);

		jQuery.getJSON(url, callback);
	}


	API.PublishContent = function(arg, hash, callback) {
		/// <summary>
		/// Publish a piece of content.
		/// </summary>
		/// <param name="arg" type="Function">Object with: contentID, languageCode</param>
		/// <param name="callback" type="Function">The method to callback to.  Has 1 parameter with the following object: {IsError, ResponseData, Message}.</param>      

		if (!checkApiIntialized(callback)) return;

		arg.hash = hash;

		var url = _buildAPIUrl("PublishContent", arg);

		jQuery.getJSON(url, callback);
	}

	API.DeleteContent = function(arg, hash, callback) {
		/// <summary>
		/// Delete a piece of content.
		/// </summary>
		/// <param name="arg" type="Function">Object with: contentID, languageCode</param>
		/// <param name="callback" type="Function">The method to callback to.  Has 1 parameter with the following object: {IsError, ResponseData, Message}.</param>      

		if (!checkApiIntialized(callback)) return;

		arg.hash = hash;

		var url = _buildAPIUrl("DeleteContent", arg);

		jQuery.getJSON(url, callback);
	}
	
	API.SaveContentItem = function(arg, contentItem, attachments, hash, callback) {
		/// <summary>
		/// Saves a record type.
		/// </summary>
		/// <param name="contentID">The content ID to update (-1 if new).</param>      
		/// <param name="contentItem">The content Item to save.</param>      
		/// <param name="attachments">List of NEW attachments on this item (null if no new attachments).</param>      		
		/// <param name="callback" type="Function">The method to callback to.  Has 1 parameter with the following object: {ResponseType, ResponseData, Message}.</param>      

		if (!checkApiIntialized(callback)) return;

		var contentItemStr = Agility.JSON.encode(contentItem);
		var attachmentStr = null;
		if (attachments != null && attachments.length > 0) {
			attachmentStr = Agility.JSON.encode(attachments);
		}

		arg.hash = hash;

		var url = _buildAPIUrl("SaveContentItem", arg);

		_submitPostData(url, {contentItem:contentItemStr, attachments:attachmentStr}, callback);
	}

	function _buildAPIUrl(methodName, args) {
		var url = API.APIUrl;
		if (url == "" || url == null) return null;
		
		//ensure the url ends with /
		if (url.lastIndexOf("/") != url.length - 1) url += "/";

		//create the base url for the call
		url += methodName + "?callback=?&website=" + escape(API.APIWebsiteName);


		for (var prop in args) {
			url += "&" + prop + "=" + escape(args[prop]);
	    }

		return url;
	}



	function _submitPostData(url, postData, callback) {

		//build the unique ids
		var uniqueID = Agility.UniqueID("postDataForm");

		var uniqueFormID = uniqueID + "_form";
		var uniqueIFrameID = uniqueID + "_iframe";

		//build the return url to come back to the AgilityRedirector.htm page
		var returnUrl = location.href;
		returnUrl = returnUrl.substring(0, returnUrl.indexOf("/", returnUrl.indexOf("//") + 2));
		returnUrl += Agility.ResolveUrl("~/AgilityRedirector.htm");

		var blankUrl = Agility.ResolveUrl("~/AgilityRedirector.htm");

		//remove the method callback from the url
		url = url.replace("?callback=?", "?returnurl=" + escape(returnUrl));

		//build the html for the form and iframe
		var formHtml = "<div id=\"" + uniqueID + "\" style='display:none'><form id=\"" + uniqueFormID + "\" method=\"post\" action=\"" + url + "\" target=\"" + uniqueIFrameID + "\">";
		if (typeof postData == "string") {
			formHtml += "<input type=\"text\" name=\"postdata\" />";
		} else {
			for(prop in postData)
			{
				formHtml += "<input type=\"text\" name=\""+prop+"\" />";
			}
		}
		formHtml += "<input type=\"text\" name=\"url\" />";
		formHtml += "</form>"
		formHtml += "<iframe id=\"" + uniqueIFrameID + "\" name=\"" + uniqueIFrameID + "\" src=\"" + blankUrl + "\"></iframe>";
		formHtml += "</div>";


		//add the elements to the DOM
		var thisBody = jQuery(document.body);
		jQuery(thisBody).append(formHtml);

		//create the actual DOM elements
		var div = jQuery("#" + uniqueID);
		var form = jQuery("#" + uniqueFormID);
		var iframe = jQuery("#" + uniqueIFrameID);

		if (typeof postData == "string") {
			$("input[name=postdata]", form).val(postData);
		} else {
			for(prop in postData)
			{
				$("input[name="+prop+"]", form).val(postData[prop]);			
			}
		}


		//capture the load event of the form.
		jQuery(iframe).load(function() {

			var frm = window.frames[uniqueIFrameID];

			var isError = true;

			var loc = frm.location;

			if (loc != null) {
				var href = loc.href;
				var errTest = Agility.QueryString("IsError", href);
				if (errTest == null) errTest = "true";
				isError = errTest.toLowerCase() == "true";				
			}


			var data = {
				IsError: isError,
				Message: Agility.QueryString("Message", href),
				ResponseData: Agility.QueryString("ResponseData", href)
			};

			//call the callback
			setTimeout(function() {
				callback(data);
			}, 0);

			//remove the elements...						
			setTimeout(function() {
				div.empty();
			}, 0);

		});

		//submit the form
		form.submit();
	}



	

})(Agility.CMS.API);