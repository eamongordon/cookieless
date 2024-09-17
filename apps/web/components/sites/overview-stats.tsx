"use client";

import { BarList } from "@/components/charts/barlist";

const data = [
    { name: "/home", value: 843 },
    { name: "/imprint", value: 46 },
    { name: "/cancellation", value: 3 },
    { name: "/blocks", value: 108 },
    { name: "/documentation", value: 384 },
];

export default function OverviewStats() {
    return (
        <BarList
            data={data}
            onValueChange={(item) =>
                console.log("Clicked on", item)
            }
        />
    );
}