function getAppStatus(vCapId){
	var capStatus = null;
	var itemCap = aa.cap.getCap(vCapId).getOutput();
	capStatus = itemCap.getCapStatus();
	return capStatus;
}
