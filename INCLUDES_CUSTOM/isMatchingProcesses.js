function isMatchingProcesses(rec1_Id, rec2_Id)
{
// Returns TRUE if both records have the same workflow processes

	var workflowResult = aa.workflow.getTasks(rec1_Id);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		rec1_Process = fTask.getProcessCode();
		//logDebug("First Process = " + rec1_Process);
		break;
	}

	var workflowResult = aa.workflow.getTasks(rec2_Id);
	if (workflowResult.getSuccess())
		wfObj = workflowResult.getOutput();
	else {
		logMessage("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		return false;
	}

	for (i in wfObj) {
		fTask = wfObj[i];
		rec2_Process = fTask.getProcessCode();
		//logDebug("Second Process = " + rec2_Process);
		break;
	}

	if (rec1_Process == rec2_Process) {
		return true;
	} else {
		return false;
	}
	
		
}
