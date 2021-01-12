//Drop preapp extension
var newId = lacdUpdateAltID(capId,"PREAPP",capId.getCustomID(),"");
logDebug("Updated record id to " + newId);

//Create child activity record
include("CREATE_ACTIVITY_RECS_FROM_PREAPP");

//Fees – applied to parent (defined)

//Notify applicant – Your application is eligible for…

//They are now allowed to add documents to the record.
