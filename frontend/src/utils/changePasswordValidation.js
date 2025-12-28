/**
 * @param {object} form
 * @returns {object} errors object
 */
function validateChangePassword(form) {
  const errs = [];
  if (!form.old_password || form.old_password.length < 6) {
    errs.push("Old password is too short");
  }
  if (!form.new_password || form.new_password.length < 6) {
    errs.push("New password is too short");
  }
  if (form.old_password === form.new_password) {
    errs.push("Cannot reuse old password");
  }
  if (!form.confirm_password || form.confirm_password.length < 6) {
    errs.push("Confirm password is too short");
  }
  if (form.new_password !== form.confirm_password) {
    errs.push("New passwords do not match");
  }
  return errs;
}

export { validateChangePassword };
