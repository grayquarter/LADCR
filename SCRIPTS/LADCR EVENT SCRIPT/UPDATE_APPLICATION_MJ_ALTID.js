//
var thisActivityType = null
if(getAppSpecific("Retailer Commercial Cannabis Activity license in an area of Undue Concentration?") != null)
	{
	var thisRecType = "PCN"
	}
else
	{
	var thisRecType = "NONPCN"
	}

/* C – Cultivation (any and all)
Adult-Use Cultivation Small Indoor,Adult-Use Cultivation Medium Indoor,Adult-Use Cultivation Specialty Indoor,Medical Cultivation Small Indoor,Medical Cultivation Medium Indoor,Medical Cultivation Specialty Indoor
*/
var ACSI = getAppSpecific("Adult-Use Cultivation Small Indoor");
var ACMI = getAppSpecific("Adult-Use Cultivation Medium Indoor");
var ACSPI = getAppSpecific("Adult-Use Cultivation Specialty Indoor");
var MCSI = getAppSpecific("Medical Cultivation Small Indoor");
var MCMI = getAppSpecific("Medical Cultivation Medium Indoor");
var MCSPI = getAppSpecific("Medical Cultivation Specialty Indoor");
if(ACSI != null ||  ACMI != null && ACSPI != null || MCSI != null  || MCMI != null || MCSPI != null)
	{
	thisActivityType = "C"
	}
/*V – Manufacture Level 2 (volatile)
Adult-Use Manufacturer Level 2,Medical Manufacturer Level 2
*/
var AML2 = getAppSpecific("Adult-Use Manufacturer Level 2");
var MML2 = getAppSpecific("Medical Manufacturer Level 2");
if(AML2 != null || MML2 != null)
	{
	thisActivityType = "V"
	}
/* D – Distribution Transport Only
Distributor Transport Only,Medical Distributor Transport Only,Adult-Use Distributor Transport Only 
*/
var DTO = getAppSpecific("Distribution Transport Only");
var ADTO = getAppSpecific("Adult-Use Distributor Transport Only");
var MDTO = getAppSpecific("Medical Distributor Transport Only");
if(DTO != null || ADTO != null || MDTO != null)
	{
	thisActivityType = "D"
	}
/* R - Retail Adult-Use Retail,Medical Retail
*/
var AR = getAppSpecific("Adult-Use Retail");
var MR = getAppSpecific("Medical Retail");
if(AR != null || MR != null )
	{
	thisActivityType = "R"
	}
/* T - Testing 
*/
if(getAppSpecific("Testing") != null)
	{
	thisActivityType = "T"
	}
/* O - Other
Adult-Use Distributor,Medical Distributor,Adult-Use Manufacturer Level 1,Adult-Use Delivery Only,Medical Manufacturer Level 1,Medical Delivery Only,Adult-Use Microbusiness,Medical Microbusiness
*/
var AD = getAppSpecific("Adult-Use Distributor");
var MD = getAppSpecific("Medical Distributor");
var AML1 = getAppSpecific("Adult-Use Manufacturer Level 1");
var MML1 = getAppSpecific("Adult-Use Manufacturer Level 1");
var ADO = getAppSpecific("Adult-Use Delivery Only");
var AMO = getAppSpecific("Medical Delivery Only");
var AMB = getAppSpecific("Adult-Use Microbusiness");
var MMB = getAppSpecific("Medical Microbusiness");
if(AD != null || MD != null || AML1 != null || MML1 != null || ADO != null || AMO != null || AMB != null || MMB != null  )
	{
	thisActivityType = "O"
	}

// Update the AltID
lacdUpdateAltID(capId,thisRecType,capId.getCustomID(), ActivityType)