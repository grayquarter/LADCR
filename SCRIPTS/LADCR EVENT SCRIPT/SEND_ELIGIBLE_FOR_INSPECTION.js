//SEND_ELIGIBLE_FOR_INSPECTION
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);
	
	//emailContacts_BCC("All", "DCR Eligible for Inspection Notice", vEParams, "Notice of Local Complianc as Doc", vRParams);
	//use new function to attach report to email
	emailContactsAttachDoc_BCC("All", "DCR Eligible for Inspection Notice", vEParams, "Notice of Local Complianc as Doc", vRParams, "N", "", "", true);
