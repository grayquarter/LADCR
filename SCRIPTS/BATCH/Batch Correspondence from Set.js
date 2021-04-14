/*------------------------------------------------------------------------------------------------------/
| Program: LADCR CORRESPONDENCE FROM SET.js  Trigger: Batch
| Client:
| Update: 7/27/2020
|
| REQUIRED: CORRESPONDENCE SCRIPT PARAMS std choice
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Initialize Variables
/------------------------------------------------------------------------------------------------------*/
/* START SCRIPT TEST PARAMETERS */

/*
aa.env.setValue("setName","SCHOMP");
aa.env.setValue("emailTemplate","BLAST NOTICE PHASE 2 LETTER 02");
aa.env.setValue("sendEmailToContactTypes","Person-in-Charge");
aa.env.setValue("reportTemplate","Invoice");
//aa.env.setValue("eventType","Batch Process");
*/
//aa.env.setValue("paramStdChoice","GH Correspondence Set Parameters"); //testing!!!!!!!!!!!!!!!!!
/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
var showDebug = true;
var sysDate = aa.date.getCurrentDate();
var batchJobResult = aa.batchJob.getJobID();
var batchJobName = "" + aa.env.getValue("BatchJobName");
var batchJobID = 0;
var capId;

SCRIPT_VERSION = 3.0;

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_BATCH"));
eval(getScriptText("INCLUDES_CUSTOM", null, true));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)
		servProvCode = aa.getServiceProviderCode();

	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}

		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}
/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var setName = getJobParam("setName"); // use this standard choice for parameters instead of batch jobs
var emailTemplate = getJobParam("emailTemplate"); // use this expiration field instead of b1expiration
var sendEmailToContactTypes = getJobParam("sendEmailToContactTypes"); // use this expiration group instead of b1expiration
var reportTemplate = getJobParam("reportTemplate");

if (batchJobResult.getSuccess()) {
	batchJobID = batchJobResult.getOutput();
	logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
} else {
	logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

if (setName && setName != "") {
	var setMemberArray = new Array();
	var setMemberResult = aa.set.getCAPSetMembersByPK(setName);
	if (setMemberResult.getSuccess()) {
		setMemberArray = setMemberResult.getOutput().toArray();
		aa.env.setValue("SetMemberArray", setMemberArray);
	} else {
		aa.print("Error: Could not find set by PK: " + setName);
	}

	aa.env.setValue("CurrentUserID", "ADMIN");
}

/* END SCRIPT TEST PARAMETERS */

var debug = "";
var br = "<br>";
var message = "";
var emailText = "";
var AInfo = []; // editTaskSpecific needs this defined as global
var useAppSpecificGroupName = ""; // getAppSpecific needs this defined as global
var currentUserID = aa.env.getValue("CurrentUserID");
var systemUserObj = aa.person.getUser(currentUserID).getOutput();
var SetMemberArray = aa.env.getValue("SetMemberArray");
var sysFromEmail = "dcrlicensing@lacity.org";

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
sysDate = aa.date.getCurrentDate();
/*----------------------------------------------------------------------------------------------------/
|
| Start: SCRIPT PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

logDebug("=====Processing set " + setName);

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var startDate = new Date();
var startTime = startDate.getTime(); // Start timer

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("*** Start of Job ***");

//if (emailTemplate && emailTemplate != "" && sendEmailToContactTypes && sendEmailToContactTypes != "" && SetMemberArray.length > 0) {
if (SetMemberArray.length > 0) {
	mainProcess();

} else {
	logDebug("*** WARNING** : This set has no records. ***");
}

logDebug("*** End of Job: Elapsed Time : " + elapsed() + " Seconds ***");

aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug + message);

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
	resultObjArray = new Array();
	var resultObjArray = aa.env.getValue("SetMemberArray");
	for (curRecord in resultObjArray) {
		aa.env.setValue("PermitId1", resultObjArray[curRecord].getID1());
		aa.env.setValue("PermitId2", resultObjArray[curRecord].getID2());
		aa.env.setValue("PermitId3", resultObjArray[curRecord].getID3());
		capId = aa.cap.getCapID(resultObjArray[curRecord].getID1(),resultObjArray[curRecord].getID2(),resultObjArray[curRecord].getID3()).getOutput();
		aa.print("capId is now " + capId);
		if (capId) {
		var cap = aa.cap.getCap(capId).getOutput();
		var altId = capId.getCustomID();

		logDebug("=====Identifying record " + altId);

		/*
		//Generate license report and email
		var vRParams = aa.util.newHashtable();
		addParameter(vRParams, "p1Value", capId.getCustomID());
		 */
		var eParams = aa.util.newHashtable();
		var vRParams = aa.util.newHashtable();
		addParameter(vRParams, "p1Value", capId.getCustomID());
		
		if (reportTemplate.length > 0) {
			var vReportName = generateReportForEmail_BCC(capId, reportTemplate, aa.getServiceProviderCode(), vRParams)[0];
			logDebug(vReportName + " generated for record " + capId.getCustomID());
		}

		if (sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {
			//sendNotification(sysFromEmail,conEmail,"",emailTemplate,eParams, [],capId);
			emailContacts_LADCR(sendEmailToContactTypes, emailTemplate, eParams, null, vRParams)
		}
		}
	}
}

function getJobParam(pParamName) //gets parameter value and logs message showing param value
{
	var ret;
	if (aa.env.getValue("paramStdChoice") != "") {
		var b = aa.bizDomain.getBizDomainByValue(aa.env.getValue("paramStdChoice"), pParamName);
		if (b.getSuccess()) {
			ret = b.getOutput().getDescription();
		}

		ret = ret ? "" + ret : ""; // convert to String

		logDebug("Parameter (from std choice " + aa.env.getValue("paramStdChoice") + ") : " + pParamName + " = " + ret);
	} else {
		ret = "" + aa.env.getValue(pParamName);
		logDebug("Parameter (from batch job) : " + pParamName + " = " + ret);
	}
	return ret;
}

/*
emailContacts_BCC
Required Params:
sendEmailToContactTypes = comma-separated list of contact types to send to, no spaces
emailTemplate = notification template name
Optional Params: (use blank string, not null, if missing!)
vEParams = parameters to be filled in notification template
reportTemplate = if provided, will run report and attach to record and include a link to it in the email
vRParams  = report parameters
vAddAdHocTask = Y/N for adding manual notification task when no email exists
changeReportName = if using reportTemplate, will change the title of the document produced by the report from its default
vContactCapId = capId to use for getting contact objects for emails, if differs from current capId
Sample: emailContacts_BCC('OWNER APPLICANT', 'DPD_WAITING_FOR_PAYMENT'); //minimal
emailContacts_BCC('OWNER APPLICANT,BUSINESS OWNER', 'DPD_PERMIT_ISSUED', eParamHashtable, 'Construction Permit', rParamHashtable, 'Y', 'New Report Name', parentId); //full
 */
function emailContacts_LADCR(sendEmailToContactTypes, emailTemplate, vEParams, reportTemplate, vRParams) {
	var vChangeReportName = "";
	var conTypeArray = [];
	var validConTypes = getContactTypes_BCC();
	var x = 0;
	var vConType;
	var vAsyncScript = "SEND_EMAIL_TO_CONTACTS_ASYNC";
	var envParameters = aa.util.newHashMap();
	var vAddAdHocTask = false;
	var vContactCapId = false;

	//Ad-hoc Task Requested
	if (arguments.length > 5) {
		vAddAdHocTask = arguments[5]; // use provided prefrence for adding an ad-hoc task for manual notification
		if (vAddAdHocTask == "N") {
			logDebug("No adhoc task");
			vAddAdHocTask = false;
		}
	}

	//Change Report Name Requested
	if (arguments.length > 6) {
		vChangeReportName = arguments[6]; // use provided report name
	}

	//Get cap Id to use for contact gathering
	if (arguments.length > 7) {
		vContactCapId = arguments[7]; // use provided report name
	}

	logDebug("Provided contact types to send to: " + sendEmailToContactTypes);

	//Check to see if provided contact type(s) is/are valid
	if (sendEmailToContactTypes != "All" && sendEmailToContactTypes != null && sendEmailToContactTypes != '') {
		conTypeArray = sendEmailToContactTypes.split(",");
	}
	for (x in conTypeArray) {
		//check all that are not "Primary"
		vConType = conTypeArray[x];
		if (vConType != "Primary" && !exists(vConType, validConTypes)) {
			logDebug(vConType + " is not a valid contact type. No actions will be taken for this type.");
			conTypeArray.splice(x, (x + 1));
		}
	}
	//Check if any types remain. If not, don't continue processing
	if ((sendEmailToContactTypes != "All" && sendEmailToContactTypes != null && sendEmailToContactTypes != '') && conTypeArray.length <= 0) {
		logDebug(vConType + " is not a valid contact type. No actions will be taken for this type.");
		return false;
	} else if ((sendEmailToContactTypes != "All" && sendEmailToContactTypes != null && sendEmailToContactTypes != '') && conTypeArray.length > 0) {
		sendEmailToContactTypes = conTypeArray.toString();
	}

	logDebug("Validated contact types to send to: " + sendEmailToContactTypes);
	//Save variables to the hash table and call sendEmailASync script. This allows for the email to contain an ACA deep link for the document


	//call sendEmailASync script
	sendEmailToContactsSync(sendEmailToContactTypes,emailTemplate,vEParams,reportTemplate,vRParams,vChangeReportName,vAddAdHocTask,vContactCapId)

	return true;
}

function sendEmailToContactsSync(sendEmailToContactTypes,emailTemplate,vEParams,reportTemplate,vRParams,vChangeReportName,vAddAdHocTask,vContactCapId) {
	try {
			aa.print("1) Here in sendEmailToContactsSync: " + aa.env.getValue("eventType"));

		aa.print("2) sendEmailToContactTypes: " + sendEmailToContactTypes);
		aa.print("3) emailTemplate: " + emailTemplate);
		aa.print("4) reportTemplate: " + reportTemplate);

		//Set variables used in the script
		var tmpl;
		var conTypeArray = [];
		var conType;
		var validConTypes;
		var conObjEmailArray = [];
		var conObjNonEmailArray = [];
		var conObjEmailCompareArray = [];
		var conObjNonEmailCompareArray = [];
		var v = 0;
		var w = 0;
		var x = 0;
		var y = 0;
		var z = 0;
		var conEmail;
		var peopTemp;
		var vConObjArry;
		var vConObj;
		var vConRefSeqNbr;
		var vPrimaryContactOnly = false;
		var mailFrom;
		var capId4Email;
		var vReportName;
		var vDocumentList;
		var vDocumentModel;
		var vDocumentName;
		var vDocumentNumber;
		var vACAUrl;
		var vDocumentACAUrl;
		var vAdHocProcess = "ADHOC_WORKFLOW";
		var vAdHocTask = "Manual Notification";
		var vAdHocNote;
		var vAdHocAssignDept;
		var vEParamsToSend;

		var balanceDue;
		var capDetailObjResult = aa.cap.getCapDetail(capId);
		if (capDetailObjResult.getSuccess()) {
			capDetail = capDetailObjResult.getOutput();
			balanceDue = capDetail.getBalance();
		}
		/* End Code needed to call master script functions -----------------------------------------------------*/

		aa.print("5) balanceDue: " + balanceDue);
		/* End SDOT work-around to prevent payment notices on auto-approved (paid) ACA submissions */
		//Get valid array of contact types
		validConTypes = getContactTypes_BCC();

		//Add standard email variables from record information
		vEParams = addStdVarsToEmail(vEParams, capId);

		//Set Ad-Hoc Task Information

		//Check to see if provided contact type(s) is/are valid
		if (sendEmailToContactTypes != "All" && sendEmailToContactTypes != null && sendEmailToContactTypes != '') {
			conTypeArray = sendEmailToContactTypes.split(",");
			aa.print("splitting sendEmailToContactTypes into " + conTypeArray.length + " pieces, first one is " + conTypeArray[0]);
		}
		for (x in conTypeArray) {
			//check all that are not "Primary"
			vConType = conTypeArray[x];
			if (vConType != "Primary" && !exists(vConType, validConTypes)) {
				aa.print(vConType + " is not a valid contact type. No actions will be taken for this type.");
				//Drop bad contact type from array;
				conTypeArray.splice(x, (x + 1));
			}
		}

		//If supplied value is "All" or null check and send to all contact types
		if (sendEmailToContactTypes == "All" || sendEmailToContactTypes == null || sendEmailToContactTypes == '') {
			conTypeArray = validConTypes;
		}

		//get From email from template configuration
		if (emailTemplate && emailTemplate != '') {
			tmpl = aa.communication.getNotificationTemplate(emailTemplate).getOutput();
			mailFrom = tmpl.getEmailTemplateModel().getFrom();
		}

		//Get Contacts based on type for each type provided
		for (z in conTypeArray) {
			conType = conTypeArray[z];
			conEmail = null;
			peopTemp = null;
			aa.print("          Searching for " + conTypeArray[z]);
			//Determine capId from which to get contacts
			if (vContactCapId == null || vContactCapId == "" || vContactCapId == false) {
				vContactCapId = capId;
			}
			if (conType == "Primary") {
				vConObjArry = getContactObjsByCap_BCC(vContactCapId);
			} else {
				vConObjArry = getContactObjsByCap_BCC(vContactCapId, conTypeArray[z]);
			}
			for (x in vConObjArry) {
				vConObj = vConObjArry[x];
				vConRefSeqNbr = vConObj.refSeqNumber;
				//Get contact email
				if (vConObj) {
					conEmail = vConObj.people.getEmail();
					if (conEmail && conEmail != null && conEmail != "") {
						conEmail = conEmail.toUpperCase();
						aa.print("found email " + conEmail);
					}
				}
				//Save contact email to array (primary)
				if (conEmail && conEmail != "" && conType == "Primary" && vConObj.capContact.getPrimaryFlag() == 'Y' && !exists(conEmail, conObjEmailCompareArray)) {
					aa.print("          Adding (Primary) " + conEmail + " to email array");
					conObjEmailArray.push(vConObj);
					conObjEmailCompareArray.push(conEmail); //Needed to make sure contact is only send one email if they have more than one role
				}
				//Save contact email to array (All or specified)
				else if (conEmail && conEmail != "" && conType != "Primary" && !exists(conEmail, conObjEmailCompareArray)) {
					aa.print("          Adding " + conEmail + " to email array");
					conObjEmailArray.push(vConObj);
					conObjEmailCompareArray.push(conEmail); //Needed to make sure contact is only sent one email if they have more than one role
				}
				//Add contact to non-email arrary to be used for the Ad-Hoc Task if no email is provided (Primary)
				else if (vAddAdHocTask && (conEmail == null || conEmail == "") && conType == "Primary" && vConObj.capContact.getPrimaryFlag() == 'Y' && !exists(vConRefSeqNbr, conObjNonEmailCompareArray)) {
					conObjNonEmailArray.push(vConObj);
					conObjNonEmailCompareArray.push(vConRefSeqNbr); //Needed to make sure contact is only send one email if they have more than one role
				}
				//Add contact to non-email arrary to be used for the Ad-Hoc Task if no email is provided (All or specified)
				else if (vAddAdHocTask && (conEmail == null || conEmail == "") && conType != "Primary" && !exists(vConRefSeqNbr, conObjNonEmailCompareArray)) {
					conObjNonEmailArray.push(vConObj);
					conObjNonEmailCompareArray.push(vConRefSeqNbr); //Needed to make sure contact is only send one email if they have more than one role
				}
			}
		}

		//Get the capId type needed for the email function
		capId4Email = null;
		capId4Email = aa.cap.createCapIDScriptModel(capId.getID1(), capId.getID2(), capId.getID3());

		//Get ACA Url
		vACAUrl = lookup("ACA_CONFIGS", "ACA_SITE");
		vACAUrl = vACAUrl.substr(0, vACAUrl.toUpperCase().indexOf("/ADMIN"));

		//Generate report and get report name
		vReportName = false;
		if (reportTemplate != '' && reportTemplate != null) {
			//generate and get report file
			vReportName = generateReportForEmail_BCC(capId, reportTemplate, aa.getServiceProviderCode(), vRParams)[0];

			//update the report name if one was provided. this will be used to update the saved report's name
			if (vReportName != false && vChangeReportName != null && vChangeReportName != "") {
				aa.print("Renaming generated report document name from " + vReportName + " to " + vChangeReportName);
				if (editDocumentName(vReportName, vChangeReportName) == true) {
					vReportName = vChangeReportName;
				}
			}
		}

		//Get document deep link URL
		if (vReportName != null && vReportName != false) {
			vDocumentList = aa.document.getDocumentListByEntity(capId, "CAP");
			if (vDocumentList != null) {
				vDocumentList = vDocumentList.getOutput();
			}
		}

		if (vDocumentList != null) {
			for (y = 0; y < vDocumentList.size(); y++) {
				vDocumentModel = vDocumentList.get(y);
				vDocumentName = vDocumentModel.getFileName();
				if (vDocumentName == vReportName) {
					//Add the document url to the email paramaters using the name: $$acaDocDownloadUrl$$
					getACADocDownloadParam4Notification(vEParams, vACAUrl, vDocumentModel);
					aa.print("including document url: " + vEParams.get('$$acaDocDownloadUrl$$'));
					aa.print("including document url: " + vEParams.get('$$acaDocDownloadUrl$$'));
					break;
				}
			}
		}

		//Loop through the contact objects with email and send to each
		for (w in conObjEmailArray) {
			vConObj = conObjEmailArray[w];
			//Get contact email
			if (vConObj) {
				conEmail = vConObj.people.getEmail();
			}
			//get clean email paramaters
			vEParamsToSend = vEParams;
			//Set contact specific email paramaters
			vEParamsToSend = vConObj.getEmailTemplateParams(vEParams);
			//Set contact Name paramaters
			addParameter(vEParamsToSend, "$$FullNameBusName$$", getContactName_BCC(vConObj));
			//Add Contact Trade Name
			if (vConObj.people.getTradeName() != null) {
				addParameter(vEParamsToSend, "$$TradeName$$", vConObj.people.getTradeName())
			}
			//Send email
			aa.print("Email Sent: " + aa.document.sendEmailAndSaveAsDocument(mailFrom, conEmail, "", emailTemplate, vEParamsToSend, capId4Email, null).getSuccess());
			aa.print("     " + capId.getCustomID() + ": Sent Email template " + emailTemplate + " to " + conEmail);
		}

		//Loop through the contact objects without email and update the Ad-Hoc Note
		for (v in conObjNonEmailArray) {
			vConObj = conObjNonEmailArray[v];
			if (v == 0) {
				vAdHocNote = vConObj.type + " - " + getContactName_BCC(vConObj);
			} else {
				vAdHocNote = vAdHocNote + ", " + vConObj.type + " - " + getContactName_BCC(vConObj);
			}
		}
		//Add Email Template to Note
		vAdHocNote = emailTemplate + ", " + vAdHocNote;

		aa.print("Create AddHocTask: " + vAddAdHocTask);

		//Add Ad-Hoc if needed
		if (vAddAdHocTask == true && conObjNonEmailArray.length > 0) {
			addAdHocTaskAssignDept_BCC(vAdHocProcess, vAdHocTask, vAdHocNote, vAdHocAssignDept);
		}
	} catch(err) { aa.print("error: " + err.message + ":" + err.stack); return false; }
}