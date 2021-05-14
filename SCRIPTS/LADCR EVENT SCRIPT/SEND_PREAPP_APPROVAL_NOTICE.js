	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);
	logDebug("capIDString = " + capIDString);
	emailContacts_BCC("All", "DCR ELIGIBLE FOR PROCESSING NOTICE", vEParams, "Invoice - Application as Doc", vRParams);
