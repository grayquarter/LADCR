/*------------------------------------------------------------------------------------------------------/
| Program : ACA_AMD_COPY_APP_INFO_ONLOAD
| Event   : ACA Page Flow onload
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   : Created 05/14/2020, Ghess -  check for parent to flag whether the app is a renewal.
|           Copy contacts from parent, copy to Custom List component
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| START User Configurable Parameters
|
|     Only variables in the following section may be changed.  If any other section is modified, this
|     will no longer be considered a "Master" script and will not be supported in future releases.  If
|     changes are made, please add notes above.
/------------------------------------------------------------------------------------------------------*/
var showMessage = false; // Set to true to see results in popup window
var showDebug = false; // Set to true to see debug messages in popup window
var useAppSpecificGroupName = false; // Use Group name when populating App Specific Info Values
var useTaskSpecificGroupName = false; // Use Group name when populating Task Specific Info Values
var cancel = false;
var useCustomScriptFile = true; // if true, use Events->Custom Script, else use Events->Scripts->INCLUDES_CUSTOM
/*------------------------------------------------------------------------------------------------------/
| END User Configurable Parameters
/------------------------------------------------------------------------------------------------------*/
var startDate = new Date();
var startTime = startDate.getTime();
var message = ""; // Message String
var debug = ""; // Debug String
var br = "<BR>"; // Break Tag

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
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", SA, useCustomScriptFile));
	eval(getScriptText(SAScript, SA));
} else {
	eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, useCustomScriptFile));
}

eval(getScriptText("INCLUDES_CUSTOM", null, useCustomScriptFile));

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

var cap = aa.env.getValue("CapModel");
var capId = cap.getCapID();
var servProvCode = capId.getServiceProviderCode() // Service Provider Code
	var publicUser = false;
var currentUserID = aa.env.getValue("CurrentUserID");
var publicUserID = aa.env.getValue("CurrentUserID");
if (currentUserID.indexOf("PUBLICUSER") == 0) {
	currentUserID = "ADMIN";
	publicUser = true
} // ignore public users
var capIDString = capId.getCustomID(); // alternate cap id string
var systemUserObj = aa.person.getUser(currentUserID).getOutput(); // Current User Object
var appTypeResult = cap.getCapType();
var appTypeString = appTypeResult.toString(); // Convert application type to string ("Building/A/B/C")
var appTypeArray = appTypeString.split("/"); // Array of application type string
var currentUserGroup;
var currentUserGroupObj = aa.userright.getUserRight(appTypeArray[0], currentUserID).getOutput()
	if (currentUserGroupObj)
		currentUserGroup = currentUserGroupObj.getGroupName();
	var capName = cap.getSpecialText();
var capStatus = cap.getCapStatus();
var sysDate = aa.date.getCurrentDate();
var sysDateMMDDYYYY = dateFormatted(sysDate.getMonth(), sysDate.getDayOfMonth(), sysDate.getYear(), "");
var parcelArea = 0;

var estValue = 0;
var calcValue = 0;
var feeFactor // Init Valuations
var valobj = aa.finance.getContractorSuppliedValuation(capId, null).getOutput(); // Calculated valuation
if (valobj.length) {
	estValue = valobj[0].getEstimatedValue();
	calcValue = valobj[0].getCalculatedValue();
	feeFactor = valobj[0].getbValuatn().getFeeFactorFlag();
}

var balanceDue = 0;
var houseCount = 0;
feesInvoicedTotal = 0; // Init detail Data
var capDetail = "";
var capDetailObjResult = aa.cap.getCapDetail(capId); // Detail
if (capDetailObjResult.getSuccess()) {
	capDetail = capDetailObjResult.getOutput();
	var houseCount = capDetail.getHouseCount();
	var feesInvoicedTotal = capDetail.getTotalFee();
	var balanceDue = capDetail.getBalance();
}

var AInfo = new Array(); // Create array for tokenized variables
loadAppSpecific4ACA(AInfo); // Add AppSpecific Info
//loadTaskSpecific(AInfo);						// Add task specific info
//loadParcelAttributes(AInfo);						// Add parcel attributes
loadASITables();

logDebug("<B>EMSE Script Results for " + capIDString + "</B>");
logDebug("capId = " + capId.getClass());
logDebug("cap = " + cap.getClass());
logDebug("currentUserID = " + currentUserID);
logDebug("currentUserGroup = " + currentUserGroup);
logDebug("systemUserObj = " + systemUserObj.getClass());
logDebug("appTypeString = " + appTypeString);
logDebug("capName = " + capName);
logDebug("capStatus = " + capStatus);
logDebug("sysDate = " + sysDate.getClass());
logDebug("sysDateMMDDYYYY = " + sysDateMMDDYYYY);
logDebug("parcelArea = " + parcelArea);
logDebug("estValue = " + estValue);
logDebug("calcValue = " + calcValue);
logDebug("feeFactor = " + feeFactor);

logDebug("houseCount = " + houseCount);
logDebug("feesInvoicedTotal = " + feesInvoicedTotal);
logDebug("balanceDue = " + balanceDue);

// page flow custom code begin

try {

	parentCapIdString = "" + cap.getParentCapID();
	if (parentCapIdString) {
		pca = parentCapIdString.split("-");
		parentCapId = aa.cap.getCapID(pca[0], pca[1], pca[2]).getOutput();
	}

	//showDebug = true;
	//showMessage = true;
	//cancel = true;

if (parentCapId){
	//editAppSpecific4ACA("Person In Charge - Title", parentCapId);
	//editAppSpecific4ACA("Business Organizational Structure", " Corporation");
	
	parentCap = aa.cap.getCapViewBySingle4ACA(parentCapId);

	//Copy Contacts
 	// copyContacts(parentCapId, capId);
	 

	//Copy ASI
	copyAppSpecific4ACA(parentCap);	
	
	var appName = parentCap.getSpecialText();
	logDebug("appName = " + appName);
	cap.setSpecialText(appName);
	
/*	
	// Get Business/Professional Name (DBA)
	logDebug("Parent Short Notes = " + getShortNotes(parentId));
	var bizName = getShortNotes(parentCapId);
	updateShortNotes(bizName, capId);
*/

	copyAddressFromParent4ACA(cap, parentCapId);
		    	
	aa.env.setValue("CapModel", cap);
}
editAppSpecific4ACA("Adult-Use Cultivation Medium Indoor1", getAppSpecific("Adult-Use Cultivation Medium Indoor", parentCapId));
   editAppSpecific4ACA("Adult-Use Cultivation Small Indoor1", getAppSpecific("Adult-Use Cultivation Small Indoor", parentCapId));
   editAppSpecific4ACA("Adult-Use Cultivation Specialty Cottage Indoor1", getAppSpecific("Adult-Use Cultivation Specialty Cottage Indoor", parentCapId));
   editAppSpecific4ACA("Adult-Use Cultivation Specialty Indoor1", getAppSpecific("Adult-Use Cultivation Specialty Indoor", parentCapId));
  editAppSpecific4ACA("Adult-Use Distributor1", getAppSpecific("Adult-Use Distributor", parentCapId));
  editAppSpecific4ACA("Adult-Use Manufacturer Level 11", getAppSpecific("Adult-Use Manufacturer Level 1", parentCapId));
logDebug("manu");
   editAppSpecific4ACA("Adult-Use Manufacturer Level 21", getAppSpecific("Adult-Use Manufacturer Level 2", parentCapId));
   editAppSpecific4ACA("Adult-Use Retail1", getAppSpecific("Adult-Use Retail", parentCapId));
   editAppSpecific4ACA("Adult-Use Microbusiness1", getAppSpecific("Adult-Use Microbusiness", parentCapId));
    editAppSpecific4ACA("Adult-Use Delivery Only1", getAppSpecific("Adult-Use Delivery Only", parentCapId));
   editAppSpecific4ACA("Medical Cultivation Medium Indoor1", getAppSpecific("Medical Cultivation Medium Indoor", parentCapId));
   editAppSpecific4ACA("Medical Cultivation Small Indoor1", getAppSpecific("Medical Cultivation Small Indoor", parentCapId));
  editAppSpecific4ACA("Medical Distributor1", getAppSpecific("Medical Distributor", parentCapId));
    editAppSpecific4ACA("Medical Cultivation Specialty Indoor1", getAppSpecific("Medical Cultivation Specialty Indoor", parentCapId));
    editAppSpecific4ACA("Medical Manufacturer Level 11", getAppSpecific("Medical Manufacturer Level 1", parentCapId));
   editAppSpecific4ACA("Medical Manufacturer Level 21", getAppSpecific("Medical Manufacturer Level 2", parentCapId));
    editAppSpecific4ACA("Medical Retail1", getAppSpecific("Medical Retail", parentCapId));
    editAppSpecific4ACA("Medical Microbusiness1", getAppSpecific("Medical Microbusiness", parentCapId));
   editAppSpecific4ACA("Medical Delivery Only1", getAppSpecific("Medical Delivery Only", parentCapId));
   editAppSpecific4ACA("Distributor Transport Only1", getAppSpecific("Distributor Transport Only", parentCapId));
   editAppSpecific4ACA("Testing1", getAppSpecific("Testing", parentCapId));
logDebug("this is running");
    editAppSpecific("Nursery1", getAppSpecific("Nursery", parentCapId));
	
} catch (err) {

	logDebug(err);

}

// page flow custom code end


if (debug.indexOf("**ERROR") > 0) {
	aa.env.setValue("ErrorCode", "1");
	aa.env.setValue("ErrorMessage", debug);
} else {
	if (cancel) {
		aa.env.setValue("ErrorCode", "-2");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	} else {
		aa.env.setValue("ErrorCode", "0");
		if (showMessage)
			aa.env.setValue("ErrorMessage", message);
		if (showDebug)
			aa.env.setValue("ErrorMessage", debug);
	}
}
function getPageComponents(capID, stepIndex, pageIndex)
{
	var componentResult = aa.acaPageFlow.getPageComponents(capID, stepIndex, pageIndex);
	
	if(componentResult.getSuccess())
	{
		return componentResult.getOutput();
	}
	
	return null;	
}

function describe(obj) {
	var ret = "";
	for (var i in obj)
		if (typeof(obj[i]) == "function")
			ret += "method:" + i + "\n";
		else
			ret += "property:" + i + " = " + obj[i] + "\n";
	return ret;
}

function copyAddressFromParent4ACA(currentRecordCapModel, parentCapId) {

	var capAddressResult = aa.address.getAddressWithAttributeByCapId(parentCapId).getOutput();
	if (capAddressResult == null || capAddressResult.length == 0) {
		return;
	}

	var adrr = getPrimaryOrAddressByType(capAddressResult);
	if (adrr != null) {
		currentRecordCapModel.setAddressModel(adrr);
	}
}
function getPrimaryOrAddressByType(addresses) {
	var ourTypeAddress = null;

	for (a in addresses) {
		if (addresses[a].getPrimaryFlag() == "Y") {
			return addresses[a];
		} else if (ourTypeAddress == null) {
			ourTypeAddress = addresses[a];
		}
	} //for

	return ourTypeAddress;
}
