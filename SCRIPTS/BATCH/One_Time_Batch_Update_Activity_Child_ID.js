/*******************************************************
| Script Title: One_Time_Batch_Update_Activity_Child_ID.js   
| Created by: Gregg Hess
| Created on: 2/2/2021
| Modified by: ()
*********************************************************/


/*------------------------------------------------------------------------------------------------------/
|
| START: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var disableTokens = false;
var showDebug = true; // Set to true to see debug messages in email confirmation
var autoInvoiceFees = "Y"; // whether or not to invoice the fees added
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = true; // Use Group name when populating Task Specific Info Values
var currentUserID = "ADMIN";
var publicUser = null;
var systemUserObj = aa.person.getUser("ADMIN").getOutput();
var GLOBAL_VERSION = 2.0
var cancel = false;

var vScriptName = aa.env.getValue("ScriptCode");
var vEventName = aa.env.getValue("EventName");

var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag
var feeSeqList = new Array(); // invoicing fee list
var paymentPeriodList = new Array(); // invoicing pay periods
var bSetCreated = false; //Don't create a set until we find our first app
var setId = "";
var timeExpired = false;
var emailText = "";
var capId = null;
var cap = null;
var capIDString = "";
var appTypeResult = null;
var appTypeString = "";
var appTypeArray = new Array();
var capName = null;
var capStatus = null;
var fileDateObj = null;
var fileDate = null;
var fileDateYYYYMMDD = null;
var parcelArea = 0;
var estValue = 0;
var houseCount = 0;
var feesInvoicedTotal = 0;
var balanceDue = 0;
var houseCount = 0;
var feesInvoicedTotal = 0;
var capDetail = "";
var AInfo = new Array();
var partialCap = false;
var SCRIPT_VERSION = 2.0

	var useSA = false;
var SA = null;
var SAScript = null;
var bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_FOR_EMSE");
if (bzr.getSuccess() && bzr.getOutput().getAuditStatus() != "I") {
	useSA = true;
	SA = bzr.getOutput().getDescription();
	bzr = aa.bizDomain.getBizDomainByValue("MULTI_SERVICE_SETTINGS", "SUPER_AGENCY_INCLUDE_SCRIPT");
	if (bzr.getSuccess()) {
		SAScript = bzr.getOutput().getDescription();
	}
}

if (SA) {
	eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS", SA));
	eval(getMasterScriptText(SAScript, SA));
} else {
	eval(getMasterScriptText("INCLUDES_ACCELA_FUNCTIONS"));
}

eval(getScriptText("INCLUDES_BATCH"));
eval(getMasterScriptText("INCLUDES_CUSTOM"));

function getMasterScriptText(vScriptName) {
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1)
		servProvCode = arguments[1]; // use different serv prov code
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}

function getScriptText(vScriptName) {
	var servProvCode = aa.getServiceProviderCode();
	if (arguments.length > 1)
		servProvCode = arguments[1]; // use different serv prov code
	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		var emseScript = emseBiz.getScriptByPK(servProvCode, vScriptName, "ADMIN");
		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}
function objectExplore1(pObject)
{
try{

//	for (x in pObject)
//	{
//		logDebug("objectExplore[" + x + "] = " + pObject[x]);
//	}
	
	aa.print("Methods:")
	for (x in pObject) {
		if (typeof(pObject[x]) == "function") aa.print("   " + x);
	}

	aa.print("");
	aa.print("Properties:")
	for (x in pObject) {
		if (typeof(pObject[x]) != "function") aa.print("   " + x + " = " + pObject[x]);
	}
}
catch(err){
	aa.print("Error:" + err);
	//comment("Error:" + err);
}
}

/*------------------------------------------------------------------------------------------------------/
|
| END: USER CONFIGURABLE PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
//Needed HERE to log parameters below in eventLog
var sysDate = aa.date.getCurrentDate();
var batchJobID = aa.batchJob.getJobID().getOutput();
var batchJobName = "" + aa.env.getValue("batchJobName");
/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
//
// Your variables go here
// Ex. var appGroup = getParam("Group");
//
/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|-----------------------------------------------------------------------------------------------------+/
/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/
//
// Your script goes here
// Ex. var appGroup = getParam("Group");
//

var dataCount = 0;
try {
	var vCapList = aa.cap.getByAppType("Licenses", "Cannabis", "Business", "Application").getOutput();
	logDebug("Looping through " + vCapList.length + " records");
	var responseArray = [];
	for (var x in vCapList) {
		// limiter
		// (dataCount > 2) {
		//break;
		//}

		vCap = vCapList[x];
		capId = vCap.getCapID();
		altId = capId.getCustomID();
		capStatus = vCap.getCapStatus();
		//		appTypeAlias = vCap.getCapModel().getAppTypeAlias();
		//		vLicenseObj = new licenseObject(null, capId);
		var strAltId = altId.toString();
		
		//objectExplore1(altId);
		//break;
		//logDebug("Evaluating " + strAltId);

		// Strip off las 2 chars
		//var lenOfStr = altId.length();
		//var endId = altId.slice(-2,lenOfStr);
		//var isActivityFormat = matches(endId,"-C","-D","-M","-N","-Q","-R","-T","-V");
		//var isOldActivityFormat = matches(strAltId,"-C-APP","-D-APP","-M-APP","-N-APP","-Q-APP","-R-APP","-T-APP","-V-APP");
		var isOldActivityFormat = false;
		if (altId.indexOf("-C-APP") >= 0 ||
			altId.indexOf("-D-APP") >= 0 ||
			altId.indexOf("-M-APP") >= 0 ||
			altId.indexOf("-N-APP") >= 0 ||
			altId.indexOf("-Q-APP") >= 0 ||
			altId.indexOf("-R-APP") >= 0 ||
			altId.indexOf("-T-APP") >= 0 ||
			altId.indexOf("-V-APP") >= 0 
		) {
			isOldActivityFormat = true;
			
			//logDebug("EOS = " + endId);
			//logDebug("Activty Format = " + isOldActivityFormat);
			
			if (isOldActivityFormat) {
				logDebug("");
				logDebug("Found record with old extension " + altId);
				//logDebug("capStatus = " + capStatus);
				
				//filter out Deprecated status and priority=Inelgible for Processing
				if (getPriority(capId)!= "Ineligible for Processing" && capStatus != "Deprecated") {
				
					// check last 4 chars of parent alt id
					parentCapId = getParent();
					if (parentCapId != null && parentCapId != "") {
						parentAltId = parentCapId.getCustomID();
						logDebug("Found parent record " + parentAltId);
					
						// check for "LA-C-"
						startParentId = parentAltId.slice(0,5);
						logDebug("Parent starts with: " + startParentId);
						if (startParentId == "LA-C-") {
							logDebug("Parent Record has correct id prefix");

							lenOfStr = parentAltId.length();
							var endParentId = parentAltId.slice(-4,lenOfStr);
							logDebug("Parent id ends with: " + endParentId);

							var isParentApp = false;
							if (endParentId == "-APP") {
								//logDebug("-- Parent App = " + parentAltId);
								//logDebug("Has Parent App");
								isParentApp = true;

								//remove -APP from child activity record ids
								logDebug("-- Modifying activity record " + altId);
								// find end of string from "-APP" on
								//var lenOfStr = altId.length();
								var startOfExt = altId.indexOf("-APP");
								var newAltId = altId.slice(0,startOfExt);
								//logDebug("-- New Alt Id = " + newAltId) ;
								//break;
								//strip off end
								//check whether resulting alt id exists
								//if not assign new alt id
								if (newAltId) {
									var updResult = aa.cap.updateCapAltID(capId, newAltId);
									//in case of duplicates...
									var capCount = 0;
									var unDupAltID = "";
									while(!updResult.getSuccess()){
									//if (!updResult.getSuccess()){
										logDebug(" **Duplicate Found! - or error: " + newAltId);
										capCount = capCount + 1;
										unDupAltID = newAltId + "-" + capCount;
										updResult = aa.cap.updateCapAltID(capId, unDupAltID);
										if (capCount>10) break;
									//} else {
									//	logDebug("--Update successful!");
									}
									
									if (unDupAltID != "") newAltId = unDupAltID;

									logDebug("-- Final Alt ID is " + newAltId);
									// update global var
									//capIDString = newAltId;
								}
								
								
							
								dataCount++;
							}
						}
					}
				} else {
					logDebug("## Status = " + capStatus + ", Phase = " + getPriority(capId));
				}
			}
		}
	}
	logDebug("Total records found: " + dataCount);
	
	//logDebug(JSON.stringify(responseArray));

} catch (e) {
	logDebug("Error: " + e);
}

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ScriptReturnCode", "1");
	aa.env.setValue("ScriptReturnMessage", debug);
} else {
	aa.env.setValue("ScriptReturnCode", "0");
	if (showMessage)
		aa.env.setValue("ScriptReturnMessage", message);
	if (showDebug)
		aa.env.setValue("ScriptReturnMessage", debug);
}

/*------------------------------------------------------------------------------------------------------/
| <===========Internal Functions and Classes (Used by this script)
/------------------------------------------------------------------------------------------------------*/
