import EmojiPicker from "emoji-picker-react";
import { Image, X } from "lucide-react";
import { useState } from "react";
import useDarkTheme from "../hooks/useDarkTheme";

const EmojiPickerPopup = ({icon, onSelect}) => {
    const [isOpen, setIsOpen] = useState(false);
    const dark = useDarkTheme();

    const handleEmojiClick = (emoji) => {
        onSelect(emoji?.imageUrl || "");
        setIsOpen(false);
    }

    return(
        <div className="flex flex-col md:flex-row items-start gap-5 mb-6">
            <button
                type="button"
                onClick={() => setIsOpen(true)}
                aria-expanded={isOpen}
                className="flex items-center gap-4 rounded-lg cursor-pointer text-left"
            >
                <span className="w-12 h-12 flex items-center justify-center text-2xl bg-purple-50 text-purple-500 rounded-lg">
                    {icon ? (
                        <img src={icon} alt="" className="w-8 h-8" />
                    ) : (
                        <Image aria-hidden="true" />
                    )}
                </span>
                <span className="text-gray-700">{icon ? "Cambiar icono" : "Elegir icono"}</span>
            </button>


                {isOpen && (
                    <div className="relative">
                        <button type="button" aria-label="Cerrar selector de iconos" onClick={() => setIsOpen(false)} className="w-7 h-7 flex items-center justify-center bg-white border border-gray-200 rounded-full absolute -top-2 -right-2 z-10 cursor-pointer">
                            <X />
                        </button>
                        <EmojiPicker 
                            open={isOpen}
                            onEmojiClick={handleEmojiClick}
                            theme={dark ? "dark" : "light"}
                        />
                    </div>
                )}
        </div>
    )
}

export default EmojiPickerPopup;