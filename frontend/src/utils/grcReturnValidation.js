/**
 * @param {object} form
 * @returns {object} errors object
 */
function validateReturn(form) {
  const errs = [];
  const errors_label = {};

  if (form.action_type == "Finalize") {
    if (!form.sent_through) {
      errs.push("Returned Through is required");
      errors_label.sent_through = true;
    }
    if (!form.docket_number) {
      errs.push("Consignment No. is required");
      errors_label.docket_number = true;
    }
  }

  return [errs, errors_label];
}

export { validateReturn };
