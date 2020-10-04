
if (publicUser && !partialCap) {

	capEmailString = capIDString;

	// get assigned users (record and initial review task)
	var au = getAssigned(capId);
	var emailList = [];
	
	if (au) {
		emailList.push(getUserEmail(au));
	}
	
	// send email
	if (emailList.length > 0) {
		var list = emailList.filter(function (x, i, a) {return a.indexOf(x) == i; });
		var params = aa.util.newHashtable();
		addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
		//addParameter(params, "$$docCount$$", (++i).toFixed(0));
		addParameter(params,"$$altID$$",capEmailString);
		addParameter(params,"$$docList$$",docList);
		sendNotification("dcrlicensing@lacity.org",list.join(","),"","LADCR_DOC_UPLOAD_NOTIFY",params,null);
	}
}

