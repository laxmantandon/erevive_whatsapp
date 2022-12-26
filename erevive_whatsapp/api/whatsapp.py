import frappe
import json
from frappe.integrations.utils import make_post_request
from frappe.utils import random_string
from frappe.utils.file_manager import save_file

def send_whatsapp_msg(doc, context, receivers):
    try:
        url = frappe.db.get_single_value("ETPL Whatsapp Settings", "url")
        version = frappe.db.get_single_value(
            "ETPL Whatsapp Settings", "version")
        phone_number_id = frappe.db.get_single_value(
            "ETPL Whatsapp Settings", "phone_number_id")
        token = frappe.db.get_single_value(
            "ETPL Whatsapp Settings", "token")
        token = f"Bearer {token}"
        base_url = f"{url}/{version}/{phone_number_id}/messages"

        default_print_format = frappe.db.get_value(
                "Property Setter",
                dict(property="default_print_format", doc_type=doc.doctype),
                "value",
            )
        from frappe.www.printview import get_letter_head 
        letter_head = get_letter_head(doc, 0)
        pdf_data = get_pdf_data(doc.doctype, doc.name, default_print_format, letterhead=letter_head)
        file_name = f"{random_string(30)}.pdf"
        save_file(file_name, pdf_data, '', '', folder='Home', is_private=0)
        document_link = f"{frappe.utils.get_url()}/files/{file_name}"
                        
        for receiver in receivers:

            payload = json.dumps({
                "messaging_product": "whatsapp",
                "to": receiver,
                "type": "template",
                "template": {
                    "name": "invoice",
                    "language": {
                        "code": "en_US"
                    },
                    "components": [
                        {
                            "type": "header",
                            "parameters": [
                                {
                                    "type": "document",
                                    "document": {
                                        "link": document_link
                                    }
                                }
                            ]
                        },
                        {
                            "type": "body",
                            "parameters": [
                                {
                                    "type": "text",
                                    "text": doc.name
                                }
                            ]
                        }
                    ]
                }
            })
            headers = {
                'Authorization': token,
                'Content-Type': 'application/json'
            }

            response = make_post_request(
                base_url, headers=headers, data=payload)
            frappe.log_error(response)
        frappe.msgprint("Whatsapp Sent")

    except Exception as e:
        frappe.log_error(e)
        
        
def get_pdf_data(doctype, name, print_format: None, letterhead: None):
    """Document -> HTML -> PDF."""
    html = frappe.get_print(doctype, name, print_format, letterhead)
    return frappe.utils.pdf.get_pdf(html)


