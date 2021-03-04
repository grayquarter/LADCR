//WTUA;LICENSES!~!~!APPLICATION.js
// Begin script to do application submittal actions. Runs the WTUA event for Application Acceptance - Awaiting Owner Submittals
include("DO_APPLICATION_SUBMITTED_ACTIONS");
// End script to do application submittal actions. Runs the WTUA event for Application Acceptance - Awaiting Owner Submittals

// Begin script to actiave the Initial Review Task
//include("ACTIVATE_INITIAL_REVIEW"); //no longer applicable 2/8/2021
// End script to actiave the Initial Review Task

//PCN Branch 21.02.25
if (wfTask.equals("PCN Waiting for Council") && wfStatus.equals("PCN Approved")) {
	logDebug("adding Pre-App fee");
	updateFee("J102", "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId); //Pre-Application Review Fee
	include("SEND_ACCEPTANCE_INVOICE_PREAPP");
}	

//Pre-App Branch 21.01.12
if (wfTask.equals("Supervisor Pre-App Document Review") && wfStatus.equals("Eligible for Processing")) {
	// turn Pre-App into a temp app
	include("UPDATE_PRE-APP_TO_APP");
	include("ASSESS_BUS_APP_ACTIVITY_FEES");
	updateFee("F100", "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId); //Fire Inspection Fee
	include("SEND_PREAPP_APPROVAL_NOTICE");
}	

//New Branch 21.03.03
if (wfTask.equals("Supervisor Temp Review") && wfStatus.equals("Ready for Inspection")) {
	include("SEND_ELIGIBLE_FOR_INSPECTION");
}	

//New Branch 21.03.03
if (wfTask.equals("Pre-Inspection Review") && wfStatus.equals("Inspection Not Passed")) {
	updateFee("F100", "CAN_BUS_APP", "FINAL", 1, "Y", null,null,capId); //place holder for final fee
	include("SEND_APPLICATION_INVOICE");
}	

//New Branch 21.03.03
if (wfTask.equals("Temp License Issued") && wfStatus.equals("Issue Temp Renewal Invoice")) {
	//include("ASSESS_BUS_APP_ACTIVITY_RENEWAL_FEES");
	include("SEND_APPLICATION_RENEWAL");
}	

if (wfStatus.equals("Additional Info Requested")){
	// Begin Story 293, 1370
	include("SEND_INCOMPLETE_APPLICATION_NOTICE");
	// End Story 293, 1370
}

//if (wfStatus.equals("Temporarily Approved")){
if (wfStatus.equals("Temporarily Approved") || wfStatus.equals("Temp License Granted") || wfStatus.equals("Temp License Granted with Issues")) {
	// Begin Story 1557
	include("SEND_TEMP_LICENSE_INCOMPLETE_NOTICE");
	//End Story 1557
}

// Begin script to send denial email
if (wfStatus.equals("Denied")){
	// Begin Story 181
	include("SEND_DENIED_NOTICE");
	// End Story 181
}
// End script to send denial email

// Begin script to send temporary denial notice - Story 1804
include("SEND_TEMP_DENIED_NOTICE");
// End script to send temporary denial notice

// Begin script #45: Appeal Process Activation 
include("SEND_WAIT_FOR_APPEAL");
include("SEND_TEMP_WAIT_FOR_APPEAL");
// End script #45: Appeal Process Activation 

if (wfTask.equals("Issuance") && wfStatus.equals("Waiting for Payment")) {
	// Begin Story 323
	include("SEND_FEES_DUE_NOTICE");
	// End Story 323
} else if (wfTask.equals("Issuance")) {
	// Begin Story 298
	include("SEND_NEW_INFO_NOTICE");
	// End Story 298
}

if (wfTask.equals("Wait for Appeal") && wfStatus.equals("Waiting for Payment")) {
	// Begin Story 323
	include("SEND_APPEAL_FEES_DUE");
	// End Story 323
}
if (wfTask.equals("Application Acceptance") && wfStatus.equals("Application Received")) {
	// Begin Story 5135, 6083
	include("CREATE_DOCUMENT_CONDITIONS");
	// End Story 5135, 6083
}

// Interested Parites Notification - test
//if (wfTask.equals("Initial Review") && wfStatus.equals("Recommend Annual Approved")) {
//	include("SEND_EMAIL_TO_INTERESTED_PARTIES");
//}

//Begin script to send email to all owners in the Owner table
//include("SEND_OWNER_EMAILS");
//End script to send email to all owners in the Owner table

// Begin script to set 'Awaiting Review'. Runs the WTUA event for Initial Review - Awaiting Review
include('AWAITING_REVIEW');
// End script to set 'Awaiting Review'.

//Start - License Creation/Update Script
include("CREATE_LICENSE_RECORD");
//End - License Creation/Update Script

//Begin email to all contacts when application is submitted in back office. Email is to let them know the application number and fee amount due, User Story 1625
include("SEND_APP_FEE_ACKNOWLEDGEMENT");
//End email to all contacts when application is submitted in back office. Email is to let them know the application number and fee amount due, User Story 1625

//Begin conditional branch for denied denials
if (wfTask.equals("Executive Review") && wfStatus.equals("Decision Appealable")){ // 3.3.2021
	include("SEND_APPEAL_AND_NOTICE");
}
if (wfTask.equals("Executive Review") && wfStatus.equals("Return to Review")){
	include("ACTIVATE_DENIED_TASK");
}
//End conditional branch for denied denials

//Begin set application status to "Pending Final Review" when all parallel reviews are complete
include("UPDATE_APP_SUPERVISOR_REVIEWS_COMPLETE");
//End set application status to "Pending Final Review" when all parallel reviews are complete

//Begin conditional branch for sending abandoned notice
if (wfTask.equals("Close Out") && wfStatus.equals("Abandoned")){
	include("NOTIFY_ABANDONED_APP");
}
//End conditional branch for sending abandoned notice

// Begin schedule meeting for Review - script #48
if (wfTask.equals("DCR Community Meeting") && wfStatus.equals("Recommend Approval")) {
	        // get 20 business days after
	        todayDateJS = new Date();
	        meetingDate = workDaysAdd(todayDateJS, 20, ['AGENCY WORKDAY'], ["WEEKEND", "HOLIDAY"]);
	        schResult = scheduleMeeting(meetingDate, "CANNABIS COMMISSION MEETING", 60, 90, capId);
}
// End schedule meeting for Review

// Begin schedule meeting for Appeal - Script #44
if (wfTask.equals("Appeal Meeting") && wfStatus.equals("CRC Meeting Scheduled")) {
	    dateNotsMailed = getStatusDateinTaskHistory("Appeal Meeting", "Public Notifications Mailed");
	    if (dateNotsMailed) {
	        // get 20 business days after
	        dateNotsMailedJS = new Date(dateNotsMailed.getTime());
	        meetingDate = workDaysAdd(dateNotsMailedJS, 20, ['AGENCY WORKDAY'], ["WEEKEND", "HOLIDAY"]);
	        schResult = scheduleMeeting(meetingDate, "CANNABIS COMMISSION MEETING", 60, 90, capId);
	    } else {
	        logDebug("Warning: No Public Notifications Mailed status set, CRC Meeting not scheduled");
	    }
}
// End schedule meeting for Appeal

//Start send reviewer notice if returned from supervisor
include("SEND_REVIEWER_NOTICE");
//End send reviewer notice
