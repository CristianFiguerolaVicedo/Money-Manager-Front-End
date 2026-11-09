import { useEffect } from "react";
import { X } from "lucide-react";

const Modal = ({children, isOpen, onClose, title}) => {
    useEffect(() => {
        if (!isOpen) return;
        const onKeyDown = (e) => e.key === "Escape" && onClose?.();
        document.addEventListener("keydown", onKeyDown);
        return () => document.removeEventListener("keydown", onKeyDown);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return(
        <div className="fixed inset-0 z-50 flex justify-center items-center w-full h-full overflow-hidden bg-black/40 backdrop-blur-sm">
            <div role="dialog" aria-modal="true" aria-label={title} className="relative p-2 sm:p-4 w-full max-w-2xl">
                <div className="relative bg-white rounded-xl shadow-2xl border border-gray-100 flex flex-col max-h-[calc(100dvh-1rem)] sm:max-h-[90vh]">
                    <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-100 rounded-t-xl shrink-0">
                        <h3 className="text-xl font-semibold text-gray-800">
                            {title}
                        </h3>

                        <button onClick={onClose} type="button" aria-label="Cerrar" className="text-gray-500 bg-gray-50 hover:bg-gray-100 hover:text-gray-700 rounded-lg text-sm w-9 h-9 flex justify-center items-center transition-colors duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="p-4 md:p-6 text-gray-700 overflow-y-auto">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Modal;