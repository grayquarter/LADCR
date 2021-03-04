//SEND_APPLICATION_RENEWAL
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);
	
	emailContacts_BCC("All", "DCR Renewal Invoice", vEParams, "Invoice - Renewal as Doc", vRParams);
