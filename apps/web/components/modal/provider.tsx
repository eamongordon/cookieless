"use client";

import { DrawerDialogDemo } from ".";
import { ReactNode, createContext, useContext, useState, useEffect } from "react";

interface ModalContextProps {
    show: (content: ReactNode) => void;
    hide: () => void;
    data: any;
    setData: (value: any) => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [modalContent, setModalContent] = useState<ReactNode | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [data, setData] = useState<any>(null);

    //Prevent Scrolling when modal is open
    useEffect(() => {
        if (showModal) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "auto";
    }, [showModal]);

    const show = (content: ReactNode) => {
        setModalContent(content);
        setShowModal(true);
    };

    const hide = () => {
        setShowModal(false);
        setTimeout(() => {
            setModalContent(null);
        }, 300); // Timeout adjusts transition duration
    };

    return (
        <ModalContext.Provider value={{ show, hide, data, setData }}>
            {children}
            {showModal && (
                <DrawerDialogDemo showModal={showModal} setShowModal={setShowModal}>
                    {modalContent}
                </DrawerDialogDemo>
            )}
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (context === undefined) {
        throw new Error("useModal must be used within a ModalProvider");
    }
    return context;
}