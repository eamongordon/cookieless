import React, { createContext, useContext, useState, ReactNode } from 'react';
import { getStatsWrapper } from '@/lib/actions';

type GetStatsParameters = Parameters<typeof getStatsWrapper>;

interface InputContextType {
    input: GetStatsParameters[0];
    setInput: React.Dispatch<React.SetStateAction<GetStatsParameters[0]>>;
}

const InputContext = createContext<InputContextType | undefined>(undefined);

export const InputProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [input, setInput] = useState<GetStatsParameters[0]>({
        filters: [],
        metrics: ["aggregations", "averageTimeSpent", "bounceRate"],
        timeData: {
            startDate: new Date("2024-09-25").toISOString(),
            endDate: new Date().toISOString(),
            calendarDuration: "1 day"
        },
        aggregations: [
            {
                property: "path",
                operator: "count",
                metrics: ["visitors"],
                limit: 5,
                sort: {
                    dimension: "currentField",
                    order: "desc"
                }
            }, {
                property: "country",
                operator: "count",
                filters: [{ property: "country", isNull: false }],
                metrics: ["visitors"],
                limit: 5,
                sort: {
                    dimension: "completions",
                    order: "desc"
                }
            }, {
                property: "region",
                operator: "count",
                filters: [{ property: "region", isNull: false }],
                metrics: ["visitors"],
                limit: 5,
                sort: {
                    dimension: "completions",
                    order: "desc"
                }
            }, {
                property: "city",
                operator: "count",
                filters: [{ property: "city", isNull: false }],
                metrics: ["visitors"],
                limit: 5,
                sort: {
                    dimension: "completions",
                    order: "desc"
                }
            }, {
                property: "referrer_hostname",
                operator: "count",
                filters: [{ property: "referrer_hostname", isNull: false }],
                metrics: ["visitors"],
                limit: 5,
                sort: {
                    dimension: "completions",
                    order: "desc"
                }
            }, {
                property: "browser",
                operator: "count",
                filters: [{ property: "browser", isNull: false }],
                metrics: ["visitors"],
                limit: 5,
                sort: {
                    dimension: "completions",
                    order: "desc"
                }
            }, {
                property: "os",
                operator: "count",
                filters: [{ property: "os", isNull: false }],
                metrics: ["visitors"],
                limit: 5,
                sort: {
                    dimension: "completions",
                    order: "desc"
                }
            }, {
                property: "size",
                operator: "count",
                filters: [{ property: "size", isNull: false }],
                metrics: ["visitors"],
                limit: 5,
                sort: {
                    dimension: "completions",
                    order: "desc"
                }
            }
        ]
    });

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