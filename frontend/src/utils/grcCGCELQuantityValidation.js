/**
 * Validates row quantities before execution
 * @param {Array} rows
 * @returns {{ valid: boolean, message?: string, failingIndices?: number[] }}
 */
function validateReturnQuantities(rows) {
  const failingIndices = [];
  rows.forEach((row, idx) => {
    const good = Number(row.good_qty) || 0;
    const defective = Number(row.defective_qty) || 0;
    const pending = Number(row.actual_pending_qty) || 0;

    if (good + defective > pending) {
      failingIndices.push(idx);
    }
  });

  if (failingIndices.length > 0) {
    return {
      valid: false,
      message: "Quantity mismatch.",
      failingIndices,
    };
  }

  return { valid: true, failingIndices: [] };
}

export { validateReturnQuantities };
