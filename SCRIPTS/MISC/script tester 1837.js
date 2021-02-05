var myCapId = "LA-C-20-000051-MOD";
var myUserId = "ADMIN";
var eventName = "";

/* CTRCA  */  //var eventName = "ConvertToRealCapAfter";
/* ASA  */  //var eventName = "ApplicationSubmitAfter";
/* WTUA */  var eventName = "WorkflowddTaskUpdateAfter";  wfTask = "License Issuance";	  wfStatus = "Issued";  wfDateMMDDYYYY = "01/27/2015";
/* IRSA */  //var eventName = "InspectionResultSubmitAfter" ; inspResult = "Failed"; inspResultComment = "Comment";  inspType = "Roofing"
/* ISA  */  //var eventName = "InspectionScheduleAfter" ; inspType = "Roofing"
/* PRA  */  //var eventName = "PaymentReceiveAfter";

var useProductInclude = true; //  set to true to use the "productized" include file (events->custom script), false to use scripts from (events->scripts)
var useProductScript = true;  // set to true to use the "productized" master scripts (events->master scripts), false to use scripts from (events->scripts)
var runEvent = true; // set to true to simulate the event and run all std choices/scripts for the record type.

/* master script code don't touch */ aa.env.setValue("EventName",eventName); var vEventName = eventName;  var controlString = eventName;  var tmpID = aa.cap.getCapID(myCapId).getOutput(); if(tmpID != null){aa.env.setValue("PermitId1",tmpID.getID1()); 	aa.env.setValue("PermitId2",tmpID.getID2()); 	aa.env.setValue("PermitId3",tmpID.getID3());} aa.env.setValue("CurrentUserID",myUserId); var preExecute = "PreExecuteForAfterEvents";var documentOnly = false;var SCRIPT_VERSION = 3.0;var useSA = false;var SA = null;var SAScript = null;var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_FOR_EMSE"); if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") { 	useSA = true; 		SA = bzr.getOutput().getDescription();	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS","SUPER_AGENCY_INCLUDE_SCRIPT"); 	if (bzr.getSuccess()) { SAScript = bzr.getOutput().getDescription(); }	}if (SA) {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",SA,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",SA,useProductScript));	/* force for script test*/ showDebug = true; eval(getScriptText(SAScript,SA,useProductScript));	}else {	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS",null,useProductScript));	eval(getScriptText("INCLUDES_ACCELA_GLOBALS",null,useProductScript));	}	eval(getScriptText("INCLUDES_CUSTOM",null,useProductInclude));if (documentOnly) {	doStandardChoiceActions2(controlString,false,0);	aa.env.setValue("ScriptReturnCode", "0");	aa.env.setValue("ScriptReturnMessage", "Documentation Successful.  No actions executed.");	aa.abortScript();	}var prefix = lookup("EMSE_VARIABLE_BRANCH_PREFIX",vEventName);var controlFlagStdChoice = "EMSE_EXECUTE_OPTIONS";var doStdChoices = true;  var doScripts = false;var bzr = aa.bizDomain.getBizDomain(controlFlagStdChoice ).getOutput().size() > 0;if (bzr) {	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"STD_CHOICE");	doStdChoices = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	var bvr1 = aa.bizDomain.getBizDomainByValue(controlFlagStdChoice ,"SCRIPT");	doScripts = bvr1.getSuccess() && bvr1.getOutput().getAuditStatus() != "I";	}	function getScriptText(vScriptName, servProvCode, useProductScripts) {	if (!servProvCode)  servProvCode = aa.getServiceProviderCode();	vScriptName = vScriptName.toUpperCase();	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();	try {		if (useProductScripts) {			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);		} else {			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");		}		return emseScript.getScriptText() + "";	} catch (err) {		return "";	}}logGlobals(AInfo); if (runEvent && typeof(doStandardChoiceActions) == "function" && doStdChoices) try {doStandardChoiceActions(controlString,true,0); } catch (err) { logDebug(err.message) } if (runEvent && typeof(doScriptActions) == "function" && doScripts) doScriptActions(); var z = debug.replace(/<BR>/g,"\r");  aa.print(z);

//
// User code goes here
//

try {
	showDebug = true;

//JS to work on 2.2

//if (wfTask.equals("Review") && wfStatus.equals("Changes Accepted")) {
    //1.  Create separate parent record if location is moving
	// copy new address from mod record
	// Deprecate old APP, 
	// create new parent app and do not link, 
	// an needs sequence ID
	
if (isASITrue(AInfo["Business Premises Relocation"])) {
	// create new parent record
	var newId = createCannabisApp("Licenses","Cannabis","Business","Application","",parentCapId,capId);
	if (newId) {
		logDebug("New Application Record created: " + newId.getCustomID());
		newCap = aa.cap.getCap(newId).getOutput();
		logDebug("Run ASA event success? " + aa.cap.runEMSEScriptAfterApplicationSubmit(newCap.getCapModel(),newId).getSuccess());
		// deprecate old app - is this all we have to do?
		updateAppStatus("Deprecated","Deprecated by mod request " + capId.getCustomID(),parentCapId);
	}


}
/*
// new activity
if isASITrue(AInfo["New Cannabis Activity"]) {

    check the child records and see if the activity record exists. If there's no child record, create it and copy asi and all related child copy data 
        
}    

//remove activity
if isASITrue(AInfo["Remove Cannabis Activity"])
    
    check the activity, find child record for activity and deprecate 



*/

	}
catch (err) {
	logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: "+ err.stack);
	}
// end user code
aa.env.setValue("ScriptReturnCode", "0"); 	aa.env.setValue("ScriptReturnMessage", debug)


               
function createCannabisApp(grp,typ,stype,cat,desc,itemCap,addressCap) {
	//
	// creates the new application and returns the capID object
	// cloned from createChild but no hierarchy
	//

	var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (appCreateResult.getSuccess())
		{
		var newId = appCreateResult.getOutput();
		logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");
		
		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);

		// Copy Contacts
		capContactResult = aa.people.getCapContactByCapID(itemCap);
		if (capContactResult.getSuccess())
			{
			Contacts = capContactResult.getOutput();
			for (yy in Contacts)
				{
				var newContact = Contacts[yy].getCapContactModel();
				newContact.setCapID(newId);
				aa.people.createCapContact(newContact);
				logDebug("added contact");
				}
			}	

		// Copy Addresses
		capAddressResult = aa.address.getAddressByCapId(addressCap);
		if (capAddressResult.getSuccess())
		{
			Address = capAddressResult.getOutput();
			for (yy in Address)
			{
			newAddress = Address[yy];
			var addressId = newAddress.getAddressId();
			logDebug("addressId:" + addressId);           
			newAddress.setCapID(newId);
			var newAddressResult = aa.address.createAddress(newAddress);
			logDebug("added address");
			// Copy address district.
			if(newAddressResult.getSuccess())
				{
					var newAddressId = newAddressResult.getOutput();
					var districtColResult = aa.address.getAssignedAddressDistrictForDaily(addressCap.getID1(),addressCap.getID2(),addressCap.getID3(),addressId);
					if(districtColResult != null && districtColResult.getOutput()!= null && districtColResult.getSuccess)
					{
						var districtCol = districtColResult.getOutput();
						for (x1 in districtCol)
						{
							var newDistrict = districtCol[x1];
							aa.address.addAddressDistrictForDaily(newId.getID1(),newId.getID2(),newId.getID3(),newAddressId,newDistrict.getDistrict());
							logDebug("added address district.");
						}
					}
				}                
			}
		}
        //Copy GIS 
		var gisObjResult = aa.gis.getCapGISObjects(addressCap);
		if (gisObjResult.getSuccess()) 
			{
			var fGisObj = gisObjResult.getOutput();
			for (a1 in fGisObj) // for each GIS object on the Cap
				{
				var gisTypeScriptModel = fGisObj[a1];
				var gisObjArray = gisTypeScriptModel.getGISObjects()
				for (b1 in gisObjArray)
					{
  					var gisObjScriptModel = gisObjArray[b1];
  					var gisObjModel = gisObjScriptModel.getGisObjectModel() ;

					var retval = aa.gis.addCapGISObject(newId,gisObjModel.getServiceID(),gisObjModel.getLayerId(),gisObjModel.getGisId());

					if (retval.getSuccess())
						{ logDebug("Successfully added Cap GIS object: " + gisObjModel.getGisId())}
					else
						{ logDebug("**WARNING: Could not add Cap GIS Object.  Reason is: " + retval.getErrorType() + ":" + retval.getErrorMessage()) ; return false }	
					}
				}
			}

		copyAppSpecificInfoForLic(parentCapId,newId);
		copyAppSpecificTableForLic(parentCapId,newId);
		return newId;
		}
	else
		{
		logDebug( "**ERROR: adding child App: " + appCreateResult.getErrorMessage());
		}
}

function copyAppSpecificTableForLic(srcCapId, targetCapId) {
	var tableNameArray = getTableName(srcCapId);
	var targetTableNameArray = getTableName(targetCapId);
	if (tableNameArray == null) {
		logDebug("tableNameArray is null, returning");
		return;
	}
	for (loopk in tableNameArray) {
		var tableName = tableNameArray[loopk];
		if (IsStrInArry(tableName, targetTableNameArray)) {
			//1. Get appSpecificTableModel with source CAPID
			var sourceAppSpecificTable = getAppSpecificTableForLic(srcCapId, tableName);
			//2. Edit AppSpecificTableInfos with target CAPID
			var srcTableModel = null;
			if (sourceAppSpecificTable == null) {
				logDebug("sourceAppSpecificTable is null");
				return;
			}
			else {
				srcTableModel = sourceAppSpecificTable.getAppSpecificTableModel();

				tgtTableModelResult = aa.appSpecificTableScript.getAppSpecificTableModel(targetCapId, tableName);
				if (tgtTableModelResult.getSuccess()) {
					tgtTableModel = tgtTableModelResult.getOutput();
					if (tgtTableModel == null) {
						logDebug("target table model is null");
					}
					else {
						tgtGroupName = tgtTableModel.getGroupName();
						srcTableModel.setGroupName(tgtGroupName);
					}
				}
				else { logDebug("Error getting target table model " + tgtTableModelResult.getErrorMessage()); }
			}
			editResult = aa.appSpecificTableScript.editAppSpecificTableInfos(srcTableModel,
				targetCapId,
				null);
			if (editResult.getSuccess()) {
				logDebug("Successfully editing appSpecificTableInfos");
			}
			else {
				logDebug("Error editing appSpecificTableInfos " + editResult.getErrorMessage());
			}
		}
		else {
			logDebug("Table " + tableName + " is not defined on target");
		}
	}

}


function copyAppSpecificInfoForLic(srcCapId, targetCapId)
{
	var ignoreArr = new Array();
	var AppSpecInfo = new Array();
	useAppSpecificGroupName = true;
	loadAppSpecific(AppSpecInfo,srcCapId);
	copyAppSpecificForLic(AppSpecInfo,targetCapId, ignoreArr);
	useAppSpecificGroupName = false;
}
	


function copyAppSpecificForLic(AInfo, newCap) // copy all App Specific info
// into new Cap, 1 optional
// parameter for ignoreArr
{
	var ignoreArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2) {
		ignoreArr = arguments[2];
		limitCopy = true;
	}

	for (asi in AInfo) {
		if (limitCopy) {
			var ignore = false;
			for (var i = 0; i < ignoreArr.length; i++) {
				if (asi.indexOf(ignoreArr[i]) == 0) {
					// if(ignoreArr[i] == asi){
					logDebug("ignoring " + asi);
					ignore = true;
					break;
				}
			}
			if (!ignore)
				editAppSpecific(asi, AInfo[asi], newCap);
		} else
			editAppSpecific(asi, AInfo[asi], newCap);
	}
}

function getTableName(capId)
{
	var tableName = null;
	var result = aa.appSpecificTableScript.getAppSpecificGroupTableNames(capId);
	if(result.getSuccess())
	{
		tableName = result.getOutput();
		if(tableName!=null)
		{
			return tableName;
		}
	}
	return tableName;
}

function IsStrInArry(eVal, argArr) {
    var x;
    for (x in argArr) {
        if (eVal == argArr[x]) {
            return true;
        }
    }
    return false;
}

function getAppSpecificTableForLic(capId,tableName)
{
	appSpecificTable = null;
	var s_result = aa.appSpecificTableScript.getAppSpecificTableModel(capId,tableName);
	if(s_result.getSuccess())
	{
		appSpecificTable = s_result.getOutput();
		if (appSpecificTable == null || appSpecificTable.length == 0)
		{
			logDebug("WARNING: no appSpecificTable on this CAP:" + capId);
			appSpecificTable = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to appSpecificTable: " + s_result.getErrorMessage());
		appSpecificTable = null;	
	}
	return appSpecificTable;
}


