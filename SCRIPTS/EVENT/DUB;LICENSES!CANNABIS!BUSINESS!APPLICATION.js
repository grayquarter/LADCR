//if (publicUser && cap.isCompleteCap() && !matches(capStatus,"Additional Info Needed","Awaiting Data Entry")) {
if (publicUser && cap.isCompleteCap() && !matches(capStatus,"Additional Info Needed","Awaiting Data Entry","Awaiting Owner Submittals")) { //requested 11/23/20 by Aaron
	cancel = true;
	showDebug = false;
	showMessage = true;
	comment('Uploads are not allowed after the record has been submitted');
}
