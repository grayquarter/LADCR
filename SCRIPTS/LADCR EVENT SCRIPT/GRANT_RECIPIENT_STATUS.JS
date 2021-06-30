if (matches(contactType, "Social Equity Owner")) {
    var recieved = false;
    var recievedOnOtherCap = false;
    var refContactNbr = ContactObj.getRefContactNumber();
    //Script Test
    //var refContactNbr = ContactObj.refSeqNumber;
    //ContactObj = ContactObj.capContact;

    if (refContactNbr && refContactNbr != "") {

        var ContactAttr = new Array();
        var pa = ContactObj.getPeople().getAttributes().toArray();
        var retValue = "Finished.";
        for (xx1 in pa) {
            ContactAttr[pa[xx1].attributeName] = pa[xx1].attributeValue;
            logDebug("ContactAttr[\"" + pa[xx1].attributeName + "\"] = " + pa[xx1].attributeValue);
        }

        refConResult = aa.people.getPeople(refContactNbr);
        if (refConResult.getSuccess()) {
            refPeopleModel = refConResult.getOutput();
            refAttrResult = aa.people.getPeopleAttributeByPeople(refContactNbr, refPeopleModel.getContactType());
            if (refAttrResult.getSuccess()) {
                refAttr = refAttrResult.getOutput();
                for (var i in refAttr) {
                    item = refAttr[i];
                    if ("GRANT RECIPIENT".equals(item.getAttributeName())) {
                        logDebug("Ref Item attribute name equaled grant recipient")
                        var attributeValue = item.getAttributeValue();
                        logDebug("Ref Attribute value: " + attributeValue);
                        var recievedOnOtherCap = false;
                        if (matches(attributeValue, null, undefined, "")) {
                            logDebug("Grant status not yet set.");
                            recievedOnOtherCap = false;
                        } else if ("Yes".equals(attributeValue)) {
                            logDebug("Grant already recieved.");
                            recievedOnOtherCap = true;
                        } else if ("No".equals(attributeValue)) {
                            logDebug("Has not recieved grant on previous record.");
                            recievedOnOtherCap = false;
                        }

                        if(!recievedOnOtherCap) {
                            if (!(matches(ContactAttr["GRANT RECIPIENT STATUS"], null, undefined, ""))) {
                                item.setAttributeValue("Yes");
                                logDebug("Set contact ref attribute to Yes");
                                editAppSpecific("Grant Recipient", "Yes");
                                editAppSpecific("Grant Recipient Reference Contact ID", refContactNbr);
                                logDebug("Set ASI values Grant Recipient to 'Yes' and Grant Recipient Reference Contact ID to " + refContactNbr);
                            } else {
                                item.setAttributeValue("No");
                                logDebug("Set contact ref attribute to No");
                            }
                            paEditResult = aa.people.editPeopleAttribute(item.getPeopleAttributeModel());
                            if (!paEditResult.getSuccess()) {
                                retValue = "failure - attribute edit failed " + paEditResult.getErrorMessage();
                            } else {
                                logDebug("Changed " + refContactNbr);
                            }
                        } else {
                            var recievedStatus = getAppSpecific("Grant Recipient", capId);
                            if(!("Yes".equals(recievedStatus))) {
                                editAppSpecific("Grant Recipient", "No");
                                editAppSpecific("Grant Recipient Reference Contact ID", "");
                                logDebug("Set Record ASI values to 'No' and Grant Recipient Reference Contact ID to ''");
                            } else {
                                logDebug("No need to change ASI fields because Grant status has already been set for this record.");
                            }
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
