if (wfTask.equals("Review") && wfStatus.equals("Changes Accepted")) {
	
	if (parentCapId) {
            
        if (isASITrue(AInfo["Remove Cannabis Activity"]) || isASITrue(AInfo["New Cannabis Activity"])) {
       
        copyASIFields(capId, parentCapId)
      logDebug("copy ASI first");
		       
    } 

    if (isASITrue(AInfo["Ownership or Primary Changes"])) {
    
        // copy over contacts from child
              //  remove all contacts from parent
            capContactResult = aa.people.getCapContactByCapID(parentCapId);
            if (capContactResult.getSuccess()) {
                var contacts = capContactResult.getOutput();
                var ownerTypes = ["Chief Executive Officer", "Chief Financial Officer", "Chief Marketing Officer", "Chief Operating Officer", "Chief Technology Officer", "Management Company", "Owner", "Owner - Entity", "President", "Secretary", "Social Equity Owner", "Social Equity Owner - Entity", "Vice President"];
      
                for (var i in contacts) {

                    if (contacts[i].getPeople()) {
                        var capContactNumber = aa.util.parseInt(contacts[i].getCapContactModel().getPeople().getContactSeqNumber());

                        if (contacts[i].getPeople().getContactType(), ownerTypes) {
                            var capContactNumber = aa.util.parseInt(contacts[i].getCapContactModel().getPeople().getContactSeqNumber());
                        aa.people.removeCapContact(parentCapId, capContactNumber);
                        logDebug(contacts[i].getPeople().getContactType() + " - Contact Seq Number " + capContactNumber + " removed from parent " + parentCapId);
                    }
                }
            }
        
        copyContacts3_0(capId, parentCapId);
       
      }
}


    if (isASITrue(AInfo["Other Contact Changes"])) {
    
        // copy over contacts from child
              //  remove all contacts from parent
            capContactResult = aa.people.getCapContactByCapID(parentCapId);
            if (capContactResult.getSuccess()) {
                var contacts = capContactResult.getOutput();
		var otherTypes = ["Accounting Firm", "Agency for Service of Process", "Agent for Service of Process", "Authorized Agent", "Authorized Agent - Entity", "Consultant", "Consultant - Entity", "Director", "Law Firm", "Manager", "Neighborhood Liaison", "Person-in-Charge", "Security Firm"];

                for (var i in contacts) {

                    if (contacts[i].getPeople(), otherTypes) {
                        var capContactNumber = aa.util.parseInt(contacts[i].getCapContactModel().getPeople().getContactSeqNumber());
                        aa.people.removeCapContact(parentCapId, capContactNumber);
                        logDebug(contacts[i].getPeople().getContactType() + " - Contact Seq Number " + capContactNumber + " removed from parent " + parentCapId);
                    }
                }
            }
        
        copyContacts3_0(capId, parentCapId);
    }
        // copy conditions over from mod request
        copyConditions(capId, parentCapId);
        logDebug("conditions added everytime");

        //copy DBA and legal name 

    if (isASITrue(AInfo["Fictitious Business Name"])) { 
        

             //DBA
             var bizName = getShortNotes(capId);
	updateShortNotes(bizName, parentCapId);
      logDebug("Short Notes = " + getShortNotes(capId));

      }

      if (isASITrue(AInfo["Legal Entity Name Change"])) { 
        
        //legal busin name
         var AppName = getAppName(capId);
               editAppName(Appame, parentCapId);
                 logDebug("Name = " + editAppName(capId));
    
                 
          }
    

if (isASITrue(AInfo["Business Premises Relocation"])) {
	// create new parent record
	var newId = createCannabisApp("Licenses","Cannabis","Business","Application","",parentCapId,capId);
	if (newId) {
		logDebug("New Application Record created: " + newId.getCustomID());
		newCap = aa.cap.getCap(newId).getOutput();
		logDebug("Run ASA event success? " + aa.cap.runEMSEScriptAfterApplicationSubmit(newCap.getCapModel(),newId).getSuccess());
		// deprecate old app - is this all we have to do?
		updateAppStatus("Deprecated","Deprecated by mod request " + capId.getCustomID(),parentCapId);
		
	}
      if (newCap) {

            closeTask("Application Acceptance","","Closed by COPY TO MOD", newId);
             logDebug("Closing Workflow Task: " + newId.getCustomID());
            activateTask("Temp App Review");
            logDebug("Activating: " + newId.getCustomID());
            updateAppStatus("Eligible for Processing","", newId);
            logDebug("APP ID: " + newId);
        
            }
}


   if (isASITrue(AInfo["Remove Cannabis Activity"])) {
    include("CREATE_ACTIVITY_RECS_FROM_PREAPP");
    logDebug("running Create Act");
   
} 

    }
    
}
	
//functions
	function createCannabisApp(grp,typ,stype,cat,desc,itemCap,addressCap) {
	//
	// creates the new application and returns the capID object
	// cloned from createChild but no hierarchy
	//

	var appCreateResult = aa.cap.createApp(grp,typ,stype,cat,desc);
	logDebug("creating cap " + grp + "/" + typ + "/" + stype + "/" + cat);
	if (appCreateResult.getSuccess())
		{
		var newId = appCreateResult.getOutput();
		logDebug("cap " + grp + "/" + typ + "/" + stype + "/" + cat + " created successfully ");

		// create Detail Record
		capModel = aa.cap.newCapScriptModel().getOutput();
		capDetailModel = capModel.getCapModel().getCapDetailModel();
		capDetailModel.setCapID(newId);
		aa.cap.createCapDetail(capDetailModel);

		// Copy Contacts
		capContactResult = aa.people.getCapContactByCapID(itemCap);
		if (capContactResult.getSuccess())
			{
			Contacts = capContactResult.getOutput();
			for (yy in Contacts)
				{
				var newContact = Contacts[yy].getCapContactModel();
				newContact.setCapID(newId);
				aa.people.createCapContact(newContact);
				logDebug("added contact");
				}
			}	

		// Copy Addresses
		capAddressResult = aa.address.getAddressByCapId(addressCap);
		if (capAddressResult.getSuccess())
		{
			Address = capAddressResult.getOutput();
			for (yy in Address)
			{
			newAddress = Address[yy];
			var addressId = newAddress.getAddressId();
			logDebug("addressId:" + addressId);           
			newAddress.setCapID(newId);
			var newAddressResult = aa.address.createAddress(newAddress);
			logDebug("added address");
			// Copy address district.
			if(newAddressResult.getSuccess())
				{
					var newAddressId = newAddressResult.getOutput();
					var districtColResult = aa.address.getAssignedAddressDistrictForDaily(addressCap.getID1(),addressCap.getID2(),addressCap.getID3(),addressId);
					if(districtColResult != null && districtColResult.getOutput()!= null && districtColResult.getSuccess)
					{
						var districtCol = districtColResult.getOutput();
						for (x1 in districtCol)
						{
							var newDistrict = districtCol[x1];
							aa.address.addAddressDistrictForDaily(newId.getID1(),newId.getID2(),newId.getID3(),newAddressId,newDistrict.getDistrict());
							logDebug("added address district.");
						}
					}
				}                
			}
		}
        //Copy GIS 
		var gisObjResult = aa.gis.getCapGISObjects(addressCap);
		if (gisObjResult.getSuccess()) 
			{
			var fGisObj = gisObjResult.getOutput();
			for (a1 in fGisObj) // for each GIS object on the Cap
				{
				var gisTypeScriptModel = fGisObj[a1];
				var gisObjArray = gisTypeScriptModel.getGISObjects()
				for (b1 in gisObjArray)
					{
  					var gisObjScriptModel = gisObjArray[b1];
  					var gisObjModel = gisObjScriptModel.getGisObjectModel() ;

					var retval = aa.gis.addCapGISObject(newId,gisObjModel.getServiceID(),gisObjModel.getLayerId(),gisObjModel.getGisId());

					if (retval.getSuccess())
						{ logDebug("Successfully added Cap GIS object: " + gisObjModel.getGisId())}
					else
						{ logDebug("**WARNING: Could not add Cap GIS Object.  Reason is: " + retval.getErrorType() + ":" + retval.getErrorMessage()) ; return false }	
					}
				}
			}

		copyAppSpecificInfoForLic(parentCapId,newId);
		copyAppSpecificTableForLic(parentCapId,newId);
		return newId;
		}
	else
		{
		logDebug( "**ERROR: adding child App: " + appCreateResult.getErrorMessage());
		}
}

function copyAppSpecificTableForLic(srcCapId, targetCapId) {
	var tableNameArray = getTableName(srcCapId);
	var targetTableNameArray = getTableName(targetCapId);
	if (tableNameArray == null) {
		logDebug("tableNameArray is null, returning");
		return;
	}
	for (loopk in tableNameArray) {
		var tableName = tableNameArray[loopk];
		if (IsStrInArry(tableName, targetTableNameArray)) {
			//1. Get appSpecificTableModel with source CAPID
			var sourceAppSpecificTable = getAppSpecificTableForLic(srcCapId, tableName);
			//2. Edit AppSpecificTableInfos with target CAPID
			var srcTableModel = null;
			if (sourceAppSpecificTable == null) {
				logDebug("sourceAppSpecificTable is null");
				return;
			}
			else {
				srcTableModel = sourceAppSpecificTable.getAppSpecificTableModel();

				tgtTableModelResult = aa.appSpecificTableScript.getAppSpecificTableModel(targetCapId, tableName);
				if (tgtTableModelResult.getSuccess()) {
					tgtTableModel = tgtTableModelResult.getOutput();
					if (tgtTableModel == null) {
						logDebug("target table model is null");
					}
					else {
						tgtGroupName = tgtTableModel.getGroupName();
						srcTableModel.setGroupName(tgtGroupName);
					}
				}
				else { logDebug("Error getting target table model " + tgtTableModelResult.getErrorMessage()); }
			}
			editResult = aa.appSpecificTableScript.editAppSpecificTableInfos(srcTableModel,
				targetCapId,
				null);
			if (editResult.getSuccess()) {
				logDebug("Successfully editing appSpecificTableInfos");
			}
			else {
				logDebug("Error editing appSpecificTableInfos " + editResult.getErrorMessage());
			}
		}
		else {
			logDebug("Table " + tableName + " is not defined on target");
		}
	}

}


function copyAppSpecificInfoForLic(srcCapId, targetCapId)
{
	var ignoreArr = new Array();
	var AppSpecInfo = new Array();
	useAppSpecificGroupName = true;
	loadAppSpecific(AppSpecInfo,srcCapId);
	copyAppSpecificForLic(AppSpecInfo,targetCapId, ignoreArr);
	useAppSpecificGroupName = false;
}



function copyAppSpecificForLic(AInfo, newCap) // copy all App Specific info
// into new Cap, 1 optional
// parameter for ignoreArr
{
	var ignoreArr = new Array();
	var limitCopy = false;
	if (arguments.length > 2) {
		ignoreArr = arguments[2];
		limitCopy = true;
	}

	for (asi in AInfo) {
		if (limitCopy) {
			var ignore = false;
			for (var i = 0; i < ignoreArr.length; i++) {
				if (asi.indexOf(ignoreArr[i]) == 0) {
					// if(ignoreArr[i] == asi){
					logDebug("ignoring " + asi);
					ignore = true;
					break;
				}
			}
			if (!ignore)
				editAppSpecific(asi, AInfo[asi], newCap);
		} else
			editAppSpecific(asi, AInfo[asi], newCap);
	}
}

function getTableName(capId)
{
	var tableName = null;
	var result = aa.appSpecificTableScript.getAppSpecificGroupTableNames(capId);
	if(result.getSuccess())
	{
		tableName = result.getOutput();
		if(tableName!=null)
		{
			return tableName;
		}
	}
	return tableName;
}

function IsStrInArry(eVal, argArr) {
    var x;
    for (x in argArr) {
        if (eVal == argArr[x]) {
            return true;
        }
    }
    return false;
}

function getAppSpecificTableForLic(capId,tableName)
{
	appSpecificTable = null;
	var s_result = aa.appSpecificTableScript.getAppSpecificTableModel(capId,tableName);
	if(s_result.getSuccess())
	{
		appSpecificTable = s_result.getOutput();
		if (appSpecificTable == null || appSpecificTable.length == 0)
		{
			logDebug("WARNING: no appSpecificTable on this CAP:" + capId);
			appSpecificTable = null;
		}
	}
	else
	{
		logDebug("ERROR: Failed to appSpecificTable: " + s_result.getErrorMessage());
		appSpecificTable = null;	
	}
	return appSpecificTable;
}

