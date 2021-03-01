var myCapId = "LIC-GBCA-20-00096";
var myUserId = "ADMIN";
var eventName = "";

/* CTRCA  */  //var eventName = "ConvertToRealCapAfter";
/* ASA  */  //var eventName = "ApplicationSubmitAfter";
/* WTUA */  var eventName = "WorkflowTaskUpdateAfter";  wfTask = "License Issuance";	  wfStatus = "Issued";  wfDateMMDDYYYY = "01/27/2015";
/* IRSA */  //var eventName = "InspectionResultSubmitAfter" ; inspResult = "Failed"; inspResultComment = "Comment";  inspType = "Roofing"
/* ISA  */  //var eventName = "InspectionScheduleAfter" ; inspType = "Roofing"
/* PRA  */  //var eventName = "PaymentReceiveAfter";

var useProductInclude = true; //  set to true to use the "productized" include file (events->custom script), false to use scripts from (events->scripts)
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.

/* master script code don't touch */ aa.env.setValue("EventName",eventName); var vEventName = eventName;  var controlString = eventName;  var tmpID = aa.cap.getCapID(myCapId).getOutput(); if(tmpID != null){aa.env.setValue("PermitId1",tmpID.getID1()); 	aa.env.setValue("PermitId2",tmpID.getID2()); 	aa.env.setValue("PermitId3",tmpID.getID3());} aa.env.setValue("CurrentUserID",myUserId); var preExecute = "PreExecuteForAfterEvents";var documentOnly = false;var SCRIPT_VERSION = 3.0;var useSA = false;var SA = null;var SAScript = null;var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 	useSA = true; 		SA = bzr.getOutput().getDescription();	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 	if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }	}if (SA) {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,useProductScript));	/* force for script test*/ showDebug = true; eval(getScriptText(SAScript,SA,useProductScript));	}else {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useProductScript));	}	eval(getScriptText("INCLUDES_CUSTOM",null,useProductInclude));if (documentOnly) {	doStandardChoiceActions2(controlString,false,0);	aa.env.setValue("ScriptReturnCode", "0");	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");	aa.abortScript();	}var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";var doStdChoices = true;  var doScripts = false;var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;if (bzr) {	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");	doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");	doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	}	function getScriptText(vScriptName, servProvCode, useProductScripts) {	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();	vScriptName = vScriptName.toUpperCase();	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();	try {		if (useProductScripts) {			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);		} else {			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");		}		return emseScript.getScriptText() + "";	} catch (err) {		return "";	}}logGlobals(AInfo); if (runEvent && typeof(doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString,true,0); } catch (err) { logDebug(err.message) } if (runEvent && typeof(doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g,"\r");  logDebug(z);

//
// User code goes here
//

try {
    showDebug = true;

    var sql = "select b1_per_id1, b1_per_id2, b1_per_id3 from b1permit where b1_alt_id like 'LA-C-%-R-APP' and serv_prov_code = 'LADCR' ";
    var r = doSQL_LADCR(sql);

    for (var i in r) {
		//
		// testing
		if (i > 1) continue;
		//
        capId = aa.cap.getCapID(r[i].b1_per_id1, r[i].b1_per_id2, r[i].b1_per_id3).getOutput();
        if (capId) {
            logDebug("=== record " + capId.getCustomID());
			var newAltId = capId.getCustomID().replace("-R-","-");
			var result = aa.cap.updateCapAltID(capId,newAltId).getOutput();
			capId = aa.cap.getCapID(newAltId).getOutput()
			if (capId) {
				logDebug("    record updated to " + capId.getCustomID());
				createRetailChildRecord();
				aa.workflow.deleteAndAssignWorkflow(capId, "CAN_GEN_APP_PCN", true);
				activateTaskByCap("Temp App Review",capId);
				updateAppStatus("Eligible for Processing","");
			} else {
				logDebug("    record not found by new id " + newAltId);
			}
            //deactivateAllTasksByCap(capId);
            //activateTaskByCap("Close Out", capId);
        } else {
            logDebug("=== record not found for " + r[i].b1_per_id1 + "-" + r[i].b1_per_id2 + "-" + r[i].b1_per_id3);
        }
    }

} catch (err) {
    logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
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

function doSQL_LADCR(sql) {
        try {
		var array = [];
		var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
		var ds = initialContext.lookup("java:/LADCR");
		var conn = ds.getConnection();
		var sStmt = conn.prepareStatement(sql);

		if (sql.toUpperCase().indexOf("SELECT") == 0) {
			logDebug("executing " + sql);
			var rSet = sStmt.executeQuery();
			while (rSet.next()) {
				var obj = {};
				var md = rSet.getMetaData();
				var columns = md.getColumnCount();
				for (i = 1; i <= columns; i++) {
								obj[md.getColumnName(i)] = String(rSet.getString(md.getColumnName(i)));
				}
				obj.count = rSet.getRow();
				array.push(obj)
				}
						rSet.close();
						logDebug("...returned " + array.length + " rows");
						logDebug(JSON.stringify(array));
						return array
		} else if (sql.toUpperCase().indexOf("UPDATE") == 0) {
			logDebug("executing update: " + sql);
			var rOut = sStmt.executeUpdate();
			logDebug(rOut + " rows updated");
		} else {
			logDebug("executing : " + sql);
			var rOut = sStmt.execute();
			logDebug(rOut);
		}
		sStmt.close();
		conn.close();
	} catch (err) {
			logDebug(err.message);
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
        setTask("Application Acceptance", "N", "Y");
        activateTask("Temp App Review");
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