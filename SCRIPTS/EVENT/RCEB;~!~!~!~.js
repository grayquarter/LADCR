
if (publicUser) {
	var people = aa.people.getPeople(ContactModel.getContactSeqNumber()).getOutput();
	var seStatus = people.getSalutation();
	if (matches(seStatus,"Pending DCR Review","Not Eligible","SEP Tier 1 and Tier 2 Eligibility Verified","SEP Tier 2 Eligibility Verified","SEP Tier 1 Eligibility Verified")) {
		cancel = true;
		showMessage = true;
		comment("No changes can be made to your profile at this time");
		}
}

slackDebug(debug);
