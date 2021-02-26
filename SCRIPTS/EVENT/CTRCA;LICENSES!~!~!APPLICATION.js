//CTRCA;LICENSES!~!~!APPLICATION.js
// Last Update: 02/24/2021
// Insert the public user reference contact as the owner applicant
//include("COPY_PUBLIC_USER_TO_OWNER_APPLICANT");
// Insert the public user reference contact as the owner applicant or agent of service (ghess, 3/20/18)
//if (AInfo["Agent of Service"] == "Yes") {
//	include("COPY_PUBLIC_USER_TO_AGENT_OF_SERVICE");
//} else {
//	include("COPY_PUBLIC_USER_TO_OWNER_APPLICANT");
//}

// Begin script to set the Owner Applicant information in the Owners ASIT to Read Only.
//include("SET_OWNER_APPLICANT_OWNER_TABLE_READ_ONLY");
// End script to set the Owner Applicant information in the Owners ASIT to Read Only.

// Begin script to copy Business contact information (Business Name and Address) to record
//include("SAVE_BUSINESS_INFO_TO_RECORD");
// End script to copy Business contact information (Business Name and Address) to record

//Begin script to invoice all fees and set workflow task Application Acceptance to Waiting for Payment when user Defers Payment in ACA
include("WAITING_FOR_PAYMENT");
//End script to invoice all fees and set workflow task Application Acceptance to Waiting for Payment when user Defers Payment in ACA

// Begin functionality to set initial workflow status. This is needed for the initial status to actually exists in the WF History
// Runs the WTUA event for the initial status.
if (publicUser) {
	setInitialWorkflowTaskStatus("Y");
}
// End functionality to set inital workflow status.

//Begin script to link amendment to application when user Defers Payment in ACA
if (!parentCapId && appMatch("Licenses/Cannabis/Application Amendment/Application")) {
	include("LINK_ATT_TO_APP");
}
//End script to link amendment to application when user Defers Payment in ACA

// Begin script to update the Business Activities selected in ACA
if(publicUser && appMatch("Licenses/Cannabis/Business/Application")){
	include("UPDATE_ACTIVITIES_FROM_ACA");
}
// End script to update the Business Activities selected in ACA

// Begin script to update the Application AltID based on Business Activity,
// updated 8/26/20 to include creating activity children
if(publicUser && appMatch("Licenses/Cannabis/Business/Application")){
	include("UPDATE_APPLICATION_MJ_ALTID");
	if (AInfo["Is this a Renewal?"] == "Yes" || AInfo["Is this a Renewal?"] == "Y") {
		include("COPY_APP_TO_RENEWAL");
		include("CREATE_ACTIVITY_RECS_FROM_PREAPP");
	} 
}
// End script to update the Application AltID based on Business Activity

// Begin script to set renewal parent and child application status
if(publicUser && appMatch("Licenses/Cannabis/Business/Application")){
	include("SET_APP_RENEWAL_STATUSES");
}
// End script to set renewal parent and child application status

// Begin script to update the Application field Social Equity Applicants Reference Contact ID with the public users refcontactno
if(publicUser && appMatch("Licenses/Cannabis/Business/Application")){
	include("ACA_SAVE_PUBLICUSER_REFCONTACT_REFNO_TO_APP");
}

/*
// disabled 10/22/20 at request of LADCR 
// script 60, 8/29/2019
if(AInfo["Is this a Renewal?"] != "Yes" && AInfo["Retailer Commercial Cannabis Activity license in an area of Undue Concentration?"] != "Yes"){
	include("SEND_INVOICE");
}
// End script
*/

// Update contacts - set contact type flag
if(publicUser){
	include("UPDATE_APP_CONTACT_TYPES");
}

// use the address to populate data from ZIMAS layers
if(publicUser){
	include("POPULATE_ZIMAS_DATA");
}

//Modification Request Notification to Staff
if (parentCapId && appMatch("Licenses/Cannabis/Application Amendment/Application")) {
  var params = aa.util.newHashtable();
  var emailList = [];
  addParameter(params, "$$altID$$", capId.getCustomID());
  var au = getAssigned(parentCapId);
  if (au) {
  	emailList.push(getUserEmail(au));
        var sendResult = sendNotification("dcrlicensing@lacity.org",emailList.join(","),"","LADCR_MOD_NOTIFY",params,null);
        assignCap(au);
         }
 }

//Send PCN Notifiction to Contacts
if (publicUser && appMatch("Licenses/Cannabis/Business/Application")) {
	if (isASITrue(AInfo["Retailer Commercial Cannabis Activity license in an area of Undue Concentration?"])) {

		include("SEND_ACCEPTANCE_INVOICE_PCN");
		
	 } else {
	 // non PCN, jump ahead in workflow and send notice
		setTask("PCN Acceptance","N","N");
		activateTask("Application Acceptance");
		
		include("SEND_ACCEPTANCE_INVOICE_PREAPP");
	 }
 }
 
 
