/**
 * @author gareth
 */
ModifyResponseHeaders.ExportImport.ImportWizard = (function () {
	return {
		initiated: false,
		importedConfig: [],
		selectedRows: [],
		
		init: function () {
			if (!this.initiated) {
				ModifyResponseHeaders.ExportImport.init(this);
				ModifyResponseHeaders.ExportImport.wizard = document.getElementById("modifyresponseheaders-import-wizard");
				ModifyResponseHeaders.ExportImport.wizard.canAdvance = false;
				this.retVal = window.arguments[1];
				this.initiated = true;
			}
		},
			
		openFileBrowser: function () {
	        var fpicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
		    var mode = fpicker.modeOpen;
	        var fpHeadStr = "Select location from which to load Modify Response Headers configuration";
		    
	        fpicker.init(window, fpHeadStr, mode);
		    
	        var showResult = fpicker.show();
	        if (showResult == fpicker.returnOK) {
	        	this.theFile = fpicker.file;
		        document.getElementById("file-path").value = this.theFile.path;
		        ModifyResponseHeaders.ExportImport.wizard.canAdvance = true;
	        }
		},
		
		loadHeaders: function () {
	        var cancel = false,
	        	data = new String();

	        if (this.theFile.exists()) {
	            try {
	                var fiStream = Components.classes["@mozilla.org/network/file-input-stream;1"].
	                    createInstance(Components.interfaces.nsIFileInputStream);
	                var siStream = Components.classes["@mozilla.org/scriptableinputstream;1"].
	                    createInstance(Components.interfaces.nsIScriptableInputStream);
	                fiStream.init(this.theFile, 1, 0, false);
	                siStream.init(fiStream);
	                data += siStream.read(-1);
	                siStream.close();
	                fiStream.close();
	                
	                var tempConfig = this.isJSON(data) || this.isXML(data) || null;
	                
	                tempConfig.forEach(function (header) {
	                	this.importedConfig.push(header);
	                }, this);
	                
	                // If the file is verified, the wizard can advance
	                if (this.importedConfig == null) {
	                	ModifyResponseHeaders.ExportImport.wizard.canAdvance = false;
	                	document.getElementById("error").hidden = false;
	                	cancel = true;
	                } else {
	                	ModifyResponseHeaders.ExportImport.wizard.canAdvance = true;
	                	document.getElementById("error").hidden = true;
	                }
	            } catch(e) {
	                Components.utils.reportError(e);
	            }
	        } else {
	        	ModifyResponseHeaders.ExportImport.wizard.canAdvance = false;
               	document.getElementById("error").hidden = false; // TODO Display a different error message
	            Components.utils.reportError("Error: File does not exist");
	            cancel = true;
	        }
	        return !cancel
		},
		
		isJSON: function (data) {
			var config = false;
			
			try {
				config = JSON.parse(data);
			} catch (e) {
				// Do nothing
			}
			
			return config;
		},
		
		isXML: function (data) {
			var config = false,
				header = null,
				characters = "",
				xmlReader = Components.classes["@mozilla.org/saxparser/xmlreader;1"]
				.createInstance(Components.interfaces.nsISAXXMLReader);

			xmlReader.contentHandler = {
				startDocument: function() {},
				endDocument: function() {},
				
				startElement: function(uri, localName, qName, attributes) {
					switch (localName) {
						case "modifyresponseheaders":
							config = new Array();
							break;
						case "header":
							header = {};
							break;
						case "action":
						case "name":
						case "value":
						case "comment":
							characters = "";
							break;
						default:
							throw "Invalid element: " + localName;
					}
				},
				
				endElement: function(uri, localName, qName) {
					switch (localName) {
						case "modifyresponseheaders":
							break;
						case "header":
							if (config && (config instanceof Array) && (header != null)) {
								config.push(header);
							} else {
								throw "No configuration to add header";
							}
							break;
						case "action":
							this.addHeaderProperty("action");
							break;
						case "name":
							this.addHeaderProperty("name");
							break;
						case "value":
							this.addHeaderProperty("value");
							break;
						case "comment":
							this.addHeaderProperty("comment");
							break;
						default:
							throw "End Element: " + localName;
					}
				},
				
				addHeaderProperty: function (prop) {
					if (header != null) {
						header[prop] = characters;
					} else {
						throw "Invalid header (" +  prop + ")"
					}
				},
				
				characters: function(value) {
					characters = value;
				},
				
				processingInstruction: function(target, data) {},
				ignorableWhitespace: function(whitespace) {},
				startPrefixMapping: function(prefix, uri) {},
				endPrefixMapping: function(prefix) {},
				
				// nsISupports
				QueryInterface: function(iid) {
					if (!iid.equals(Components.interfaces.nsISupports) &&
						!iid.equals(Components.interfaces.nsISAXContentHandler))
							throw Components.results.NS_ERROR_NO_INTERFACE;
					return this;
				}
			};
			
			try {
				xmlReader.parseFromString(data, "text/xml");
			} catch (e) {
                Components.utils.reportError(e);
			}
			
			return config;
		},

		showSelectHeaders: function () {
			document.getElementById("select-headers-tree").view = ModifyResponseHeaders.ExportImport.ImportWizard.selectHeadersTreeView;
			ModifyResponseHeaders.ExportImport.ImportWizard.headersSelected();
		},
		
		selectAllHeaders: function (checkBox) {
			for (var i = 0; i < ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig.length; i++) {
				ModifyResponseHeaders.ExportImport.ImportWizard.selectedRows[i] = !checkBox.checked;
			}
			ModifyResponseHeaders.ExportImport.wizard.canAdvance = !checkBox.checked;
		},
		
		headersSelected: function () {
			var trueCount = 0;
			
			for (var i = 0; i < ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig.length; i++) {
				if (ModifyResponseHeaders.ExportImport.ImportWizard.selectedRows[i]) {
					trueCount++;
				}
			}
			ModifyResponseHeaders.ExportImport.wizard.canAdvance = (trueCount > 0) ? true : false;
			document.getElementById("select-all-headers").checked = (trueCount == ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig.length) ? true : false;
		},
		
		selectHeadersTreeView: {
	        selection: null,
	        get rowCount() {
	        	return ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig.length;
	        },
	        getCellText: function(row,column) {
	        	if (column == "col-select" || column.id == "col-select") {
	        		return "";
	        	} else if (column == "col-action" || column.id == "col-action") {
	        		return ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig[row].action;
	            } else if (column == "col-header-name" || column.id == "col-header-name") {
	        		return ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig[row].name;
	            } else if (column == "col-header-value" || column.id == "col-header-value") {
	        		return ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig[row].value;
	            } else if (column == "col-comment" || column.id == "col-comment") {
	        		return ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig[row].comment;
	            }
	            return null;
	        },
	        getCellValue: function (row,column) {
	        	if (column == "col-select" || column.id == "col-select") {
	        		return ModifyResponseHeaders.ExportImport.ImportWizard.selectedRows[row];
	        	}
	        	return null;
	        },
	        setCellValue: function (row, column, value) {
	        	if (column == "col-select" || column.id == "col-select") {
	        		ModifyResponseHeaders.ExportImport.ImportWizard.selectedRows[row] = (value == "false" ? false : true);
	        		ModifyResponseHeaders.ExportImport.ImportWizard.headersSelected();
	        	}
	        },
	        setTree: function(treebox) { this.treeBox = treebox; },
	        isContainer: function(row) { return false; },
	        isEditable: function (row, column) {
	        	if (column == "col-select" || column.id == "col-select") {
	        		return true;
	        	}
	        	return false;
	        },
	        isSeparator: function(row) { return false; },
	        isSorted: function() { return false; },
	        getLevel: function(row) { return 0; },
	        getImageSrc: function(row,col) { return null; },
	        getRowProperties: function(row,props) {},
	        getCellProperties: function(row,col,props) {},
	        getColumnProperties: function(colid,col,props) {},
	        refresh: function(index) {
	            this.treeBox.invalidateRow(index);
	        }
		},
		
		showConfirm: function () {
			var count = 0;
			for (var i = 0; i < ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig.length; i++) {
				if (ModifyResponseHeaders.ExportImport.ImportWizard.selectedRows[i]) {
					count++;
				}
			}
			var confirmHeaderCount = document.getElementById("confirm-header-count");
			var confirmFilePath = document.getElementById("confirm-file-path");
				
			while (confirmHeaderCount.firstChild) {
				confirmHeaderCount.removeChild(confirmHeaderCount.firstChild);
			}
			while (confirmFilePath.firstChild) {
				confirmFilePath.removeChild(confirmFilePath.firstChild);
			}
			confirmHeaderCount.appendChild(document.createTextNode(count));
			confirmFilePath.appendChild(document.createTextNode(this.theFile.path));
		},
		
		import: function () {
			var importHeaders = [],
				exportHeadersJson = "",
				count = 0;
			
			var headers = JSON.parse(ModifyResponseHeaders.ExportImport.modifyresponseheadersService.getHeaders());
			
			for (var i = 0; i < ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig.length; i++) {
				// If selected, get the header from the importedConfig
				if (ModifyResponseHeaders.ExportImport.ImportWizard.selectedRows[i]) {
					var header = {
						action  : ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig[i].action,
						name    : ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig[i].name,
						value   : ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig[i].value,
						comment : ModifyResponseHeaders.ExportImport.ImportWizard.importedConfig[i].comment
					};
					headers.push(header);
					count++;
				}
			}
			ModifyResponseHeaders.ExportImport.modifyresponseheadersService.saveHeaders(JSON.stringify(headers));
			this.retVal.importedHeaderCount = count;
		}
	}
})();