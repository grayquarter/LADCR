if (wfTask.equals("Review") && wfStatus.equals("Changes Accepted")) {
        
        if (parentCapId) {
                
            if (isASITrue(AInfo["Remove Cannabis Activity"]) || isASITrue(AInfo["New Cannabis Activity"])) {
            //copy ASI infomation, but I want to replace as well. 
            // there is a standard function to do that... copyASIFields(sourceCapId, targetCapId); in you case:
            
            copyASIFields(capId, parentCapId)
            
           }
    
        if (isASITrue(AInfo["Ownership or Primary Changes"]) || isASITrue(AInfo["Other Contact Changes"])) {
                // copy over contacts from child
                  //  remove all contacts from parent
                capContactResult = aa.people.getCapContactByCapID(parentCapId);
                if (capContactResult.getSuccess()) {
                    var contacts = capContactResult.getOutput();
                    for (var i in contacts) {
    
                        //REMOVING CONTACTS
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
    
        if (isASITrue(AInfo["Fictitious Business Name"]) || isASITrue(AInfo["Legal Entity Name Change"])) { 
    
            editAppSpecific("Legal Business Name",AInfo["Legal Entity Name Change",parentCapId]);
            editAppSpecific("DBA Name",AInfo["Fictitious Business Name",parentCapId]);
    
          }
        }
    }
// End script to copy mod request info back to parent
