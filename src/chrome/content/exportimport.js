/**
 * @author Gareth Hunt
 */
var ModifyResponseHeaders = {};

ModifyResponseHeaders.ExportImport = (function () {
	return {
		wizard: undefined,
		
		init: function (action) {
			this.modifyresponseheadersService = Components.classes["@modifyresponseheaders.mozdev.org/service;1"].getService(Components.interfaces.nsIModifyResponseHeaders);
			
			var headers = JSON.parse(this.modifyresponseheadersService.getHeaders());
			
			for (var i = 0; i < headers.length; i++) {
				action.selectedRows[i] = false;
			}
		}
	}
})();
