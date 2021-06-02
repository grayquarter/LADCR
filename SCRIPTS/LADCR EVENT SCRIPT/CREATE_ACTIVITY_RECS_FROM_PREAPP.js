//Start - CREATE_ACTIVITY_RECS_FROM_PREAPP Script
//Update: 05/24/2021:09:25 AM

var childSuffixArray = [];
var clearASIArray = [];

// CREATE CHILD RECORDS HERE
var rt = ["Licenses", "Cannabis", "Business", "Activity"];

var aList = ["Adult-Use Cultivation Medium Indoor",
    "Adult-Use Cultivation Small Indoor",
    "Adult-Use Cultivation Specialty Cottage Indoor",
    "Adult-Use Cultivation Specialty Indoor",
    "Adult-Use Distributor",
    "Adult-Use Manufacturer Level 1",
    "Adult-Use Manufacturer Level 2",
    "Adult-Use Retail",
    "Adult-Use Microbusiness",
    "Adult-Use Delivery Only",
    "Medical Cultivation Medium Indoor",
    "Medical Cultivation Small Indoor",
    "Medical Cultivation Specialty Cottage Indoor",
    "Medical Cultivation Specialty Indoor",
    "Medical Distributor",
    "Medical Manufacturer Level 1",
    "Medical Manufacturer Level 2",
    "Medical Retail",
    "Medical Microbusiness",
    "Medical Delivery Only",
    "Distributor Transport Only",
    "Testing",
    "Nursery"];

// Cultivation
if (matches("CHECKED", AInfo["Adult-Use Cultivation Medium Indoor"], AInfo["Adult-Use Cultivation Small Indoor"], AInfo["Adult-Use Cultivation Specialty Indoor"], AInfo["Adult-Use Cultivation Specialty Cottage Indoor"],AInfo["Medical Cultivation Medium Indoor"], AInfo["Medical Cultivation Small Indoor"], AInfo["Medical Cultivation Specialty Indoor"], AInfo["Medical Cultivation Specialty Cottage Indoor"])) {
    childSuffixArray.push("C");
    clearASIArray["C"] = removeElements(aList.slice(), ["Adult-Use Cultivation Medium Indoor", "Adult-Use Cultivation Small Indoor", "Adult-Use Cultivation Specialty Indoor", "Adult-Use Cultivation Specialty Cottage Indoor","Medical Cultivation Medium Indoor", "Medical Cultivation Small Indoor", "Medical Cultivation Specialty Indoor", "Medical Cultivation Specialty Cottage Indoor"]);
}

// Distributor
if (matches("CHECKED", AInfo["Adult-Use Distributor"], AInfo["Medical Distributor"])) {
    childSuffixArray.push("D");
    clearASIArray["D"] = removeElements(aList.slice(), ["Adult-Use Distributor", "Medical Distributor"]);
} else if (matches("Y", String(AInfo["Distributor Transport Only"]).substr(0,1).toUpperCase())) {
    childSuffixArray.push("D");
    clearASIArray["D"] = removeElements(aList.slice(), ["Distributor Transport Only"]);
}
    


// Manufacturer
if (matches("CHECKED", AInfo["Adult-Use Manufacturer Level 1"], AInfo["Medical Manufacturer Level 1"])) {
	childSuffixArray.push("M");
	clearASIArray["M"] = removeElements(aList.slice(), ["Adult-Use Manufacturer Level 1", "Medical Manufacturer Level 1"]);
}
if (matches("CHECKED", AInfo["Adult-Use Manufacturer Level 2"], AInfo["Medical Manufacturer Level 2"])) {
	childSuffixArray.push("V");
	clearASIArray["V"] = removeElements(aList.slice(), ["Adult-Use Manufacturer Level 2", "Medical Manufacturer Level 2"]);
} 

// Delivery
//if (matches("CHECKED", AInfo["Delivery Only"])) {
//    childSuffixArray.push("Q");
//    clearASIArray["Q"] = removeElements(aList.slice(), ["Delivery Only"]);
//} else {
    if (matches("CHECKED", AInfo["Adult-Use Delivery Only"], AInfo["Medical Delivery Only"])) {
        childSuffixArray.push("Q");
        clearASIArray["Q"] = removeElements(aList.slice(), ["Adult-Use Delivery Only", "Medical Delivery Only"]);
		//logDebug("Clearing Deliveries");
    }
//}

// Retail
//if (matches("CHECKED", AInfo["Retail"])) {
//    childSuffixArray.push("R");
//    clearASIArray["R"] = removeElements(aList.slice(), ["Retail"]);
//} else {
    if (matches("CHECKED", AInfo["Adult-Use Retail"], AInfo["Medical Retail"], AInfo["Adult-Use Microbusiness"], AInfo["Medical Microbusiness"])) {
        childSuffixArray.push("R");
        clearASIArray["R"] = removeElements(aList.slice(), ["Adult-Use Retail", "Medical Retail", "Adult-Use Microbusiness", "Medical Microbusiness"]);
		//logDebug("Clearing Retails");
    }
//}

// Misc Y/N selections
if (matches("Y", String(AInfo["Nursery"]).substr(0,1).toUpperCase())) {
    childSuffixArray.push("N");
    clearASIArray["N"] = removeElements(aList.slice(), ["Nursery"]);

}
if (matches("Y", String(AInfo["Testing"]).substr(0,1).toUpperCase())) {
    childSuffixArray.push("T");
    clearASIArray["T"] = removeElements(aList.slice(), ["Testing"]);

}
logDebug("childSuffixArray = " + childSuffixArray);

// refresh as alt id has likely changed
var itemCapId = aa.cap.getCapID(capId.getID1(),capId.getID2(),capId.getID3()).getOutput();

var childRecs = getChildren(rt.join("/"),itemCapId);

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
	if (alreadyExists) {continue;}

    //var childId = createChild(rt[0], rt[1], rt[2], rt[3], "");
	// creates the new application and assigns the capID object

	var itemCap = capId
	//if (arguments.length > 5) itemCap = arguments[5]; // use cap ID specified in args
	
	var grp = rt[0];
	var typ = rt[1];
	var stype = rt[2];
	var cat = rt[3];
	var desc = "";

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

		var newObj = aa.cap.getCap(newId).getOutput();	//Cap object
		var result = aa.cap.createAppHierarchy(itemCap, newId); 
		if (result.getSuccess())
			logDebug("Child application successfully linked");
		else
			logDebug("Could not link applications");

		childId = newId;
	}
	else
	{
		logDebug( "**ERROR: adding child App: " + appCreateResult.getErrorMessage());
	}
	// end create child

    //Copy ASI from child to license
    // TODO: only certain fields?
    copyASIInfo(itemCapId, childId);

/*********************************************
    //Copy ASIT from child to license
    copyASITables(itemCapId, childId);

    editAppSpecific("Is this a Renewal?", "N", childId);

    //Copy Contacts from child to license
    copyContacts3_0(itemCapId, childId);
*********************************************/

    //Copy Work Description from child to license
    aa.cap.copyCapWorkDesInfo(itemCapId, childId);

    //Copy application name from child to license
    editAppName(getAppName(itemCapId), childId);

    //Copy remaining application fields
    updateShortNotes(getShortNotes(itemCapId),childId);
	editPriority(getPriority(itemCapId),childId);

	// set child record status
	updateAppStatus("Eligible for Processing","",childId); //updated per Aaron 1/28/21

/************************************************/
	// set workflow task - added per Aaron 1/28/21, reset 6/1/21
	var capIdSave = capId;
	capId = childId;
	setTask("Application Acceptance","N","Y");
	activateTask("Temp App Review");
	capId = capIdSave;
/***********************************************/

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

function removeElements(array, elem) {
    for (var i in elem) {
        var index = array.indexOf(elem[i]);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
    return array;
}
