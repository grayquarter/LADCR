var aa = expression.getScriptRoot();

var vGrantStatus = expression.getValue("ASI::SOCIAL EQUITY PROGRAM::Grant Recipient");
var vContactStatus = expression.getValue("PEOPLETPL::CONTACT - SOCIAL EQUITY OWNE::GRANT RECIPIENT STATUS");
var vContactForm = expression.getValue("CONTACT::FORM");

try {
    var status = vGrantStatus.value;
    var setGrantStatus = String(vContactStatus.value);
    vContactForm.message = setGrantStatus;
    if(setGrantStatus && setGrantStatus.length > 0) {
        if("Yes".equals(status)) {
            vContactStatus.message = "Grant status has already been recieved for this record.";
            vContactForm.blockSubmit = true;
        }
    } else {
        vContactStatus.message = "";
        vContactForm.blockSubmit = false;
    }
    expression.setReturn(vContactStatus);
    expression.setReturn(vContactForm);
    
} catch (err) {
    vContactForm.message = "Contact Expression Error: " + err.message;
	expression.setReturn(vContactForm);
}
