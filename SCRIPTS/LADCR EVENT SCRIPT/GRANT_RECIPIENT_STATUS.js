var recieved = false;
var refContactNbr = ContactObj.getRefContactNumber();
logDebug("refContactNbr: " + refContactNbr);
if(ContactAttr["GRANT RECIPIENT STATUS"]) {
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
    