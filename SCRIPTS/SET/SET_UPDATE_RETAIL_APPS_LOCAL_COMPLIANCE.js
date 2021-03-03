/*------------------------------------------------------------------------------------------------------/
| Program: SET_UPDATE_RETAIL_APPS_LOCAL_COMPLIANCE.js  Trigger: Batch
| Client: LADCR
|
| REQUIRED: CORRESPONDENCE SCRIPT PARAMS std choice
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Initialize Variables
/------------------------------------------------------------------------------------------------------*/
/* START SCRIPT TEST PARAMETERS */
if (true) { //set to false to turn off test values
	var mySetID = "JHSTEST";
	var setMemberArray = new Array();
	var setMemberResult = aa.set.getCAPSetMembersByPK(mySetID);
	if (setMemberResult.getSuccess()) {
		setMemberArray = setMemberResult.getOutput().toArray();
		aa.env.setValue("SetMemberArray", setMemberArray);
		aa.env.setValue("SetId", mySetID);
		aa.env.setValue("ScriptName", "TEST TEMPLATE");
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

		var cap = aa.cap.getCap(capId).getOutput();
		var altId = capId.getCustomID();


		try {
			if (capId) {
				logDebug("=== record " + capId.getCustomID());
				var newAltId = capId.getCustomID().replace("-R-","-");
				var result = aa.cap.updateCapAltID(capId,newAltId).getOutput();
				capId = aa.cap.getCapID(newAltId).getOutput()
				if (capId) {
					logDebug("    record updated to " + capId.getCustomID());
					createRetailChildRecord();
					aa.workflow.deleteAndAssignWorkflow(capId, "CAN_GEN_APP_PCN", true);
					activateTaskByCap("Pre-Inspection Review",capId);
					deactivateTaskByCap("PCN Acceptance",capId);
					updateAppStatus("Local Compliance Underway","");
				} else {
					logDebug("    record not found by new id " + newAltId);
				}
				//deactivateAllTasksByCap(capId);
				//activateTaskByCap("Close Out", capId);
			} else {
				logDebug("=== record not found for " + r[i].b1_per_id1 + "-" + r[i].b1_per_id2 + "-" + r[i].b1_per_id3);
			}
		} catch (err) {
			logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
		}
	}
}
// end user code
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);

function activateTaskByCap(wfstr, capId) 
{
    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess()) 
    {
        var wfObj = workflowResult.getOutput();
    } else 
    {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }
  
    for (var i in wfObj) 
    {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) 
        {
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            //PARAMETERS ARE: Cap ID, StepNumber, ActiveFlag, CompleteFlag, Assignment Date, Due Date
            aa.workflow.adjustTask(capId, stepnumber, "Y", "N", null, null);
            logDebug("Activating Workflow Task: " + wfstr);
        }
    }
}

function deactivateAllTasksByCap(capId) 
{
    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess()) 
    {
        var wfObj = workflowResult.getOutput();
    } else 
    {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }
  
    for (var i in wfObj) 
    {
        var fTask = wfObj[i];
		var stepnumber = fTask.getStepNumber();
		var processID = fTask.getProcessID();
		//PARAMETERS ARE: Cap ID, StepNumber, ActiveFlag, CompleteFlag, Assignment Date, Due Date
		aa.workflow.adjustTask(capId, stepnumber, "N", "N", null, null);
		logDebug("Deactivating Workflow Task: " + fTask.getTaskDescription());
    }
}

function deactivateTaskByCap(wfstr, capId) 
{
    var workflowResult = aa.workflow.getTasks(capId);
    if (workflowResult.getSuccess()) 
    {
        var wfObj = workflowResult.getOutput();
    } else 
    {
        logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
        return false;
    }
  
    for (var i in wfObj) 
    {
        var fTask = wfObj[i];
        if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) 
        {
            var stepnumber = fTask.getStepNumber();
            var processID = fTask.getProcessID();
            //PARAMETERS ARE: Cap ID, StepNumber, ActiveFlag, CompleteFlag, Assignment Date, Due Date
            aa.workflow.adjustTask(capId, stepnumber, "N", "N", null, null);
            logDebug("Deactivating Workflow Task: " + wfstr);
        }
    }
}

function createRetailChildRecord() {
    //Start - CREATE_ACTIVITY_RECS_FROM_PREAPP Script
    //Update: 01/28/2021:02:50 PM

    var childSuffixArray = [];
    var clearASIArray = [];

    // CREATE CHILD RECORDS HERE
    var rt = ["Licenses", "Cannabis", "Business", "Application"];

	// retail only
    childSuffixArray.push("R");
    var itemCapId = aa.cap.getCapID(capId.getID1(), capId.getID2(), capId.getID3()).getOutput();

    var childRecs = getChildren(rt.join("/"), itemCapId);

    // GQ ticket 1837, deprecate activity records that aren't selected
    for (var i in childRecs) {
        var thisChildId = childRecs[i];
        var thisChildIdStr = String(thisChildId.getCustomID());
        if (thisChildIdStr.substr(thisChildIdStr.length - 2, 1) == "-" && childSuffixArray.indexOf(thisChildIdStr.substr(thisChildIdStr.length - 1, 1)) == -1) {
            // deprecate old app
            logDebug("Child Activity record exists for " + thisChildIdStr.substr(thisChildIdStr.length - 1, 1) + ": " + thisChildIdStr + ", deprecating");
            updateAppStatus("Deprecated", "Deprecated by mod request " + capId.getCustomID(), thisChildId);
        }
    }

    for (var i in childSuffixArray) {
        // GQ ticket 1387, check to see if child record already exists, as we are calling this from modification request
        var alreadyExists = false;
        for (var j in childRecs) {
            if (String(childRecs[j].getCustomID()).endsWith("-" + childSuffixArray[i])) {
                logDebug("Child for " + childSuffixArray[i] + " already exists: " + childRecs[j].getCustomID());
                alreadyExists = true;
            }
        }
        if (alreadyExists) {
            continue;
        }

        var childId = createChild(rt[0], rt[1], rt[2], rt[3], "");

        //Copy ASI from child to license
        // TODO: only certain fields?
        copyASIInfo(itemCapId, childId);

        //Copy ASIT from child to license
        copyASITables(itemCapId, childId);

        editAppSpecific("Is this a Renewal?", "N", childId);

        //Copy Contacts from child to license
        copyContacts3_0(itemCapId, childId);

        //Copy Work Description from child to license
        aa.cap.copyCapWorkDesInfo(itemCapId, childId);

        //Copy application name from child to license
        editAppName(getAppName(itemCapId), childId);

        //Copy remaining application fields
        updateShortNotes(getShortNotes(itemCapId), childId);
        editPriority(getPriority(itemCapId), childId);

        // set child record status
        updateAppStatus("Eligible for Processing", "", childId); //updated per Aaron 1/28/21

        // set workflow task - added per Aaron 1/28/21
        var capIdSave = capId;
        capId = childId;
        setTask("PCN Acceptance", "N", "Y");
        setTask("Application Acceptance", "N", "Y");
        activateTask("Pre-Inspection Review");
        capId = capIdSave;

        //use the suffix to give it a unique ID
        lacdUpdateAltID(childId, "ACTIVITY", itemCapId.getCustomID(), childSuffixArray[i]);

        // clear ASI
        logDebug("here in record for " + childSuffixArray[i]);
        for (var j in clearASIArray[childSuffixArray[i]]) {
            logDebug("clearing ASI: " + clearASIArray[childSuffixArray[i]][j]);
            editAppSpecific(clearASIArray[childSuffixArray[i]][j], "", childId);
        }

        //End - Activity Record Creation/Update Script
    }

}
