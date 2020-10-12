//ASSESS_BUS_APP_FEES_2020.10.js
// Last Update 09/29/20
// This relies on AInfo[] being populated with custom fields.

/*
if (!isTrue(AInfo["Is this a Renewal?"]) && (!appMatch("Licenses/Cannabis/Application Amendment/Application"))) {
    logDebug("Not a Renewal");
    updateFee("J300", "CAN_BUS_APP", "FINAL", 1, "Y"); //Cannabis Pre-Application Review Fee
} 
*/

var amendFee = isTrue(AInfo["Legal Entity Name Change"]) || isTrue(AInfo["Business Premises Diagram"]) || isTrue(AInfo["Business Premises Relocation"]) || isTrue(AInfo["Ownership or Primary Changes"]) || isTrue(AInfo["Other"]);

if (appMatch("Licenses/Cannabis/Application Amendment/Application") && amendFee) {
	logDebug("adding amendment fee");
    updateFee("J098B21", "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId); //Cannabis License Mod Fee
} 

function isTrue(o) {
    return String(o) == "CHECKED" || String(o) == "YES" || String(o) == "Yes" || String(o) == "Y";
}
