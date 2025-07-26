import { AnimatePresence, motion } from "motion/react";
import React, { createContext, useCallback, useEffect, useState } from "react";

interface ModalProps {
  currentModal?: React.ReactNode;
  onClose?: () => void;
}

interface ContextProps {
  setCurrentModal: (modal: React.ReactNode, onClose?: () => void) => void;
  closeCurrentModal: () => void;
}

export const ModalContext = createContext<ContextProps | null>(null);

export const ModalContextImpl = ({ children }: { children: React.ReactNode }) => {

  const [currentModalData, _setCurrentModalData] = useState<ModalProps | undefined>();

  const setCurrentModal = useCallback((modal: React.ReactNode, onClose?: () => void) => {
    _setCurrentModalData({
      currentModal: modal,
      onClose
    });
    document.body.classList.add('overflow-y-hidden');
  }, [_setCurrentModalData]);

  const closeCurrentModal = useCallback(() => {
    if (currentModalData?.onClose) currentModalData.onClose();
    _setCurrentModalData(undefined);
    document.body.classList.remove('overflow-y-hidden');
  }, [currentModalData, _setCurrentModalData]);

  useEffect(() => {
    const closeModalOnEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeCurrentModal();
    }

    if (currentModalData)
      document.body.addEventListener('keyup', closeModalOnEscape);
    else
      document.body.removeEventListener('keyup', closeModalOnEscape);

    return () => document.body.removeEventListener('keyup', closeModalOnEscape);
  }, [currentModalData]);

  return (
    <ModalContext value={{ setCurrentModal, closeCurrentModal }}>
      {children}
      <AnimatePresence>
        {
          currentModalData && (
            <motion.div
              className="fixed top-0 left-0 flex justify-center items-center h-full w-full bg-black/65 backdrop:blur-lg cursor-pointer"
              exit={{ opacity: 0 }}
              onClick={(e) => {
                if (e.target === e.currentTarget) closeCurrentModal();
              }}
            >
              <AnimatePresence propagate>
                <motion.div
                  className="cursor-auto"
                  initial={{ opacity: 0, y: 15 }}
                  exit={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    transition: {
                      type: "spring",
                      visualDuration: 0.3,
                      bounce: 0.4,
                    },
                  }}
                >
                  {currentModalData.currentModal}
                </motion.div>
              </AnimatePresence>
            </motion.div>
          )
        }
      </AnimatePresence>
    </ModalContext>
  );
}