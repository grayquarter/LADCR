//ASSESS_BUS_APP_FEES_2020.10.js
// Last Update 09/29/20
// This relies on AInfo[] being populated with custom fields.

if (!isTrue(AInfo["Is this a Renewal?"])) {
    logDebug("Not a Renewal");
    updateFee("J300", "CAN_BUS_APP", "FINAL", 1, "Y"); //Cannabis Pre-Application Review Fee
} 

function isTrue(o) {
    return String(o) == "CHECKED" || String(o) == "YES" || String(o) == "Yes" || String(o) == "Y";
}
