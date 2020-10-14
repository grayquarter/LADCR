

var d = getZimasDataFromAddress();
if (d && d.data) {
	logDebug("got back " + JSON.stringify(d.data));
	populateZimasData(d.data);
} else {
	if (!appHasCondition("Address Not Validated", "Applied", null, null)) {
		addStdConditionWithComments("License Conditions", "Address Not Validated", "Address not validated with Zimas", JSON.stringify(d));
	}
}

function populateZimasData(theData) {
	for (var i in theData) {
		logDebug("editAppSpecific('" + i + "','" + theData[i] + "')");
		editAppSpecific(i, theData[i]);
	}
}
function getZimasDataFromAddress() {

	var addressURL = "http://zimas.lacity.org/zmaWS-DCR/zmaService.svc/GetZIMASAddress?";
	var dataURL = "http://zimas.lacity.org/zmaWS-1.0/zmaService.svc/GetZIMASDataByPINAndAPN?";
	var dataCount = 0;
	var altId = capId.getCustomID();
	//		appTypeAlias = vCap.getCapModel().getAppTypeAlias();
	//		vLicenseObj = new licenseObject(null, capId);
	var response = {};
	logDebug(altId + " processing...");
	response.altId = String(altId);
	var params = [];
	/*
	1.	HseNum
	2.	StrNm
	3.	StrDir = Street Direction; e.g. N, S, E, W
	4.	StrSfx = Street Suffix
	5.	HseFrc  = House Fraction; e.g. #/#
	6.	StrSfxDir = Street Suffix Direction; e,g, NORTH, SOUTH, EAST, WEST
	 */

	var add = aa.address.getAddressByCapId(capId).getOutput();
	if (add && add.length > 0) {
		var theAdd = add[0];
		if (theAdd.getHouseNumberStart())
			params.push("HseNum=" + theAdd.getHouseNumberStart());
		if (theAdd.getStreetName()) {
			var sn = theAdd.getStreetName().toUpperCase();
			params.push("StrNm=" + sn);
		}
		if (theAdd.getStreetDirection())
			params.push("StrDir=" + theAdd.getStreetDirection());
	}

	if (params.length == 0) {
		logDebug(altId + " no address data, skipping");
		return false;
	}

	var theUrl = encodeURI(addressURL + params.join("&"));
	response.url = String(theUrl);

	var vOutObj = aa.httpClient.get(theUrl);

	if (vOutObj.getSuccess()) {
		var vOut = vOutObj.getOutput();
		//  aa.print(vOut);
		// not sure if we need this JSON.parse, getOutput might do this already
		var vOutParsed = JSON.parse(vOut);
		logDebug("returned " + vOutParsed.length + " results");
		response.addressResults = String(vOutParsed.length);
	}

	// only get ZIMAS data if we have a known good address
	if (vOutParsed.length == 1) {

		theUrl = encodeURI(dataURL + "PIN=" + String(vOutParsed[0].PIN));
		response.dataurl = String(theUrl);

		var vOutObj = aa.httpClient.get(theUrl);

		if (vOutObj.getSuccess()) {
			var vOut = vOutObj.getOutput();
			var vOutParsed = JSON.parse(vOut);
			if (vOutParsed.length > 0) {

				logDebug("we have data");
				response.data = {};
				//var addrData = vOutParsed[0].Value.ZIMASDataTabs[0];
				var jurisData = vOutParsed[0].Value.ZIMASDataTabs[1];
				var zoningData = vOutParsed[0].Value.ZIMASDataTabs[2];
				var econoData = vOutParsed[0].Value.ZIMASDataTabs[8];
				var safetyData = vOutParsed[0].Value.ZIMASDataTabs[10];
				if (jurisData) {
					for (var i in jurisData.Value) {
						if ("Community Plan Area".equals(jurisData.Value[i].Description)) {
							response.data["Community Plan Area"] = String(jurisData.Value[i].Value);
						}
						if ("Council District".equals(jurisData.Value[i].Description)) {
							response.data["Council District"] = String(jurisData.Value[i].Value);
						}
						if ("Neighborhood Council".equals(jurisData.Value[i].Description)) {
							response.data["Neighborhood Council"] = String(jurisData.Value[i].Value);
						}
						if ("Area Planning Commission".equals(jurisData.Value[i].Description)) {
							response.data["Area Planning Commission"] = String(jurisData.Value[i].Value);
						}
					}
				}
				var zone = [];
				if (zoningData) {
					for (var i in zoningData.Value) {

						if ("CPIO: Community Plan Imp. Overlay".equals(zoningData.Value[i].Description)) {
							response.data["Overlay Zone"] = String(zoningData.Value[i].Value);
						}
						if ("Specific Plan Area".equals(zoningData.Value[i].Description)) {
							response.data["Specific Plan Area"] = String(zoningData.Value[i].Value);
						}
						if ("Zoning".equals(zoningData.Value[i].Description)) {
							zone.push(String(zoningData.Value[i].Value));
						}
					}
				}
				response.data["Zoning"] = String(zone.join(","));
				if (econoData) {
					for (var i in econoData.Value) {

						if ("Business Improvement District".equals(econoData.Value[i].Description)) {
							response.data["Business Improvement District"] = String(econoData.Value[i].Value);
						}
					}
				}
				if (safetyData) {
					for (var i in safetyData.Value) {
						if (safetyData.Value[i].Description.indexOf("Division / Station") >= 0) {
							response.data["LAPD Area Station"] = String(safetyData.Value[i].Value);
						}
						if (safetyData.Value[i].Description.indexOf("District / Fire Station") >= 0) {
							response.data["LAFD Fire Station"] = String(safetyData.Value[i].Value);
						}

					}
				}
			}
		}
	}
	return response;
}
