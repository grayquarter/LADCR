// Begin script to copy Owner Applicant information to the Owners ASIT.
include("SAVE_OWNER_APPLICANT_TO_OWNER_TABLE");
// End script to copy Owner Applicant information to the Owners ASIT.

// update contact permissions in ACA
include("UPDATE_ACA_VISIBILITY_BY_CONTACT");

//Grant status for applications and contacts
include("GRANT_RECIPIENT_STATUS");