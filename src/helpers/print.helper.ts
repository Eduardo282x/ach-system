export const INVOICE_BODY_CLASS = "print-invoice-body";

export const INVOICE_PAGE_STYLE = `
    @page {
        size: 80mm 80mm;
        margin: 0;
    }

    html, body {
        margin: 0 !important;
        padding: 0 !important;
        width: 80mm;
        height: 80mm;
        overflow: hidden;
        background: #fff;
    }

    body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
    }
`;
