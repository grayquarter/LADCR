/*------------------------------------------------------------------------------------------------------/
| Program: Batch Notify Internally if Payment Overdue.js  Trigger: Batch
| Client: LADCR
| Task: Parking Lot 31
| Create Date: 04/12/2021
| Last Update: 
|	04/14/2021 - rewrite based on new requirements
|	04/15/2021 - preparing for batch job
|
/------------------------------------------------------------------------------------------------------*/
/*------------------------------------------------------------------------------------------------------/
| BEGIN Initialize Variables
/------------------------------------------------------------------------------------------------------*/
/* START SCRIPT TEST PARAMETERS */
var testScriptMode = false; //set to true for using in Script Tester

if (testScriptMode) {
	aa.env.setValue("emailGroupAddr","ghess@accela.com"); //DCR.AccelaPaymentReviewers@lacity.org
	aa.env.setValue("emailInternalTemplace","DCR APPEAL PAYMENT OVERDUE");
	aa.env.setValue("waitingPeriodDays","31");
	aa.env.setValue("testMode","Y");

	aa.env.setValue("CurrentUserID", "ADMIN");
}
/* END SCRIPT TEST PARAMETERS */

/*------------------------------------------------------------------------------------------------------/
| BEGIN Includes
/------------------------------------------------------------------------------------------------------*/
var showDebug = true;
var capId;

SCRIPT_VERSION = 3.0;

eval(getScriptText("INCLUDES_ACCELA_FUNCTIONS", null, true));
eval(getScriptText("INCLUDES_BATCH"));
eval(getScriptText("INCLUDES_CUSTOM", null, true));

function getScriptText(vScriptName, servProvCode, useProductScripts) {
	if (!servProvCode)
		servProvCode = aa.getServiceProviderCode();

	vScriptName = vScriptName.toUpperCase();
	var emseBiz = aa.proxyInvoker.newInstance("com.accela.aa.emse.emse.EMSEBusiness").getOutput();
	try {
		if (useProductScripts) {
			var emseScript = emseBiz.getMasterScript(aa.getServiceProviderCode(), vScriptName);
		} else {
			var emseScript = emseBiz.getScriptByPK(aa.getServiceProviderCode(), vScriptName, "ADMIN");
		}

		return emseScript.getScriptText() + "";
	} catch (err) {
		return "";
	}
}
/*----------------------------------------------------------------------------------------------------/
|
| Start: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var batchJobResult = aa.batchJob.getJobID();
var batchJobName = "" + aa.env.getValue("BatchJobName");
var batchJobID = 0;

if (batchJobResult.getSuccess()) {
	batchJobID = batchJobResult.getOutput();
	logDebug("Batch Job " + batchJobName + " Job ID is " + batchJobID);
} else {
	logDebug("Batch job ID not found " + batchJobResult.getErrorMessage());
}

var internalMailAddr = getJobParam("emailGroupAddr"); 
var emailTemplace = getJobParam("emailInternalTemplace");
var waitPeriod = parseInt(getJobParam("waitingPeriodDays"));
var testFlag = getJobParam("testMode");

var testMode = true;
if (testFlag == "N" || testScriptMode) {
	testMode = false;
}


/*----------------------------------------------------------------------------------------------------/
|
| End: BATCH PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/

/*----------------------------------------------------------------------------------------------------/
|
| Start: SCRIPT PARAMETERS
|
/------------------------------------------------------------------------------------------------------*/
var debug = "";
var br = "<br>";
var message = "";
var emailText = "";
var AInfo = []; // editTaskSpecific needs this defined as global
var useAppSpecificGroupName = ""; // getAppSpecific needs this defined as global
var currentUserID = aa.env.getValue("CurrentUserID");
var systemUserObj = aa.person.getUser(currentUserID).getOutput();
var sysFromEmail = "dcrlicensing@lacity.org";

var startDate = new Date();
var startTime = startDate.getTime(); // Start timer

/*------------------------------------------------------------------------------------------------------/
| <===========Main=Loop================>
|
/-----------------------------------------------------------------------------------------------------*/

logDebug("*** Start of Job ***");

mainProcess();

logDebug("*** End of Job: Elapsed Time : " + elapsed() + " Seconds ***");

aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug + message);

/*------------------------------------------------------------------------------------------------------/
| <===========END=Main=Loop================>
/-----------------------------------------------------------------------------------------------------*/

function mainProcess() {
try {

	var condDesc = "Invoice Past Due";
	sysDate = aa.date.getCurrentDate();
	var curDate = convertDate(sysDate);
	var lateDate = dateAdd(null,0-waitPeriod);
	
	if (testMode) logDebug("<font style='color:red;'>In Testing Mode - no changes will be made!</font>");

	logDebug("Today's Date: " + curDate);
	logDebug("Looking Applications with a status of 'Waiting for Payment'...");
		
	//var selectString = "select b1_per_id1, b1_per_id2, b1_per_id3, B1_APPL_STATUS from B1PERMIT where b1_per_id1 like '%DUB%' and B1_APPL_STATUS = 'Waiting for Payment'";
	var selectString = "select b1_per_id1, b1_per_id2, b1_per_id3, B1_APPL_STATUS from B1PERMIT where B1_APPL_STATUS = 'Waiting for Payment'";

	r = doSQL_LADCR(selectString);

    for (var i in r) {
		//
		// testing
		//if (i > 10) continue;
		//
		capId = aa.cap.getCapID(r[i].b1_per_id1, r[i].b1_per_id2, r[i].b1_per_id3).getOutput();

        if (capId) {
			logDebug("");
			logDebug("=== record " + capId.getCustomID());
			
			var capResult = aa.cap.getCap(capId);

			cap = aa.cap.getCap(capId).getOutput();
			//logDebug("capId  = " + capId );
			//logDebug("cap = " + cap);
	
			if (!capResult.getSuccess()) 
			{
				logDebug(altId + ": Record is deactivated, skipping");
				continue;
			} else {
				var cap = capResult.getOutput();
			}

			//var capStatus = cap.getCapStatus();
			//logDebug("capStatus = " + capStatus);

			// this section not used...
			/******************************************************************************
			//look for invoiced fees that are not paid...
			//logDebug("Looking at payments...");
			var payResult = aa.finance.getPaymentByCapID(capId, null);

			if (!payResult.getSuccess()) {
				logDebug("**ERROR: error retrieving payments " + payResult.getErrorMessage());
				//return false
			}

			var payments = payResult.getOutput();

			for (var paynum in payments) {
				logDebug("Inside payments");
				var payment = payments[paynum];
				
				var payBalance = payment.getAmountNotAllocated();
				var payStatus = payment.getPaymentStatus();
				
				//logDebug("payBalance = " + payBalance);
				//logDebug("payStatus = " + payStatus);

				//if (payBalance <= 0)
				//	continue; // nothing to allocate

				//if (payStatus != "Paid")
				//	continue; // not in paid status
			} //For
			*************************************************************************/
			
			// check for fees
			
			var feeResult = aa.finance.getFeeItemByCapID(capId);

			if (!feeResult.getSuccess()) {
				logDebug("**ERROR: error retrieving fee items " + feeResult.getErrorMessage());
				continue;
				//return false
			}

			var feeArray = feeResult.getOutput();

			//logDebug("Length = " + feeArray.length);
			if (feeArray.length < 1) {
				logDebug("Record has no fees");
			} else {
					
				for (var feeNumber in feeArray) {
					//logDebug("Inside fees");

					var feeItem = feeArray[feeNumber];
					var amtPaid = 0;
					var pfResult = aa.finance.getPaymentFeeItems(capId, null);

					logDebug("Looking at fee: " + feeItem.getFeeDescription());
					logDebug("- Fee Sequence Number: " + feeItem.getFeeSeqNbr());
					logDebug("- Fee Amount: " + feeItem.getFee());

					//if (feeItem.getFeeitemStatus() != "INVOICED")
					//	continue; // only apply to invoiced fees

					if (!pfResult.getSuccess()) {
						logDebug("**ERROR: error retrieving fee payment items items " + pfResult.getErrorMessage());
						//return false
					}

					var pfObj = pfResult.getOutput();

					for (ij in pfObj)
						if (feeItem.getFeeSeqNbr() == pfObj[ij].getFeeSeqNbr())
							amtPaid += pfObj[ij].getFeeAllocation()

					var feeBalance = feeItem.getFee() - amtPaid;
					logDebug("- Fee Balance: " + feeBalance);

					if (feeBalance <= 0)
						continue; // this fee has no balance, move on

					var invoiceResult = aa.finance.getFeeItemInvoiceByFeeNbr(capId, feeItem.getFeeSeqNbr(), null);

					if (!invoiceResult.getSuccess()) {
						logDebug("**ERROR: error retrieving invoice items " + invoiceResult.getErrorMessage());
					} else {
						var invoiceItem = invoiceResult.getOutput();

						if (invoiceItem.length < 1) {
							//logDebug("**WARNING: fee item " + feeItem.getFeeSeqNbr() + " returned " + invoiceItem.length + " invoice matches")
							logDebug("This fee item is not invoiced.")
						} 
					}
					
					// check fee date
					applyDate = feeItem.getApplyDate().getMonth() + "/" + feeItem.getApplyDate().getDayOfMonth() + "/" + feeItem.getApplyDate().getYear()
					logDebug("- Fee Assessed: " + applyDate);
					auditDate = feeItem.getAuditDate().getMonth() + "/" + feeItem.getAuditDate().getDayOfMonth() + "/" + feeItem.getAuditDate().getYear()
					//logDebug("- Fee Invoiced: " + auditDate);
					logDebug("- Last Update:   " + auditDate);
					
					
					// Check whether invoiced date is after 31 days
					var nDays = dateDiff(auditDate, curDate).toFixed(0);
					logDebug("- Days from Last Update = " + nDays);

					// if past date, put condition on record and notify internally
					if (nDays > waitPeriod) {
						logDebug("Date " + auditDate + " is more than " + waitPeriod + " days before today");

						// check for existing conditions containing fee seq num
						if (!feeConditionExist(feeItem.getFeeSeqNbr())){
						
							// if none, create new condition
							if (!testMode) {
								logDebug("Adding Condition: " + condDesc);
								addStdConditionWithFeeSeq("License Conditions", condDesc, feeItem.getFeeSeqNbr());
							} else {
								logDebug("Test Mode: not Adding Condition: " + condDesc);
							}

							// send notifications
							// notify assigned reviewer
							var au = getAssigned(capId);
							var emailAddr = "";
							if (au) {
								emailAddr = getUserEmail(au);
							} else{
								logDebug("No Reviewer assigned to the record.");
							}
							
							// send emails
							var params = aa.util.newHashtable();
							addParameter(params, "$$licenseType$$", cap.getCapType().getAlias());
							addParameter(params, "$$AltID$$", capId.getCustomID());

							if (!testMode) {
								sendNotification(sysFromEmail,internalMailAddr,"",emailTemplace,params,null);
								if (au) {
										sendNotification(sysFromEmail,emailAddr,"",emailTemplace,params,null);
									}
							} else {
								logDebug("Test Mode: not sending notifications");
							}
						} else {
							//logDebug("Condition exists: " + condDesc);
						}
		
					} else {
						logDebug("Date " + auditDate + " is less than or equal to " + waitPeriod + " days before today");
					}
					logDebug("");

				} //For
			}

		}
	}

	logDebug("End Script");

} catch (err) {
    logDebug("A JavaScript Error occured: " + err.message + " at line " + err.lineNumber + " stack: " + err.stack);
}
// end user code
aa.env.setValue("ScriptReturnCode", "0");
aa.env.setValue("ScriptReturnMessage", debug);
}

function doSQL_LADCR(sql) {
        try {
		var array = [];
		var initialContext = aa.proxyInvoker.newInstance("javax.naming.InitialContext", null).getOutput();
		var ds = initialContext.lookup("java:/LADCR");
		var conn = ds.getConnection();
		var sStmt = conn.prepareStatement(sql);

		if (sql.toUpperCase().indexOf("SELECT") == 0) {
			aa.print("executing " + sql);
			var rSet = sStmt.executeQuery();
			while (rSet.next()) {
				var obj = {};
				var md = rSet.getMetaData();
				var columns = md.getColumnCount();
				for (i = 1; i <= columns; i++) {
								obj[md.getColumnName(i)] = String(rSet.getString(md.getColumnName(i)));
				}
				obj.count = rSet.getRow();
				array.push(obj)
				}
						rSet.close();
						aa.print("...returned " + array.length + " rows");
						//aa.print(JSON.stringify(array));
						return array
		} else if (sql.toUpperCase().indexOf("UPDATE") == 0) {
			aa.print("executing update: " + sql);
			var rOut = sStmt.executeUpdate();
			aa.print(rOut + " rows updated");
		} else {
			aa.print("executing : " + sql);
			var rOut = sStmt.execute();
			aa.print(rOut);
		}
		sStmt.close();
		conn.close();
	} catch (err) {
			aa.print(err.message);
	}
}
function feeConditionExist(feeSeqNum) {
	//logDebug("--Inside conditionExist looking for fee: " + feeSeqNum);
	
	// check for existing conditions
	var condDesc = "Invoice Past Due";
	var condExist = false;

	var capConds = aa.capCondition.getCapConditions(capId).getOutput();
	if (!capConds || capConds.length == 0 || capConds == null) 
	  logDebug("No conditions to verify " + capId.getCustomID());
	else {		
	  logDebug("Checking " + capConds.length + " existing conditions");
	  for (i in capConds) {
		 if (capConds[i].getConditionDescription() == condDesc) {
			//logDebug("Found Condition: " + condDesc);
			//check short comments
			shortComments = capConds[i].getConditionComment()
			//logDebug("shortComments = " + shortComments);
			//objectExplore1(shortComments);
			if (shortComments.contains(feeSeqNum.toString())) {
				//logDebug("Found shortComments with seq num:" + feeSeqNum);
				logDebug("Found Condition '" + condDesc + "' with matching fee: " + feeSeqNum);
				condExist = true;
				break;
			}
		 }
	  }
	}
	
 return condExist;
}

function addStdConditionWithFeeSeq(cType, cDesc, cFeeSeqNum) // optional cap ID
{
	var itemCap = capId;
	var feeSeqString = cFeeSeqNum.toString();
	
	if (arguments.length == 4) {
		itemCap = arguments[3]; // use cap ID specified in args
	}
	if (!aa.capCondition.getStandardConditions) {
		logDebug("addStdCondition function is not available in this version of Accela Automation.");
	} else {
		standardConditions = aa.capCondition.getStandardConditions(cType, cDesc).getOutput();
		for (i = 0; i < standardConditions.length; i++)
			// deactivate strict match for indy
			//if (standardConditions[i].getConditionType().toUpperCase() == cType.toUpperCase() && standardConditions[i].getConditionDesc().toUpperCase() == cDesc.toUpperCase()) //EMSE Dom function does like search, needed for exact match
			{
				standardCondition = standardConditions[i];
				var addCapCondResult = aa.capCondition.addCapCondition(itemCap, standardCondition.getConditionType(), standardCondition.getConditionDesc(), cFeeSeqNum.toString(), sysDate, null, sysDate, null, null, standardCondition.getImpactCode(), systemUserObj, systemUserObj, "Applied", currentUserID, "A", null, standardCondition.getDisplayConditionNotice(), standardCondition.getIncludeInConditionName(), standardCondition.getIncludeInShortDescription(), standardCondition.getInheritable(), standardCondition.getLongDescripton(), standardCondition.getPublicDisplayMessage(), standardCondition.getResolutionAction(), null, null, standardCondition.getConditionNbr(), standardCondition.getConditionGroup(), standardCondition.getDisplayNoticeOnACA(), standardCondition.getDisplayNoticeOnACAFee(), standardCondition.getPriority(), standardCondition.getConditionOfApproval());
				if (addCapCondResult.getSuccess()) {
					logDebug("Successfully added condition (" + standardCondition.getConditionDesc() + ")");
				} else {
					logDebug("**ERROR: adding condition (" + standardCondition.getConditionDesc() + "): " + addCapCondResult.getErrorMessage());
				}
			}
	}
}
function getJobParam(pParamName) //gets parameter value and logs message showing param value
{
	var ret;
	if (aa.env.getValue("paramStdChoice") != "") {
		var b = aa.bizDomain.getBizDomainByValue(aa.env.getValue("paramStdChoice"), pParamName);
		if (b.getSuccess()) {
			ret = b.getOutput().getDescription();
		}

		ret = ret ? "" + ret : ""; // convert to String

		logDebug("Parameter (from std choice " + aa.env.getValue("paramStdChoice") + ") : " + pParamName + " = " + ret);
	} else {
		ret = "" + aa.env.getValue(pParamName);
		logDebug("Parameter (from batch job) : " + pParamName + " = " + ret);
	}
	return ret;
}
function objectExplore1(pObject)
{
try{

//	for (x in pObject)
//	{
//		logDebug("objectExplore[" + x + "] = " + pObject[x]);
//	}
	
	aa.print("Methods:")
	for (x in pObject) {
		if (typeof(pObject[x]) == "function") aa.print("   " + x);
	}

	aa.print("");
	aa.print("Properties:")
	for (x in pObject) {
		if (typeof(pObject[x]) != "function") aa.print("   " + x + " = " + pObject[x]);
	}
}
catch(err){
	aa.print("Error:" + err);
	//comment("Error:" + err);
}
}
