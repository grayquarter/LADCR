 if (isTaskActive('Review') && (wfStatus.equals('Changes Denied'))) {
        closeTask('Close Out','Denied','Closed via script','');
        }
    
    if (isTaskActive('Review') && (wfStatus.equals('Changes Accepted'))) {
        closeTask('Close Out','Completed','Closed via script','');
        logDebug("what is workflow status: " + wfStatus);
        }
    
    if (isTaskActive('Review') && (wfStatus.equals('Abandoned'))) {
        closeTask('Close Out','Abandoned','Closed via script','');
        }
    
    if (isTaskActive('Review') && (wfStatus.equals('Abandoned'))) {
        closeTask('Close Out','Abandoned','Closed via script','');
        }
    
    if (isTaskActive('Review') && (wfStatus.equals('Void'))) {
        closeTask('Close Out','Void','Closed via script','');
        }
    
    if (isTaskActive('Review') && (wfStatus.equals('Withdrawn'))) {
        closeTask('Close Out','Withdrawn','Closed via script','');
        }
