// Begin associated forms for owner data
//
// EWYLAM -- turned off associated forms on the record, so I disabled this script (JHS)
//include("DO_ASSOCIATED_FORM_OWNER_SUB");
// End associated forms for owner data

// Begin script to copy Business contact information (Business Name and Address) to record
//include("SAVE_BUSINESS_INFO_TO_RECORD"); //3/17/2020 Business contact type no longer valid 
// End script to copy Business contact information (Business Name and Address) to record

// Check matching FEIN or SSN for this BTRC, not for testing records
//if (!appMatch("Licenses/Cannabis/Testing/Application")) {
//	include("CHECK_SSN_FEIN_MATCH");
//}
// end check for fein/ssn

// Assess fees
if (appMatch("Licenses/Cannabis/Business/Application")) {
	if (AInfo["Is this a Renewal?"] && AInfo["Is this a Renewal?"].substr(0, 1).toUpperCase().equals("Y")) {
		//include("ASSESS_BUS_REN_FEES"); //use the ame for now 1/30/2020
		//include("ASSESS_BUS_APP_FEES");
	} else {
		//include("ASSESS_BUS_APP_FEES2");
		//include("ASSESS_BUS_APP_FEES");
		//include("ASSESS_BUS_APP_FEES_2020.06");
		include("ASSESS_BUS_APP_FEES_2020.10");
	}
}
// end assess fees

// Begin script to update the Application AltID based on Business Activity
if(!publicUser && appMatch("Licenses/Cannabis/Business/Application")){
	include("UPDATE_APPLICATION_MJ_ALTID");
}
// End script to update the Application AltID based on Business Activity

// Update contacts - set contact type flag
if(!publicUser){
	include("UPDATE_APP_CONTACT_TYPES");
}

// use the address to populate data from ZIMAS layers
if(!publicUser){
	include("POPULATE_ZIMAS_DATA");
}
