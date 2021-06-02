var aa = expression.getScriptRoot();

var vGrantStatus = expression.getValue("ASI::SOCIAL EQUITY PROGRAM::Grant Recipient");
var vASIRefId = expression.getValue("ASI::SOCIAL EQUITY PROGRAM::Grant Recipient Reference Contact ID");
var vContactStatus = expression.getValue("PEOPLETPL::CONTACT - SOCIAL EQUITY OWNE::GRANT RECIPIENT STATUS");
var vContactForm = expression.getValue("CONTACT::FORM");
var vContactRefId = expression.getValue("CONTACT::refContactNumber");

try {
    var status = vGrantStatus.value;
    var setGrantStatus = String(vContactStatus.value);
    if(setGrantStatus && setGrantStatus.length > 0) {
        if("Yes".equals(status)) {
            vContactStatus.message = "Grant status has already been recieved for this record.";
            vContactForm.blockSubmit = true;
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
