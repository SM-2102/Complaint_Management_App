/**
 * @param {object} form
 * @returns {object} errors object
 */
function validateCreateEmployee(form) {
  const errs = [];
  const errors_label = {};

  if (!form.name || form.name.length < 3) {
    errs.push("Enter your full name");
    errors_label.name = true;
  }
  if (!form.dob) {
    errs.push("Date of birth is required");
    errors_label.dob = true;
  }

  if (!form.phone_number || !/^\d{10}$/.test(form.phone_number)) {
    errs.push("Invalid contact number");
    errors_label.phone_number = true;
  }
  if (!form.address || form.address.length < 5) {
    errs.push("Enter a valid address");
    errors_label.address = true;
  }
  if (form.email && !/^[\w\.-]+@[\w\.-]+\.\w+$/.test(form.email)) {
    errs.push("Invalid email address");
    errors_label.email = true;
  }
  if (
    form.aadhar &&
    (!/^[0-9]{12}$/.test(form.aadhar) || form.aadhar.length !== 12)
  ) {
    errs.push("Aadhar must be 12 digits");
    errors_label.aadhar = true;
  }
  if (form.pan && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan)) {
    errs.push("Invalid PAN format");
    errors_label.pan = true;
  }
  if (!form.joining_date) {
    errs.push("Joining date is required");
    errors_label.joining_date = true;
  }
  if (
    form.joining_date &&
    form.dob &&
    new Date(form.joining_date) < new Date(form.dob)
  ) {
    errs.push("Invalid joining date");
    errors_label.joining_date = true;
  }
  if (!form.role) {
    errs.push("Role is required");
    errors_label.role = true;
  }
  return [errs, errors_label];
}

export { validateCreateEmployee };
