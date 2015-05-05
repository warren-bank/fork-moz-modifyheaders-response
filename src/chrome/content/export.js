/**
 * @author gareth
 */

ModifyResponseHeaders.ExportImport.ExportWizard = (function () {
	return {
		initiated: false,
		selectedRows: [],
		
		init: function () {
			if (!this.initiated) {
				ModifyResponseHeaders.ExportImport.init(this);
				ModifyResponseHeaders.ExportImport.wizard = document.getElementById("modifyresponseheaders-export-wizard");
				ModifyResponseHeaders.ExportImport.wizard.canAdvance = false;
				ModifyResponseHeaders.ExportImport.ExportWizard.selectHeadersTreeView.data = JSON.parse(ModifyResponseHeaders.ExportImport.modifyresponseheadersService.getHeaders());
				document.getElementById("select-headers-tree").view = ModifyResponseHeaders.ExportImport.ExportWizard.selectHeadersTreeView;
				this.initiated = true;
			}
		},
			
		openFileBrowser: function () {
	        var fpicker = Components.classes["@mozilla.org/filepicker;1"].createInstance(Components.interfaces.nsIFilePicker);
	        fpicker.defaultString = "modifyresponseheaders.json";
		    fpicker.appendFilter("Modify Response Headers Configuration", "modifyresponseheaders.conf");
		    
		    var mode = fpicker.modeSave;
	        var fpHeadStr = "Select location to save Modify Response Headers configuration";
		    
	        fpicker.init(window, fpHeadStr, mode);
		    
	        var showResult = fpicker.show();
	        if (showResult == fpicker.returnOK || showResult == fpicker.returnReplace) {
	        	ModifyResponseHeaders.ExportImport.theFile = fpicker.file;
		        document.getElementById("file-path").value = ModifyResponseHeaders.ExportImport.theFile.path;
		        ModifyResponseHeaders.ExportImport.wizard.canAdvance = true;
	        }
		},

		showSelectHeaders: function () {
			ModifyResponseHeaders.ExportImport.ExportWizard.headersSelected();
		},
		
		showConfirm: function () {
			// TODO Modify the view to include the selected file path and list of selected headers
			var count = 0;
			for (var i = 0; i < this.selectHeadersTreeView.rowCount; i++) {
				if (ModifyResponseHeaders.ExportImport.ExportWizard.selectedRows[i]) {
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
			confirmFilePath.appendChild(document.createTextNode(ModifyResponseHeaders.ExportImport.theFile.path));
		},
		
		selectAllHeaders: function (checkBox) {
			for (var i = 0; i < this.selectHeadersTreeView.rowCount; i++) {
				ModifyResponseHeaders.ExportImport.ExportWizard.selectedRows[i] = !checkBox.checked;
			}
			ModifyResponseHeaders.ExportImport.wizard.canAdvance = !checkBox.checked;
		},
		
		headersSelected: function () {
			var trueCount = 0;
			
			for (var i = 0; i < this.selectHeadersTreeView.rowCount; i++) {
				if (ModifyResponseHeaders.ExportImport.ExportWizard.selectedRows[i]) {
					trueCount++;
				}
			}
			ModifyResponseHeaders.ExportImport.wizard.canAdvance = (trueCount > 0) ? true : false;
			document.getElementById("select-all-headers").checked = (trueCount == this.selectHeadersTreeView.rowCount) ? true : false;
		},
		
		saveConfiguration: function () {
			var exportHeaders = [],
				exportHeadersJson = "";
			
			for (var i = 0; i < this.selectHeadersTreeView.rowCount; i++) {
				// If selected, get the header from the service
				if (ModifyResponseHeaders.ExportImport.ExportWizard.selectedRows[i]) {
					var header = this.selectHeadersTreeView.data[i];
					exportHeaders.push(header);
				}
			}
			exportHeadersJson = JSON.stringify(exportHeaders);
			
			// Save the JS object to the specified file
			try {
	            var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"].
	                createInstance(Components.interfaces.nsIFileOutputStream);
	            var flags = 0x02 | 0x08 | 0x20; // wronly | create | truncate
	            foStream.init(ModifyResponseHeaders.ExportImport.theFile, flags, 0664, 0);
	            foStream.write(exportHeadersJson, exportHeadersJson.length);
	            foStream.close();
	        } catch (e) {
	            Components.utils.reportError(e);
	        }
		},
		
		selectHeadersTreeView: {
			data: [],
	        selection: null,
	        get rowCount() {
	        	return this.data.length;
	        },
	        getCellText: function(row,column) {
	        	if (column == "col-select" || column.id == "col-select") {
	        		return "";
	        	} else if (column == "col-action" || column.id == "col-action") {
	                return this.data[row].action;
	            } else if (column == "col-header-name" || column.id == "col-header-name") {
	            	return this.data[row].name;
	            } else if (column == "col-header-value" || column.id == "col-header-value") {
	            	return this.data[row].value;
	            } else if (column == "col-comment" || column.id == "col-comment") {
	            	return this.data[row].comment
	            }
	            return null;
	        },
	        getCellValue: function (row,column) {
	        	if (column == "col-select" || column.id == "col-select") {
	        		return ModifyResponseHeaders.ExportImport.ExportWizard.selectedRows[row];
	        	}
	        	return null;
	        },
	        setCellValue: function (row, column, value) {
	        	if (column == "col-select" || column.id == "col-select") {
	        		ModifyResponseHeaders.ExportImport.ExportWizard.selectedRows[row] = (value == "false" ? false : true);
	        		ModifyResponseHeaders.ExportImport.ExportWizard.headersSelected();
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
		}
	}
})();