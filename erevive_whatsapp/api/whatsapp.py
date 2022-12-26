import frappe
import json
from frappe.integrations.utils import make_post_request
from frappe.utils import random_string
from frappe.utils.file_manager import save_file
from frappe.core.doctype.file.file import create_new_folder

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
        pdf_data = get_pdf_data(doc.doctype, doc.name, default_print_format, letterhead=letter_head, is_report=False, report_html=None)
        file_name = f"{random_string(30)}.pdf"
        folder_name = create_folder("Whatsapp", "Home")
        save_file(file_name, pdf_data, '', '', folder=folder_name, is_private=0)
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
        
@frappe.whitelist()
def send_whatsapp_report(html, receivers=['919926100041']):
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

        pdf_data = get_pdf_data(None, None, None, None, is_report=True, report_html=html)
        file_name = f"{random_string(30)}.pdf"
        folder_name = create_folder("Whatsapp", "Home")
        save_file(file_name, pdf_data, '', '', folder=folder_name, is_private=0)
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
                                    "text": "Document"
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
            
def get_pdf_data(doctype:None, name: None, print_format: None, letterhead: None, is_report:False, report_html:None):
    
    if not is_report:
        html = frappe.get_print(doctype, name, print_format, letterhead)
        return frappe.utils.pdf.get_pdf(html)
    else:
        from frappe.utils.pdf import get_pdf
        return get_pdf(report_html)

def create_folder(folder, parent):
    new_folder_name = "/".join([parent, folder])
    
    if not frappe.db.exists("File", new_folder_name):
        create_new_folder(folder, parent)
    
    return new_folder_name
