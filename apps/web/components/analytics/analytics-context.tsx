import React, { createContext, useContext, useState, ReactNode, useEffect, useRef } from 'react';
import { getStatsWrapper } from '@/lib/actions';
import { createDefaultStatsInput } from '@/lib/constants';

type GetStatsParameters = Parameters<typeof getStatsWrapper>;
type AwaitedGetStatsReturnType = Awaited<ReturnType<typeof getStatsWrapper>>;

interface InputContextType {
    input: GetStatsParameters[0];
    setInput: React.Dispatch<React.SetStateAction<GetStatsParameters[0]>>;
    data: AwaitedGetStatsReturnType;
    setData: React.Dispatch<React.SetStateAction<AwaitedGetStatsReturnType>>;
    loading: boolean;
    error?: string | null;
}

const InputContext = createContext<InputContextType | undefined>(undefined);

export const InputProvider: React.FC<{ children: ReactNode, siteId: string, initialData: AwaitedGetStatsReturnType }> = ({ children, siteId, initialData }) => {
    const [input, setInput] = useState<GetStatsParameters[0]>(createDefaultStatsInput(siteId));
    const [data, setData] = useState<AwaitedGetStatsReturnType>(initialData);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {

        const loadData = async () => {
            console.log("Loading new data");
            setLoading(true);
            setError(null);
            try {
                const statsQuery = await getStatsWrapper(input);
                setData(statsQuery);
            } catch (err) {
                setError("Failed to load data");
                console.error(err as Error);
            } finally {
                setLoading(false);
            }
        };
        
        if (isMounted) {
            loadData();
        } else {
            setIsMounted(true);
        }

    }, [input]);

    return (
        <InputContext.Provider value={{ input, setInput, data, setData, loading, error }}>
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