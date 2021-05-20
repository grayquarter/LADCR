if (matches(contactType, "Social Equity Owner")) {
    var recieved = false;
    var refContactNbr = ContactObj.getRefContactNumber();
    //Script Test
    //var refContactNbr = ContactObj.refSeqNumber;
    //ContactObj = ContactObj.capContact;
    var ContactAttr = new Array();
    var pa = ContactObj.getPeople().getAttributes().toArray();
    var retValue = "Finished.";
    for (xx1 in pa) {
        ContactAttr[pa[xx1].attributeName] = pa[xx1].attributeValue;
        logDebug("ContactAttr[\"" + pa[xx1].attributeName + "\"] = " + pa[xx1].attributeValue);
    }
    if (!(matches(ContactAttr["GRANT RECIPIENT STATUS"], null, undefined, ""))) {
        editAppSpecific("Grant Recipient", "Yes");
        editAppSpecific("Grant Recipient Reference Contact ID", refContactNbr);
        var asi1 = getAppSpecific("Grant Recipient", capId);
        var asi2 = getAppSpecific("Grant Recipient Reference Contact ID", capId);
        recieved = true;
        logDebug("Set ASI values Grant Recipient to 'Yes' and Grant Recipient Reference Contact ID to " + refContactNbr + ", Grant status recieved: " + recieved);
    } else {
        var recievedStatus = getAppSpecific("Grant Recipient", capId);
        if(!("Yes".equals(recievedStatus))) {
            editAppSpecific("Grant Recipient", "No");
            editAppSpecific("Grant Recipient Reference Contact ID", "");
            recieved = false;
            logDebug("Set ASI values to 'No' and '' grant status recieved: " + recieved);
        } else {
            logDebug("No need to change ASI fields because Grant status has already been set for this record.");
        }
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
                        if (recieved) {
                            item.setAttributeValue("Yes");
                            logDebug("Set contact attribute to Yes");
                        } else {
                            item.setAttributeValue("No");
                            logDebug("Set contact attribute to No");
                        }
                        paEditResult = aa.people.editPeopleAttribute(item.getPeopleAttributeModel());
                        if (!paEditResult.getSuccess()) {
                            retValue = "failure - attribute edit failed " + paEditResult.getErrorMessage();
                        } else {
                            logDebug("Changed " + refContactNbr);
                        }
                    }
                }
            } else {
                retValue = "failure - failed to get attributes " + refAttrResult.getErrorMessage();
            }
        } else {
            retValue = "failure - failed to retrieve contact " + refConResult.getErrorMessage();
        }
    } else {
        retValue = "failure - reference contact number not passed";
    }

    logDebug(retValue);
}
