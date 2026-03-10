import type { ColumnDef } from "@/components/table/TableComponent";
import { formatDateWithTime, formatNumberWithDecimal } from "@/helpers/formatters";
import type { EventType, Session } from "@/interfaces/sessions.interface";

export const cashDrawerSessionColumns: ColumnDef<Session>[] = [
    {
        header: 'Session',
        key: 'sessionId',
        element: (row) => `Session ${row.sessionId}`,
        width: '12rem',
        visible: true,
    },
    {
        header: 'Tipo de Evento',
        key: 'eventType',
        width: '8rem',
        element: (row) => `${translateEventType(row.eventType)}`,
        class: (row) => `${styleClassEventType(row.eventType)} rounded-full px-2 text-center`,
        visible: true,
    },
    {
        header: 'Caja',
        key: 'cashDrawer',
        width: '8rem',
        element: (row) => row.cashDrawer.name,
        visible: true,
    },
    {
        header: 'Usuario',
        key: 'user',
        width: '8rem',
        element: (row) => row.user.name,
        visible: true,
    },
    {
        header: 'Estado',
        key: 'status',
        width: '8rem',
        element: (row) => `${translateEventType(row.status)}`,
        class: (row) => `${styleClassEventType(row.status)} rounded-full px-2 text-center`,
        visible: true,
    },

    {
        header: 'Apertura con',
        key: 'openingBalance',
        width: '8rem',
        element: (row) => formatNumberWithDecimal(row.openingBalance),
        visible: true,
    },
    {
        header: 'Cierre con',
        key: 'closingBalance',
        width: '8rem',
        element: (row) => row.closingBalance ? formatNumberWithDecimal(row.closingBalance) : '-',
        visible: true,
    },
    {
        header: 'Total en Bs',
        key: 'totalInBs',
        width: '8rem',
        element: (row) => row.totalInBs ? `${formatNumberWithDecimal(row.totalInBs)} Bs` : '-',
        visible: true,
    },
    {
        header: 'Total en USD',
        key: 'totalInUsd',
        width: '8rem',
        element: (row) => row.totalInUsd ? `${formatNumberWithDecimal(row.totalInUsd)} $` : '-',
        visible: true,
    },
    {
        header: 'Total de venta',
        key: 'totalSales',
        width: '8rem',
        element: (row) => row.totalSales ? `${formatNumberWithDecimal(row.totalSales)} Bs` : '-',
        visible: true,
    },
    {
        header: 'Fecha',
        key: 'eventAt',
        width: '8rem',
        element: (row) => formatDateWithTime(row.eventAt),
        visible: false,
    },
];

const styleClassEventType = (type: EventType) => {
    if (type === 'OPEN') {
        return 'bg-green-100 text-green-800';
    } else if (type === 'CLOSE' || type === 'CLOSED') {
        return 'bg-red-100 text-red-800';
    } else {
        return '';
    }
}

const translateEventType = (type: EventType) => {
    switch (type) {
        case 'OPEN':
            return 'Apertura';
        case 'CLOSE':
        case 'CLOSED':
            return 'Cierre';
        default:
            return type;
    }
}