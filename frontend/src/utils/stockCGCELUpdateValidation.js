/**
 * @param {object} form
 * @returns {object} errors object
 */
function validateUpdate(form) {
  const errs = [];
  const errors_label = {};

  if (!form.spare_code) {
    errs.push("Spare Code is required");
    errors_label.spare_code = true;
  }
  if (!form.division) {
    errs.push("Division is required");
    errors_label.division = true;
  }
  if (!form.spare_description) {
    errs.push("Spare Description is required");
    errors_label.spare_description = true;
  }
  if (!form.qty || isNaN(form.qty) || Number(form.qty) <= 0) {
    errs.push("Enter required quanity");
    errors_label.qty = true;
  }
  if (!form.movement_type) {
    errs.push("Movement Type is required");
    errors_label.movement_type = true;
  }
  if (!form.qty) {
    errs.push("Quantity is required");
    errors_label.qty = true;
  }
  if (
    form.movement_type === "SPARE OUT" &&
    Number(form.qty) > Number(form.own_qty)
  ) {
    errs.push("Check stock availability");
    errors_label.qty = true;
  }
  if (!form.remark) {
    errs.push("Remark is required");
    errors_label.remark = true;
  }
  return [errs, errors_label];
}

export { validateUpdate };
