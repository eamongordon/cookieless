import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getStatsWrapper } from '@/lib/actions';
import { defaultStatsInput } from '@/lib/constants';

type GetStatsParameters = Parameters<typeof getStatsWrapper>;

interface InputContextType {
    input: GetStatsParameters[0];
    setInput: React.Dispatch<React.SetStateAction<GetStatsParameters[0]>>;
}

const InputContext = createContext<InputContextType | undefined>(undefined);

export const InputProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [input, setInput] = useState<GetStatsParameters[0]>(defaultStatsInput);

    return (
        <InputContext.Provider value={{ input, setInput }}>
            {children}
        </InputContext.Provider>
    );
};

export const useInput = (): InputContextType => {
    const context = useContext(InputContext);
    if (!context) {
        throw new Error('useInput must be used within an InputProvider');
    }
    return context;
};