import frappe
from werkzeug.wrappers import Response

@frappe.whitelist(allow_guest=True)
def callback():
    frappe.log_error(frappe.request.data)

    if frappe.request.method == "GET":

        hubchallange = frappe.form_dict.get("hub.challenge")
        frappe.log_error(frappe.request.data)
        return Response(hubchallange)

    if frappe.request.method == "POST":
        frappe.log_error(frappe.request.data)

