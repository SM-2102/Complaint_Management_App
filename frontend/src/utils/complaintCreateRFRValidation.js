/**
 * @param {object} form
 * @returns {object} errors object
 */
function validateCreateRFR(form) {
  const errors = [];
  const errors_label = {};

  if (!form.complaint_number) {
    errors.push("Complaint Number is required");
    errors_label.complaint_number = true;
  }
  if (!form.customer_type) {
    errors.push("Customer Type is required");
    errors_label.customer_type = true;
  }
  if(!form.product_model) {
    errors.push("Product Model is required");
    errors_label.product_model = true;
  }
  if(!form.product_serial_number) {
    errors.push("Serial Number is required");
    errors_label.product_serial_number = true;
  }
  if(form.customer_type === 'CUSTOMER') {
    if (!form.invoice_date) {
      errors.push("Invoice Date is required");
      errors_label.invoice_date = true;
    }
    if(!form.invoice_number) {
      errors.push("Invoice Number is required");
      errors_label.invoice_number = true;
    }
    if(!form.purchased_from) {
      errors.push("Purchased From is required");
      errors_label.purchased_from = true;
    }
  } else if(form.customer_type === 'DEALER') {
    if(!form.distributor_name) {
      errors.push("Distributor Name is required");
      errors_label.distributor_name = true;
    }
  }
  if(!form.replacement_reason) {
    errors.push("Replacement Reason is required");
    errors_label.replacement_reason = true;
  }
  if(!form.replacement_remark) {
    errors.push("Replacement Remark is required");
    errors_label.replacement_remark = true;
  }

  if (!form.current_status) {
    errors.push("Current Status is required");
    errors_label.current_status = true;
  }
 
  return [errors, errors_label];
}

export { validateCreateRFR };
