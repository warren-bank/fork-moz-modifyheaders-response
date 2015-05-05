/**
 * @author Gareth Hunt
 */
var ModifyResponseHeaders = ModifyResponseHeaders || {};

ModifyResponseHeaders.Preferences = (function () {
	return {
		openExportWizard: function () {
			window.openDialog("chrome://modify-response-headers/content/exportwizard.xul", "modifyresponseheadersExportWizard", "chrome,modal,titlebar,toolbar,resizeable,centerscreen,dialog=no", this);
		},
		openImportWizard: function () {
			var retVals ={
				importedHeaderCount: 0
			}
			var importDialog = window.openDialog("chrome://modify-response-headers/content/importwizard.xul", "modifyresponseheadersImportWizard", "chrome,modal,titlebar,toolbar,resizeable,centerscreen,dialog=no", this, retVals);
			ModifyResponseHeaders.headerListTreeView.data = JSON.parse(ModifyResponseHeaders.modifyresponseheadersService.getHeaders());
			ModifyResponseHeaders.headerListTreeView.treeBox.rowCountChanged(0, retVals.importedHeaderCount);
			ModifyResponseHeaders.headerListTreeView.selection.select(ModifyResponseHeaders.headerListTreeView.rowCount-1);
		}
	}	
})();

ModifyResponseHeaders.ActivateListener = (function (callback) {
	var listener = {
		register: function () {
			var prefService = Components.classes["@mozilla.org/preferences-service;1"].getService(Components.interfaces.nsIPrefService);
			this._branch = prefService.getBranch("modify-response-headers.");
			this._branch.QueryInterface(Components.interfaces.nsIPrefBranch2);
			this._branch.addObserver("", this, false);
		},
		
		unregister: function () {
			if (!this._branch) return;  
		    this._branch.removeObserver("", this);
		},
		
		observe: function (subject, topic, data) {
			if (topic == 'nsPref:changed') {
			    this._callback(this._branch, data);
			}
		}
	}
	listener._callback = callback;
	return listener;
});
