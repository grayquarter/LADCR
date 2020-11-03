//ASSESS_BUS_APP_FEES_2020.10.js
// Last Update 11/03/20
// Changed fee code from J300 to J102
// This relies on AInfo[] being populated with custom fields.


if (!isASITrue(AInfo["Is this a Renewal?"]) && (!appMatch("Licenses/Cannabis/Application Amendment/Application"))) {
    logDebug("Not a Renewal");
    updateFee("J102", "CAN_BUS_APP", "FINAL", 1, "Y"); //Cannabis Pre-Application Review Fee
} 


var amendFee = isASITrue(AInfo["Legal Entity Name Change"]) || isASITrue(AInfo["Business Premises Diagram"]) || isASITrue(AInfo["Business Premises Relocation"]) || isASITrue(AInfo["Ownership or Primary Changes"]) || isASITrue(AInfo["Other"]);

if (appMatch("Licenses/Cannabis/Application Amendment/Application") && amendFee) {
	logDebug("adding amendment fee");
    updateFee("J098B21", "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId); //Cannabis License Mod Fee
} 
