/// <reference path="jquery-1.10.2.intellisense.js" />

if (typeof (window.Agility) == "undefined") {
	window.Agility = new Object();	
}
(function(Agility) {



	//handle ctrl and shift
	Agility.isCtrl = false; 
	Agility.isAlt = false; 
	Agility.isShift = false; 

	$(document).keyup(function (e) { 
		switch (e.which) {
			case 16:
				Agility.isShift=false; 
				break;
			case 17:
				Agility.isCtrl=false; 
				break;
			case  18:
				Agility.isAlt=false; 	
				break;
		}
		
	}).keydown(function (e) { 
		switch (e.which) {
			case 16:
				Agility.isShift=true; 
				break;
			case 17:
				Agility.isCtrl=true; 
				break;
			case 18:
				Agility.isAlt=true; 	
				break;
		}
		
	});
	

	Agility.RegisterNamespace = function(space) {
		/// <summary>
		/// Register a javascript namespace.
		/// </summary>
		/// <param name="space" type="String">The namespace (dot-separated) to register.</param>
		/// <returns type="object">Object representing the created namespace.</returns>

		var spaces = space.split("."),
			root = window;

		for (var i = 0; i < spaces.length; i++) {
			if (typeof (root[spaces[i]]) == "undefined") {
				root = root[spaces[i]] = {};
			} else {
				root = root[spaces[i]];
			}
		}
		
		return root;
	}
	
	var _sessionLevelCacheKey = null;
	Agility.SessionLevelCacheKey = function() {
		/// <summary>
		/// gets a string that is based on the date and time that this page was loaded.  Use this for Client Templating with urls.
		/// </summary>
		
		if (_sessionLevelCacheKey == null) {
			_sessionLevelCacheKey = (new Date()).toString("yyyyMMddHHmmss");
		}
		return _sessionLevelCacheKey;
		
	};

	Agility.ResolveUrl = function(url) {
		/// <summary>
		/// Resolve "~/" to the application's base url. *Requires that global var "Edentity_BaseUrl" has been set.
		/// </summary>
		/// <param name="url" type="String">The URL whose path to resolve.</param>
		/// <returns type="string">String representing the resolved URL.</returns>

		var baseUrl = window.Agility_BaseUrl || "/";
		return url.replace(/^~\//, baseUrl);
	}
	
	
	var _unique = {};
	var _uniqueIndex = 0;
	Agility.UniqueID = function(prePend){
		/// <summary>
		/// Build a Unique ID (unique to this instance).
		/// </summary>
		/// <param name="prePend" type="String">The value to prepend to the Unique portion.</param>
						
		if (prePend == undefined || prePend == null || prePend == "") {
			return _uniqueIndex++;
		} else {
			if (_unique[prePend] == undefined) _unique[prePend] = 0;
			return prePend + _unique[prePend]++;
		}				
	}
	
	Agility.CloneObject = function (what, serializationType) {
		/// <summary>
		/// Clones an object to preserve the original value.
		/// </summary>
		/// <param name="what" type="object">The object to clone.</param>
		
		if (serializationType != undefined && serializationType != null && serializationType != "") {
			this.__type = serializationType;	
		}
		
		for (i in what) {
			if (what[i] == null) {
				this[i] = null;
			} else {
			 
				if (typeof what[i] == 'object') {
					this[i] = new Agility.CloneObject(what[i]);
				} else {
					var val = what[i];				
					this[i] = val;				
				}
			}
		}
	}


	
	Agility.QueryString = function(name, url) {
		/// <summary>
		/// Gets a variable from the query string.  
		/// </summary>
		/// <param name="name" type="String">QueryString variable to retrieve.</param>
		/// <param name="url" type="String">(Optional) the url to take the querystring from.  If this is not present, the current url is used.</param>
		
		if (url == undefined || url == null || url == "") {
			url = location.href;
		}
		
		var index = url.indexOf("?");
		if (index < 1 && index == url.length - 2) return null;
		if (url.indexOf("#") != -1) {
			url = url.substring(0, url.indexOf("#"));
		}
		
		var qstr = url.substring(index + 1, url.length);
		
		var ary1 = qstr.split("&");
		var retValue = null;
		
		jQuery.each(ary1, function(index, q) {
			var ary2 = q.split("=");
			if (ary2.length == 2) {
				if (unescape(ary2[0]).toLowerCase() == name.toLowerCase()) {
				
					retValue = ary2[1];					
					retValue = retValue.replace(/\+/g, "%20");
					retValue = unescape(retValue);
					return false;
				}
			}
		});
		
		return retValue;
		
	}
	
	Agility.ToJSONDate = function(dateObj) {
		/// <summary>
		/// Converts a Date object to a JSON string, and it will account for the timezone offset (\/Date(000000000000)\/). 
		/// </summary>
		/// <param name="dateObj" type="Date">Date object to convert.</param>
		

        var dtStr = Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), dateObj.getHours(), dateObj.getMinutes(), dateObj.getSeconds(), "0").toString();

		return "\/Date("+ dtStr +")\/";	
	}
	
	Agility.PadLeft = function(str, padChar) {
		
		str = str + "";
		while (str.length < padChar) {
			str = padChar + str;
		}
		
		return str;
	}
	
	Agility.GetFlashVersion = function() {
		/// <summary>Gets the number of the installed flash version.</summary>

	   var flashVersion = 0;
	   
		if (window.ActiveXObject) {   
			//ie
			var control = null;   
			try {   
				control = new ActiveXObject('ShockwaveFlash.ShockwaveFlash');   
				if (control) {					
					var version = control.GetVariable('$version').substring(4);   
					version = version.split(',');   
					flashVersion = parseInt(version[0]);
				}   
			} catch (e) {  				
			}   
			
		} else { 
	   
			//non ie
			if (navigator.plugins != null) {
				if (navigator.plugins.length > 0) {
					var flashPlugin = navigator.plugins['Shockwave Flash']; 

						if (typeof flashPlugin == 'object') {

							if (flashPlugin.description.indexOf("10") > 0 
								|| flashPlugin.description.indexOf("11") > 0 
								|| flashPlugin.description.indexOf("12") > 0) {
								return 10;
							
							}
							for (i=25;i>0;i--) {

								if (flashPlugin.description.indexOf(i+'.') != -1){ 
									flashVersion = i;

							}
						}
					}
				}
			}
		}
		
		return flashVersion;
	}

	
	
	Agility.SetCookie = function(name, value, expires, path, domain, secure ) {
	/// <summary>Sets a cookie based on the name and value provided.</summary>
	/// <param name="name" type="String">The name of the cookie to set the value of.</param>
	/// <param name="value" type="String">The value of the cookie to set.</param>
	/// <param name="expires" type="Date">(Optional) The date that the cookie should expire.</param>
	/// <param name="path" type="String">(Optional) The path of the cookie.</param>
	/// <param name="domain" type="String">(Optional) The domain of the cookie.</param>
	/// <param name="secure" type="Boolean">(Optional) Whether the cookie is secure or not.</param>

		var expires_date = expires;

		document.cookie = name + "=" +escape( value ) +
		( ( expires ) ? ";expires=" + expires_date.toGMTString() : "" ) +
		( ( path ) ? ";path=" + path : "" ) +
		( ( domain ) ? ";domain=" + domain : "" ) +
		( ( secure ) ? ";secure" : "" );
	}

	
	
	Agility.GetCookie = function ( cookieName ) {
	/// <summary>Gets the value of the given cookieName from the current cookies collection.</summary>
	/// <param name="cookieName" type="String">The name of the cookie to return.</param>

		// first we'll split this cookie up into name/value pairs
		// note: document.cookie only returns name=value, not the other components
		var a_all_cookies = document.cookie.split( ';' );
		var a_temp_cookie = '';
		var cookie_name = '';
		var cookie_value = '';
		var b_cookie_found = false; // set boolean t/f default f

		for ( i = 0; i < a_all_cookies.length; i++ )
		{
			// now we'll split apart each name=value pair
			a_temp_cookie = a_all_cookies[i].split( '=' );


			// and trim left/right whitespace while we're at it
			cookie_name = a_temp_cookie[0].replace(/^\s+|\s+$/g, '');

			// if the extracted name matches passed cookieName
			if ( cookie_name == cookieName )
			{
				b_cookie_found = true;
				// we need to handle case where cookie has no value but exists (no = sign, that is):
				if ( a_temp_cookie.length > 1 )
				{
					cookie_value = unescape( a_temp_cookie[1].replace(/^\s+|\s+$/g, '') );
				}
				// note that in cases where cookie is initialized but no value, null is returned
				return cookie_value;
				break;
			}
			a_temp_cookie = null;
			cookie_name = '';
		}
		if ( !b_cookie_found )
		{
			return null;
		}
	}
	

	

})(Agility);

