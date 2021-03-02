//ASSESS_BUS_APP_ACTIVITY_FEES
//Update: 03/01/2021

var feePrefix;
var assessFee;

if (isASITrue(AInfo["Social Equity Requested"])) {
	logDebug("Social Equity Requested");
	feePrefix = "J4"
} else {
	logDebug("Social Equity NOT Requested");
	feePrefix = "J3"
}

// Testing
if (matches("Y", String(AInfo["Testing"]).substr(0,1).toUpperCase())) {
	logDebug("Activity: Testing");
	assessFee = "J040";
	logDebug("assess fee: " + assessFee);
	updateFee(assessFee, "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId);
}

// Retail
if (matches("CHECKED", AInfo["Adult-Use Retail"], AInfo["Medical Retail"])) {
	logDebug("Activity: Retail");
	assessFee = feePrefix + "01";
	logDebug("assess fee: " + assessFee);
	updateFee(assessFee, "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId);
}
if (matches("CHECKED", AInfo["Adult-Use Microbusiness"], AInfo["Medical Microbusiness"])) {
	logDebug("Activity: Microbusiness");
	assessFee = feePrefix + "02";
	logDebug("assess fee: " + assessFee);
	updateFee(assessFee, "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId);
}

// Delivery
if (matches("CHECKED", AInfo["Adult-Use Delivery Only"], AInfo["Medical Delivery Only"])) {
	logDebug("Activity: Delivery");
	assessFee = feePrefix + "03";
	logDebug("assess fee: " + assessFee);
	updateFee(assessFee, "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId);
}

// Distributor
if (matches("CHECKED", AInfo["Adult-Use Distributor"], AInfo["Medical Distributor"]) || matches("Y", String(AInfo["Distributor Transport Only"]).substr(0,1).toUpperCase())) {
	logDebug("Activity: Distributor");
	assessFee = feePrefix + "04";
	logDebug("assess fee: " + assessFee);
	updateFee(assessFee, "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId);
}


// Cultivation
if (matches("Y", String(AInfo["Nursery"]).substr(0,1).toUpperCase())) {
	logDebug("Activity: Nursery");
	assessFee = feePrefix + "05";
	logDebug("assess fee: " + assessFee);
	updateFee(assessFee, "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId);
}
if (matches("CHECKED", AInfo["Adult-Use Cultivation Specialty Indoor"], AInfo["Medical Cultivation Specialty Indoor"],AInfo["Adult-Use Cultivation Specialty Cottage Indoor"], AInfo["Medical Cultivation Specialty Cottage Indoor"])) {
	logDebug("Activity: Cultivation Specialty");
	assessFee = feePrefix + "06";
	logDebug("assess fee: " + assessFee);
	updateFee(assessFee, "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId);
}
if (matches("CHECKED", AInfo["Adult-Use Cultivation Small Indoor"], AInfo["Medical Cultivation Small Indoor"])){
	logDebug("Activity: Cultivation Small");
	assessFee = feePrefix + "07";
	logDebug("assess fee: " + assessFee);
	updateFee(assessFee, "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId);
}
if (matches("CHECKED", AInfo["Adult-Use Cultivation Medium Indoor"], AInfo["Medical Cultivation Medium Indoor"])){
	logDebug("Activity: Cultivation Medium");
	assessFee = feePrefix + "08";
	logDebug("assess fee: " + assessFee);
	updateFee(assessFee, "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId);
}

// Manufacturer
if (matches("CHECKED", AInfo["Adult-Use Manufacturer Level 1"], AInfo["Medical Manufacturer Level 1"], AInfo["Adult-Use Manufacturer Level 2"], AInfo["Medical Manufacturer Level 2"])) { 
	logDebug("Activity: Manufacturer");
	assessFee = feePrefix + "09";
	logDebug("assess fee: " + assessFee);
	updateFee(assessFee, "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId);
}
