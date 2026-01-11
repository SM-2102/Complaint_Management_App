/**
 * @param {object} form
 * @returns {object} errors object
 */
function validateCustomer(form, showContact2) {
  const errors = [];
  const errors_label = {};
  if (!form.name || form.name.length < 3) {
    errors.push("Customer name is required");
    errors_label.name = true;
  }
  if (!form.address1) {
    errors.push("Address1 is required");
    errors_label.address1 = true;
  }
  if (!form.city) {
    errors.push("City is required");
    errors_label.city = true;
  }
  if (!form.pin || !/^\d{6}$/.test(form.pin)) {
    errors.push("PIN must be 6 digits");
    errors_label.pin = true;
  }
  if (!form.consignee_address1) {
    errors.push("Consignee Address1 is required");
    errors_label.consignee_address1 = true;
  }
  if (!form.consignee_city) {
    errors.push("Consignee City is required");
    errors_label.consignee_city = true;
  }
  if (!form.consignee_pin || !/^\d{6}$/.test(form.consignee_pin)) {
    errors.push("Consignee PIN must be 6 digits");
    errors_label.consignee_pin = true;
  }
  if (!form.contact1 || !/^\d{10}$/.test(form.contact1)) {
    errors.push("Contact 1 must be 10 digits");
    errors_label.contact1 = true;
  }
  if (showContact2 && form.contact2 && !/^\d{10}$/.test(form.contact2)) {
    errors.push("Contact 2 must be 10 digits");
    errors_label.contact2 = true;
  }
  if (form.gst && !/^[A-Z0-9]{15}$/.test(form.gst)) {
    errors.push("GST must be 15 characters");
    errors_label.gst = true;
  }
  return [errors, errors_label];
}

export { validateCustomer };
