/**
 * @param {object} form
 * @returns {object} errors object
 */
function validateCreateComplaint(form, showContact2, entryType) {
  const errors = [];
  const errors_label = {};

  if (!entryType) {
    errors.push("Entry Type is required");
    errors_label.entryType = true;
  }
  if (!form.complaint_number) {
    errors.push("Complaint Number is required");
    errors_label.complaint_number = true;
  }
  if (!form.complaint_head) {
    errors.push("Complaint Head is required");
    errors_label.complaint_head = true;
  }
  if (!form.complaint_type) {
    errors.push("Complaint Type is required");
    errors_label.complaint_type = true;
  }
  if (!form.customer_type) {
    errors.push("Customer Type is required");
    errors_label.customer_type = true;
  }
  if (!form.product_division) {
    errors.push("Division is required");
    errors_label.product_division = true;
  }
  if (!form.customer_name || form.customer_name.length < 3) {
    errors.push("Customer name is required");
    errors_label.customer_name = true;
  }
  if (!form.customer_address1) {
    errors.push("Address1 is required");
    errors_label.customer_address1 = true;
  }
  if (!form.customer_city) {
    errors.push("City is required");
    errors_label.customer_city = true;
  }
  if (!form.customer_pincode || !/^\d{6}$/.test(form.customer_pincode)) {
    errors.push("PIN must be 6 digits");
    errors_label.customer_pincode = true;
  }
  if (!form.customer_contact1 || !/^\d{10}$/.test(form.customer_contact1)) {
    errors.push("Contact 1 must be 10 digits");
    errors_label.customer_contact1 = true;
  }
  if (
    showContact2 &&
    form.customer_contact2 &&
    !/^\d{10}$/.test(form.customer_contact2)
  ) {
    errors.push("Contact 2 must be 10 digits");
    errors_label.customer_contact2 = true;
  }
  if (form.updated_time && !/^\d{2}-\d{4}$/.test(form.updated_time)) {
    errors.push("Updated Time Format : DD-HHMM");
    errors_label.updated_time = true;
  }
  if (!form.current_status) {
    errors.push("Current Status is required");
    errors_label.current_status = true;
  }
  if (!form.action_by) {
    errors.push("Action By is required");
    errors_label.action_by = true;
  }
  if (!form.technician) {
    errors.push("Technician Responsible is required");
    errors_label.technician = true;
  }
  if (!form.action_head) {
    errors.push("Action Required is required");
    errors_label.action_head = true;
  }
  if (!form.complaint_priority) {
    errors.push("Action Priority is required");
    errors_label.complaint_priority = true;
  }
  return [errors, errors_label];
}

export { validateCreateComplaint };
