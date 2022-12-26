// Copyright (c) 2018, Frappe Technologies Pvt. Ltd. and Contributors
// License: GNU General Public License v3. See license.txt

frappe.query_reports["General Ledger"] = {
    "filters": [
        {
            "fieldname": "company",
            "label": __("Company"),
            "fieldtype": "Link",
            "options": "Company",
            "default": frappe.defaults.get_user_default("Company"),
            "reqd": 1
        },
        {
            "fieldname": "finance_book",
            "label": __("Finance Book"),
            "fieldtype": "Link",
            "options": "Finance Book"
        },
        {
            "fieldname": "from_date",
            "label": __("From Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.add_months(frappe.datetime.get_today(), -1),
            "reqd": 1,
            "width": "60px"
        },
        {
            "fieldname": "to_date",
            "label": __("To Date"),
            "fieldtype": "Date",
            "default": frappe.datetime.get_today(),
            "reqd": 1,
            "width": "60px"
        },
        {
            "fieldname": "account",
            "label": __("Account"),
            "fieldtype": "MultiSelectList",
            "options": "Account",
            get_data: function (txt) {
                return frappe.db.get_link_options('Account', txt, {
                    company: frappe.query_report.get_filter_value("company")
                });
            }
        },
        {
            "fieldname": "voucher_no",
            "label": __("Voucher No"),
            "fieldtype": "Data",
            on_change: function () {
                frappe.query_report.set_filter_value('group_by', "Group by Voucher (Consolidated)");
            }
        },
        {
            "fieldtype": "Break",
        },
        {
            "fieldname": "party_type",
            "label": __("Party Type"),
            "fieldtype": "Link",
            "options": "Party Type",
            "default": "",
            on_change: function () {
                frappe.query_report.set_filter_value('party', "");
            }
        },
        {
            "fieldname": "party",
            "label": __("Party"),
            "fieldtype": "MultiSelectList",
            get_data: function (txt) {
                if (!frappe.query_report.filters) return;

                let party_type = frappe.query_report.get_filter_value('party_type');
                if (!party_type) return;

                return frappe.db.get_link_options(party_type, txt);
            },
            on_change: function () {
                var party_type = frappe.query_report.get_filter_value('party_type');
                var parties = frappe.query_report.get_filter_value('party');

                if (!party_type || parties.length === 0 || parties.length > 1) {
                    frappe.query_report.set_filter_value('party_name', "");
                    frappe.query_report.set_filter_value('tax_id', "");
                    return;
                } else {
                    var party = parties[0];
                    var fieldname = erpnext.utils.get_party_name(party_type) || "name";
                    frappe.db.get_value(party_type, party, fieldname, function (value) {
                        frappe.query_report.set_filter_value('party_name', value[fieldname]);
                    });

                    if (party_type === "Customer" || party_type === "Supplier") {
                        frappe.db.get_value(party_type, party, "tax_id", function (value) {
                            frappe.query_report.set_filter_value('tax_id', value["tax_id"]);
                        });
                    }
                }
            }
        },
        {
            "fieldname": "party_name",
            "label": __("Party Name"),
            "fieldtype": "Data",
            "hidden": 1
        },
        {
            "fieldname": "group_by",
            "label": __("Group by"),
            "fieldtype": "Select",
            "options": [
                "",
                {
                    label: __("Group by Voucher"),
                    value: "Group by Voucher",
                },
                {
                    label: __("Group by Voucher (Consolidated)"),
                    value: "Group by Voucher (Consolidated)",
                },
                {
                    label: __("Group by Account"),
                    value: "Group by Account",
                },
                {
                    label: __("Group by Party"),
                    value: "Group by Party",
                },
            ],
            "default": "Group by Voucher (Consolidated)"
        },
        {
            "fieldname": "tax_id",
            "label": __("Tax Id"),
            "fieldtype": "Data",
            "hidden": 1
        },
        {
            "fieldname": "presentation_currency",
            "label": __("Currency"),
            "fieldtype": "Select",
            "options": erpnext.get_presentation_currency_list()
        },
        {
            "fieldname": "cost_center",
            "label": __("Cost Center"),
            "fieldtype": "MultiSelectList",
            get_data: function (txt) {
                return frappe.db.get_link_options('Cost Center', txt, {
                    company: frappe.query_report.get_filter_value("company")
                });
            }
        },
        {
            "fieldname": "project",
            "label": __("Project"),
            "fieldtype": "MultiSelectList",
            get_data: function (txt) {
                return frappe.db.get_link_options('Project', txt, {
                    company: frappe.query_report.get_filter_value("company")
                });
            }
        },
        {
            "fieldname": "include_dimensions",
            "label": __("Consider Accounting Dimensions"),
            "fieldtype": "Check",
            "default": 1
        },
        {
            "fieldname": "show_opening_entries",
            "label": __("Show Opening Entries"),
            "fieldtype": "Check"
        },
        {
            "fieldname": "include_default_book_entries",
            "label": __("Include Default Book Entries"),
            "fieldtype": "Check"
        },
        {
            "fieldname": "show_cancelled_entries",
            "label": __("Show Cancelled Entries"),
            "fieldtype": "Check"
        },
        {
            "fieldname": "show_net_values_in_party_account",
            "label": __("Show Net Values in Party Account"),
            "fieldtype": "Check"
        }
    ],
    onload: function (report) {
        // console.log(report)
        report.page.add_inner_button("Whatsapp", function () {

            let dialog = frappe.ui.get_print_settings(
                false,
                print_settings => whatsapp(print_settings),
                frappe.query_report.report_doc.letter_head,
                frappe.query_report.get_visible_columns()
            );
            frappe.query_report.add_portrait_warning(dialog);

        })
    }
}

function whatsapp(print_settings) {
    const base_url = frappe.urllib.get_base_url();
    const print_css = frappe.boot.print_css;
    const landscape = "Portrait";

    const custom_format = frappe.query_report.report_settings.html_format || null;
    const columns = frappe.query_report.get_columns_for_print(print_settings, custom_format);
    const data = frappe.query_report.get_data_for_print();
    const applied_filters = frappe.query_report.get_filter_values();

    const filters_html = frappe.query_report.get_filters_html_for_print();
    const template =
        print_settings.columns || !custom_format ? 'print_grid' : custom_format;
    const content = frappe.render_template(template, {
        title: __(frappe.query_report.report_name),
        subtitle: filters_html,
        filters: applied_filters,
        data: data,
        original_data: frappe.query_report.data,
        columns: columns,
        report: frappe.query_report
    });

    // Render Report in HTML
    const html = frappe.render_template('print_template', {
        title: __(frappe.query_report.report_name),
        content: content,
        base_url: base_url,
        print_css: print_css,
        print_settings: print_settings,
        landscape: landscape,
        columns: columns,
        lang: frappe.boot.lang,
        layout_direction: frappe.utils.is_rtl() ? "rtl" : "ltr"
    });

    let filter_values = [],
        name_len = 0;
    for (var key of Object.keys(applied_filters)) {
        name_len = name_len + applied_filters[key].toString().length;
        if (name_len > 200) break;
        filter_values.push(applied_filters[key]);
    }
    frappe.call({
        method: "erevive_whatsapp.api.whatsapp.send_whatsapp_report",
        args: {
            html: html
        }
    }).then(response => {
        console.log(response)
    })
    // print_settings.report_name = `${__(this.report_name)}_${filter_values.join("_")}.pdf`;
    // frappe.render_pdf(html, print_settings);
}

erpnext.utils.add_dimensions('General Ledger', 15)
