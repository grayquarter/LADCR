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

var message = "";
try {
	if (vStreetNbr.value != "" && vStreetName.value != "") { 
		
		var data = getZimasDataFromAddress(vStreetName.value, vStreetNbr.value, vDirection.value);

		if (data && data.length > 0) {
			if (data.length > 1) {
				vStreetName.message = "Address has " + data.length + " matches. Please try adding a street direction";
			} else {
				//vStreetName.message = "Zimas Data: " + JSON.stringify(data[0])
				vStreetName.message = "Address validated";
				vZip.value = data[0].ZIP;
				expression.setReturn(vZip);
				vStreetName.value = vStreetName.value.toUpperCase();
				vDirection.value = vDirection.value.toUpperCase();
				expression.setReturn(vDirection);
				vCity.value = "LOS ANGELES";
				expression.setReturn(vCity);
				vState.value = "CA";
				expression.setReturn(vState);
				
				}
		} else {
			vStreetName.message = "No matching address found";
		}
		expression.setReturn(vStreetName);
	}
} catch (err) {
	vStreetName.message = "Zimas Error: " + err.message;
	expression.setReturn(vStreetName);
}

function getZimasDataFromAddress(street, nbr, dir) {

	var addressURL = "http://zimas.lacity.org/zmaWS-DCR/zmaService.svc/GetZIMASAddress?";
	//		appTypeAlias = vCap.getCapModel().getAppTypeAlias();
	//		vLicenseObj = new licenseObject(null, capId);
	var response = {};
	var params = [];

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

	var vOutObj = aa.httpClient.get(theUrl);

	if (vOutObj.getSuccess()) {
		var vOut = vOutObj.getOutput();
		//  aa.print(vOut);
		// not sure if we need this JSON.parse, getOutput might do this already
		var vOutParsed = JSON.parse(vOut);

		return vOutParsed;
	}
}
