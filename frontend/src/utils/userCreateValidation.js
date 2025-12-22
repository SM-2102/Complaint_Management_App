/**
 * @param {object} form
 * @returns {object} errors object
 */
function validateCreateUser(form) {
  const errs = [];
  if (!form.username || form.username.length < 3) {
    errs.push("Enter your full name");
  }
  if (!form.password || form.password.length < 6) {
    errs.push("Password is too short");
  }
  if (!form.phone_number || !/^\d{10}$/.test(form.phone_number)) {
    errs.push("Invalid contact number");
  }
  return errs;
}

export { validateCreateUser };
