//SEND_INTERESTED_PARTIES_PCN
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	
  addParameter(vEParams, "$$CommunityPlanArea$$", AInfo["Community Plan Area"]);
  addParameter(vEParams, "$$CouncilFileNo$$", AInfo["Council File Number"]);
  addParameter(vEParams, "$$CouncilDistrict$$", AInfo["Council District"]);

	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);
	
  //us4-8362312074-aff97321c2@inbound.mailchimp.com
	emailAsync_BCC("ghess@accela.com", "DCR Interested Parties Notification PCN", vEParams, "", "");
