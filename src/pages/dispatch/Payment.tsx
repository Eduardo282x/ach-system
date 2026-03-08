import { Button } from "@/components/ui/button"
import { formatNumberWithDecimal } from "@/helpers/formatters";
import { useDispatchStore } from "@/store/dispatch.store";
import { FiShoppingCart } from "react-icons/fi";

export const Payment = () => {
    const { total, totalUSD } = useDispatchStore((state) => state)
    return (
        <div className='w-[20%] h-full rounded-xl border-2 border-gray-300 bg-gray-100 overflow-hidden'>
            <div className='text-center text-xl bg-white font-semibold text-blue-800 py-2'>
                <p>Total</p>
            </div>

            <div className="flex items-center justify-end pr-4 h-[50%] mt-2">
                <div className="text-2xl text-right p-4 font-semibold">
                    <p>{formatNumberWithDecimal(total)} Bs</p>
                    <p>${formatNumberWithDecimal(totalUSD)}</p>
                </div>
                <Button variant='primary' className="h-full w-18"><FiShoppingCart className="size-8" /></Button>
            </div>
        </div>
    )
}
