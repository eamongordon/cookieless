"use client";

import Modal from ".";
import { ReactNode, createContext, useContext, useState, useEffect } from "react";

interface ModalContextProps {
  show: (content: ReactNode) => void;
  hide: () => void;
}

const ModalContext = createContext<ModalContextProps | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalContent, setModalContent] = useState<ReactNode | null>(null);
  const [showModal, setShowModal] = useState(false);
  
  //Prevent Scrolling when modal is open
  useEffect(() => {
    console.log("showModal");
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
    <ModalContext.Provider value={{ show, hide }}>
      {children}
      {showModal && (
        <Modal showModal={showModal} setShowModal={setShowModal}>
          {modalContent}
        </Modal>
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  return useContext(ModalContext);
}
