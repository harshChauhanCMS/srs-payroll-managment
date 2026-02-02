/**
 * Salary calculation helpers (mirror of backend formulas).
 * Standard: 26 working days/month, ESI ceiling 21000, PF 12%, ESI 0.75%.
 */

const STANDARD_WORKING_DAYS = 26;
const ESI_CEILING = 21000;
const PF_RATE = 0.12;
const ESI_RATE = 0.0075;

function round(num) {
  return Math.round(Number(num) || 0);
}

/**
 * Payable days = present days + national holiday (if not entered directly)
 */
export function getPayableDays(presentDays, nationalHoliday, payableDaysInput) {
  const present = Number(presentDays) || 0;
  const holiday = Number(nationalHoliday) || 0;
  const direct = Number(payableDaysInput);
  if (direct > 0) return direct;
  return present + holiday;
}

/**
 * Basic Earned = ROUND((Basic Monthly Rate / 26) * Payable Days, 0)
 */
export function calcBasicEarned(basicMonthly, payableDays) {
  return round((Number(basicMonthly) || 0) / STANDARD_WORKING_DAYS * (Number(payableDays) || 0));
}

/**
 * HRA Earned = ROUND((HRA Monthly Rate / 26) * Payable Days, 0)
 */
export function calcHraEarned(hraMonthly, payableDays) {
  return round((Number(hraMonthly) || 0) / STANDARD_WORKING_DAYS * (Number(payableDays) || 0));
}

/**
 * Other Allowance Earned = ROUND((Other Allowance / 26) * Payable Days, 0)
 */
export function calcOtherEarned(otherMonthly, payableDays) {
  return round((Number(otherMonthly) || 0) / STANDARD_WORKING_DAYS * (Number(payableDays) || 0));
}

/**
 * Leave Earned = ROUND((Leave Rate / 26) * Payable Days, 0) — or use direct leaveEarnings
 */
export function calcLeaveEarned(leaveMonthly, payableDays) {
  return round((Number(leaveMonthly) || 0) / STANDARD_WORKING_DAYS * (Number(payableDays) || 0));
}

/**
 * Bonus Earned = ROUND((Bonus Rate / 26) * Payable Days, 0) — or use direct bonusEarnings
 */
export function calcBonusEarned(bonusMonthly, payableDays) {
  return round((Number(bonusMonthly) || 0) / STANDARD_WORKING_DAYS * (Number(payableDays) || 0));
}

/**
 * Total Earning = Basic Earned + HRA Earned + Other Earned + Leave Earnings + Bonus Earnings
 */
export function calcTotalEarning(basicEarned, hraEarned, otherEarned, leaveEarnings, bonusEarnings) {
  return (
    (Number(basicEarned) || 0) +
    (Number(hraEarned) || 0) +
    (Number(otherEarned) || 0) +
    (Number(leaveEarnings) || 0) +
    (Number(bonusEarnings) || 0)
  );
}

/**
 * Incentive Amt. = ROUND((Basic/26/8)*2*OT_hours, 0). If OT in days: OT_hours = overtimeDays * 8
 */
export function calcIncentive(basicMonthly, overtimeDays) {
  const basic = Number(basicMonthly) || 0;
  const otDays = Number(overtimeDays) || 0;
  const otHours = otDays * 8;
  return round((basic / STANDARD_WORKING_DAYS / 8) * 2 * otHours);
}

/**
 * OT Amount (if using daily rate * OT days): ROUND(OT_rate * OT_days, 0)
 */
export function calcOtAmount(otRatePerDay, overtimeDays) {
  return round((Number(otRatePerDay) || 0) * (Number(overtimeDays) || 0));
}

/**
 * Gross = Total Earning + Incentive
 */
export function calcGross(totalEarning, incentive) {
  return round((Number(totalEarning) || 0) + (Number(incentive) || 0));
}

/**
 * PF @12% = ROUND(Basic Earned * 12%, 0)
 */
export function calcPfDeduction(basicEarned) {
  return round((Number(basicEarned) || 0) * PF_RATE);
}

/**
 * ESI 0.75% = IF(Gross < 21000, ROUND(Gross * 0.75%, 0), 0)
 */
export function calcEsiDeduction(gross) {
  const g = Number(gross) || 0;
  if (g >= ESI_CEILING) return 0;
  return round(g * ESI_RATE);
}

/**
 * Total Deductions = PF + ESI + LWF + HWF + GTLI + Misc + shoes + jacket + canteen + iCard
 */
export function calcTotalDeductions(
  pfDeduction,
  esiDeduction,
  labourWelfareFund,
  haryanaWelfareFund,
  groupTermLifeInsurance,
  miscellaneousDeduction,
  shoesDeduction,
  jacketDeduction,
  canteenDeduction,
  iCardDeduction,
) {
  return (
    (Number(pfDeduction) || 0) +
    (Number(esiDeduction) || 0) +
    (Number(labourWelfareFund) || 0) +
    (Number(haryanaWelfareFund) || 0) +
    (Number(groupTermLifeInsurance) || 0) +
    (Number(miscellaneousDeduction) || 0) +
    (Number(shoesDeduction) || 0) +
    (Number(jacketDeduction) || 0) +
    (Number(canteenDeduction) || 0) +
    (Number(iCardDeduction) || 0)
  );
}

/**
 * Net Payment / Amount = ROUND(Gross - Total Deductions, 0)
 */
export function calcNetPayment(gross, totalDeductions) {
  return round((Number(gross) || 0) - (Number(totalDeductions) || 0));
}

/**
 * Run all calculations from form values; returns object of calculated fields.
 */
export function runAllCalculations(values) {
  const payableDays = getPayableDays(
    values.presentDays,
    values.nationalHoliday,
    values.payableDays,
  );
  const basicEarned = calcBasicEarned(values.basic, payableDays);
  const hraEarned = calcHraEarned(values.houseRentAllowance, payableDays);
  const otherEarned = calcOtherEarned(values.otherAllowance, payableDays);
  const leaveEarnings = Number(values.leaveEarnings) || 0;
  const bonusEarnings = Number(values.bonusEarnings) || 0;
  const arrear = Number(values.arrear) || 0;
  const totalEarning =
    calcTotalEarning(
      basicEarned,
      hraEarned,
      otherEarned,
      leaveEarnings,
      bonusEarnings,
    ) + arrear;
  const incentive = calcIncentive(values.basic, values.overtimeDays);
  const gross = calcGross(totalEarning, incentive);
  const esiApplicableGross = gross;
  const pfDeduction = calcPfDeduction(basicEarned);
  const esiDeduction = calcEsiDeduction(gross);
  const totalDeductions = calcTotalDeductions(
    pfDeduction,
    esiDeduction,
    values.labourWelfareFund,
    values.haryanaWelfareFund,
    values.groupTermLifeInsurance,
    values.miscellaneousDeduction,
    values.shoesDeduction,
    values.jacketDeduction,
    values.canteenDeduction,
    values.iCardDeduction,
  );
  const netPayment = calcNetPayment(gross, totalDeductions);
  const roundedAmount = round(netPayment);

  return {
    payableDays,
    basicEarned,
    hraEarned,
    totalEarning,
    incentive,
    gross,
    esiApplicableGross,
    pfDeduction,
    esiDeduction,
    totalDeductions,
    netPayment,
    roundedAmount,
    totalPayable: roundedAmount,
    amount: roundedAmount,
  };
}
