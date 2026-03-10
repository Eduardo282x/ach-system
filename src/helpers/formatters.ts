import type { ExchangeRateType } from "@/interfaces/inventory.interface";

export const formatDate = (dateString: Date | string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${day}/${month}/${year}`;
}
export const formatDateWithTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    const hours24 = date.getHours();
    const period = hours24 >= 12 ? 'pm' : 'am';
    const hours12 = hours24 % 12 || 12;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(hours12).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds} ${period}`;
}
export const formatOnlyTime = (dateString: Date | string) => {
    const date = new Date(dateString);
    const hours24 = date.getHours();
    const period = hours24 >= 12 ? 'pm' : 'am';
    const hours12 = hours24 % 12 || 12;
    const hours = String(hours12).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes} ${period}`;
}

export const formatDateString = (dateString: string) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const monthName = months[date.getMonth()];
    const day = String(date.getDate()).padStart(2, '0');
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const dayName = days[date.getDay()];
    return `${dayName}, ${day} de ${monthName} de ${year}`;
}

export const formatOnlyDateStringFilter = (dateString: Date | undefined): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


export const formatNumberWithDecimal = (number: number | string, digits?: number): string => {
    const parsed = typeof number === 'string' ? parseFloat(number) : number;

    return new Intl.NumberFormat('es-VE', {
        minimumFractionDigits: digits ? digits : 2,
        maximumFractionDigits: digits ? digits : 2,
    }).format(parsed);
};
export const formatCurrency = (value: string | number, currency: string) => {
    return new Intl.NumberFormat('es-VE', { style: 'currency', currency }).format(Number(value));
}

export const formatNumberWithDots = (number: number | string, prefix?: string, suffix?: string, isRif?: boolean): string => {
    const text = isRif ?
        `${number.toString().slice(0, 1)}-${number.toString().slice(1).replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
        :
        number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")
    return `${prefix}${text}${suffix}`;
}

export const translateCurrency = (currency: ExchangeRateType) => {
    switch (currency) {
        case 'USD':
            return '$';
        case 'EUR':
            return '€';
        case 'BS':
            return 'Bs';
        default:
            return currency;
    }
}