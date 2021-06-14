function getActiveTask()
{

	var activeTask = "";

	//var workflowResult = aa.workflow.getTaskItems(capId, null, processName, "Y", null, null);
	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		//logDebug("Is this an active task: " + fTask.getTaskDescription());
		//logDebug("fTask.getActiveFlag() = " + fTask.getActiveFlag());
		//logDebug("fTask.getCompleteFlag() = " + fTask.getCompleteFlag());
		
		
		if (fTask.getCompleteFlag().equals("N") && fTask.getActiveFlag().equals("Y")) {
			activeTask = fTask.getTaskDescription();
			break;
		}
	}
	return activeTask;
}
