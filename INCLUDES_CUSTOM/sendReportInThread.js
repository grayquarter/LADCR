//Legacy from RRIO, attaches report file to email
function sendReportInThread(itemCap,itemCapIDString,reportName,reportParamters,module,reportUser,emailFrom,emailTo,emailCC,emailSubject,emailContent,saveReport,sendEmail) {
	var scriptName = "RUNREPORTANDSENDASYNC";

	var envParameters = aa.util.newHashMap();
	envParameters.put("ReportName",reportName);
	envParameters.put("ReportParameters",reportParamters);
	envParameters.put("Module",module);
	envParameters.put("CustomCapId",itemCapIDString);
	envParameters.put("CapID",itemCap);
	envParameters.put("ReportUser",currentUserID);
	envParameters.put("ServProvCode",servProvCode);
	envParameters.put("ErrorEmailTo", "");
	envParameters.put("DebugEmailTo", "");
	envParameters.put("EmailFrom",emailFrom);
	envParameters.put("EmailTo", emailTo);
	envParameters.put("EmailCC", emailCC);
	envParameters.put("EmailSubject",emailSubject);
	envParameters.put("EmailContent",emailContent);
	if(saveReport==false)
		envParameters.put("SaveReport","false");
	else
		envParameters.put("SaveReport","true");
	if(sendEmail==false)
		envParameters.put("SendEmail","false");	
	else
		envParameters.put("SendEmail","true");
		
	aa.runAsyncScript(scriptName, envParameters);
}
