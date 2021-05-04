function getTaskActionBy(wfstr) // optional process name.
{
	var useProcess = false;
	var processName = "";
	if (arguments.length == 2) {
		processName = arguments[1]; // subprocess
		useProcess = true;
	}

	var taskDesc = wfstr;
	if (wfstr == "*") {
		taskDesc = "";
	}
	var workflowResult = aa.workflow.getTaskItems(capId, taskDesc, processName, null, null, null);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + s_capResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		var fTask = wfObj[i];
		if ((fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase()) || wfstr == "*") && (!useProcess || fTask.getProcessCode().equals(processName))) {
			var taskItem = fTask.getTaskItem();
			var vStaffUser = aa.cap.getStaffByUser(taskItem.getSysUser().getFirstName(),taskItem.getSysUser().getMiddleName(),taskItem.getSysUser().getLastName(),taskItem.getSysUser().toString()).getOutput(); 
			logDebug("vStaffUser: " + vStaffUser);
			return vStaffUser.getUserID();
		}
	}
}
