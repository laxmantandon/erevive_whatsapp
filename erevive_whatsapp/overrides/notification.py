import frappe
from frappe import _
from frappe.email.doctype.notification.notification import Notification, get_context, json
from erevive_whatsapp.api.whatsapp import send_whatsapp_msg

class SendNotification(Notification):
    def validate(self):
        self.validate_etpl_whatsapp_settings()

    def validate_etpl_whatsapp_settings(self):
        if self.enabled and self.channel == "WhatsApp" \
            and not frappe.db.get_single_value("ETPL Whatsapp Settings", "url"):
            frappe.throw(_("Please enable Whatsapp settings to send WhatsApp messages"))

    def send(self, doc):
        context = get_context(doc)
        context = {"doc": doc, "alert": self, "comments": None}
        if doc.get("_comments"):
            context["comments"] = json.loads(doc.get("_comments"))

        if self.is_standard:
            self.load_standard_properties(context)

        try:
            if self.channel == 'WhatsApp':
                receivers = self.get_receiver_list(doc, context)
                send_whatsapp_msg(doc, self, receivers)
        except:
            frappe.log_error(title='Failed to send notification', message=frappe.get_traceback())

        super(SendNotification, self).send(doc)