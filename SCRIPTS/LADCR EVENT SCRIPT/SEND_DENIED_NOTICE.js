// Begin script to send denial email
if (wfStatus.equals("Denied")) {
	//populate contact single address fields for report
	updateContactAddressFromAddressType(capId,"Owner Applicant","Mailing");
	
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	addParameter(vEParams, "$$businessName$$", capName);
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);
	emailContacts_BCC("All", "DCA OWNER APPLICANT DENIED NOTIFICATION", vEParams, "Denial of Permanent License", vRParams);
}
// End script to send denial email
