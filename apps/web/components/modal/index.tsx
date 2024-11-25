import { Dispatch, SetStateAction } from "react";
import { useIsMobile } from "@/hooks/use-mobile"
import { Dialog } from "@/components/ui/dialog"
import { Drawer } from "@/components/ui/drawer"

export function DrawerDialogDemo({
    children,
    showModal,
    setShowModal,
}: {
    children: React.ReactNode;
    showModal: boolean;
    setShowModal: Dispatch<SetStateAction<boolean>>;
}) {
    const isMobile = useIsMobile();

    return isMobile ? (
        <Drawer open={showModal} onOpenChange={setShowModal}>
            {children}
        </Drawer>
    ) : (
        <Dialog open={showModal} onOpenChange={setShowModal}>
            {children}
        </Dialog>
    )
}