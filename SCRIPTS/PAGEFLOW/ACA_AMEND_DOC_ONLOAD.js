/*------------------------------------------------------------------------------------------------------/
| Program : ACA_AMEND_DOC_ONLOAD.JS
| Event   : ACA Page Flow onload attachments component
|
| Usage   : Master Script by Accela.  See accompanying documentation and release notes.
|
| Client  : N/A
| Action# : N/A
|
| Notes   :
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

	// indicate the current page
	var thisPage = "Document";  // Business, Document, Contact, Location, ActivityType, or Activity
	var showPage = false;
	var isFicticiousName = isASITrue(AInfo["Fictitious Business Name"]); 
	var isLegalEntityNameChange = isASITrue(AInfo["Legal Entity Name Change"]); 
	var isPremisesDiagram = isASITrue(AInfo["Business Premises Diagram"]); 
	var isPremisesRelocation = isASITrue(AInfo["Business Premises Relocation"]); 
	var isOwnershipPrimaryChange = isASITrue(AInfo["Ownership or Primary Changes"]); 
	var isOtherContactChange = isASITrue(AInfo["Other Contact Changes"]); 
	var isRemoveActivity = isASITrue(AInfo["Remove Cannabis Activity"]); 
	var isNewActivity = isASITrue(AInfo["New Cannabis Activity"]); 
	var isOther = isASITrue(AInfo["Other"]); 
	
	switch (thisPage) {
		case "Business":
			showPage = isFicticiousName || isLegalEntityNameChange;
		break;
		case "Document":
			showPage = isFicticiousName || isLegalEntityNameChange || isPremisesRelocation || isPremisesDiagram || isOwnershipPrimaryChange || isOtherContactChange || isNewActivity || isRemoveActivity || isOther;
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
	} else {
		conditionType = "License Required Documents";
		showDebug = false;
		docsMissing = false;
		showList = false;
		addConditions = true;
		addTableRows = false;
		cancel = false;
		showMessage = false;
		capIdString = capId.getID1() + "-" + capId.getID2() + "-" + capId.getID3();
		var r1 = getRequiredDocumentsFromCOA(true);
		var r2 = getRequiredDocuments(true);
		var r = mergeDocReqs(r1,r2);

		var parentCapId;
		parentCapIdString = "" + cap.getParentCapID();
		if (parentCapIdString) {
			pca = parentCapIdString.split("-");
			parentCapId = aa.cap.getCapID(pca[0], pca[1], pca[2]).getOutput();
		}

		uploadedDocs = new Array();

		if (parentCapId) { 
			submittedDocList = aa.document.getDocumentListByEntity(parentCapId, "CAP").getOutput().toArray();
			for (var i in submittedDocList) {
				uploadedDocs[submittedDocList[i].getDocCategory()] = true;
				}
		}

		if (r.length > 0) {
			for (x in r) {
				if (uploadedDocs[r[x].document] == undefined) {
					showMessage = true;
					if (!docsMissing && showList) {
						comment("<div class='docList'><span class='fontbold font14px ACA_Title_Color'>The following documents are required based on the information you have provided: </span><ol>");
						docsMissing = true;
					}
		
					dr = r[x].condition;
					publicDisplayCond = null;
					if (dr) {
						ccr = aa.capCondition.getStandardConditions(conditionType, dr).getOutput();
						for (var i = 0;
							i < ccr.length;
							i++)
							if (ccr[i].getConditionDesc().toUpperCase() == dr.toUpperCase())
								publicDisplayCond = ccr[i];
					}

					if (dr && ccr.length > 0 && showList && publicDisplayCond) {
						message += "<li><span>" + dr + "</span>: " + publicDisplayCond.getPublicDisplayMessage() + "</li>";
					}

					if (dr && ccr.length > 0 && addConditions && !appHasCondition(conditionType, null, dr, null)) {
						addStdCondition(conditionType, dr);
					}

					if (dr && ccr.length > 0 && addTableRows) {
						row = new Array();
						row["Document Type"] = new asiTableValObj("Document Type", dr, "Y");
						row["Description"] = new asiTableValObj("Description", publicDisplayCond.getPublicDisplayMessage(), "Y");
						conditionTable.push(row);
					}
				}
			}
		}

		if (r.length > 0 && showList && docsMissing) {
			comment("</ol></div>");
		}


	}
} catch (err) {
	cancel = true; showDebug = true;
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

function mergeDocReqs(arr1,arr2) {
var arr3 = [];
for(var i in arr1){
   var shared = false;
   for (var j in arr2)
       if (arr2[j].document == arr1[i].document) {
           shared = true;
           break;
       }
   if(!shared) arr3.push(arr1[i])
}
arr3 = arr3.concat(arr2);
return arr3;
}