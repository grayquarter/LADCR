/*
emailAsync_BCC - parallel function for emailContacts_BCC when you have actual email addresses instead of contact types
  Required Params:
     sendEmailToAddresses = comma-separated list of email addresses, no spaces
     emailTemplate = notification template name
  Optional Params: (use blank string, not null, if missing!)
     vEParams = parameters to be filled in notification template
     reportTemplate = if provided, will run report and attach to record and include a link to it in the email
     vRParams  = report parameters
     manualNotificationList = comma-separated list of contact names without email to be listed in Manual Notification adhoc task
     changeReportName = if using reportTemplate, will change the title of the document produced by the report from its default

Sample: emailAsync_BCC('gephartj@seattle.gov', 'DPD_WAITING_FOR_PAYMENT'); //minimal
        emailAsync_BCC('gephartj@seattle.gov,joe@smith.com', 'DPD_PERMIT_ISSUED', "", 'Construction Permit', paramHashtable, 'Jane Doe-Applicant,Adam West-Batman', 'This is Your Permit'); //full
 */
function emailAsync_BCC(sendEmailToAddresses, emailTemplate, vEParams, reportTemplate, vRParams, manualNotificationList, changeReportName) {
	var vAsyncScript = "SEND_EMAIL_ASYNC";
	
	//Start modification to support batch script
	var vEvntTyp = aa.env.getValue("eventType");
	if (vEvntTyp == "Batch Process") {
		aa.env.setValue("sendEmailToAddresses", sendEmailToAddresses);
		aa.env.setValue("emailTemplate", emailTemplate);
		aa.env.setValue("vEParams", vEParams);
		aa.env.setValue("reportTemplate", reportTemplate);
		aa.env.setValue("vRParams", vRParams);
		aa.env.setValue("vChangeReportName", changeReportName);
		aa.env.setValue("CapId", capId);
		aa.env.setValue("adHocTaskContactsList", manualNotificationList);		
		//call sendEmailASync script
		logDebug("Attempting to run Non-Async: " + vAsyncScript);
		aa.includeScript(vAsyncScript);
	}
	else {
		//Can't store nulls in a hashmap, so check optional params just in case
		if (vEParams == null || vEParams == "") { vEParams = aa.util.newHashtable(); }
		if (vRParams == null || vRParams == "") { vRParams = aa.util.newHashtable(); }
		if (reportTemplate == null) { reportTemplate = ""; }
		if (changeReportName == null) { changeReportName = ""; }
		if (manualNotificationList == null) { manualNotificationList = ""; }
		
		//Save variables to the hash table and call sendEmailASync script. This allows for the email to contain an ACA deep link for the document
		var envParameters = aa.util.newHashMap();
		envParameters.put("sendEmailToAddresses", sendEmailToAddresses);
		envParameters.put("emailTemplate", emailTemplate);
		envParameters.put("vEParams", vEParams);
		envParameters.put("reportTemplate", reportTemplate);
		envParameters.put("vRParams", vRParams);
		envParameters.put("vChangeReportName", changeReportName);
		envParameters.put("CapId", capId);
		envParameters.put("adHocTaskContactsList", manualNotificationList);
		
		//call sendEmailASync script
		logDebug("Attempting to run Async: " + vAsyncScript);
		aa.runAsyncScript(vAsyncScript, envParameters);
	}
	//End modification to support batch script
	
	return true;
}