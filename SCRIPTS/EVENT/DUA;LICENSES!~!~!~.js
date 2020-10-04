
if (documentUploadedFrom == "ACA" && partialCap && documentModelArray) {
	var documentModels = documentModelArray.toArray();
	var documentModel = null;
	var conditionNumber = 0;
	logDebug("documentModels.length = " + documentModels.length);
	for (i = 0; i < documentModels.length; i++) {
		documentModel = documentModels[i];
		conditionNumber = documentModel.getConditionNumber();
		logDebug(" i = " + i);
		logDebug("Condition Number = " + conditionNumber);
		if (conditionNumber != null && conditionNumber != 0) {
			var capConditionResult = aa.capCondition.getCapCondition(capId, conditionNumber);
			if (capConditionResult.getSuccess()) {
				var capCondition = capConditionResult.getOutput();
				if (capCondition.getCapConditionModel()) {
					var conditionGroup = capCondition.getConditionGroup();
					var conditionName = capCondition.getConditionDescription();
					documentModel.setDocCategory(conditionName);
					documentModel.setDocDepartment(conditionGroup);
					logDebug("Condition Name - " + conditionName);
					logDebug("Condition Group - " + conditionGroup)
					var updateDocumentResult = aa.document.updateDocument(documentModel);
					if (updateDocumentResult.getSuccess()) {
						logDebug("Update document model successfully - " + documentModel.getDocName());
					} else {
						logDebug("Update document model failed - " + documentModel.getDocName());
					}
				} else {
					logDebug("Resulting capConditionModel is null " + conditionNumber);
				}
			} else {
				logDebug("no condition found " + conditionNumber);
			}
		} else {
			logDebug("No condition number - " + documentModel.getDocName());
		}
	}
}

// Begin script to notify back office of documents added to submitted applications
include("DOC_UPLOAD_NOTIFY");
// end script on notify documents 