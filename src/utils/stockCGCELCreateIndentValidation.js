/**
 * @param {object} form
 * @returns {object} errors object
 */
function validateCreate(form) {
  const errs = [];
  const errors_label = {};

  if (!form.spare_code) {
    errs.push("Spare Code is required");
    errors_label.spare_code = true;
  }
  if (
    !form.indent_qty ||
    isNaN(form.indent_qty) ||
    Number(form.indent_qty) <= 0
  ) {
    errs.push("Enter required quanity");
    errors_label.indent_qty = true;
  }
  if (!form.party_name) {
    errs.push("Ordered For is required");
    errors_label.party_name = true;
  }
  if (!form.order_number) {
    errs.push("Order Number is required");
    errors_label.order_number = true;
  }
  if (!form.order_date) {
    errs.push("Order Date is required");
    errors_label.order_date = true;
  }
  if (!form.remark) {
    errs.push("Remark is required");
    errors_label.remark = true;
  }
  return [errs, errors_label];
}

export { validateCreate };
