// Script 60

var vEParams = aa.util.newHashtable();
addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
addParameter(vEParams, "$$ApplicationID$$", capIDString);
var vRParams = aa.util.newHashtable();
addParameter(vRParams, "p1Value", capIDString);
emailContacts_BCC('Owner,Social Equity Owner,Consultant,Authorized Agent,Law Firm,Accounting Firm,President,Chief Executive Officer', "LADCR_OWNER_INVOICE", vEParams, "Invoice Custom - Preapp", vRParams);

