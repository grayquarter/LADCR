 if (wfTask == 'Review') {

    if (wfStatus == 'Changes Denied') {
        closeTask('Close Out','Denied','Closed via script','');
        }
    
    if (wfStatus == 'Changes Accepted') {
        closeTask('Close Out','Completed','Closed via script','');
        include("COPY_MOD_TO_PARENT");
        }
    
    if (wfStatus == 'Abandoned') {
        closeTask('Close Out','Abandoned','Closed via script','');
        }
        
    if (wfStatus == 'Void') {
        closeTask('Close Out','Void','Closed via script','');
        }
    
    if (wfStatus == 'Withdrawn') {
        closeTask('Close Out','Withdrawn','Closed via script','');
        }

}
