import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/Button";
import { Loader2 } from "lucide-react";
import getCroppedImg from "@/lib/cropImage";

export function ImageCropper({
  isOpen,
  onClose,
  imageSrc,
  onCropCompleteAction,
  isLoading,
}: any) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback(
    (_croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    [],
  );

  const handleCrop = async () => {
    try {
      const croppedImageBlob = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        0,
      );
      onCropCompleteAction(croppedImageBlob);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open: any) => !open && !isLoading && onClose()}
    >
      <DialogContent className="max-w-md w-full">
        <DialogHeader>
          <DialogTitle>Crop your avatar</DialogTitle>
        </DialogHeader>

        <div className="relative w-full h-[300px] bg-slate-900 rounded-lg overflow-hidden my-4">
          {imageSrc && (
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              aspect={1}
              cropShape="round"
              showGrid={false}
              onCropChange={setCrop}
              onCropComplete={onCropComplete}
              onZoomChange={setZoom}
            />
          )}
        </div>

        <div className="px-2 mb-4">
          <input
            type="range"
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="Zoom"
            onChange={(event: React.SyntheticEvent<any>) =>
              setZoom(Number((event.target as HTMLInputElement).value))
            }
            className="w-full accent-blue-600"
          />
        </div>

        <DialogFooter className="flex sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleCrop} disabled={isLoading}>
            {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Crop & Upload
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
