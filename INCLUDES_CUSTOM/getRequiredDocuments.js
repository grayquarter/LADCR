function getRequiredDocuments(isPageFlow) {
	// 01/24/20: Removed check for MANAGEMENT COMPANIES table entry
	// 05/08/20: Updated for next phase of license applications and renewals
	// 08/26/20: updated for Pre-App
	// 09/09/20: Added Modification Request Form
	// 09/11/20: app renewal logic
	// 10/01/20: added PCN Request Form
	// 10/06/20: added more stuff
		
		logDebug("start getRequiredDocuments(" + [].slice.call(arguments) + ")");
	
		//TODO: put in checks to validate record types and reference conditions.
		var capToUse = capId;
		if (isPageFlow) {
			capToUse = cap;
		}
		var requirementArray = [];
	
		/*------------------------------------------------------------------------------------------------------/
		| Load up Record Types : NEEDS REVIEW, map variables to record types
		/------------------------------------------------------------------------------------------------------*/
		var isApplication = appMatch("Licenses/*/*/Application");
		var isAttestationAmendment = appMatch("Licenses/*/*/Incomplete Attestation");
		var isRenewal = appMatch("Licenses/*/*/Renewal");
		var isOwner = appMatch("Licenses/*/*/Owner Submittal");
		var isOwnerAttestation = false; // not used for LADCR appMatch("Licenses/Cannabis/Application Amendment/Incomplete Attestation");
		var isCEOAttestation = appMatch("Licenses/Cannabis/Event Organzier/Incomplete Attestation");
		var isTemporaryEventAttestation = appMatch("Licenses/Cannabis/Temporary Event/Incomplete Attestation");
		var isModRequestAmd = appMatch("Licenses/Cannabis/Application Amendment/Application");
		
		/*------------------------------------------------------------------------------------------------------/
		| Load up Standard Conditions :
		/------------------------------------------------------------------------------------------------------*/
	
		var DiagramOfPremises = {condition: "Diagram of Premises",document: "Diagram of Premises"};
		var DocOfLocalCompliance = {condition : "Documentation of Local Compliance",document: "Documentation of Local Compliance"};
		//var ProofOfBondInsurance = {condition : "Proof of Bond / Insurance",document :  "Proof of Bond / Insurance"};
		var IndemnificationAgreement = {condition : "Indemnification Agreement",document : "Indemnification Agreement"};
		//var CommunityBenefitAgreement = {condition : "Community Benefit Agreement",document : "Community Benefit Agreement"};
		var BusinessTaxRegistrationCertificate = {condition: "Business Tax Registration Certificate",document: "Business Tax Registration Certificate"};
		var CannabisWasteManagementPlan = {condition: "Cannabis Waste Management Plan",document: "Cannabis Waste Management Plan"}; 
		var DiversityPlan = {condition: "Diversity Plan",document: "Diversity Plan"}; 
		//var CUPAPermit = {condition : "CUPA Permit",document : "CUPA Permit"};
		var EnergyEfficiencyPlan = {condition: "Energy Efficiency Plan",document: "Energy Efficiency Plan"}; 
		var CommercialCannabisActivityPlan = {condition: "Energy Efficiency Plan",document: "Energy Efficiency Plan"}; //defined above
		var FinancialInformation = {condition: "Financial Information",document: "Financial Information"}; 
		var FireSafetyPlan = {condition: "Fire Safety Plan",document: "Fire Safety Plan"}; 
		var GovernmentIssuedIdentification = {condition: "Government-Issued Identification",document: "Government-Issued Identification"}; 
		//var HiringPlan = {condition: "Hiring Plan",document: "Hiring Plan"}; 
		var ISO170325Accreditation = {condition: "ISO 170325 Accreditation",document: "ISO 170325 Accreditation"}; 
		var LaborPeaceAgreement = {condition: "Labor Peace Agreement Attestation Form",document: "Labor Peace Agreement Attestation Form"}; 
		var LaboratoryEmployeeQualifications = {condition: "Laboratory Employee Qualifications",document: "Laboratory Employee Qualifications"}; 
		//var LimitedAccessAreasPlan = {condition: "Limited Access Areas Plan",document: "Limited Access Areas Plan"}; 
		//var OrgChart = {condition: "Org. Chart",document: "Org. Chart"}; 
		//var RadiusMap = {condition: "Radius Map",document: "Radius Map"}; 
		var SamplingPlansProceduresAndProtocols = {condition: "Sampling Plans, Procedures and Protocols",document: "Sampling Plans, Procedures and Protocols"}; 
		//var SecurityPlan = {condition: "Security Plan",document: "Security Plan"}; 
		//var StaffingPlan = {condition: "Staffing Plan",document: "Staffing Plan"}; 
		var StandardOperatingProcedures = {condition: "Standard Operating Procedures",document: "Standard Operating Procedures"}; 
		var TestingMethodologies = {condition: "Testing Methodologies",document: "Testing Methodologies"}; 
		//var LiveScan = {condition: "Proof of Live Scan or Other Service",document: "Proof of Live Scan or Other Service"}; 
		var CourtRecords = {condition: "Court Records",document: "Court Records"};
		var GovernmentRecords = {condition: "Government Records",document: "Government Records"};
		var DeclarationArrest = {condition: "Declaration - Arrest or Conviction",document: "Declaration - Arrest or Conviction"};
		var OtherArrest = {condition: "Other Documents - Arrest or Conviction",document: "Other Documents - Arrest or Conviction"};
		var TaxRecords = {condition: "Tax Records",document: "Tax Records"};
		var FinancialRecordsWage = {condition: "Financial Records - Wage or Bank Statements",document: "Financial Records - Wage or Bank Statements"};
		var ReceiptOfAssistance = {condition: "Receipt of Government Assistance",document: "Receipt of Government Assistance"};
		var DeclarationIncome = {condition: "Declaration - Income",document: "Declaration - Income"};
		var OtherLowIncome = {condition: "Other Documents - Low Income Status",document: "Other Documents - Low Income Status"};
		var PropertyMortgageLease = {condition: "Property Deed, Mortgage, or Lease Agreement",document: "Property Deed, Mortgage, or Lease Agreement"};
		var FinancialLease = {condition: "Financial Records - Lease or Mortgage",document: "Financial Records - Lease or Mortgage"};
		var ProofOfAssistance = {condition: "Proof of Government Housing Assistance",document: "Proof of Government Housing Assistance"};
		var UtilityBills = {condition: "Utility Bills, Registration, or Similar Document",document: "Utility Bills, Registration, or Similar Document"};
		var EducationRecords = {condition: "Education Records",document: "Education Records"};
		var DeclarationAddress = {condition: "Declaration - Address",document: "Declaration - Address"};
		var DeclarationParent = {condition: "Declaration - Parent or Guardian",document: "Declaration - Parent or Guardian"};
		var OtherDispro = {condition: "Other Documents - Disproportionately Impacted Area",document: "Other Documents - Disproportionately Impacted Area"};
		var ExecutedTier1 = {condition: "Executed Tier 1 Contract",document: "Executed Tier 1 Contract"};
		var Tier1Attest = {condition: "Tier 1 Attestation",document: "Tier 1 Attestation"};
		var ExecutedTier2 = {condition: "Executed Tier 2 Contract",document: "Executed Tier 2 Contract"};
		var Tier2Attest = {condition: "Tier 2 Attestation",document: "Tier 2 Attestation"};
		var DeclarationPhase2Eligibility = {condition: "Declaration of Phase 2 Eligibility",document: "Declaration of Phase 2 Eligibility"};
	
		var contract2016 = {condition: "Contract Pre-2016",document: "Contract Pre-2016"};
		var lease2016 = {condition: "Lease Pre-2016",document: "Lease Pre-2016"};
		var formulation2016 = {condition: "Business Formulation Documents Pre-2016",document: "Business Formulation Documents Pre-2016"};
		var business2016 = {condition: "Business Records Pre-2016",document: "Business Records Pre-2016"};
		var other2016 = {condition: "Other Supporting Documents Pre-2016",document: "Other Supporting Documents Pre-2016"};
		var contract2017 = {condition: "Contract Pre-2017",document: "Contract Pre-2017"};
		var lease2017 = {condition: "Lease Pre-2017",document: "Lease Pre-2017"};
		var formulation2017 = {condition: "Business Formulation Documents Pre-2017",document: "Business Formulation Documents Pre-2017"};
		var business2017 = {condition: "Business Records Pre-2017",document: "Business Records Pre-2017"};
		var other2017 = {condition: "Other Supporting Documents Pre-2017",document: "Other Supporting Documents Pre-2017"};
		//var DeclarationEngagedActivities  = {condition: "Declaration - Engaged in Activities Prior to January 1, 2016",document: "Declaration - Engaged in Activities Prior to January 1, 2016"};
		//var DeclarationSuppliedEMMD  = {condition: "Declaration - Supplied EMMD Prior to January 1, 2017",document: "Declaration - Supplied EMMD Prior to January 1, 2017"};
	
		var OrganizationalChart = {condition: "Organizational Chart",document: "Organizational Chart"}; 
		var ProofOfBondOrIns = {condition: "Proof of Bond or Insurance",document: "Proof of Bond or Insurance"}; 
		//var CAOperationalReqs = {condition: "State of California Operational Requirements",document: "State of California Operational Requirements"}; 
		var LAFDNotification = {condition: "LAFD Statement of Intended Use",document: "LAFD Statement of Intended Use"}; 
		//var LAFDCUPA = {condition: "LAFD Certified Uniform Program Agency (CUPA)",document: "LAFD Certified Uniform Program Agency (CUPA)"}; 
		//var CommunityBenefits = {condition: "Community Benefits Agreement",document: "Community Benefits Agreement"}; 
		var DatedRadiusMap = {condition: "Dated Radius Map",document: "Dated Radius Map"}; 
		var TestingISO17025 = {condition: "ISO 17025 (Testing Applications Only)",document: "ISO 17025 (Testing Applications Only)"}; 
		var TestingPlan = {condition: "Testing Plan (Testing Applications Only)",document: "Testing Plan (Testing Applications Only)"}; 
	
		// new requirements 2/13/2019 JHS
	
		var bizFormOrg = {condition: "Business Formation and Organization Documents",document: "Business Formation and Organization Documents" };
		var ownDisclosure = { condition: "Ownership Disclosure Form", document: "Ownership Disclosure Form"};
		var retailerPlan = { condition: "Retailer Plan (Type 10 Applications Only)", document: "Retailer Plan (Type 10 Applications Only)" };
		var deliveryPlan = { condition: "Delivery Plan (Type 9 and Type 10 Applications Only)", document: "Delivery Plan (Type 9 and Type 10 Applications Only)"};
		var distributorPlan = { condition: "Distributor Plan (Distribution Applications Only)", document: "Distributor Plan (Distribution Applications Only)"};
		var manufacturerPlan = { condition: "Manufacturer Plan (Manufacturing Applications Only)", document: "Manufacturer Plan (Manufacturing Applications Only)"};
		var cultivatorPlan = { condition: "Cultivator Plan (Cultivation Applications Only)", document: "Cultivator Plan (Cultivation Applications Only)"};
		//var indemnificationAgreement = { condition: "Indemnification Agreement", document: "Indemnification Agreement"};
	
		// new requirements 2/28/2019 GH
		var managementCompanies = { condition: "Management Company Agreement", document: "Management Company Agreement"};
	
		// new requirements 5/8/2020 GH
		var bizFormOrg = {condition: "Business Formation and Organization Documents",document: "Business Formation and Organization Documents" };
		var BusinessPremisesDiagram = {condition: "Business Premises Diagram",document: "Business Premises Diagram"}; 
		var CertificateOfOccupancy = {condition: "Certificate of Occupancy",document: "Certificate of Occupancy"}; 
		var CommercialCannabisActivityPlan = {condition: "Commercial Cannabis Activity Plan",document: "Commercial Cannabis Activity Plan"}; 
		var DatedRadiusMap = {condition: "Dated Radius Map",document: "Dated Radius Map"}; 
		var EquityShareDocuments = {condition: "Equity Share Documents",document: "Equity Share Documents"}; 
		var EvidenceOfLegalRightToOccupy = {condition: "Evidence of Legal Right to Occupy",document: "Evidence of Legal Right to Occupy"}; 
		var ExecutedLeaseOrPropertyDeed = {condition: "Executed Lease or Property Deed",document: "Executed Lease or Property Deed"}; 
		var FinancialInformation = {condition: "Financial Information",document: "Financial Information"}; 
		var IndemnificationAgreement = {condition : "Indemnification Agreement",document : "Indemnification Agreement"};
		var SecurityPlan = {condition: "Security Plan",document: "Security Plan"}; 
		var SitePlan = {condition: "Site Plan",document: "Site Plan"}; 
		var StaffingPlan = {condition: "Staffing Plan",document: "Staffing Plan"}; 
		// added requirements 5/18/2020 GH
		var CEQAComplianceExemption = {condition: "CEQA Compliance/Exemption",document: "CEQA Compliance/Exemption"};
		var CUPAPermit = {condition : "CUPA Permit (If Applicable)",document : "CUPA Permit (If Applicable)"};
		// added requirements 8/26/2020 GH
		var Attestation = {condition: "Attestation",document: "Attestation"};
		// added requirements 9/9/2020 GH
		var ModificationRequestForm = {condition: "Modification Request Form",document: "Modification Request Form"};
		// added requirements 10/1/2020 GH
		var PCNRequestForm = {condition: "PCN Request Form",document: "PCN Request Form"};
		// added requirements 10/6/2020 GH
		var ProofDepositPropertyDeed = {condition: "Proof of Deposit or Property Deed",document: "Proof of Deposit or Property Deed"};
		var StakeholderInputRequest = {condition: "Stakeholder Input Request (PCN)",document: "Stakeholder Input Request (PCN)"};
		var PCNRequestForm = {condition: "PCN Request Form",document: "PCN Request Form"};
		
		//add requirements 10/8/2020 TT
		var ModificationCoverPage = {condition: "Application Modification Request - Cover Page",document: "Application Modification Request - Cover Page"};
		var Other = {condition: "Other",document: "Other"};
		var RadiusMapATT = {condition: "Radius Map Attestation",document: "Radius Map Attestation"};
		var PrimaryPersonnelOwner = {condition: "Primary Personnel and Owner Attestation",document: "Primary Personnel and Owner Attestation"};
		var ListofPrimaryPersonnelOwner = {condition: "List of Primary Personnel and Owner(s)",document: "List of Primary Personnel and Owner(s)"};
	
	
	
		/*------------------------------------------------------------------------------------------------------/
		| Load up Conditionals from Record
		/------------------------------------------------------------------------------------------------------*/
		var isMedical =  AInfo["Medical"] == "YES" || AInfo["Medical"] == "Yes"; 
		var isAdultUse =  AInfo["Adult Use"] == "YES" || AInfo["Adult Use"] == "Yes"; 
		//var isTesting = AInfo["Testing"] == "YES" || AInfo["Testing"] == "Yes"; 
		var isTesting = AInfo["Testing"] == "YES" || AInfo["Testing"] == "Yes" || AInfo["Use"] == "Testing"; //added 5/19/2020
		var isCultivation = AInfo["Adult-Use Cultivation Medium Indoor"] == "CHECKED" || AInfo["Adult-Use Cultivation Small Indoor"]  == "CHECKED" || AInfo["Adult-Use Cultivation Specialty Cottage Indoor"]  == "CHECKED" || 	AInfo["Adult-Use Cultivation Specialty Indoor"] == "CHECKED" || AInfo["Medical Cultivation Medium Indoor"] == "CHECKED" || AInfo["Medical Cultivation Small Indoor"] == "CHECKED" || AInfo["Medical Cultivation Specialty Cottage Indoor"] == "CHECKED" || AInfo["Medical Cultivation Specialty Indoor"] == "CHECKED";	
		var isTemporaryRequest = isASITrue(AInfo["Are you requesting a temporary license?"]); 
		//set isTemporaryRequest = true if ASI field is null or ""
		if (AInfo["Are you requesting a temporary license?"] == null || AInfo["Are you requesting a temporary license?"] == "") {
			isTemporaryRequest = true;
		}
		var isModRequest = AInfo["Are you submitting a Modification Request?"] == "YES" || AInfo["Are you submitting a Modification Request?"] == "Yes" || AInfo["Are you submitting a Modification Request?"] == "Y"; 
		var isAppRenewal = AInfo["Is this a Renewal?"] == "YES" || AInfo["Is this a Renewal?"] == "Yes" || AInfo["Is this a Renewal?"] == "Y"; 
		var isPCNRequest = AInfo["Retailer Commercial Cannabis Activity license in an area of Undue Concentration?"] == "YES" || AInfo["Retailer Commercial Cannabis Activity license in an area of Undue Concentration?"] == "Yes" || AInfo["Retailer Commercial Cannabis Activity license in an area of Undue Concentration?"] == "Y"; 
		var isLeaseOrOwnership = AInfo["Executed lease or ownership of the premises?"] == "YES" || AInfo["Retailer Commercial Cannabis Activity license in an area of Undue Concentration?"] == "Yes" || AInfo["Retailer Commercial Cannabis Activity license in an area of Undue Concentration?"] == "Y"; 
	
		//check to see if a temporary license has already been issued
		var vWFTaskHistory = aa.workflow.getWorkflowHistory(capId, 'Issuance', null).getOutput();
		var vTaskModel;
		var vTaskStatus;
		var x = 0;
		for (x in vWFTaskHistory) {
			vTaskModel = vWFTaskHistory[x];
			vTaskStatus = vTaskModel.getDisposition();
			if (vTaskStatus == 'Temporarily Issued') {
				isTemporaryRequest = false;
				break;
			}
		}
	
		if (isAttestationAmendment) {
			isTemporaryRequest = false;
		}
	
		logDebug("isTemporaryRequest: " + isTemporaryRequest);
			
		/*
		var business = getContactObj(capToUse, "Business");
		if (business && business.asi) {
			isSoleOwner = business.asi["What is your business's organizational structure?"] == "Sole Proprietorship";
		}
		*/
		
		/*------------------------------------------------------------------------------------------------------/
		| Business Rules : map variables to standard condition
		/------------------------------------------------------------------------------------------------------*/
	
		if (isOwner || isOwnerAttestation) {
			requirementArray.push(GovernmentIssuedIdentification);
			requirementArray.push(DeclarationPhase2Eligibility);
			if (isChecked("Court Records")) requirementArray.push(CourtRecords);
			if (isChecked("Government Records")) requirementArray.push(GovernmentRecords);
			if (isChecked("Declaration - Arrest or Conviction")) requirementArray.push(DeclarationArrest);
			if (isChecked("Other Documents - Arrest or Conviction")) requirementArray.push(OtherArrest);
			if (isChecked("Tax Records")) requirementArray.push(TaxRecords);
			if (isChecked("Financial Records - Wage or Bank Statements")) requirementArray.push(FinancialRecordsWage);
			if (isChecked("Receipt of Government Assistance")) requirementArray.push(ReceiptOfAssistance);
			if (isChecked("Declaration - Income")) requirementArray.push(DeclarationIncome);
			if (isChecked("Other Documents - Low Income Status")) requirementArray.push(OtherLowIncome);
			if (isChecked("Property Deed, Mortgage, or Lease Agreement")) requirementArray.push(PropertyMortgageLease);
			if (isChecked("Financial Records - Lease or Mortgage")) requirementArray.push(FinancialLease);
			if (isChecked("Proof of Government Housing Assistance")) requirementArray.push(ProofOfAssistance);
			if (isChecked("Utility Bills, Registration, or Similar Document")) requirementArray.push(UtilityBills);
			if (isChecked("Education Records")) requirementArray.push(EducationRecords);
			if (isChecked("Declaration - Address")) requirementArray.push(DeclarationAddress);
			if (isChecked("Declaration - Parent or Guardian")) requirementArray.push(DeclarationParent);
			if (isChecked("Other Documents - Disproportionately Impacted Area")) requirementArray.push(OtherDispro);
			if (isChecked("Executed Tier 1 Contract")) requirementArray.push(ExecutedTier1);
			if (isChecked("Tier 1 Attestation")) requirementArray.push(Tier1Attest);
			if (isChecked("Executed Tier 2 Contract")) requirementArray.push(ExecutedTier2);
			if (isChecked("Tier 2 Attestation")) requirementArray.push(Tier2Attest);
		}
	
		if ((isApplication || isAttestationAmendment) && !isOwnerAttestation) {
			// add for temp and annual
			// add always...
			if (true) { // for testing purposes - set to false to bypass
	
				// Pre-App requirements 8/26/2020
				if (isAppRenewal) {
					if (isModRequest) {
						requirementArray.push(ModificationRequestForm);
					}
				} else {		
					requirementArray.push(Attestation); 		
					requirementArray.push(BusinessPremisesDiagram); 		
					requirementArray.push(DatedRadiusMap); 					
					requirementArray.push(EvidenceOfLegalRightToOccupy); 
					requirementArray.push(ListofPrimaryPersonnelOwner);
					requirementArray.push(ownDisclosure);  
					requirementArray.push(SitePlan); 
				
					if (isPCNRequest) {
						requirementArray.push(PCNRequestForm);
						requirementArray.push(StakeholderInputRequest); 		
					}
					
					if(isLeaseOrOwnership) {
						requirementArray.push(ExecutedLeaseOrPropertyDeed); 		
						requirementArray.push(ProofDepositPropertyDeed); 		
	
					}
				}
				
	
	
				/*************************************************
				//updated 5/8/2020
				requirementArray.push(BusinessPremisesDiagram); 		
				requirementArray.push(CertificateOfOccupancy); 			
				requirementArray.push(CommercialCannabisActivityPlan); 	
				requirementArray.push(DatedRadiusMap); 					
				requirementArray.push(EquityShareDocuments); 			
				requirementArray.push(EvidenceOfLegalRightToOccupy); 	
				requirementArray.push(ExecutedLeaseOrPropertyDeed); 	
				requirementArray.push(FinancialInformation); 			
				requirementArray.push(IndemnificationAgreement); 		
				requirementArray.push(SecurityPlan); 					
				requirementArray.push(SitePlan); 						
				requirementArray.push(StaffingPlan); 					
				requirementArray.push(bizFormOrg); 		
				//updated 5/18/2020
				requirementArray.push(BusinessTaxRegistrationCertificate);
				requirementArray.push(CannabisWasteManagementPlan);
				requirementArray.push(CEQAComplianceExemption);
				//requirementArray.push(CUPAPermit);
				requirementArray.push(LaborPeaceAgreement); 
				requirementArray.push(managementCompanies);
				requirementArray.push(OrganizationalChart);
				requirementArray.push(ownDisclosure);  
				requirementArray.push(ProofOfBondOrIns);
				requirementArray.push(StandardOperatingProcedures);
				
				if (isTesting) {
					requirementArray.push(TestingISO17025);    
				}
				*****************************************************/
			}
			
			/*
			
			// disabled 09-17-2020 JSCHOMP not required for this release.
			
			if (!isTesting) {
				//requirementArray.push(DeclarationEngagedActivities);
				//requirementArray.push(DeclarationSuppliedEMMD);
			}
			
			// if full app, add all requirements
			if (!isTemporaryRequest) {
				//requirementArray.push(BusinessTaxRegistrationCertificate);
				requirementArray.push(CannabisWasteManagementPlan);
				//requirementArray.push(CommercialCannabisActivityPlan);
				requirementArray.push(DiversityPlan);
				requirementArray.push(FinancialInformation);
				requirementArray.push(FireSafetyPlan);
				//requirementArray.push(HiringPlan);
				//requirementArray.push(LaborPeaceAgreement); // moved below
				//requirementArray.push(LimitedAccessAreasPlan);
				//requirementArray.push(OrgChart); // moved below, renamed
				//requirementArray.push(RadiusMap);
				//requirementArray.push(SecurityPlan); // moved below
				//requirementArray.push(StaffingPlan); // moved below
				//requirementArray.push(ProofOfBondInsurance); // moved below, renamed
				//requirementArray.push(LiveScan);
				//requirementArray.push(CUPAPermit);
				requirementArray.push(IndemnificationAgreement);
				//requirementArray.push(CommunityBenefitAgreement);
				
				if (isTesting) {
					requirementArray.push(ISO170325Accreditation);
					requirementArray.push(LaboratoryEmployeeQualifications);					
					requirementArray.push(SamplingPlansProceduresAndProtocols);
					requirementArray.push(StandardOperatingProcedures);
					requirementArray.push(TestingMethodologies);
				}
				if (isCultivation) {
					requirementArray.push(EnergyEfficiencyPlan);
				}
			} else {
				// only add temp requirements
				//requirementArray.push(DocOfLocalCompliance);
				//requirementArray.push(DiagramOfPremises); //moved above
				//requirementArray.push(BusinessTaxRegistrationCertificate);
			}
			
			// add eligibility reqs based on selections
			if (isChecked("Contract Pre-2016")) requirementArray.push(contract2016);
			if (isChecked("Lease Pre-2016")) requirementArray.push(lease2016);
			if (isChecked("Business Formulation Documents Pre-2016")) requirementArray.push(formulation2016);
			if (isChecked("Business Records Pre-2016")) requirementArray.push(business2016);
			if (isChecked("Other Supporting Documents Pre-2016")) requirementArray.push(other2016);
			if (isChecked("Contract Pre-2017")) requirementArray.push(contract2017);
			if (isChecked("Lease Pre-2017")) requirementArray.push(lease2017);
			if (isChecked("Business Formulation Documents Pre-2017")) requirementArray.push(formulation2017);
			if (isChecked("Business Records Pre-2017")) requirementArray.push(business2017);
			if (isChecked("Other Supporting Documents Pre-2017")) requirementArray.push(other2017);
			// add Additional Requirements based on selections
			if (isChecked("Organizational Chart")) requirementArray.push(OrganizationalChart);
			if (isChecked("Proof of Bond or Insurance")) requirementArray.push(ProofOfBondOrIns);
			//if (isChecked("State of California Operational Requirements")) requirementArray.push(CAOperationalReqs);
			if (isChecked("LAFD Statement of Intended Use")) requirementArray.push(LAFDNotification);
			//if (isChecked("LAFD Certified Uniform Program Agency (CUPA)")) requirementArray.push(LAFDCUPA);
			//if (isChecked("Community Benefits Agreement")) requirementArray.push(CommunityBenefits);
			if (isChecked("Dated Radius Map")) requirementArray.push(DatedRadiusMap);
			if (isChecked("ISO 17025 (Testing Applications Only)")) requirementArray.push(TestingISO17025);
			if (isChecked("Testing Plan (Testing Applications Only)")) requirementArray.push(TestingPlan);
			if (isChecked("Labor Peace Agreement Attestation Form")) requirementArray.push(LaborPeaceAgreement);
			if (isChecked("Security Plan")) requirementArray.push(SecurityPlan);
			if (isChecked("Staffing Plan")) requirementArray.push(StaffingPlan);
			
			// added 2/13/19
			if (isChecked("Business Formation and Organization Documents")) requirementArray.push(bizFormOrg);
			if (isChecked("Ownership Disclosure Form")) requirementArray.push(ownDisclosure);
			if (isChecked("Retailer Plan (Type 10 Applications Only)")) requirementArray.push(retailerPlan);
			if (isChecked("Delivery Plan (Type 9 and Type 10 Applications Only)")) requirementArray.push(deliveryPlan);
			if (isChecked("Distributor Plan (Distribution Applications Only)")) requirementArray.push(distributorPlan);
			if (isChecked("Manufacturer Plan (Manufacturing Applications Only)")) requirementArray.push(manufacturerPlan);
			if (isChecked("Cultivator Plan (Cultivation Applications Only)")) requirementArray.push(cultivatorPlan);
			if (isChecked("Indemnification Agreement")) requirementArray.push(indemnificationAgreement);
			// added 2/28/2019 - check if entry in table for document requirement
			// commented out 1/24/2019
			//var relASIT = isPageFlow ? loadASITable4ACA("MANAGEMENT COMPANIES", capToUse) : loadASITable("MANAGEMENT COMPANIES",capToUse);
			//if (relASIT && relASIT.length > 0) {
			//	requirementArray.push(managementCompanies);
			//} 
			
			*/
// adding Modification Request Required Documents
if (isModRequestAmd) {
					
                    
if (isChecked(AInfo["Fictitious Business Name"])) {
    requirementArray.push(ModificationCoverPage);
    requirementArray.push(Attestation);
    requirementArray.push(ModificationRequestForm);
    requirementArray.push(Other);
}


		
if (isChecked(AInfo["Legal Entity Name Change"])) {
    requirementArray.push(ModificationCoverPage);
    requirementArray.push(Attestation); 
    requirementArray.push(ModificationRequestForm);
    requirementArray.push(Other);
}

if (isChecked(AInfo["Business Premises Diagram"])) {
    requirementArray.push(ModificationCoverPage);
    requirementArray.push(Attestation);
    requirementArray.push(ModificationRequestForm);
    requirementArray.push(Other);
    requirementArray.push(BusinessPremisesDiagram);
    requirementArray.push(SitePlan);

}


if (isChecked(AInfo["Business Premises Relocation"])) {
    requirementArray.push(ModificationCoverPage);
    requirementArray.push(Attestation);
    requirementArray.push(ModificationRequestForm);
    requirementArray.push(BusinessPremisesDiagram);
    requirementArray.push(SitePlan);
    requirementArray.push(CertificateOfOccupancy);
    requirementArray.push(DatedRadiusMap);
    requirementArray.push(EvidenceOfLegalRightToOccupy);
    requirementArray.push(ExecutedLeaseOrPropertyDeed);
    requirementArray.push(RadiusMapATT);
    requirementArray.push(PrimaryPersonnelOwner);

}

if (isChecked(AInfo["Ownership or Primary Changes"])) {

    requirementArray.push(ModificationCoverPage);
    requirementArray.push(Attestation);
    requirementArray.push(ModificationRequestForm);
    requirementArray.push(PrimaryPersonnelOwner);
    requirementArray.push(bizFormOrg);
    requirementArray.push(EquityShareDocuments);
    requirementArray.push(FinancialInformation);
    requirementArray.push(ListofPrimaryPersonnelOwner);
    requirementArray.push(ownDisclosure);
    requirementArray.push(OrganizationalChart);

}


if (isChecked(AInfo["New Cannabis Activity"])) {
    requirementArray.push(ModificationRequestForm);
    requirementArray.push(ModificationCoverPage);
    requirementArray.push(Attestation);
    requirementArray.push(CommercialCannabisActivityPlan);
    requirementArray.push(IndemnificationAgreement);
    requirementArray.push(LAFDNotification);
    requirementArray.push(StandardOperatingProcedures);
}


if (isChecked(AInfo["Other Contact Changes"])) {
    
    requirementArray.push(ModificationCoverPage);
    requirementArray.push(ModificationRequestForm);
    requirementArray.push(Attestation);
    requirementArray.push(bizFormOrg);
    requirementArray.push(OrganizationalChart);
}

if (isChecked(AInfo["Remove Cannabis Activity"])) {
    requirementArray.push(ModificationRequestForm);
    requirementArray.push(ModificationCoverPage);
    requirementArray.push(Attestation);
}

if (isChecked(AInfo["Other"])) {
    requirementArray.push(ModificationCoverPage);
    requirementArray.push(Attestation); 
    requirementArray.push(ModificationRequestForm); 
								
    }
}
		
	
		}
		logDebug("Num of Req Docs:" + requirementArray.length + " docs.");
		logDebug("All req docs: " + requirementArray);
	
		return requirementArray;
	}
	
	function isChecked(fld) {
		return (AInfo[fld] && "CHECKED".equals(AInfo[fld].toUpperCase()));
	}
	

