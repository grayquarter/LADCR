
if (publicUser && cap.isCompleteCap() && !matches(capStatus,"Additional Info Needed","Awaiting Data Entry")) {
	cancel = true;
	showDebug = false;
	showMessage = true;
	comment('Uploads are not allowed after the record has been submitted');
}
