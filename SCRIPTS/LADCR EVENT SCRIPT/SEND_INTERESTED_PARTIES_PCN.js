//SEND_INTERESTED_PARTIES_PCN

	// Email Notification parameters
	var vEParams = aa.util.newHashtable();
	addParameter(vEParams, "$$LicenseType$$", appTypeAlias);
	addParameter(vEParams, "$$ExpirationDate$$", dateAdd(null, 60));
	addParameter(vEParams, "$$ApplicationID$$", capIDString);
	
	addParameter(vEParams, "$$businessName$$", getAppName(capId));
	addParameter(vEParams, "$$CommunityPlanArea$$", AInfo["Community Plan Area"]);
	addParameter(vEParams, "$$CouncilFileNo$$", AInfo["Council File Number"]);
	addParameter(vEParams, "$$CouncilDistrict$$", AInfo["Council District"]);

	vAddresses = getAddress(capId);
	if (vAddresses) {
		x = 0;
		for (x in vAddresses) {
			vAddress = vAddresses[x];

			if (vAddress) {
				var strAddress1 = vAddress.getHouseNumberStart();
				var addPart = vAddress.getStreetDirection();
				if (addPart && addPart != "") 
					strAddress1 += " " + addPart;
				var addPart = vAddress.getStreetName();
				if (addPart && addPart != "") 
					strAddress1 += " " + addPart;	
				var addPart = vAddress.getStreetSuffix();
				if (addPart && addPart != "") 
					strAddress1 += " " + addPart;	

				var strAddress2 = vAddress.getUnitType();
				var addPart = vAddress.getUnitStart();
				if (addPart && addPart != "") 
					strAddress2 += " " + addPart;
					
				var strCityStateZip = vAddress.getCity();
				var addPart = vAddress.getState();
				if (addPart && addPart != "") 
					strCityStateZip += ", " + addPart;	
				var addPart = vAddress.getZip();
				if (addPart && addPart != "") 
					strCityStateZip += " " + addPart;	
			}

			logDebug( "strAddress1= " + strAddress1);
			logDebug( "strAddress2= " + strAddress2);
			logDebug( "strCityStateZip= " + strCityStateZip);

			addParameter(vEParams, "$$address1$$", strAddress1);
			addParameter(vEParams, "$$address2$$", strAddress2);
			addParameter(vEParams, "$$cityStateZip$$", strCityStateZip);
			
			// Exit loop - assumes only one Business address type
			break;
		}
	}
	
	//Report parameter - not used
	var vRParams = aa.util.newHashtable();
	addParameter(vRParams, "p1Value", capIDString);

  	//us4-8362312074-aff97321c2@inbound.mailchimp.com
	emailAsync_BCC("ghess@accela.com", "DCR Interested Parties Notification PCN", vEParams, "", "");
