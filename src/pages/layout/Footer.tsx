import { formatDateString } from "@/helpers/formatters";

export const Footer = () => {
    const today = new Date();

    return (
        <div className='w-full py-2 px-6 bg-white flex items-center justify-between font-semibold'>
            <div>
                Admin | {formatDateString(today.toISOString())}
            </div>
            <div></div>
            <div className="text-sm flex items-center gap-3">
                <span>BCV: 400,00 Bs </span>
                <span>|</span>
                <span>Euro: 400,00 Bs</span>
            </div>
        </div>
    )
}
