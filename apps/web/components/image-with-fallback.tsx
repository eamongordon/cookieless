import React, { useEffect, useState } from "react"
import Image, { ImageProps } from 'next/image';

interface ImageWithFallbackProps extends ImageProps {
    fallback?: React.ReactNode;
}

const ImageWithFallback = ({
    fallback,
    ...props
}: ImageWithFallbackProps) => {
    const [error, setError] = useState<React.SyntheticEvent<
        HTMLImageElement,
        Event
    > | null>(null)

    useEffect(() => {
        setError(null)
    }, [props.src])

    return error ? (
        fallback ? <>{fallback}</> : null
    ) : (
        <Image
            onError={setError}
            {...props}
            src={props.src}
        />
    )
}

export default ImageWithFallback;