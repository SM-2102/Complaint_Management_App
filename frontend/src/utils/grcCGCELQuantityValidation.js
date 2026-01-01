/**
 * Validates row quantities before execution
 * @param {Array} rows
 * @returns {{ valid: boolean, message?: string }}
 */
function validateReturnQuantities(rows) {
  for (const row of rows) {
    const good = Number(row.good_qty) || 0;
    const defective = Number(row.defective_qty) || 0;
    const pending = Number(row.actual_pending_qty) || 0;

    if (good + defective > pending) {
      return {
        valid: false,
        message: `${row.spare_code}: Quanity Mismatch`,
      };
    }
  }

  return { valid: true };
}

export { validateReturnQuantities };
