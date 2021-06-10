/*------------------------------------------------------------------------------------------------------/
| Program: LADCR CORRESPONDENCE FROM SET.js  Trigger: Batch
| Client:
|
| REQUIRED: CORRESPONDENCE SCRIPT PARAMS std choice
| 08/24/20: added more email template parameters
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Initialize Variables
/------------------------------------------------------------------------------------------------------*/
/* START SCRIPT TEST PARAMETERS */
if (false) { //set to false to turn off test values
	var mySetID = "TEST CORRESPONDENCE";
	var setMemberArray = new Array();
	var setMemberResult = aa.set.getCAPSetMembersByPK(mySetID);
	if (setMemberResult.getSuccess()) {
		setMemberArray = setMemberResult.getOutput().toArray();
		aa.env.setValue("SetMemberArray", setMemberArray);
		aa.env.setValue("SetId", mySetID);
		aa.env.setValue("ScriptName", "LADCR LICENSING WORKSHOP ANNOUNCEMENT");
	} else {
		aa.print("Error: Could not find set by PK: " + mySetID);
	}

	aa.env.setValue("CurrentUserID", "ADMIN");

	aa.env.setValue("TestParam", "value");
	var values = aa.env.getParamValues();
	aa.print(values);
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
//
//
//

//var emailTemplate = "BLAST NOTICE PHASE 2 LETTER 02";
//var sendEmailToContactTypes = "Owner Applicant,Business Owner,Business,Primary Contact Person";
//var sendEmailToContactTypes = "Individual";

//
//
//
var SetId = aa.env.getValue("SetID"); 

var ScriptName = aa.env.getValue("ScriptName");
batchJobName = "";
batchJobID = "";

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/

SCRIPT_VERSION = 3.0

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,true));
eval(getScriptText("INCLUDES_BATCH"));
eval(getScriptText("INCLUDES_CUSTOM",null,true));

function getScriptText(vScriptName, servProvCode, useProductScripts)
{
if (!servProvCode) 
	servProvCode = aa.getServiceProviderCode();

vScriptName = vScriptName.toUpperCase();
var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
try
 {
	if (useProductScripts) {
		var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
	}	

	else {
		var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
	}
	
	return emseScript.getScriptText() + "";
 }

catch (err) {
return "";
}
}

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

var showDebug = true; //debug on or off
aa.env.setValue("eventType","Batch Process") // need to be for sync emails.

logDebug("=====Processing set " + SetId);

/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

var startDate = new Date();
var startTime = startDate.getTime();			// Start timer

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("*** Start of Job ***");

var emailTemplate = lookup("CORRESPONDENCE SCRIPT PARAMS","emailTemplate");
var sendEmailToContactTypes = lookup("CORRESPONDENCE SCRIPT PARAMS","sendEmailToContactTypes");

if (emailTemplate && emailTemplate != "" && sendEmailToContactTypes && sendEmailToContactTypes != "" && SetMemberArray.length > 0) {
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
		capId = resultObjArray[curRecord];
		aa.env.setValue("PermitId1", resultObjArray[curRecord].getID1());
		aa.env.setValue("PermitId2", resultObjArray[curRecord].getID2());
		aa.env.setValue("PermitId3", resultObjArray[curRecord].getID3());
		var capIdObject = getCapId();

		var cap = aa.cap.getCap(capId).getOutput();
		var altId = capIdObject.getCustomID();

		logDebug("=====Identifying record " + altId);

		/*
		//Generate license report and email
		var vRParams = aa.util.newHashtable();
		addParameter(vRParams, "p1Value", capId.getCustomID());
		*/
		//aa.print("Legal Business Name = " + getAppName());
		//aa.print("DBA Name = " + getShortNotes());
		//aa.print("Address = " + getAddressInALine());
		
		var vEParams = aa.util.newHashtable();		
		if (sendEmailToContactTypes.length > 0 && emailTemplate.length > 0) {
			var conTypeArray = sendEmailToContactTypes.split(",");
			var	conArray = getContactArray(capId);
			for (thisCon in conArray) {
				var conEmail = false;
				thisContact = conArray[thisCon];
				if (exists(thisContact["contactType"],conTypeArray)) {
					for(a in conTypeArray) {
						if(thisContact["contactType"] == conTypeArray[a]) {
							conEmail = thisContact["email"];
							if (conEmail) {
								eParams = aa.util.newHashtable();
								addParameter(eParams,"$$AltId$$",altId);
								addParameter(eParams,"$$firstName$$",thisContact["firstName"]);
								addParameter(eParams,"$$lastName$$",thisContact["lastName"]);
								addParameter(eParams,"$$LegalBusinessName$$",getAppName()); //new
								addParameter(eParams,"$$DBAName$$",getShortNotes()); //new
								addParameter(eParams,"$$address$$",getAddressInALine()); //new
								addParameter(eParams,"$$todayplus14$$",dateAdd(null,14));
								addParameter(eParams,"$$todaysDate$$",dateAdd(null,0));
								sendNotification(sysFromEmail,conEmail,"",emailTemplate,eParams, [],capId);
								logDebug(altId + ": Sent Email template " + emailTemplate + " to " + thisContact["contactType"] + " : " + conEmail);
							}
						}
					}
				}
			}
		}
	}
}
