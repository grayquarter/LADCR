// Get AA script root
var aa = expression.getScriptRoot();

// Get expression fields
var vUserID = expression.getValue("$$userID$$").value;
var vUserGroup = expression.getValue("$$userGroup$$").value;
var vGAUserID = expression.getValue("$$gaUserID$$").value;
var vStreetNbr = expression.getValue("ADDR::addressesModel*houseNumberStart");
var vStreetName = expression.getValue("ADDR::addressesModel*streetName");
var vDirection = expression.getValue("ADDR::addressesModel*streetDirection");
var vZip = expression.getValue("ADDR::addressesModel*zip");
var vCity = expression.getValue("ADDR::addressesModel*city");
var vState = expression.getValue("ADDR::addressesModel*state");
var addrForm = expression.getValue("ADDR::FORM");

var message = "";
try {
	if (vStreetNbr.value != "" && vStreetName.value != "") { 
		
		var response = getZimasDataFromAddress(vStreetName.value, vStreetNbr.value, vDirection.value);
		var data = response.addressResults;
		var communityData = response.data;
		var checkCPA = null;
		if(communityData) {
			var communityPlanningArea = communityData["Community Plan Area"];
			checkCPA = lookup("UNDUE_CONCENTRATION", communityPlanningArea);
		}
		
		if (data && data.length > 0) {
			if (data.length > 1) {
				vStreetName.message = "Address has " + data.length + " matches. Please try adding a street direction";
			} else {
				if(!!checkCPA) {
					logDebug("We found a lookup for this.");
					addrForm.blockSubmit = true;
					addrForm.message = "Applicants seeking to engage in Retail, Cultivation and Volatile-Manufacturing Commercial Cannabis Activity in a CPA that is unduly concentrated are required to file a request that the City Council find that approval of the License application would serve a public convenience or necessity (PCN) supported by evidence in the record pursuant to LAMC Section 104.03(a)(4)."
					expression.setReturn(vStreetName);
					expression.setReturn(addrForm);
				} else {
					addrForm.message = "The Community Plan Area (CPA) that you have selected has not reached Undue Concentration under Los Angeles Municipal Code (LAMC) Section 104.01(a)(48). An area is considered unduly concentrated when DCR issues the maximum number of these license types in that CPA.";
					addrForm.blockSubmit = false;
					expression.setReturn(addrForm);
					//vStreetName.message = "Zimas Data: " + JSON.stringify(data[0])
					vStreetName.message = "Address validated";
					vZip.value = data[0].ZIP;
					logDebug(data[0].ZIP);
					expression.setReturn(vZip);
					vStreetName.value = vStreetName.value.toUpperCase();
					vDirection.value = vDirection.value.toUpperCase();
					expression.setReturn(vDirection);
					vCity.value = "LOS ANGELES";
					expression.setReturn(vCity);
					vState.value = "CA";
					expression.setReturn(vState);
				}
			}
		} else {
			vStreetName.message = "No matching address found";
		}
		expression.setReturn(vStreetName.message);
    }
} catch (err) {
	vStreetName.message = "Zimas Error: " + err.message;
	expression.setReturn(vStreetName);
}

function getZimasDataFromAddress(street, nbr, dir) {

	var addressURL = lookup("Address_Verification_Interface_Settings", "ADDRESS_URL");
    var apiKey = lookup("Address_Verification_Interface_Settings", "API_KEY");
	var dataURL = lookup("Address_Verification_Interface_Settings", "DATA_URL");
	var header = aa.httpClient.initPostParameters();
	header.put("X-API-Key", apiKey);
	header.put("Content-Type", "application/json");
	//		appTypeAlias = vCap.getCapModel().getAppTypeAlias();
	//		vLicenseObj = new licenseObject(null, capId);
	var response = {};
	var params = [];
	var vOutParsed = null;

	/*
	1.	HseNum
	2.	StrNm
	3.	StrDir = Street Direction; e.g. N, S, E, W
	4.	StrSfx = Street Suffix
	5.	HseFrc  = House Fraction; e.g. #/#
	6.	StrSfxDir = Street Suffix Direction; e,g, NORTH, SOUTH, EAST, WEST
	 */

	if (nbr)
		params.push("HseNum=" + nbr);
	if (street) {
		var sn = street.toUpperCase();
		params.push("StrNm=" + sn);
	}
	if (dir) {
		params.push("StrDir=" + dir);
	}

	var theUrl = encodeURI(addressURL + params.join("&"));
	response.url = String(theUrl);

	var vOutObj = aa.httpClient.get(theUrl, header);

	if (vOutObj.getSuccess()) {
		var vOut = vOutObj.getOutput();
		//  aa.print(vOut);
		// not sure if we need this JSON.parse, getOutput might do this already
		vOutParsed = JSON.parse(vOut);
		logDebug("returned " + vOutParsed.length + " results");
		response.addressResults = vOutParsed;
		//return vOutParsed;
	}

	// only get ZIMAS data if we have a known good address
	if (vOutParsed && vOutParsed.length == 1) {

		theUrl = encodeURI(dataURL + "PIN=" + String(vOutParsed[0].PIN));
		response.dataurl = String(theUrl);

		var vOutObj = aa.httpClient.get(theUrl, header);

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
							var councilDist = String(jurisData.Value[i].Value);
							if (councilDist.indexOf("-") > 0) {
								councilDist = councilDist.slice(0,councilDist.indexOf("-")-1)
								//logDebug("councilDist = '" + councilDist + "'");
								response.data["Council District"] = councilDist;
							}
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

function lookup(stdChoice,stdValue) {
	var strControl;
	var bizDomScriptResult = aa.bizDomain.getBizDomainByValue(stdChoice,stdValue);

   	if (bizDomScriptResult.getSuccess()) {
		var bizDomScriptObj = bizDomScriptResult.getOutput();
		strControl = "" + bizDomScriptObj.getDescription(); // had to do this or it bombs.  who knows why?
		aa.print("lookup(" + stdChoice + "," + stdValue + ") = " + strControl);
	} else {
		aa.print("lookup(" + stdChoice + "," + stdValue + ") does not exist");
	}

	return strControl;
}
