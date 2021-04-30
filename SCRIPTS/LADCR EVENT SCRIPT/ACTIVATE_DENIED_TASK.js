	var checkTask = "";
	var deniedTask = "Not Found";

	// find the last task that denied and return
	checkTask = "Temp License Issued";
	if (checkDenied(checkTask)) {
		deniedTask = checkTask;
	} else {
	checkTask = "Pre-Inspection Review";
	if (checkDenied(checkTask)) {
		deniedTask = checkTask;
	} else {
	checkTask = "Supervisor Temp Review";
	if (checkDenied(checkTask)) {
		deniedTask = checkTask;
	} else {
	checkTask = "Temp App Review";
	if (checkDenied(checkTask)) {
		deniedTask = checkTask;
	} else {
	checkTask = "Supervisor Pre-App Document Review";
	if (checkDenied(checkTask)) {
		deniedTask = checkTask;
	} else {
	checkTask = "Pre-App Document Review";
	if (checkDenied(checkTask)) {
		deniedTask = checkTask;
	}}}}}}
	
	if (deniedTask != "Not Found"){
	  //branch to that task
	  setTask(wfTask,"N","Y");
	  activateTask(deniedTask);
	  updateTask(deniedTask,"Denial Denied","Returned from " + wfTask,"Script ACTIVATE_DENIED_TASK");
	}
	
	function checkDenied(pTask) {
		var checkStatus = taskStatus(pTask);
		if (matches(checkStatus,"Abandoned","Inspection Timeout - No Activity","Temporary Denied","Tempoary Denied","Void","Withdrawn"))
			return true;
		else
			return false;
	}
