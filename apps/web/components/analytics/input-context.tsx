import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getStatsWrapper } from '@/lib/actions';
import { createDefaultStatsInput } from '@/lib/constants';
import { init } from 'next/dist/compiled/webpack/webpack';

type GetStatsParameters = Parameters<typeof getStatsWrapper>;
type AwaitedGetStatsReturnType = Awaited<ReturnType<typeof getStatsWrapper>>;

interface InputContextType {
    input: GetStatsParameters[0];
    setInput: React.Dispatch<React.SetStateAction<GetStatsParameters[0]>>;
    data: AwaitedGetStatsReturnType;
    setData: React.Dispatch<React.SetStateAction<AwaitedGetStatsReturnType>>;
}

const InputContext = createContext<InputContextType | undefined>(undefined);

export const InputProvider: React.FC<{ children: ReactNode, siteId: string, initialData: AwaitedGetStatsReturnType }> = ({ children, siteId, initialData }) => {
    const [input, setInput] = useState<GetStatsParameters[0]>(createDefaultStatsInput(siteId));
    const [data, setData] = useState<AwaitedGetStatsReturnType>(initialData);
    return (
        <InputContext.Provider value={{ input, setInput, data, setData }}>
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