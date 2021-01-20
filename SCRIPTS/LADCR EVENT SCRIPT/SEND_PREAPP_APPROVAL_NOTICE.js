//if (wfTask == "Supervisor Pre-App Document Review" && wfStatus == "Eligible for Processing") {
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	//addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	emailContacts_BCC("All", "DCA PREAPP LICENSE APPROVED NOTIFICATION", vEParams, "", "");
}
