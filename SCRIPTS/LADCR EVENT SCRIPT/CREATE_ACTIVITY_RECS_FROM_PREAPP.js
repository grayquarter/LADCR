//Start - CREATE_ACTIVITY_RECS_FROM_PREAPP Script
//Update: 01/28/2021:02:50 PM

var childSuffixArray = [];
var clearASIArray = [];

// CREATE CHILD RECORDS HERE
var rt = ["Licenses", "Cannabis", "Business", "Application"];

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
if (matches("CHECKED", AInfo["Delivery Only"])) {
    childSuffixArray.push("Q");
    clearASIArray["Q"] = removeElements(aList.slice(), ["Delivery Only"]);
} else {
    if (matches("CHECKED", AInfo["Adult-Use Delivery Only"], AInfo["Medical Delivery Only"])) {
        childSuffixArray.push("Q");
        clearASIArray["Q"] = removeElements(aList.slice(), ["Adult-Use Delivery Only", "Medical Delivery Only"]);
    }
}

// Retail
if (matches("CHECKED", AInfo["Retail"])) {
    childSuffixArray.push("R");
    clearASIArray["R"] = removeElements(aList.slice(), ["Retail"]);
} else {
    if (matches("CHECKED", AInfo["Adult-Use Retail"], AInfo["Medical Retail"], AInfo["Adult-Use Microbusiness"], AInfo["Medical Microbusiness"])) {
        childSuffixArray.push("R");
        clearASIArray["R"] = removeElements(aList.slice(), ["Adult-Use Retail", "Medical Retail", "Adult-Use Microbusiness", "Medical Microbusiness"]);
    }
}

// Misc Y/N selections
if (matches("Y", String(AInfo["Nursery"]).substr(0,1).toUpperCase())) {
    childSuffixArray.push("N");
    clearASIArray["N"] = removeElements(aList.slice(), ["Nursery"]);

}
if (matches("Y", String(AInfo["Testing"]).substr(0,1).toUpperCase())) {
    childSuffixArray.push("T");
    clearASIArray["T"] = removeElements(aList.slice(), ["Testing"]);

}

// refresh as alt id has likely changed
var itemCapId = aa.cap.getCapID(capId.getID1(),capId.getID2(),capId.getID3()).getOutput();

var childRecs = getChildren(rt.join("/"),itemCapId);

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
    updateShortNotes(getShortNotes(itemCapId),childId);
	editPriority(getPriority(itemCapId),childId);

	// set child record status
	updateAppStatus("Eligible for Processing","",childId); //updated per Aaron 1/28/21

	// set workflow task - added per Aaron 1/28/21
	var capIdSave = capId;
	capId = childId;
	setTask("Application Acceptance","N","Y");
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


function removeElements(array, elem) {
    for (var i in elem) {
        var index = array.indexOf(elem[i]);
        if (index > -1) {
            array.splice(index, 1);
        }
    }
    return array;
}
