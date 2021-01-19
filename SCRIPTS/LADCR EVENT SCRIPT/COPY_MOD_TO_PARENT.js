if (wfTask.equals("Review") && wfStatus.equals("Changes Accepted")) {
	if (parentCapId) {
	
		//copy ASI infomation
		var AppSpecInfo = new Array();
		loadAppSpecific(AppSpecInfo, capId);

		for (asi in AppSpecInfo) {
			if (AppSpecInfo[asi] != null && AppSpecInfo[asi] != 'undefined') {
				logDebug("Copying ASI Field: " + asi + " Value: " + AppSpecInfo[asi]);
				editAppSpecific(asi, AppSpecInfo[asi], parentCapId);
			}
		}

		// copy over contacts 
        copyContacts3_0(capId, parentCapId);
        
        // copy conditions over from mod request
        copyConditions(capId, parentCapId);
	}
}
// End script to copy mod request info back to parent
