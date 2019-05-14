/*! Agility
*/
/// <reference path="../External/moment.js" />
/// <reference path="../External/numeral.js" />
/// <reference path="../External/jquery.js" />

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
			
			_sessionLevelCacheKey = moment().format("YYYYMMDDHHmmss");
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
				
		dateObj.setMinutes(dateObj.getMinutes() + dateObj.getTimezoneOffset());
				
		var dtStr = dateObj.getFullYear() + "-" + Agility.PadLeft(dateObj.getMonth() + 1, "0") + "-" + Agility.PadLeft(dateObj.getDate() + 1, "0") + " " + Agility.PadLeft(dateObj.getHours(), "0") + ":" + Agility.PadLeft(dateObj.getMinutes(), "0") + ":" + Agility.PadLeft(dateObj.getSeconds(), dateObj.getMilliseconds(), "0");
		
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
	 					if (flashPlugin.version) {
	 						var vstr = flashPlugin.version;
	 						if (vstr) flashVersion = parseInt(vstr.split(".")[0]);						
	 					} else {						
	 						var desc = flashPlugin.description;
	 						if (desc) flashVersion = parseInt(desc.replace("Shockwave Flash ", "").split(".")[0]);										
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
	
    Agility.DeleteCookie = function(name, path, domain, secure) {
    /// <summary>Delete a cookie based on the name provided.</summary>
	/// <param name="name" type="String">The name of the cookie to set the value of.</param>
	/// <param name="path" type="String">(Optional) The path of the cookie.</param>
	/// <param name="domain" type="String">(Optional) The domain of the cookie.</param>
	/// <param name="secure" type="Boolean">(Optional) Whether the cookie is secure or not.</param>

        if (Agility.GetCookie(name)) {
            document.cookie = name + "=" + (path ? ";path=" + path : "") +
                (domain ? ";domain=" + domain : "" ) + (secure ? ";secure" : "") +
                ";expires=Thu, 01-Jan-1970 00:00:01 GMT";
        }
    };


    Agility.JSON = new function () {

        /* Section: Methods - Public */

        /*
        Method: decode
        decodes a valid JSON encoded string.
        
        Arguments:
        [String / Function] - Optional JSON string to decode or a filter function if method is a String prototype.
        [Function] - Optional filter function if first argument is a JSON string and this method is not a String prototype.
        
        Returns:
        Object - Generic JavaScript variable or undefined
        
        Example [Basic]:
        >var	arr = JSON.decode('[1,2,3]');
        >alert(arr);	// 1,2,3
        >
        >arr = JSON.decode('[1,2,3]', function(key, value){return key * value});
        >alert(arr);	// 0,2,6
        
        Example [Prototype]:
        >String.prototype.parseJSON = JSON.decode;
        >
        >alert('[1,2,3]'.parseJSON());	// 1,2,3
        >
        >try {
        >	alert('[1,2,3]'.parseJSON(function(key, value){return key * value}));
        >	// 0,2,6
        >}
        >catch(e) {
        >	alert(e.message);
        >}
        
        Note:
        Internet Explorer 5 and other old browsers should use a different regular expression to check if a JSON string is valid or not.
        This old browsers dedicated RegExp is not safe as native version is but it required for compatibility.
        */
        this.decode = function () {
            var filter, result, self, tmp;
            if ($$("toString")) {
                switch (arguments.length) {
                    case 2:
                        self = arguments[0];
                        filter = arguments[1];
                        break;
                    case 1:
                        if ($[typeof arguments[0]](arguments[0]) === Function) {
                            self = this;
                            filter = arguments[0];
                        }
                        else
                            self = arguments[0];
                        break;
                    default:
                        self = this;
                        break;
                };
                if (rc.test(self)) {
                    try {
                        result = e("(".concat(self, ")"));
                        if (filter && result !== null && (tmp = $[typeof result](result)) && (tmp === Array || tmp === Object)) {
                            for (self in result)
                                result[self] = v(self, result) ? filter(self, result[self]) : result[self];
                        }
                    }
                    catch (z) { }
                }
                else {
                    throw new JSONError("bad data");
                }
            };
            return result;
        };

        /*
        Method: encode
        encode a generic JavaScript variable into a valid JSON string.
        
        Arguments:
        [Object] - Optional generic JavaScript variable to encode if method is not an Object prototype.
        
        Returns:
        String - Valid JSON string or undefined
        
        Example [Basic]:
        >var	s = Agility.JSON.encode([1,2,3]);
        >alert(s);	// [1,2,3]
        
        Example [Prototype]:
        >Object.prototype.toJSONString = Agility.JSON.encode;
        >
        >alert([1,2,3].toJSONString());	// [1,2,3]
        */
        this.encode = function () {
            var self = arguments.length ? arguments[0] : this,
                result, tmp;
            if (self === null)
                result = "null";
            else if (self !== undefined && (tmp = $[typeof self](self))) {
                switch (tmp) {
                    case Array:
                        result = [];
                        for (var i = 0, j = 0, k = self.length; j < k; j++) {
                            if (self[j] !== undefined && (tmp = Agility.JSON.encode(self[j])))
                                result[i++] = tmp;
                        };
                        result = "[".concat(result.join(","), "]");
                        break;
                    case Boolean:
                        result = String(self);
                        break;
                    case Date:
                        result = '"'.concat(self.getFullYear(), '-', d(self.getMonth() + 1), '-', d(self.getDate()), 'T', d(self.getHours()), ':', d(self.getMinutes()), ':', d(self.getSeconds()), '"');
                        break;
                    case Function:
                        break;
                    case Number:
                        result = isFinite(self) ? String(self) : "null";
                        break;
                    case String:
                        result = '"'.concat(self.replace(rs, s).replace(ru, u), '"');
                        break;
                    default:
                        var i = 0, key;
                        result = [];
                        for (key in self) {
                            if (self[key] !== undefined && (tmp = Agility.JSON.encode(self[key])))
                                result[i++] = '"'.concat(key.replace(rs, s).replace(ru, u), '":', tmp);
                        };
                        result = "{".concat(result.join(","), "}");
                        break;
                }
            };
            return result;
        };

        /*
        Method: toDate
        transforms a JSON encoded Date string into a native Date object.
        
        Arguments:
        [String/Number] - Optional JSON Date string or server time if this method is not a String prototype. Server time should be an integer, based on seconds since 1970/01/01 or milliseconds / 1000 since 1970/01/01.
        
        Returns:
        Date - Date object or undefined if string is not a valid Date
        
        Example [Basic]:
        >var	serverDate = JSON.toDate("2007-04-05T08:36:46");
        >alert(serverDate.getMonth());	// 3 (months start from 0)
        
        Example [Prototype]:
        >String.prototype.parseDate = JSON.toDate;
        >
        >alert("2007-04-05T08:36:46".parseDate().getDate());	// 5
        
        Example [Server Time]:
        >var	phpServerDate = JSON.toDate(<?php echo time(); ?>);
        >var	csServerDate = JSON.toDate(<%=(DateTime.Now.Ticks/10000-62135596800000)%>/1000);
        
        Example [Server Time Prototype]:
        >Number.prototype.parseDate = JSON.toDate;
        >var	phpServerDate = (<?php echo time(); ?>).parseDate();
        >var	csServerDate = (<%=(DateTime.Now.Ticks/10000-62135596800000)%>/1000).parseDate();
        
        Note:
        This method accepts an integer or numeric string too to mantain compatibility with generic server side time() function.
        You can convert quickly mtime, ctime, time and other time based values.
        With languages that supports milliseconds you can send total milliseconds / 1000 (time is set as time * 1000)
        */
        this.toDate = function () {
            var self = arguments.length ? arguments[0] : this,
                result;
            if (rd.test(self)) {
                result = new Date;
                result.setHours(i(self, 11, 2));
                result.setMinutes(i(self, 14, 2));
                result.setSeconds(i(self, 17, 2));
                result.setMonth(i(self, 5, 2) - 1);
                result.setDate(i(self, 8, 2));
                result.setFullYear(i(self, 0, 4));
            }
            else if (rt.test(self))
                result = new Date(self * 1000);
            return result;
        };

        /* Section: Properties - Private */

        /*
        Property: Private
        
        List:
        Object - 'c' - a dictionary with useful keys / values for fast encode convertion
        Function - 'd' - returns decimal string rappresentation of a number ("14", "03", etc)
        Function - 'e' - safe and native code evaulation
        Function - 'i' - returns integer from string ("01" => 1, "15" => 15, etc)
        Array - 'p' - a list with different "0" strings for fast special chars escape convertion
        RegExp - 'rc' - regular expression to check JSON strings (different for IE5 or old browsers and new one)
        RegExp - 'rd' - regular expression to check a JSON Date string
        RegExp - 'rs' - regular expression to check string chars to modify using c (char) values
        RegExp - 'rt' - regular expression to check integer numeric string (for toDate time version evaluation)
        RegExp - 'ru' - regular expression to check string chars to escape using "\u" prefix
        Function - 's' - returns escaped string adding "\\" char as prefix ("\\" => "\\\\", etc.)
        Function - 'u' - returns escaped string, modifyng special chars using "\uNNNN" notation
        Function - 'v' - returns boolean value to skip object methods or prototyped parameters (length, others), used for optional decode filter function
        Function - '$' - returns object constructor if it was not cracked (someVar = {}; someVar.constructor = String <= ignore them)
        Function - '$$' - returns boolean value to check native Array and Object constructors before convertion
        */
        var c = { "\b": "b", "\t": "t", "\n": "n", "\f": "f", "\r": "r", '"': '"', "\\": "\\", "/": "/" },
            d = function (n) { return n < 10 ? "0".concat(n) : n },
            e = function (c, f, e) { e = eval; delete eval; if (typeof eval === "undefined") eval = e; f = eval("" + c); eval = e; return f },
            i = function (e, p, l) { return 1 * e.substr(p, l) },
            p = ["", "000", "00", "0", ""],
            rc = null,
            rd = /^[0-9]{4}\-[0-9]{2}\-[0-9]{2}T[0-9]{2}:[0-9]{2}:[0-9]{2}$/,
            rs = /(\x5c|\x2F|\x22|[\x0c-\x0d]|[\x08-\x0a])/g,
            rt = /^([0-9]+|[0-9]+[,\.][0-9]{1,3})$/,
            ru = /([\x00-\x07]|\x0b|[\x0e-\x1f])/g,
            s = function (i, d) { return "\\".concat(c[d]) },
            u = function (i, d) {
                var n = d.charCodeAt(0).toString(16);
                return "\\u".concat(p[n.length], n)
            },
            v = function (k, v) { return $[typeof result](result) !== Function && (v.hasOwnProperty ? v.hasOwnProperty(k) : v.constructor.prototype[k] !== v[k]) },
            $ = {
                "boolean": function () { return Boolean },
                "function": function () { return Function },
                "number": function () { return Number },
                "object": function (o) { return o instanceof o.constructor ? o.constructor : null },
                "string": function () { return String },
                "undefined": function () { return null }
            },
            $$ = function (m) {
                function $(c, t) { t = c[m]; delete c[m]; try { e(c) } catch (z) { c[m] = t; return 1 } };
                return $(Array) && $(Object)
            };
        try { rc = new RegExp('^("(\\\\.|[^"\\\\\\n\\r])*?"|[,:{}\\[\\]0-9.\\-+Eaeflnr-u \\n\\r\\t])+?$') }
        catch (z) { rc = /^(true|false|null|\[.*\]|\{.*\}|".*"|\d+|\d+\.\d+)$/ }
    };
	

})(Agility);

