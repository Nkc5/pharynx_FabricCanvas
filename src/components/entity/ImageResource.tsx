"use client";
import React, { useEffect, useRef, useState } from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { fabric } from "fabric";
import { MdAdd } from "react-icons/md";




type ImageResourceProps = {
  image: string;
  index: number;
  imG: string;
};

export const ImageResource = observer(
  ({ image, index, imG }: ImageResourceProps) => {
    const store = React.useContext(StoreContext);
    const canvasRef = useRef<fabric.Canvas | null>(null);
    const [cropRect, setCropRect] = useState<fabric.Rect | null>(null);
    const [activeObject, setActiveObject] = useState<fabric.Image | null>(null);
    const [storedImage, setStoredImage] = useState<string | null>(null);

    // Ensure the canvas reference is set
    useEffect(() => {
      const canvas = store.getCanvas();
      const image = store.getImages();
      setStoredImage(image[0]);

      if (canvas) {
        console.log("Canvas initialized", canvas);
        canvasRef.current = canvas;
      } else {
        console.error("Canvas not initialized");
      }
    }, []);




    // const handleAddImage = () => {
    //   const canvas = store.getCanvas();
    //   canvasRef.current = canvas;

    //   if (!canvas) return alert("please select canva size");

    //   fabric.Image.fromURL(image, (img) => {
    //     // Calculate scale to fit the image within the canvas
    //     const canvasWidth = canvas.getWidth();
    //     const canvasHeight = canvas.getHeight();
    //     const imgWidth = img.width;
    //     const imgHeight = img.height;

    //     const scaleX = canvasWidth / imgWidth;
    //     const scaleY = canvasHeight / imgHeight;
    //     const scale = Math.min(scaleX, scaleY); // Scale to fit within canvas

    //     img.set({
    //       left: (canvasWidth - imgWidth * scale) / 2,
    //       top: (canvasHeight - imgHeight * scale) / 2,
    //       scaleX: scale,
    //       scaleY: scale,
    //       angle: 0,
    //       padding: 10,
    //       cornerSize: 10,
    //     });

    //     console.log("in canva", img);
    //     canvas.add(img);
    //     canvas.setActiveObject(img);
    //     canvas.renderAll();
    //     console.log("active img", img);
    //     setActiveObject(img);
    //     store.setActiveObject(img);
    //   });
    // };

  
   

  

    const handleAddText = () => {
      store.handleAddText(); // Call the store method
    };

    const handleDownload = () => {
      store.handleDownload(); // Call the store method
    };

   

    return (
      <div className="relative rounded-lg overflow-hidden items-center bg-slate-800 m-[15px] flex flex-col ">
        {/* <img src={storedImage as any} alt="image to be edited" id="previewImage" /> */}
        <button
          className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded z-10 text-white font-bold py-1 absolute text-lg bottom-2 right-2"
        >
          <MdAdd size="25" />
        </button>
        {/* <button  className="text-white bg-blue-500 hover:bg-blue-700 px-1 py-2 rounded mt-4" onClick={handleCrop}>{cropRect ? "Apply Crop" : "Crop"}</button> <br /> */}
      </div>
    );
  }
);
