//Begin script to link amendment to application when user Defers Payment in ACA
var vParentId;
vParentId = "" + aa.env.getValue("ParentCapID");
if (vParentId == false || vParentId == null || vParentId == "") {
	var vAppId = getAppSpecific("Application ID");
	if (vAppId != "" && vAppId != null) {
		addParent(vAppId);
		// 3063 set global for later use
		var pCapId = aa.cap.getCapID(vAppId).getOutput();
		if (pCapId) {
			parentCapId = pCapId;
		}
	}
}
//End script to link amendment to application when user Defers Payment in ACA