"use client";
import React, { useEffect, useState, useRef } from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { ImageResource } from "../entity/ImageResource";
import { UploadButton } from "../shared/UploadButton";
import { fabric } from "fabric";

export const ImageResourcesPanel = observer(() => {
  const [imgFile, setImgFile] = useState<string | null>(null);
  const [imgArray, setImgArray] = useState([]);
  const canvasRef = useRef<fabric.Canvas | null>(null);

  const store = React.useContext(StoreContext);

  useEffect(() => {
    const intervalId = setInterval(() => {
      const images = store.getNewImages();
      if (images.length > 0) {
        setImgFile(images[0]);
      }

      const fetchApi = async () => {
        const res = await fetch("api/saveImage", {
          method: "GET",
        });
        if (!res.ok) throw new Error("error fetching api");
        const data = await res.json();
        console.log("data.image", data.image);
        setImgArray(data[0].image);
      };

      fetchApi();
    }, 3000);

    return () => clearInterval(intervalId);
  });

  useEffect(() => {
    console.log("imgfile", imgFile);
  }, [imgFile]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    // store.clearImages();
    store.addImageResource(URL.createObjectURL(file));
  };

  const handleClick = async () => {
    if (!imgFile) return;

    try {
      const res = await fetch("/api/saveImage", {
        method: "POST",
        body: JSON.stringify({ base64: imgFile }),
      });

      if (!res.ok) throw new Error("error fetching api");
      const data = await res.json();
      console.log("data", data);
    } catch (error: any) {
      console.log("error in catch: ", error.message);
    }
  };

  const handleImageClick = (imageSrc: string) => {
    store.addImageResource(imageSrc); // Add the clicked image to the canvas

    window.scrollTo({
      top: 0,
      behavior: "smooth", // This will make the scrolling smooth
    });

    const canvas = canvasRef.current;
    if (!canvas) return;
    const image = store.images[0];
    fabric.Image.fromURL(image, (img) => {
      // Calculate scale to fit the image within the canvas
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();
      const imgWidth = img.width;
      const imgHeight = img.height;

      const scaleX = canvasWidth / imgWidth;
      const scaleY = canvasHeight / imgHeight;
      const scale = Math.min(scaleX, scaleY); // Scale to fit within canvas

      img.set({
        left: (canvasWidth - imgWidth * scale) / 2,
        top: (canvasHeight - imgHeight * scale) / 2,
        scaleX: scale,
        scaleY: scale,
        angle: 0,
        padding: 10,
        cornerSize: 10,
      });

      canvas.add(img);
      canvas.setActiveObject(img);
      console.log("Active object after adding image:", canvas.getActiveObject());
      canvas.renderAll();



    });
  };

  return (
    <>
      <div className="text-sm px-[16px] pt-[16px] pb-[8px] font-semibold">
        Images
      </div>
      <UploadButton
        accept="image/*"
        className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold text-center mx-2 py-2 px-4 rounded cursor-pointer"
        onChange={handleFileChange}
      />
      <div>
        {store.images.map((image, index) => {
          return <ImageResource key={image} image={image} index={index} />;
        })}
      </div>

      {imgFile && (
        <div className="mt-5 text-center">
          <button
            className="text-white bg-red-500 hover:bg-red-700  px-4 py-2 rounded my-5"
            onClick={handleClick}
          >
            save image
          </button>
        </div>
      )}

      <div className="my-5">
        <h2>Saved Images.....</h2>
      </div>

      {imgArray &&
        imgArray.map((imG: any) => (
          <img
            key={imG}
            src={imG}
            width="200"
            className="m-4 p-2"
            onClick={() => handleImageClick(imG)}
            style={{ cursor: "pointer" }}
          />
        ))}
    </>
  );
});
