// send email notice to task reviewer if supervisor returns it for further review
// use in WTU, assumes wfTask and wfStatus

	if (wfStatus == "Needs Review") {
		//Determine task to be reviewed based on task submitted
		var reviewTask = "";
		if (wfTask == "Supervisor Premises Review") reviewTask = "Premises Review"; else
		if (wfTask == "Supervisor Owner Review") reviewTask = "Owner Review"; else
		if (wfTask == "Supervisor Social Equity Review") reviewTask = "Social Equity Review"; else
		if (wfTask == "Supervisor Temp Review") reviewTask = "Premises Temp Review"; 
	  
		//Get task reviewer and send notice
		if (reviewTask != "") {
			var assignedStaffUser = getTaskAssignedStaff(reviewTask);
			//aa.print("assignedStaffUser = " + assignedStaffUser);

			var actionByUser = getTaskActionBy(reviewTask);
			//aa.print("actionByUser = " + actionByUser);
			
			var iNameResult  = aa.person.getUser(actionByUser);
			if (!iNameResult.getSuccess())
			{ 
				logDebug("**ERROR retrieving  user model " + actionByUser + " : " + iNameResult.getErrorMessage()) ; 
				//return false ; 
			} else {
				var iName = iNameResult.getOutput();
				//aa.print("getDeptOfUser = " +  iName.getDeptOfUser() + ", getUserID = " + iName.getUserID() + ", getEmail = " + iName.getEmail());

				emailSubject = "Civic Platform Task Needs Review";
				emailMessage = "Supervisor returned your task '" + reviewTask + "' for further review. Please check the application: " + capId.getCustomID();
				email(iName.getEmail(),"dcrlicensing@lacity.org",emailSubject,emailMessage);
				
			}
		}
	}
