import { Trash, Upload, User } from "lucide-react";
import { useRef, useState } from "react";

const ProfileImageSelector = ({ image, setImage }) => {
  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        setImage(file);

        if (previewUrl) URL.revokeObjectURL(previewUrl);
        const preview = URL.createObjectURL(file);
        setPreviewUrl(preview);
    }
  }

  const handleRemoveImage = (e) => {
    e.preventDefault();
    setImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const onChooseFile = (e) => {
    e.preventDefault();
    inputRef.current?.click();
  }

  return (
    <div className="flex justify-center mb-6">
      <input
        type="file"
        accept="image/*"
        ref={inputRef}
        onChange={handleImageChange}
        className="hidden"
      />

      {!image ? (
        <div className="w-20 h-20 flex items-center justify-center bg-purple-100 rounded-full relative">
            <User className="text-purple-500" size={35} />
            <button type="button" className="w-8 h-8 flex items-center justify-center bg-white border border-purple-200 rounded-full absolute -bottom-1 -right-1 hover:cursor-pointer" onClick={onChooseFile}>
                <Upload size={15} className="text-purple-500 hover:cursor-pointer"/>
            </button>
        </div>
      ) : (
        <div className="relative">
            <img src={previewUrl} alt="profile photo" className="w-20 h-20 rounded-full object-cover"/>
            <button type="button" className="w-8 h-8 flex items-center justify-center bg-red-800 text-white rounded-full absolute -bottom-1 -right-1 hover:cursor-pointer" onClick={handleRemoveImage}>
                <Trash size={15} className="hover:cursor-pointer"/>
            </button>
        </div>
      )}
    </div>
  );
};

export default ProfileImageSelector;
