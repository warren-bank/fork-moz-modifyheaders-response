// reference:
//   http://en.wikipedia.org/wiki/List_of_HTTP_header_fields#Response_fields
/*
(function($){
	var $table, $cells, fields;
	$table = $('tr#accept-ranges-response-header').parent();
	$cells = $table.children('tr').children('td:first-child');
	$cells.children().remove();
	fields = [];
	$cells.each(function(){
		var $cell = $(this);
		fields.push( $cell.text() );
	});
	console.log( JSON.stringify(fields) );
})(jQuery);
 */
pref('modifyheaders.autocomplete.name.defaults', '["Access-Control-Allow-Origin","Accept-Ranges","Age","Allow","","Connection","Content-Encoding","Content-Language","Content-Length","Content-Location","Content-MD5","Content-Disposition","Content-Range","Content-Type","Date","","Expires","Last-Modified","Link","","P3P","Pragma","Proxy-Authenticate","","Retry-After","Server","Set-Cookie","Status","","Trailer","Transfer-Encoding","","Vary","Via","Warning","WWW-Authenticate","X-Frame-Options"]');
