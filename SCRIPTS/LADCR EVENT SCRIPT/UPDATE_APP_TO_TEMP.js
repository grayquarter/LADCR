// UPDATE_APP_TO_TEMP
// change alt id extension -APP to -TMP
// Created 03/16/2021

	altId = capId.getCustomID();
	var startOfExt = altId.indexOf("-APP");
	//logDebug("-- startOfExt = " + startOfExt) ;
	if (startOfExt > 0) {
		var newAltId = altId.slice(0,startOfExt);
		newAltId = newAltId + "-TMP";
		//logDebug("-- New Alt Id = " + newAltId) ;
		
		var updResult = aa.cap.updateCapAltID(capId, newAltId);

		//in case of duplicates...
		var capCount = 0;
		var unDupAltID = "";
		while(!updResult.getSuccess()){
			logDebug(" **Duplicate Found! - or error: " + newAltId);
			capCount = capCount + 1;
			unDupAltID = newAltId + "-" + capCount;
			updResult = aa.cap.updateCapAltID(capId, unDupAltID);
			if (capCount>10) break;
		}
		
		if (unDupAltID != "") newAltId = unDupAltID;

		logDebug("-- New Alt ID is " + newAltId);
		// update global var
		capIDString = newAltId;
	}
