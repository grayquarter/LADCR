if (wfTask.equals("Review") && wfStatus.equals("Changes Accepted")) {
	if (parentCapId) {
            
        if (isASITrue(AInfo["Remove Cannabis Activity"]) || isASITrue(AInfo["New Cannabis Activity"])) {
       
        copyASIFields(capId, parentCapId)
		       
    }

    if (isASITrue(AInfo["Ownership or Primary Changes"])) {
    
        // copy over contacts from child
              //  remove all contacts from parent
            capContactResult = aa.people.getCapContactByCapID(parentCapId);
            if (capContactResult.getSuccess()) {
                var contacts = capContactResult.getOutput();
                var ownerTypes = ["Chief Executive Officer", "Chief Financial Officer", "Chief Marketing Officer", "Chief Operating Officer", "Chief Technology Officer", "Management Company", "Owner", "Owner - Entity", "President", "Secretary", "Social Equity Owner", "Social Equity Owner - Entity", "Vice President"];
      
                for (var i in contacts) {

                    if (contacts[i].getPeople()) {
                        var capContactNumber = aa.util.parseInt(contacts[i].getCapContactModel().getPeople().getContactSeqNumber());

                        if (contacts[i].getPeople().getContactType().ownerTypes) {
                            var capContactNumber = aa.util.parseInt(contacts[i].getCapContactModel().getPeople().getContactSeqNumber());
                        aa.people.removeCapContact(parentCapId, capContactNumber);
                        logDebug(contacts[i].getPeople().getContactType() + " - Contact Seq Number " + capContactNumber + " removed from parent " + parentCapId);
                    }
                }
            }
        
        copyContacts3_0(capId, parentCapId);
       
             // var otherTypes = ["Accounting Firm", "Agency for Service of Process", "Agent for Service of Process", "Authorized Agent", "Authorized Agent - Entity", "Consultant", "Consultant - Entity", "Director", "Law Firm", "Manager", "Neighborhood Liaison", "Person-in-Charge", "Security Firm"];

    }
}


    if (isASITrue(AInfo["Other Contact Changes"])) {
    
        // copy over contacts from child
              //  remove all contacts from parent
            capContactResult = aa.people.getCapContactByCapID(parentCapId);
            if (capContactResult.getSuccess()) {
                var contacts = capContactResult.getOutput();
                for (var i in contacts) {

                    if (contacts[i].getPeople()) {
                        var capContactNumber = aa.util.parseInt(contacts[i].getCapContactModel().getPeople().getContactSeqNumber());
                        aa.people.removeCapContact(parentCapId, capContactNumber);
                        logDebug(contacts[i].getPeople().getContactType() + " - Contact Seq Number " + capContactNumber + " removed from parent " + parentCapId);
                    }
                }
            }
        
        copyContacts3_0(capId, parentCapId);
    }
        // copy conditions over from mod request
        copyConditions(capId, parentCapId);

        //copy DBA and legal name 

    if (isASITrue(AInfo["Fictitious Business Name"])) { 
        

             //DBA
             var bizName = getShortNotes(capId);
	updateShortNotes(bizName, parentCapId);
      logDebug("Short Notes = " + getShortNotes(capId));

      }

      if (isASITrue(AInfo["Legal Entity Name Change"])) { 
        
        //legal busin name
         var AppName = getAppName(capId);
               editAppName(Appame, parentCapId);
                 logDebug("Name = " + editAppName(capId));
    
                 
          }
    }
}
