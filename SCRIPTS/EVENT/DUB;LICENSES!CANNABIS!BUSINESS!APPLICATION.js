//if (publicUser && cap.isCompleteCap() && !matches(capStatus,"Additional Info Needed","Awaiting Data Entry")) {
if (publicUser && cap.isCompleteCap() && !matches(capStatus,"Additional Info Needed","Awaiting Data Entry","Awaiting Owner Submittals","Eligible for Processing")) { //updated 1/20/2021
	cancel = true;
	showDebug = false;
	showMessage = true;
	comment('Uploads are not allowed after the record has been submitted');
}
