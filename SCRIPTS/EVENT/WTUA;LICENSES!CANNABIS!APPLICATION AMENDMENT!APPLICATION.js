if (isTaskActive('Review') && matches(String(wfStatus),'Changes Denied')) {
	closeTask('Close Out','Denied','Closed via script','');
	}

if (isTaskActive('Review') && matches(String(wfStatus),'Changes Accepted')) {
	closeTask('Close Out','Completed','Closed via script','');
	}

if (isTaskActive('Review') && matches(String(wfStatus),'Abandoned')) {
	closeTask('Close Out','Abandoned','Closed via script','');
	}

if (isTaskActive('Review') && matches(String(wfStatus),'Abandoned')) {
	closeTask('Close Out','Abandoned','Closed via script','');
	}

if (isTaskActive('Review') && matches(String(wfStatus),'Void')) {
	closeTask('Close Out','Void','Closed via script','');
	}

if (isTaskActive('Review') && matches(String(wfStatus),'Withdrawn')) {
	closeTask('Close Out','Withdrawn','Closed via script','');
    }
