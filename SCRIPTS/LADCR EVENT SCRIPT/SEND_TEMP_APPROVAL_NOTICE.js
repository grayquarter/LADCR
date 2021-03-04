//SEND_TEMP_APPROVAL_NOTICE
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);
	
	emailContacts_BCC("All", "DCR Temporary Approval Notice", vEParams, "Temporary Approval Licens as Doc", vRParams);
