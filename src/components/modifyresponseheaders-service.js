/* 
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * The Original Code is the modifyresponseheaders extension.
 * 
 * The Initial Developer of the Original Code is Gareth Hunt
 * <gareth-hunt@rocketmail.com>. Portions created by the Initial Developer
 * are Copyright (C) 2005 the Initial Developer. All Rights Reserved.
 *
 */
if (!ModifyResponseHeaders)
	var ModifyResponseHeaders = {};

if (!ModifyResponseHeaders.Header) {
	Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
	
	ModifyResponseHeaders.Header = function () {
		this.aAction   = "";
		this.aName     = "";
		this.aValue    = "";
		this.aComment  = "";
		this.aEnabled  = false;
		this.aSelected = true;
	};
	
	ModifyResponseHeaders.Header.prototype = {
		classDescription: "Modify Response Headers Header",
		classID:          Components.ID("{f76b2347-aea1-483d-861b-06b392bfa38f}"),
		contractID:       "@modifyresponseheaders.mozdev.org/header;1",
		
		QueryInterface: XPCOMUtils.generateQI([Components.interfaces.mhIHeader]),

		get action () { return this.aAction },
		set action (action) { this.aAction = action },
		
		get name () { return this.aName },
		set name (name) { this.aName = name },
		
		get value () { return this.aValue },
		set value (value) { this.aValue = value },
		 
		get comment () { return this.aComment },
		set comment (comment) { this.aComment = comment },
		
		get enabled () { return this.aEnabled },
		set enabled (enabled) { this.aEnabled = enabled },
		
		get selected () { return this.aSelected },
		set selected (selected) { this.aSelected = selected },
		
		equals: function (obj) {
			return (this.action.toLowerCase() == obj.action.toLowerCase() && this.name.toLowerCase() == obj.name.toLowerCase() && this.value.toLowerCase() == obj.value.toLowerCase()) ? true : false;
		}
	};
}

if (!ModifyResponseHeaders.Service) {
	Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
	
	ModifyResponseHeaders.Service = function () {
		this.configuration = {
			headers: []
		};
		this.preferencesUtil = new ModifyResponseHeaders.PreferencesUtil();
		this.initiated = false;
		this.winOpen = false;
	};
	
	ModifyResponseHeaders.Service.prototype = {
		classDescription: "Modify Response Headers Service",
		classID:          Components.ID("{1bb30833-e65f-492a-b8eb-9422b69716c7}"),
		contractID:       "@modifyresponseheaders.mozdev.org/service;1",
		
		QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIModifyResponseHeaders]),
		
		get count () {
			if (!this.initiated) {
				this.init();
			}
			return this.configuration.headers.length;
		},
		set count (c) { /* Do nothing */ },
		
		get active() {
			return this.preferencesUtil.getPreference("bool", this.preferencesUtil.prefActive);
		},
		
		set active (active) {
			this.preferencesUtil.setPreference("bool", this.preferencesUtil.prefActive, active);
		},
		
	    get openAsTab () {
			return this.preferencesUtil.getPreference("bool", this.preferencesUtil.prefOpenAsTab);
		},
		 
		set openAsTab (openAsTab) {
			this.preferencesUtil.setPreference("bool", this.preferencesUtil.prefOpenAsTab, openAsTab);
		},
		
		get windowOpen () {
			return this.winOpen;
		},
		
		set windowOpen (winOpen) {
			this.winOpen = winOpen;
		},
		
		// Load the headers from the preferences
		init: function () {
			if (!this.initiated) {
				var profileDir = Components.classes["@mozilla.org/file/directory_service;1"].
				getService(Components.interfaces.nsIProperties).
				get("ProfD", Components.interfaces.nsIFile);
				
				// Get the modifyresponseheaders configuration file
				this.configFile = this.initConfigFile();
				
				// Load the configuration data
				if (this.configFile.exists()) {
					try {
						var data = new String();
						var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"].
							createInstance(Components.interfaces.nsIFileInputStream);
						var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"].
							createInstance(Components.interfaces.nsIScriptableInputStream);
						fiStream.init(this.configFile, 1, 0, false);
						siStream.init(fiStream);
						data += siStream.read(-1);
						siStream.close();
						fiStream.close();
						this.configuration = JSON.parse(data);
					} catch(e) {
						Components.utils.reportError(e);
					}
				}
				
				// Attempt to migrate headers if none found before
				if (this.configuration.headers.length == 0 && !this.preferencesUtil.getPreference("bool", this.preferencesUtil.prefMigratedHeaders)) {
					this.migrateHeaders();
				}
				
				this.initiated = true;
			}
		},
		
		initConfigFile: function () {
			dump("\nEntered ModifyResponseHeaders.initConfigFile()");
	        // Get the configuration file
			var theFile = null;
			
	        try {
	            theFile = Components.classes["@mozilla.org/file/directory_service;1"].
	                     getService(Components.interfaces.nsIProperties).
	                     get("ProfD", Components.interfaces.nsIFile);
	            theFile.append("modify-response-headers.conf");
	        } catch (e) {
	            Components.utils.reportError(e);
	        }

	        return theFile;
	        dump("\nExiting ModifyResponseHeaders.initConfigFile()");
		},
		
		migrateHeaders: function () {
			// Read the preferences
			var headers = new Array();
			var headerCount = this.preferencesUtil.getPreference("int", this.preferencesUtil.prefHeaderCount);
		
			for (var i=0; i < headerCount; i++) {
				var header = {
					name: this.preferencesUtil.getPreference("char", this.preferencesUtil.prefHeaderName + i),
					value: this.preferencesUtil.getPreference("char", this.preferencesUtil.prefHeaderValue + i),
					action: this.preferencesUtil.getPreference("char", this.preferencesUtil.prefHeaderAction + i),
					comment: this.preferencesUtil.getPreference("char", this.preferencesUtil.prefHeaderComment + i),
					enabled: this.preferencesUtil.getPreference("bool", this.preferencesUtil.prefHeaderEnabled + i)
				};
				
				// Write to headers array
				headers.push(header);
			}
			
			// Write to configuration
			this.configuration.headers = headers;
			
			// Write to file
			this.saveConfiguration();
			
			// Set migrated preference
			this.preferencesUtil.setPreference("bool", this.preferencesUtil.prefMigratedHeaders, true)
		},
		  
		getHeaders: function () {
			if (!this.initiated) {
				this.init();
			}
			if (this.configuration && this.configuration.headers) {
				return JSON.stringify(this.configuration.headers);
			} else {
				Components.utils.reportError("Unable to getHeaders(), this.configuration.headers is null");
				return null;
			}
		},
		
		saveHeaders: function (headers) {
			if (headers != null) {
				this.configuration.headers = JSON.parse(headers);
			} else {
				Components.utils.reportError("Unable to saveHeaders(), headers argument is null");
			}
			this.saveConfiguration();
		},
		
		// Save configuration file
		saveConfiguration: function () {
			var data = JSON.stringify(this.configuration);

	        try {
	            var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
	                createInstance(Components.interfaces.nsIFileOutputStream);
	            var flags = 0x02 | 0x08 | 0x20; // wronly | create | truncate
	            foStream.init(this.configFile, flags, 0664, 0);
	            foStream.write(data, data.length);
	            foStream.close();
	    	} catch (e) {
	    		// TODO Work out a way of handling or reporting the error
	            Components.utils.reportError(e);
		    }
		}
	};
}

if (!ModifyResponseHeaders.Proxy) {
	Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");
	
	ModifyResponseHeaders.Proxy = function () {
		this.modifyresponseheadersService = Components.classes["@modifyresponseheaders.mozdev.org/service;1"].getService(Components.interfaces.nsIModifyResponseHeaders);
	};
	
	ModifyResponseHeaders.Proxy.prototype = {
		classDescription: "Modify Response Headers Proxy",
		classID:          Components.ID("{c5c58352-a576-4c0b-bb27-b4a860c6689f}"),
		contractID:       "@modifyresponseheaders.mozdev.org/proxy;1",
		
		QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIObserver]),
		
		_xpcom_categories: [{
			category: "profile-after-change",
			entry: "Modify Response Headers Proxy"
		}],
					
		// nsIObserver interface method
		observe: function (subject, topic, data) {
			if (['http-on-examine-response','http-on-examine-cached-response','http-on-examine-merged-response'].indexOf(topic) !== -1) {
				subject.QueryInterface(Components.interfaces.nsIHttpChannel);
				
				if (this.modifyresponseheadersService.active) {
					// TODO Fetch only enabled headers
					var headers = JSON.parse(this.modifyresponseheadersService.getHeaders());
					
					// TODO See if a foreach is better here
					for (var i=0; i < headers.length; i++) {
						if (headers[i].enabled) {
							var headerName = headers[i].name;
							
							// This is the default for action = Modify
							var headerValue = headers[i].value;
							var headerAppend = false;
							
							if (headers[i].action == "Add") {
								headerAppend = true;
							} else if (headers[i].action == "Filter") {
								headerValue = "";
							}
							
							// Handle Cookies separately
							if (headerName.toLowerCase() == "cookie") {
								headerAppend = false;
								if (headers[i].action == "Add") {
									// Throws failure code: 0x80040111 (NS_ERROR_NOT_AVAILABLE) [nsIHttpChannel.getResponseHeader]
									// if the Cookie is filtered before a new Cookie value is added
									try {
										var currentHeaderValue = subject.getResponseHeader(headerName);
										headerValue = currentHeaderValue + ";" + headerValue;
									} catch (err) {
										// Continue after error. Commenting out so the JS console is not spammed 
										// Components.utils.reportError("Continuing after error: " + err.message);
									}
								}
							}
							
							subject.setResponseHeader(headerName, headerValue, headerAppend);
						}
					}
					// TODO Add an optional ModifyResponseHeaders header so that users know the tool is active
					// subject.setResponseHeader("x-modifyresponseheaders", "version 0.4", true)
				}
			} else if (topic == 'profile-after-change') {
				if ("nsINetModuleMgr" in Components.interfaces) {
					// Should be an old version of Mozilla (before september 15, 2003
					// Do Nothing as these old versions of firefox (firebird, phoenix etc) are not supported
				} else {
					// Should be a new version of  Mozilla (after september 15, 2003)
					var observerService = Components.classes["@mozilla.org/observer-service;1"].getService(Components.interfaces.nsIObserverService);
					observerService.addObserver(this, "http-on-examine-response", false);
					observerService.addObserver(this, "http-on-examine-cached-response", false);
					observerService.addObserver(this, "http-on-examine-merged-response", false);
				}
			} else {
				//dump("\nNo observable topic defined");
			}
		}
	};
}

if (!ModifyResponseHeaders.PreferencesUtil) {
	ModifyResponseHeaders.PreferencesUtil = function () {
		this.prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
		this.prefService = this.prefService.getBranch("");
		this.prefActive          = "modify-response-headers.config.active";
		this.prefHeaderCount     = "modify-response-headers.headers.count";
		this.prefHeaderAction    = "modify-response-headers.headers.action";
		this.prefHeaderEnabled   = "modify-response-headers.headers.enabled";
		this.prefHeaderName      = "modify-response-headers.headers.name";
		this.prefHeaderValue     = "modify-response-headers.headers.value";
		this.prefHeaderComment   = "modify-response-headers.headers.comment";
		this.prefMigratedHeaders = "modify-response-headers.config.migrated";
		this.prefOpenAsTab       = "modify-response-headers.config.openNewTab";
	};
	
	ModifyResponseHeaders.PreferencesUtil.prototype = {
		getPreference: function (type, name) {
			var prefValue;
			
			if (this.prefService.prefHasUserValue(name)) {
				if (type=='bool') {
					prefValue = this.prefService.getBoolPref(name);
				} else if (type=='char') {
					prefValue = this.prefService.getCharPref(name);
				} else if (type=='int') {
					prefValue = this.prefService.getIntPref(name);
				}
				
				// Set the preference with a default value
			} else {
				if (type=='bool') {
					this.setPreference(type, name, false);
					prefValue = false;
				} else if (type=='char') {
					this.setPreference(type, name, "");
					prefValue = "";
				} else if (type=='int') {
					this.setPreference(type, name, 0);
					prefValue = 0;
				}
			}
			
			return prefValue;
		},

		// Convenience method to set a user preference
		setPreference: function (type, name, value) {
			if (type=='bool') {
				this.prefService.setBoolPref(name, value);
			} else if (type=='char') {
				this.prefService.setCharPref(name, value);
			} else if (type=='int') {
				this.prefService.setIntPref(name, value);
			}
		},
		
		deletePreference: function (name) {
			this.prefService.clearUserPref(name);
		}
	};
}

/* Entry point - registers the component with the browser */
if (XPCOMUtils.generateNSGetFactory) {
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([ModifyResponseHeaders.Service,ModifyResponseHeaders.Header,ModifyResponseHeaders.Proxy]);
} else {
    var NSGetModule = XPCOMUtils.generateNSGetModule([ModifyResponseHeaders.Service,ModifyResponseHeaders.Header,ModifyResponseHeaders.Proxy]);
}
