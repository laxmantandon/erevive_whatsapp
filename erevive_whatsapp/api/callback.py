import frappe
from werkzeug.wrappers import Response

@frappe.whitelist(allow_guest=True)
def callback():
    if frappe.request.method == "GET":

        hubchallange = frappe.form_dict.get("hub.challenge")
        # frappe.log_error(frappe.request.data, 'whatsapp_callback_get')
        return Response(hubchallange)

    if frappe.request.method == "POST":
        try:
            frappe.get_doc({
                "doctype": "Whatsapp Callback",
                "response": frappe.request.data
            }).insert(ignore_permissions=True)

        except Exception as e:
            frappe.log_error(e, 'whatsapp_callback')
        finally:
            frappe.db.commit()
