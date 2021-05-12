//var myCapId = "LA-P-21-000677-Q";
var myCapId = "x";
var myUserId = "ADMIN";
var eventName = "test";
/* CTRCA  */  //var eventName = "ConvertToRealCapAfter";
/* ASA  */  //var eventName = "ContactAddAfter"; var contactType;
/* WTUA */  //var eventName = "WorkflowTaskUpdateAfter";  wfTask = "Issuance";      wfStatus = "Issued";  wfDateMMDDYYYY = "01/27/2015"; wfProcess = "";
/* IRSA */  //var eventName = "InspectionResultSubmitAfter" ; inspResult = "Scheduled"; inspResultComment = "Comment";  inspType = "1804 Five Year Emergency Power Test"; var inspResultDate; var inspObj;
/* ISA  */  //var eventName = "InspectionScheduleAfter" ; inspType = "Roofing"
/* PRA  */  //var eventName = "PaymentReceiveAfter"; capStatus = "Ready to Issue";
/* IRSB */ //var eventName = "InspectionResultSubmitBefore"; var inspResult; var inspComment; var inspType;
/* CAA */ //var eventName = "ContactAddAfter"; var contactType = "Applicant"; var contactEmail = "sal@grayquarter.com"; var contactRelation = ""; var contactName = "Sal G"
var useProductInclude = true; //  set to true to use the "productized" include file (events->custom script), false to use scripts from (events->scripts)
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.
/* master script code don't touch */ aa.env.setValue("EventName",eventName); var vEventName = eventName;  var controlString = eventName;  var tmpID = aa.cap.getCapID(myCapId).getOutput(); if(tmpID != null){aa.env.setValue("PermitId1",tmpID.getID1());  aa.env.setValue("PermitId2",tmpID.getID2());    aa.env.setValue("PermitId3",tmpID.getID3());} aa.env.setValue("CurrentUserID",myUserId); var preExecute = "PreExecuteForAfterEvents";var documentOnly = false;var SCRIPT_VERSION = 3.0;var useSA = false;var SA = null;var SAScript = null;var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {     useSA = true;       SA = bzr.getOutput().getDescription();  bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT");     if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }  }if (SA) {  eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));   eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,useProductScript)); /* force for script test*/ showDebug = true; eval(getScriptText(SAScript,SA,useProductScript)); }else { eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript)); eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useProductScript));   }   eval(getScriptText("INCLUDES_CUSTOM",null,useProductInclude));if (documentOnly) {   doStandardChoiceActions2(controlString,false,0);    aa.env.setValue("ScriptReturnCode", "0");   aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");  aa.abortScript();   }var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";var doStdChoices = true;  var doScripts = false;var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;if (bzr) {   var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");    doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";   var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");    doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";  }   function getScriptText(vScriptName, servProvCode, useProductScripts) {  if (!servProvCode)  servProvCode = aa.getServiceProviderCode(); vScriptName = vScriptName.toUpperCase();    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();  try {       if (useProductScripts) {            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);     } else {            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");      }       return emseScript.getScriptText() + ""; } catch (err) {     return "";  }}logGlobals(AInfo); if (runEvent && typeof(doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString,true,0); } catch (err) { logDebug(err.message) } if (runEvent && typeof(doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g,"\r");  aa.print(z);
//
// User code goes here
//

/*c = getContactObjs(capId,"Applicant")[0];

// returns contactObj class

logDebug(c.asi["label name"])*/

// look at existing CEA or CAA code for examples

try {
    showDebug = true;

    var recieved = false;
    var refContactNbr = ContactObj.refSeqNumber;
    if(ContactObj.getAttribute("Grant Recipient Status")) {
        editAppSpecific("Grant Recipient", "Yes");
        editAppSpecific("Grant Recipient Reference Contact ID", refContactNbr);
        var asi1 = getAppSpecific("Grant Recipient", capId);
        var asi2= getAppSpecific("Grant Recipient Reference Contact ID", capId);
        recieved = true;
        logDebug("Set ASI values to 'Yes' and " + refContactNbr + " grant status recieved: " + recieved);
    } else {
        editAppSpecific("Grant Recipient", "No");
        editAppSpecific("Grant Recipient Reference Contact ID", "");
        recieved = false;
        logDebug("Set ASI values to 'No' and '' grant status recieved: " + recieved);
    }

    if (refContactNbr && refContactNbr != "") {
        refConResult = aa.people.getPeople(refContactNbr);
        if (refConResult.getSuccess()) {
                refPeopleModel = refConResult.getOutput();
                refAttrResult = aa.people.getPeopleAttributeByPeople(refContactNbr, refPeopleModel.getContactType());
                if (refAttrResult.getSuccess()) {
                    refAttr = refAttrResult.getOutput();
                    for (var i in refAttr) {
                        item = refAttr[i];
                        if ("GRANT RECIPIENT".equals(item.getAttributeName())) {
                            if(recieved) {
                                item.setAttributeValue("Yes");
                                logDebug("Set contact attribute to Yes");
                            } else {
                                item.setAttributeValue("No");
                                logDebug("Set contact attribute to No");
                            }
                            paEditResult = aa.people.editPeopleAttribute(item.getPeopleAttributeModel());
                            if (!paEditResult.getSuccess()) {
                                retValue =  "failure - attribute edit failed " + paEditResult.getErrorMessage();
                            } else {
                                logDebug("Changed " + refContactNbr);
                            }
                        }
                    }
                } else { 
                    retValue =  "failure - failed to get attributes " + refAttrResult.getErrorMessage();
                }
        } else { 
            retValue =  "failure - failed to retrieve contact " + refConResult.getErrorMessage();
        }
    } else { 
        retValue =  "failure - reference contact number not passed";
    }

    logDebug(retValue);

} catch (err) {
    logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
}
// end user code
aa.env.setValue("ScriptReturnCode", "0");   aa.env.setValue("ScriptReturnMessage", debug)


    