var myCapId = "LA-C-19-000120-R-APP";
var myUserId = "ADMIN";
var eventName = "RemoveGrantStatus";

var useProductInclude = true; //  set to true to use the "productized" include file (events->custom script), false to use scripts from (events->scripts)
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.
/* master script code don't touch */ aa.env.setValue("EventName",eventName); var vEventName = eventName;  var controlString = eventName;  var tmpID = aa.cap.getCapID(myCapId).getOutput(); if(tmpID != null){aa.env.setValue("PermitId1",tmpID.getID1());  aa.env.setValue("PermitId2",tmpID.getID2());    aa.env.setValue("PermitId3",tmpID.getID3());} aa.env.setValue("CurrentUserID",myUserId); var preExecute = "PreExecuteForAfterEvents";var documentOnly = false;var SCRIPT_VERSION = 3.0;var useSA = false;var SA = null;var SAScript = null;var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {     useSA = true;       SA = bzr.getOutput().getDescription();  bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT");     if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }  }if (SA) {  eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));   eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,useProductScript)); /* force for script test*/ showDebug = true; eval(getScriptText(SAScript,SA,useProductScript)); }else { eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript)); eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useProductScript));   }   eval(getScriptText("INCLUDES_CUSTOM",null,useProductInclude));if (documentOnly) {   doStandardChoiceActions2(controlString,false,0);    aa.env.setValue("ScriptReturnCode", "0");   aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");  aa.abortScript();   }var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";var doStdChoices = true;  var doScripts = false;var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;if (bzr) {   var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");    doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";   var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");    doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";  }   function getScriptText(vScriptName, servProvCode, useProductScripts) {  if (!servProvCode)  servProvCode = aa.getServiceProviderCode(); vScriptName = vScriptName.toUpperCase();    var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();  try {       if (useProductScripts) {            var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);     } else {            var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");      }       return emseScript.getScriptText() + ""; } catch (err) {     return "";  }}logGlobals(AInfo); if (runEvent && typeof(doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString,true,0); } catch (err) { logDebug(err.message) } if (runEvent && typeof(doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g,"\r");  aa.print(z);

try {
    showDebug = true;

    var altId = capId.getCustomID();
    logDebug(br + "PROCESSING: Begin resetting grant status on record: " + altId)
    var refId = getAppSpecific("Grant Recipient Reference Contact ID", capId)
    logDebug("Current grant status on record: " + getAppSpecific("Grant Recipient", capId))
    logDebug("Current reference ID on this record: " + refId)
    refConResult = aa.people.getPeople(refId);
    if (refConResult.getSuccess()) {
        refPeopleModel = refConResult.getOutput();
        refAttrResult = aa.people.getPeopleAttributeByPeople(refId, refPeopleModel.getContactType());
        if (refAttrResult.getSuccess()) {
            refAttr = refAttrResult.getOutput();
            for (var i in refAttr) {
                item = refAttr[i];
                if ("GRANT RECIPIENT".equals(item.getAttributeName())) {
                    var attributeValue = item.getAttributeValue();
                    logDebug("Contact's Grant Recipient status value: " + attributeValue);
                    logDebug("Attempting to set contact ref attribute to No");
                    item.setAttributeValue("No");
                    paEditResult = aa.people.editPeopleAttribute(item.getPeopleAttributeModel());
                    if (!paEditResult.getSuccess()) {
                        retValue = "failure - attribute edit failed " + paEditResult.getErrorMessage();
                    } else {
                        logDebug("Changed " + refId + " grant status to No");
                    }
                    logDebug("Clearing record's ASI");
                    editAppSpecific("Grant Recipient", "No", capId);
                    editAppSpecific("Grant Recipient Reference Contact ID", "", capId);
                    break;
                } else {
                    logDebug("Attribute not found on reference.")
                }
            }
        }
    } else {
        logDebug("Invalid Ref ID in the ASI. Contact that was synced does not have an ASI.")
    }
    
    logDebug("END PROCESSING: Ending Records Grant Status: " + getAppSpecific("Grant Recipient", capId))
                
        
    
    
} catch (err) {
    logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
}
// end user code
aa.env.setValue("ScriptReturnCode", "0");   aa.env.setValue("ScriptReturnMessage", debug)
