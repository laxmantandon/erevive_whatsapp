// // Copyright (c) 2018, Frappe Technologies Pvt. Ltd. and Contributors
// // License: GNU General Public License v3. See license.txt

// frappe.query_reports["General Ledger"] = {
//     onload: function (report) {
//         // console.log(report)
//         report.page.add_inner_button("Whatsapp", function () {

//             frappe.prompt({
//                 fieldtype: 'Link',
//                 label: 'Whatsapp To',
//                 options: 'Contact',
//                 fieldname: 'contact'
//             }, (values) => {
//                 let dialog = frappe.ui.get_print_settings(
//                     false,
//                     print_settings => whatsapp(print_settings, values),
//                     frappe.query_report.report_doc.letter_head,
//                     frappe.query_report.get_visible_columns()
//                 );
//                 frappe.query_report.add_portrait_warning(dialog);
//             })
//         })
//     }
// }

// // erpnext.utils.add_dimensions('General Ledger', 15)

// function whatsapp(print_settings, receivers) {
//     const base_url = frappe.urllib.get_base_url();
//     const print_css = frappe.boot.print_css;
//     const landscape = "Portrait";

//     const custom_format = frappe.query_report.report_settings.html_format || null;
//     const columns = frappe.query_report.get_columns_for_print(print_settings, custom_format);
//     const data = frappe.query_report.get_data_for_print();
//     const applied_filters = frappe.query_report.get_filter_values();

//     const filters_html = frappe.query_report.get_filters_html_for_print();
//     const template =
//         print_settings.columns || !custom_format ? 'print_grid' : custom_format;
//     const content = frappe.render_template(template, {
//         title: __(frappe.query_report.report_name),
//         subtitle: filters_html,
//         filters: applied_filters,
//         data: data,
//         original_data: frappe.query_report.data,
//         columns: columns,
//         report: frappe.query_report
//     });

//     // Render Report in HTML
//     const html = frappe.render_template('print_template', {
//         title: __(frappe.query_report.report_name),
//         content: content,
//         base_url: base_url,
//         print_css: print_css,
//         print_settings: print_settings,
//         landscape: landscape,
//         columns: columns,
//         lang: frappe.boot.lang,
//         layout_direction: frappe.utils.is_rtl() ? "rtl" : "ltr"
//     });

//     let filter_values = [],
//         name_len = 0;
//     for (var key of Object.keys(applied_filters)) {
//         name_len = name_len + applied_filters[key].toString().length;
//         if (name_len > 200) break;
//         filter_values.push(applied_filters[key]);
//     }
//     frappe.call({
//         method: "erevive_whatsapp.api.whatsapp.send_whatsapp_report",
//         args: {
//             html: html,
//             document_caption: cur_page.page.page.title,
//             contact: receivers.contact
//         }
//     }).then(response => {
//         console.log(response)
//     })
//     // print_settings.report_name = `${__(this.report_name)}_${filter_values.join("_")}.pdf`;
//     // frappe.render_pdf(html, print_settings);
// }

