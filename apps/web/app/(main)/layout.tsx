import Header from '@/components/navbar';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            <Header />
            {children}
        </>
    )
}
