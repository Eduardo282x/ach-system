import type { TypeRole } from "@/interfaces/users.interface";
import type { ComponentType } from "react";
import { GoHistory } from "react-icons/go";
import { HiOutlineCurrencyDollar } from "react-icons/hi";
import { IoSettingsOutline } from "react-icons/io5";
import { MdOutlineInventory2, MdOutlinePointOfSale, MdQuestionMark } from "react-icons/md";
import { PiUsersThree } from "react-icons/pi";

export type HeaderType = 'button' | 'dropdown' | 'dropdown-item' | 'separator';

export type HeaderAction = 'logout';

export interface HeaderInterface {
    title: string;
    navigateTo: string;
    auth: TypeRole[];
    icon?: ComponentType<{ className?: string }>;
    type: HeaderType;
    active: boolean;
    children: HeaderInterface[];
    action?: HeaderAction;
}

export const headerData: HeaderInterface[] = [
    {
        title: 'Clientes',
        icon: PiUsersThree,
        navigateTo: '/clientes',
        type: 'button',
        active: false,
        auth: ['ADMIN', 'SUPERVISOR'],
        children: []
    },
    {
        title: 'Inventario Historial',
        icon: GoHistory,
        navigateTo: '/historial-inventario',
        type: 'button',
        active: false,
        auth: ['ADMIN'],
        children: []
    },
    {
        title: 'Inventario',
        icon: MdOutlineInventory2,
        navigateTo: '/inventario',
        type: 'button',
        active: false,
        auth: ['ADMIN', 'SUPERVISOR'],
        children: []
    },
    {
        title: 'Despacho',
        icon: MdOutlinePointOfSale,
        navigateTo: '/despacho',
        type: 'button',
        active: false,
        auth: ['ADMIN', 'SUPERVISOR', 'CAJERO'],
        children: []
    },
    {
        title: 'Cierre de Caja',
        icon: HiOutlineCurrencyDollar,
        navigateTo: '/cierre-caja',
        type: 'button',
        active: false,
        auth: ['ADMIN', 'SUPERVISOR'],
        children: []
    },
    {
        title: 'Configuración',
        icon: IoSettingsOutline,
        navigateTo: '',
        type: 'dropdown',
        active: false,
        auth: ['ADMIN', 'SUPERVISOR', 'CAJERO'],
        children: [
            {
                title: 'Tasa del dia',
                navigateTo: '/tasas',
                type: 'dropdown-item',
                active: false,
                auth: ['ADMIN', 'SUPERVISOR', 'CAJERO'],
                children: []
            },
            {
                title: 'Gestionar Cajeros',
                navigateTo: '/cajeros',
                type: 'dropdown-item',
                active: false,
                auth: ['ADMIN', 'SUPERVISOR', 'CAJERO'],
                children: []
            },
            {
                title: 'Historial de Cajeros',
                navigateTo: '/historial-cajeros',
                type: 'dropdown-item',
                active: false,
                auth: ['ADMIN', 'SUPERVISOR', 'CAJERO'],
                children: []
            },
            {
                title: '',
                navigateTo: '',
                type: 'separator',
                active: false,
                auth: ['ADMIN', 'SUPERVISOR', 'CAJERO'],
                children: []
            },
            {
                title: 'Salir',
                navigateTo: '',
                type: 'dropdown-item',
                active: false,
                auth: ['ADMIN', 'SUPERVISOR', 'CAJERO'],
                children: [],
                action: 'logout'
            }
        ]
    },
    {
        title: 'Ayuda',
        icon: MdQuestionMark,
        navigateTo: '',
        type: 'button',
        active: false,
        auth: ['ADMIN', 'SUPERVISOR', 'CAJERO'],
        children: []
    },
]

export const getHeaderDataWithActive = (pathname: string, role?: TypeRole) => {
    if (!role) return [];

    return headerData
        .filter((item) => item.auth.includes(role))
        .map((item) => {
            const children = item.children
                .filter((child) => child.auth.includes(role))
                .map((child) => ({
                    ...child,
                    active: !!child.navigateTo && pathname === child.navigateTo,
                }));

            const isItemActive = !!item.navigateTo && pathname === item.navigateTo;
            const isChildActive = children.some((child) => child.active);

            return {
                ...item,
                active: isItemActive || isChildActive,
                children,
            };
        });
};