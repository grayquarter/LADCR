/*------------------------------------------------------------------------------------------------------/
| Program : ACA_APP_PEOPLE_ONLOAD
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

    var parentCapId;
    var parentCap;

    parentCapIdString = "" + cap.getParentCapID();
    if (parentCapIdString) {
        pca = parentCapIdString.split("-");
        parentCapId = aa.cap.getCapID(pca[0], pca[1], pca[2]).getOutput();
        parentCap = aa.cap.getCapViewBySingle4ACA(parentCapId);
    }

    //showDebug = true;
    //showMessage = true;
    //cancel = true;

    // indicate the current page
    var thisPage = "Contact"; // Business, Document, Contact, Location, ActivityType, or Activity
    var showPage = false;
    var isFicticiousName = isASITrue(AInfo["Fictitious Business Name"]);
    var isLegalEntityNameChange = isASITrue(AInfo["Legal Entity Name Change"]);
    var isPremisesDiagram = isASITrue(AInfo["Business Premises Diagram"]);
    var isPremisesRelocation = isASITrue(AInfo["Business Premises Relocation"]);
    var isOwnershipPrimaryChange = isASITrue(AInfo["Ownership or Primary Changes"]);
    var isOtherContactChange = isASITrue(AInfo["Other Contact Changes"]);
    var isRemoveActivity = isASITrue(AInfo["Remove Cannabis Activity"]);
    var isNewActivity = isASITrue(AInfo["New Cannabis Activity"]);

    var ownerTypes = ["Chief Executive Officer", "Chief Financial Officer", "Chief Marketing Officer", "Chief Operating Officer", "Chief Technology Officer", "Management Company", "Owner", "Owner - Entity", "President", "Secretary", "Social Equity Owner", "Social Equity Owner - Entity", "Vice President"];
    var otherTypes = ["Accounting Firm", "Agency for Service of Process", "Agent for Service of Process", "Authorized Agent", "Authorized Agent - Entity", "Consultant", "Consultant - Entity", "Director", "Law Firm", "Manager", "Neighborhood Liaison", "Person-in-Charge", "Security Firm"];

    switch (thisPage) {
    case "Business":
        showPage = isFicticiousName || isLegalEntityNameChange;
        break;
    case "Document":
        showPage = isFicticiousName || isLegalEntityNameChange || isPremisesRelocation || isOwnershipPrimaryChange || isOtherContactChange || isNewActivity;
        break;
    case "Contact":
        showPage = isOwnershipPrimaryChange || isOtherContactChange;
        break;
    case "Location":
        showPage = isPremisesRelocation;
        break;
    case "ActivityType":
        showPage = isNewActivity;
        break;
    case "Activity":
        showPage = isNewActivity || isRemoveActivity;
        break;
    }

    if (!showPage) {
        aa.env.setValue("ReturnData", "{'PageFlow': {'HidePage' : 'Y'}}");
    } else if (parentCap) {
        //populate custom list

        var contactList = parentCap.getContactsGroup();

        for (var j = 0; j < contactList.size(); j++) {
			//var compCorrect = String(contactList.get(j).getComponentName()).equals("Contact List") || String(contactList.get(j).getComponentName()).indexOf("MultiContacts") >= 0;

			if (/*!compCorrect || */(isOwnershipPrimaryChange && !exists(contactList.get(j).getContactType(), ownerTypes))) {
				contactList.remove(j);
				logDebug("removing : " + contactList.get(j).getContactType());
				continue;
			} else if (/*!compCorrect || */(isOtherContactChange && !exists(contactList.get(j).getContactType(), otherTypes))) {
				logDebug("removing : " + contactList.get(j).getContactType());
				contactList.remove(j);
				continue;
			}
			logDebug("adding : " + contactList.get(j).getContactType());
		contactList.get(j).getPeople().setContactSeqNumber(null);
		contactList.get(j).setComponentName("Contact List");
        }
        cap.setContactsGroup(contactList);
aa.env.setValue("CapModel", cap);
    }
}
catch (err) {

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

function addPublicUserToRecordAsContact(publicUserId, itemCapId, contactType) {

	var getUserResult = aa.publicUser.getPublicUserByPUser(publicUserId);
	if (!getUserResult.getSuccess()) {
		logDebug("addPublicUserToRecordAsContact: could not get public user " + getUserResult.getErrorMessage);
		return false;
	}
	var userModel = getUserResult.getOutput();
	if (!userModel) {
		logDebug("addPublicUserToRecordAsContact: user Model is empty");
		return false;
	}
	var userSeqNum = userModel.getUserSeqNum();
	var refContact = getRefContactForPublicUser(userSeqNum);
	if (!refContact) {
		logDebug("addPublicUserToRecordAsContact: refContact is empty");
		return false;
	}
	var refContactNum = refContact.getContactSeqNumber();
	refContact.setContactAddressList(getRefAddContactList(refContactNum));
	var capContactModel = aa.proxyInvoker.newInstance("com.accela.aa.aamain.people.CapContactModel").getOutput();
	capContactModel.setPeople(refContact);
	capContactModel.setSyncFlag("Y");
	capContactModel.setRefContactNumber(refContactNum);
	capContactModel.setContactType(contactType);
	capContactModel.setCapID(itemCapId);
	var createResult = aa.people.createCapContactWithAttribute(capContactModel);
	if (!createResult.getSuccess()) {
		logDebug("addPublicUserToRecordAsContact: createCapContact Failed " + createResult.getErrorMessage());
		return false;
	}
	return true;
}

function getRefAddContactList(peoId) {
	var conAdd = aa.proxyInvoker.newInstance("com.accela.orm.model.address.ContactAddressModel").getOutput();
	conAdd.setEntityID(parseInt(peoId));
	conAdd.setEntityType("CONTACT");
	var addList = aa.address.getContactAddressList(conAdd).getOutput();
	var tmpList = aa.util.newArrayList();
	var pri = true;
	for (x in addList) {
		if (pri) {
			pri = false;
			addList[x].getContactAddressModel().setPrimary("Y");
		}
		tmpList.add(addList[x].getContactAddressModel());
	}

	return tmpList;
}
