type CustomProperty = {
    name: string
    aggregationType?: "sum" | "average" | "count"
}

export default function CustomPropertiesSettings({ allProperties, customProperties }: { allProperties: string[], customProperties: CustomProperty[] }) {
    return (
        <div>
            <h1>Custom Properties Settings</h1>
            {
                customProperties.map((property) => (
                    <div key={property.name}>
                        <h2>{property.name}</h2>
                        <p>Aggregation Type: {property.aggregationType}</p>
                    </div>
                ))
            }
        </div>
    )
}