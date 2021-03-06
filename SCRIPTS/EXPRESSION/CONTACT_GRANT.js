var aa = expression.getScriptRoot();

var vGrantStatus = expression.getValue("ASI::SOCIAL EQUITY PROGRAM::Grant Recipient");
var vASIRefId = expression.getValue("ASI::SOCIAL EQUITY PROGRAM::Grant Recipient Reference Contact ID");
var vContactStatus = expression.getValue("PEOPLETPL::CONTACT - SOCIAL EQUITY OWNE::GRANT RECIPIENT STATUS");
var vContactForm = expression.getValue("CONTACT::FORM");
var vContactRefId = expression.getValue("CONTACT::refContactNumber");

try {
    var status = vGrantStatus.value;
    var setGrantStatus = String(vContactStatus.value);
    var refContactNbr = vContactRefId.value
    refConResult = aa.people.getPeople(refContactNbr);
    if (refConResult.getSuccess()) {
        refPeopleModel = refConResult.getOutput();
        refAttrResult = aa.people.getPeopleAttributeByPeople(refContactNbr, refPeopleModel.getContactType());
        if (refAttrResult.getSuccess()) {
            refAttr = refAttrResult.getOutput();
            for (var i in refAttr) {
                item = refAttr[i];
                if ("GRANT RECIPIENT".equals(item.getAttributeName())) {
                    var attributeValue = item.getAttributeValue();
                    var recievedOnOtherCap = false;
                    if ("Yes".equals(attributeValue)) {
                        recievedOnOtherCap = true;
                    } else {
                        recievedOnOtherCap = false;
                    }
                }
            }
        }
    }

    
    if(setGrantStatus && setGrantStatus.length > 0) {
        if("Yes".equals(status)) {
            vContactStatus.message = "Grant status has already been recieved for this record.";
            vContactStatus.value = null;
            vContactForm.blockSubmit = true;
        }
        if(recievedOnOtherCap) {
            vContactForm.blockSubmit = true;
            vContactStatus.message = "This person has recieved a grant on another record.";
        }
    } else {
        var asiRef = String(vASIRefId.value);
        var contactRef = String(vContactRefId.value);
        vContactForm.message = "asiRef: " + asiRef + " contactRef: " + contactRef;
        if(asiRef.equals(contactRef)) {
            vContactStatus.message = "Ref ID has been set by this contact we can't change this value. If this is an error contact an Administrator.";
            vContactForm.blockSubmit = true;
        } else {
            vContactStatus.message = "";
            vContactForm.blockSubmit = false;
        }
    }
    expression.setReturn(vContactStatus);
    expression.setReturn(vContactForm);
    
} catch (err) {
    vContactForm.message = "Contact Expression Error: " + err.message;
	expression.setReturn(vContactForm);
}
