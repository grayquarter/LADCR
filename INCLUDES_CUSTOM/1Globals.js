// setting globals per EMSE_ENVIRONMENT standard choice

var ENVIRON = lookup("EMSE_ENVIRONMENT","ENVIRON");
var EMAILREPLIES = lookup("EMSE_ENVIRONMENT","EMAILREPLIES");
var SENDEMAILS = lookup("EMSE_ENVIRONMENT","SENDEMAILS").toUpperCase().equals("TRUE");
var ACAURL = lookup("EMSE_ENVIRONMENT","ACAURL");
var SLACKURL = lookup("EMSE_ENVIRONMENT","SLACKURL");
var DEBUGUSERS = lookup("EMSE_ENVIRONMENT","DEBUGUSERS");

//set Debug
var vDebugUsers = DEBUGUSERS.split(",");
if (exists(currentUserID,vDebugUsers)) {
	showDebug = 3;
	showMessage = true;
}

String.prototype.trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
}

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function(search, this_len) {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

String.prototype.formatToHTML = function () {
    return this.replace("&\amp;", "&").replace("&\nbsp;", " ").replace("&\lt;", "<").replace("&\gt;", ">").replace("&\quot;", "\"").replace("<br />", "\r\n");
}
