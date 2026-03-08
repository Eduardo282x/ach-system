import { IoMdClose } from 'react-icons/io';
import { Input } from '../ui/input';
import { useEffect, useState } from 'react';
import { IoIosSearch } from "react-icons/io";
import { Spinner } from "../ui/spinner";
interface FilterComponentProps {
    placeholder?: string;
    loading?: boolean;
    onChange?: (value: string) => void;
    clearValue?: boolean;
}

export const FilterComponent = ({ placeholder, loading, onChange, clearValue }: FilterComponentProps) => {
    const [value, setValue] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
    };

    useEffect(() => {
        if(clearValue){
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setValue('');
        }
    },[clearValue])

    useEffect(() => {
        const timeout = setTimeout(() => {
            onChange?.(value);
        }, 500);

        return () => clearTimeout(timeout);
    }, [value, onChange]);

    
    return (
        <div className="relative w-full">
            <div className="absolute top-2 left-2 text-xl text-gray-400">
                <IoIosSearch />
            </div>
            <Input placeholder={placeholder ?? "Buscar..."} className="pl-9 w-full" value={value} onChange={handleChange} />
            {loading && (
                <div className="absolute top-2.5 right-3 text-sm text-gray-400">
                    <Spinner />
                </div>
            )}
            {!loading && value !== '' && (
                <div className="absolute top-2 right-3 text-xl text-gray-400 cursor-pointer" onClick={() => { setValue(''); }}>
                    <IoMdClose />
                </div>
            )}
        </div>
    )
}
