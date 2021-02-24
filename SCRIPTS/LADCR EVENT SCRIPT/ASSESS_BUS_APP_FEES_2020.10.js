//ASSESS_BUS_APP_FEES_2020.10.js
// Last Update 02/24/21
// Changed fee codes to match new fee schedule version 186708_V1 
// This relies on AInfo[] being populated with custom fields.


if (!isASITrue(AInfo["Is this a Renewal?"]) && (!appMatch("Licenses/Cannabis/Application Amendment/Application"))) {
    logDebug("Not a Renewal");

	if (isASITrue("Retailer Commercial Cannabis Activity license in an area of Undue Concentration?")) {
	{
		logDebug("adding PCN fee");
		updateFee("J097", "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId); 
	} else {
		logDebug("adding Pre-App fee");
		updateFee("J102", "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId);
	}
} 

var amendFee = isASITrue(AInfo["Legal Entity Name Change"]) || isASITrue(AInfo["Business Premises Diagram"]) || isASITrue(AInfo["Business Premises Relocation"]) || isASITrue(AInfo["Ownership or Primary Changes"]) || isASITrue(AInfo["Other"]);

if (appMatch("Licenses/Cannabis/Application Amendment/Application") && amendFee) {
	logDebug("adding amendment fee");
    updateFee("J098", "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId); //Cannabis License Mod Fee
} 
