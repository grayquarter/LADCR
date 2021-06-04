//Created 06/04/2021, ghess
//sync application and child activity record's workflow

//get parent workflow task and status
	var parentTask = null;
	var parentStatus = null;

	var workflowResult = aa.workflow.getTasks(capId);
	if (workflowResult.getSuccess()) 
	{
		var wfObj = workflowResult.getOutput();
	} else 
	{
		logDebug("**ERROR: Failed to get workflow object: " + workflowResult.getErrorMessage());
		//return false;
	}

	//Find first active task in parent application
	for (var i in wfObj) 
	{
		var fTask = wfObj[i];
		
		//logDebug("fTask.getProcessCode() = " + fTask.getProcessCode());
		//logDebug("fTask.getTaskDescription() = " + fTask.getTaskDescription());
		//logDebug("fTask.getActiveFlag() = " + fTask.getActiveFlag());
		//logDebug("fTask.getDisposition() = " + fTask.getDisposition());
		//logDebug("fTask.getCompleteFlag() = " + fTask.getCompleteFlag());
		
		//logDebug("");
		
		//if (fTask.getTaskDescription().toUpperCase().equals(wfstr.toUpperCase())) 
		if (fTask.getActiveFlag() == "Y" && fTask.getCompleteFlag() == "N") {
			parentTask = fTask.getTaskDescription();
			parentStatus = fTask.getDisposition();
			logDebug("First active Application WF Task: " + parentTask);
			break;
		}
	}
	
	//for all activity children
	var childRecs = getChildren("Licenses/Cannabis/Business/Activity", capId);

	var parenCaptId = capId;
    for (var i in childRecs) {
        var thisChildId = childRecs[i];
        var thisChildIdStr = String(thisChildId.getCustomID());

		//logDebug("");
		logDebug("Child Record = " + thisChildIdStr);
		
		//Check both parent and child are assigned the same workflow
		processesMatch = isMatchingProcesses(thisChildId, parenCaptId);
		logDebug("Do Processes match? " + processesMatch);
		if(processesMatch) {
		
			//look for corresponding active task in child. If not, update child
			capId = thisChildId; //assigning default capId for Accela functions
			var taskComplete = isTaskComplete(parentTask);
			var taskActive = isTaskActive(parentTask);
			
			logDebug("Looking for parent task '" + parentTask + "' in child...");
			logDebug("Is task complete: " + taskComplete);
			logDebug("Is task active: " + taskActive);

			//move on if task completed in activity record
			if (taskComplete) {
				continue;
			}
			
			//move on if task is active
			if (taskActive) {
				continue;
			}
			
			//logDebug("");
			
			//otherwise close activity record current task 
			//logDebug("Calling getActiveTask()");
			currTask = getActiveTask();
			logDebug("First active task in child Activity Record = " + currTask);
			setTask(currTask,"N","N");
			
			//assign parent task
			setTask(parentTask,"Y","N");
			updateTask(parentTask, parentStatus, "Updated from parent application workflow","");

			//update app status?
			updateAppStatus(getAppStatus(parenCaptId),"Updated from parent application.",capId); 

			//logDebug("");
		}
	}
	
	capId = parenCaptId;
	
