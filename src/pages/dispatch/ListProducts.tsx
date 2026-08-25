import { FilterComponent } from '@/components/table/FilterComponent'
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { formatNumberWithDecimal, translateCurrency } from '@/helpers/formatters';
import { useInventoryQuery } from '@/hooks/inventory.hook';
import type { Product } from '@/interfaces/inventory.interface';
import { useDispatchStore } from '@/store/dispatch.store';
import { useInventoryStore } from '@/store/inventory.store';
import { useEffect, useRef, useState } from 'react';
import { FaRegTrashCan } from 'react-icons/fa6';

const hasValidDiscount = (product: Product) => {
    const discountPrice = Number(product.discountPrice);
    return discountPrice > 0;
}

const minUnitPrice = (product: Product) => {
    const price = Number(product.price);
    const discountPrice = Number(product.discountPrice);
    if (!(discountPrice > 0)) return price;
    return Math.max(0, discountPrice - 0.25 * (price - discountPrice));
}

const maxUnitPrice = (product: Product) => {
    return Number(product.price);
}

const effectiveUnitPrice = (product: Product, hasDiscount: boolean) => {
    if (!hasDiscount) return Number(product.price);
    if (product.unitPrice != null && product.unitPrice > 0) return product.unitPrice;
    if (hasValidDiscount(product)) return Number(product.discountPrice);
    return Number(product.price);
}

export const ListProducts = () => {
    const searchContainerRef = useRef<HTMLDivElement | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [clear, setClear] = useState(false);
    const [loading, setLoading] = useState(false);
    const { data } = useInventoryQuery(searchTerm);
    const { productList, hasDiscount, setHasDiscount, setProductList, setTotal, setTotalUSD } = useDispatchStore((state) => state);
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
                    unitPrice: effectiveUnitPrice(product, hasDiscount),
                    subtotal: Number(effectiveUnitPrice(product, hasDiscount)),
                    subtotalBs: Number(effectiveUnitPrice(product, hasDiscount)) * (exchangeRates.find((rate) => rate.currency === product.currency)?.rate ?? 1)
                }];
            return newList;
        });
        setSearchTerm('');
        setClear((prev) => !prev);
    }

    const calculateSubtotalWithUnitPrice = (product: Product, quantity: number | undefined, currency: string, unitPrice: number) => {
        const calculate = unitPrice * (quantity ?? 0);

        if (currency === 'USD' || currency === 'EUR') {
            return calculate;
        }
        const findExchangeRate = exchangeRates.find((rate) => rate.currency === product.currency);
        const exchangeRate = findExchangeRate ? findExchangeRate.rate : 1;
        return calculate * exchangeRate;
    }

    const calculateSubtotal = (product: Product, quantity: number | undefined, currency: string) => {
        return calculateSubtotalWithUnitPrice(product, quantity, currency, effectiveUnitPrice(product, hasDiscount));
    }

    const changeUnitPrice = (productEdit: Product, value: string) => {
        if (value === '' || value === '-') {
            setProductList((prevList) =>
                prevList.map((product) =>
                    product.id === productEdit.id ?
                        {
                            ...product,
                            unitPrice: 0,
                            subtotal: 0,
                            subtotalBs: 0
                        }
                        :
                        product
                )
            );
            return;
        }

        const parsed = Number(value);
        if (!Number.isFinite(parsed) || parsed < 0) return;

        setProductList((prevList) =>
            prevList.map((product) => {
                if (product.id !== productEdit.id) return product;

                const next = { ...product, unitPrice: parsed };
                return {
                    ...next,
                    subtotal: calculateSubtotalWithUnitPrice(next, next.quantity, 'USD', parsed),
                    subtotalBs: calculateSubtotalWithUnitPrice(next, next.quantity, 'BS', parsed)
                };
            })
        );
    }

    const finalizeUnitPrice = (productEdit: Product) => {
        const raw = productEdit.unitPrice ?? Number(productEdit.price);
        const min = minUnitPrice(productEdit);
        const max = maxUnitPrice(productEdit);
        const clamped = Math.min(max, Math.max(min, raw));

        setProductList((prevList) =>
            prevList.map((product) => {
                if (product.id !== productEdit.id) return product;

                const next = { ...product, unitPrice: clamped };
                return {
                    ...next,
                    subtotal: calculateSubtotalWithUnitPrice(next, next.quantity, 'USD', clamped),
                    subtotalBs: calculateSubtotalWithUnitPrice(next, next.quantity, 'BS', clamped)
                };
            })
        );
    }

    const handleToggleDiscount = (checked: boolean) => {
        setHasDiscount(checked);

        setProductList((prevList) =>
            prevList.map((product) => {
                const unitPrice = checked && hasValidDiscount(product)
                    ? Number(product.discountPrice)
                    : Number(product.price);

                return {
                    ...product,
                    unitPrice,
                    subtotal: calculateSubtotalWithUnitPrice(product, product.quantity, 'USD', unitPrice),
                    subtotalBs: calculateSubtotalWithUnitPrice(product, product.quantity, 'BS', unitPrice)
                };
            })
        );
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

        const priceBs = effectiveUnitPrice(product, hasDiscount) * exchangeRate;
        return formatNumberWithDecimal(priceBs);
    }

    const priceProduct = (product: Product) => {
        return `${formatNumberWithDecimal(product.price)}${translateCurrency(product.currency)}`
    }

    //Calculate Total
    useEffect(() => {
        const totalUSD = productList.reduce((acc, product) => {
            return acc + (effectiveUnitPrice(product, hasDiscount) * (product.quantity ?? 0));
        }, 0);

        const totalBs = productList.reduce((acc, product) => {
            const findExchangeRate = exchangeRates.find((rate) => rate.currency === product.currency);
            const exchangeRate = findExchangeRate ? findExchangeRate.rate : 1;

            return acc + (effectiveUnitPrice(product, hasDiscount) * (product.quantity ?? 0) * exchangeRate);
        }, 0);

        setTotal(totalBs);
        setTotalUSD(totalUSD);
    }, [productList, setTotal, setTotalUSD, exchangeRates, hasDiscount]);

    const resolvePresentation = (product: Product) => {
        return product.presentation ? product.presentation : product.brand;
    }

    return (
        <div className='w-full h-104 p-4 border-2 border-gray-300 rounded-md shadow-md'>
            <div className='flex items-center justify-between mb-2'>
                <p className='font-semibold text-black'>Lista de productos</p>
                <div className='flex items-center gap-2'>
                    <Label htmlFor="manual-discount">Descuento manual (USD)</Label>
                    <Switch id="manual-discount" checked={hasDiscount} onCheckedChange={handleToggleDiscount} />
                </div>
            </div>
            <div className='relative' ref={searchContainerRef}>
                <div className="w-full">
                    <FilterComponent placeholder='Buscar producto...' onChange={searchProducts} loading={loading} clearValue={clear} />
                </div>
                {searchTerm !== '' && (
                    <div className='absolute top-10 w-full left-0 border-2 border-gray-300 rounded-md bg-white shadow-md'>
                        {productFilter.length > 0 ? productFilter.map((product: Product, index: number) => (
                            <div key={index} onClick={() => product.stock > 0 && handleSelectProduct(product)} className={`text-sm flex items-center justify-between p-2 border-b last:border-0 hover:bg-gray-100 relative ${product.stock === 0 ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                                <div className="">
                                    <p className='font-semibold'>{product.name} - {resolvePresentation(product)}</p>
                                    <p><span className='font-semibold'>Precio:</span> {priceProduct(product)} | {calculatePriceBs(product)} Bs</p>
                                    <p><span className='font-semibold'>Cantidad:</span> {product.stock}</p>
                                </div>
                                <div>
                                    <p className='text-gray-500 w-32'>{product.barcode}</p>
                                </div>

                                <div className="absolute top-0 right-0 flex items-center justify-center w-full h-full">
                                    {product.stock === 0 && (
                                        <div className="text-center">
                                            <p className='text-red-500 font-semibold text-2xl'>Producto no disponible</p>
                                            <p className='text-red-500 font-semibold text-xl'>Sin stock</p>
                                        </div>
                                    )}
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
                            <p className='min-w-0 flex-1 truncate'>{product.name} - {resolvePresentation(product)}</p>
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
                            {hasDiscount ? (
                                <div className='w-32 shrink-0 flex items-center justify-end'>
                                    <input
                                        type="number"
                                        min={minUnitPrice(product)}
                                        max={maxUnitPrice(product)}
                                        step="0.01"
                                        value={product.unitPrice ?? effectiveUnitPrice(product, hasDiscount)}
                                        disabled={!hasValidDiscount(product)}
                                        onChange={(e) => changeUnitPrice(product, e.target.value)}
                                        onBlur={() => finalizeUnitPrice(product)}
                                        className="w-24 text-right border-2 border-gray-300 rounded-md p-1 disabled:opacity-50 disabled:cursor-not-allowed"
                                    />
                                </div>
                            ) : (
                                <p className='w-32 shrink-0 text-right'>{formatNumberWithDecimal(product.price)} {translateCurrency(product.currency)}</p>
                            )}
                            <p className='w-32 shrink-0 text-right'>{formatNumberWithDecimal(calculateSubtotal(product, product.quantity, product.currency))} {translateCurrency(product.currency)}</p>
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
