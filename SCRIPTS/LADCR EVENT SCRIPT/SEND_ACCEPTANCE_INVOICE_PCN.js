//SEND_ACCEPTANCE_INVOICE_PCN
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);
	
	emailContacts_BCC("All", "DCR Generic Invoice", vEParams, "Invoice - PCN Request as Doc", vRParams);
