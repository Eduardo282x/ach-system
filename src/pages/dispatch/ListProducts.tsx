import { FilterComponent } from '@/components/table/FilterComponent'
import { Button } from '@/components/ui/button';
import { formatNumberWithDecimal, translateCurrency } from '@/helpers/formatters';
import { useInventoryQuery } from '@/hooks/inventory.hook';
import type { Product } from '@/interfaces/inventory.interface';
import { useDispatchStore } from '@/store/dispatch.store';
import { useInventoryStore } from '@/store/inventory.store';
import { useEffect, useRef, useState } from 'react';
import { FaRegTrashCan } from 'react-icons/fa6';

export const ListProducts = () => {
    const searchContainerRef = useRef<HTMLDivElement | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [clear, setClear] = useState(false);
    const [loading, setLoading] = useState(false);
    const { data } = useInventoryQuery(searchTerm);
    const { productList, setProductList, setTotal, setTotalUSD } = useDispatchStore((state) => state);
    const exchangeRates = useInventoryStore((state) => state.exchangeRates);

    const productFilter = (data?.products ?? []).filter((product) =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.barcode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const searchProducts = (term: string) => {
        setLoading(true);
        setSearchTerm(term);

        setTimeout(() => {
            setLoading(false);
        }, 1500);
    }

    const handleSelectProduct = (product: Product) => {
        setProductList((prevList) => {
            const findProduct = prevList.find((item) => item.id === product.id);
            const newList = findProduct
                ? prevList.map((item) =>
                    item.id === product.id ?
                        {
                            ...item,
                            quantity: (item.quantity ?? 0) + 1,
                            subtotal: calculateSubtotal(item, (item.quantity ?? 0) + 1, 'USD'),
                            subtotalBs: calculateSubtotal(item, (item.quantity ?? 0) + 1, 'BS')
                        }
                        : item
                )
                : [...prevList, {
                    ...product,
                    quantity: 1,
                    subtotal: Number(product.price),
                    subtotalBs: Number(product.price) * (exchangeRates.find((rate) => rate.currency === product.currency)?.rate ?? 1)
                }];
            return newList;
        });
        setSearchTerm('');
        setClear(true);
    }

    const calculateSubtotal = (product: Product, quantity: number | undefined, currency: string) => {
        const calculate = Number(product.price) * (quantity ?? 0);

        if (currency === 'USD' || currency === 'EUR') {
            return calculate;
        }
        const findExchangeRate = exchangeRates.find((rate) => rate.currency === product.currency);
        const exchangeRate = findExchangeRate ? findExchangeRate.rate : 1;
        return calculate * exchangeRate;
    }

    const changeQuantity = (productEdit: Product, quantity: number) => {
        if (quantity < 1) return;
        if (productEdit.stock && quantity > productEdit.stock) return;

        setProductList((prevList) =>
            prevList.map((product) =>
                product.id === productEdit.id ?
                    {
                        ...product,
                        quantity,
                        subtotal: calculateSubtotal(product, quantity, 'USD'),
                        subtotalBs: calculateSubtotal(product, quantity, 'BS')
                    }
                    :
                    product
            )
        );
    }

    const removeProduct = (productId: number) => {
        setProductList((prevList) => prevList.filter((product) => product.id !== productId));
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!searchContainerRef.current) return;

            const target = event.target as Node;
            if (!searchContainerRef.current.contains(target)) {
                setSearchTerm('');
            }
        };

        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const calculatePriceBs = (product: Product) => {
        const findExchangeRate = exchangeRates.find((rate) => rate.currency === product.currency);
        const exchangeRate = findExchangeRate ? findExchangeRate.rate : 1;

        const priceBs = Number(product.price) * exchangeRate;
        return formatNumberWithDecimal(priceBs);
    }

    //Calculate Total
    useEffect(() => {
        const totalUSD = productList.reduce((acc, product) => {
            return acc + (Number(product.price) * (product.quantity ?? 0));
        }, 0);

        const totalBs = productList.reduce((acc, product) => {
            const findExchangeRate = exchangeRates.find((rate) => rate.currency === product.currency);
            const exchangeRate = findExchangeRate ? findExchangeRate.rate : 1;

            return acc + (Number(product.price) * (product.quantity ?? 0) * exchangeRate);
        }, 0);

        setTotal(totalBs);
        setTotalUSD(totalUSD);
    }, [productList, setTotal, setTotalUSD, exchangeRates]);

    return (
        <div className='w-full h-104 p-4 border-2 border-gray-300 rounded-md shadow-md'>
            <div className='relative' ref={searchContainerRef}>
                <div className="w-full">
                    <FilterComponent placeholder='Buscar producto...' onChange={searchProducts} loading={loading} clearValue={clear} />
                </div>
                {searchTerm !== '' && (
                    <div className='absolute top-10 w-full left-0 border-2 border-gray-300 rounded-md bg-white shadow-md'>
                        {productFilter.length > 0 ? productFilter.map((product, index: number) => (
                            <div key={index} onClick={() => handleSelectProduct(product)} className='text-sm flex items-center justify-between p-2 border-b last:border-0 hover:bg-gray-100 cursor-pointer'>
                                <div className="">
                                    <p className='text-gray-500 w-32'>#{product.barcode}</p>
                                    <p className='font-semibold'>{product.name} - {product.presentation}</p>
                                </div>
                                <div>
                                    <p><span className='font-semibold'>Precio:</span> {formatNumberWithDecimal(product.price)}{translateCurrency(product.currency)}</p>
                                    <p><span className='font-semibold'>Cantidad:</span> {product.stock}</p>
                                </div>
                            </div>
                        )) : (
                            <p className='text-center p-4 text-gray-500'>No se encontraron productos</p>
                        )}
                    </div>
                )}
            </div>
            <div className='overflow-y-auto h-[85%] border-2 w-full bg-white mt-2 rounded-md shadow-md'>
                <div className="flex items-center gap-3 p-2 border-b-2 text-sm">
                    <p className='font-semibold text-black w-40 shrink-0'>Código</p>
                    <p className='font-semibold text-black min-w-0 flex-1'>Nombre</p>
                    <p className='font-semibold text-black w-32 shrink-0 text-center'>Cantidad</p>
                    <p className='font-semibold text-black w-32 shrink-0 text-right'>Precio ($)</p>
                    <p className='font-semibold text-black w-32 shrink-0 text-right'>SubTotal ($)</p>
                    <p className='font-semibold text-black w-32 shrink-0 text-right'>Precio (Bs)</p>
                    <p className='font-semibold text-black w-32 shrink-0 text-right'>SubTotal (Bs)</p>
                    <p className='font-semibold text-black w-32 shrink-0'></p>
                </div>
                <div>
                    {productList.map((product, index: number) => (
                        <div key={index} className='flex items-center gap-3 p-2 border-b-2 text-sm'>
                            <p className='w-40 shrink-0 truncate'>{product.barcode}</p>
                            <p className='min-w-0 flex-1 truncate'>{product.name} - {product.presentation}</p>
                            <div className='w-32 shrink-0 flex items-center gap-1'>
                                <Button variant='destructive' size='icon-sm' onClick={() => changeQuantity(product, (product.quantity ?? 0) - 1)}>-</Button>
                                <input
                                    type="number"
                                    value={product.quantity}
                                    max={product.stock}
                                    onChange={(e) => changeQuantity(product, Number(e.target.value))}
                                    className="w-12 text-center border-2 border-gray-300 rounded-md p-1"
                                />
                                <Button variant='success' size='icon-sm' onClick={() => changeQuantity(product, (product.quantity ?? 0) + 1)}>+</Button>
                            </div>
                            <p className='w-32 shrink-0 text-right'>{formatNumberWithDecimal(product.price)} $</p>
                            <p className='w-32 shrink-0 text-right'>{formatNumberWithDecimal(calculateSubtotal(product, product.quantity, product.currency))} $</p>
                            <p className='w-32 shrink-0 text-right'>{calculatePriceBs(product)} Bs</p>
                            <p className='w-32 shrink-0 text-right'>{formatNumberWithDecimal(calculateSubtotal(product, product.quantity, 'BS'))} Bs</p>
                            <div className='w-32 shrink-0 text-center'>
                                <Button variant='destructive' size='icon-sm' onClick={() => removeProduct(product.id)}>
                                    <FaRegTrashCan />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
