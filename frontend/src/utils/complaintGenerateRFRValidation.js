/**
 * @param {object} form
 * @returns {object} errors object
 */
function validateGenerateRFR(form) {
  const errors = [];
  const errors_label = {};

  if (!form.product_division) {
    errors.push("Division is required");
    errors_label.product_division = true;
  }
  if(!form.rfr_type) {
    errors.push("RFR Type is required");
    errors_label.rfr_type = true;
  }
  if(!form.product_type) {
    errors.push("Product Type is required");
    errors_label.product_type = true;
  }
  if(!form.rfr_number) {
    errors.push("RFR Number is required");
    errors_label.rfr_number = true;
  }
  return [errors, errors_label];
}

export { validateGenerateRFR };
