import { IoMdClose } from 'react-icons/io';
import { Input } from '../ui/input';
import { useState } from 'react';
import { IoIosSearch } from "react-icons/io";

interface FilterComponentProps {
    placeholder?: string;
    onChange?: (value: string) => void;
}

export const FilterComponent = ({ placeholder, onChange }: FilterComponentProps) => {
    const [value, setValue] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setValue(e.target.value);
        onChange?.(e.target.value);
    }
    return (
        <div className="relative">
            <div className="absolute top-2 left-2 text-xl text-gray-400">
                <IoIosSearch />
            </div>
            <Input placeholder={placeholder ?? "Buscar..."} className="pl-9 w-96" value={value} onChange={handleChange} />
            {value !== '' && (
                <div className="absolute top-2 right-4 text-xl text-gray-400 cursor-pointer" onClick={() => { setValue(''); onChange?.(''); }}>
                    <IoMdClose />
                </div>
            )}
        </div>
    )
}
