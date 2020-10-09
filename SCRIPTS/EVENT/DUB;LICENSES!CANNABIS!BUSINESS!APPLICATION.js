
if (publicUser && cap.isCompleteCap()) {
	cancel = true;
	showDebug = false;
	showMessage = true;
	comment('Uploads are not allowed after the record has been submitted');
}
