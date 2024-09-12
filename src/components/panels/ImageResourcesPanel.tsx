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
  const [img, setImg] = useState();
  const canvasRef = useRef<fabric.Canvas | null>(null);
  const localRef = useRef(null);
  const [selectedImage, setSelectedImage] = useState<fabric.Image | null>(null);
  const [currentWidth, setCurrentWidth] = useState<number>(0);
  const [currentHeight, setCurrentHeight] = useState<number>(0);
  const [bool, setBool] = useState(true);

  
  const store = React.useContext(StoreContext);

  // Initialize the canvas on mount
  useEffect(() => {
    const canvas = store.getCanvas();

    if (canvas) {
      console.log("Canvas initialized", canvas);
      canvasRef.current = canvas;
    } else {
      console.error("Canvas not initialized");
    }
  }, []);



  useEffect(() => {
    const intervalId = setInterval(() => {
      const images = store.getNewImages();

      if (images.length > 0) {
        setImgFile(images[images.length - 1]);
        setBool(true)
      }

      const fetchApi = async () => {
        const res = await fetch("api/saveImage", {
          method: "GET",
        });
        if (!res.ok) return;
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

  // Monitor changes on the canvas (resizing of the image)
  useEffect(() => {
    const canvas = store.getCanvas();
    if (!canvas) return;

    const handleObjectModified = (event: fabric.IEvent) => {
      if (event.target && event.target === selectedImage) {
        updateDimensions(event.target as fabric.Image); // Update the dimensions on resize
      }
    };

    canvas.on("object:modified", handleObjectModified);

    return () => {
      canvas.off("object:modified", handleObjectModified);
    };
  }, [selectedImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    store.addImageResource(URL.createObjectURL(file));

    const canvas = store.getCanvas();
    canvasRef.current = canvas;

    if (!canvas) return alert("please select canva size");

    canvas.clear();

    fabric.Image.fromURL(URL.createObjectURL(file), (img) => {
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
        cornerStyle: 'circle',
        cornerSize: 10,
        hasControls: true,
        selectable: true,
        hasBorders: true,
        lockScalingFlip: true,
        lockMovementX: false,
        lockMovementY: false,
      });

      console.log("in canva", img);
      canvas.add(img);
      canvas.setActiveObject(img);
      setSelectedImage(img); // Set as the active image
      updateDimensions(img);
      canvas.renderAll();
      console.log("active img", img);
      // setActiveObject(img);
      store.setActiveObject(img);
    });
  };

  // Update the current width and height when the image is resized
  const updateDimensions = (img: fabric.Image) => {
    setCurrentWidth(Math.round(img.getScaledWidth()));
    setCurrentHeight(Math.round(img.getScaledHeight()));
  };



  const handleClick = async () => {
    if (!imgFile) return;

    try {
      const res = await fetch("/api/saveImage", {
        method: "POST",
        body: JSON.stringify({ base64: imgFile }),
      });

      if (!res.ok) throw new Error("error fetching api");
      setImgFile(null);
      setBool(false);
      const data = await res.json();
      console.log("data", data);
    } catch (error: any) {
      console.log("error in catch: ", error.message);
    }
  };

  const handleImageClick = (imageSrc: string) => {
    // store.addImageResource(imageSrc); // Add the clicked image to the canvas

    const canvas = store.getCanvas();
    canvasRef.current = canvas;

    if (!canvas) return alert("please select canva size");

    canvas.clear();

    fabric.Image.fromURL(imageSrc, (img) => {
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

      console.log("in canva", img);
      canvas.add(img);
      canvas.setActiveObject(img);
      canvas.renderAll();
      console.log("active img", img);
      store.setActiveObject(img);
    });
  };

  async function handleDeleteImage(image) {
    const baseUrl = "/api/saveImage";
    const param = {
      image: image,
    };
    const url = new URL(baseUrl, window.location.origin);
    // Append query parameters
    Object.keys(param).forEach((key) =>
      url.searchParams.append(key, param[key])
    );

    console.log(url.toString());

    try {
      const res = await fetch(url.toString(), {
        method: "DELETE",
      });

      if (!res.ok) throw new Error("error fetching api");
      const data = await res.json();
      console.log("data", data);
    } catch (error: any) {
      console.log("error in catch: ", error.message);
    }
  }


  const [gallery, setGallery] = useState(false);

  useEffect(() => {
    setGallery(store.getGallery())
  })

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

       {/* Display current image width and height */}
       {selectedImage && (
        <div className="my-9 mx-3 text-gray-500">
          <p className="text-sm bg-white"> Height x Width: &nbsp;   {currentHeight} x {currentWidth} px</p>
        </div>
      )}


      <div>
        {store.images.map((image, index) => {
          store.storeIndex(index);
          return (
            <ImageResource
              key={index}
              image={image}
              imG={img as any}
              index={index}
            />
          );
        })}
      </div>

      {imgFile && bool && (
        <div className="mt-5 text-center">
          <button
            className="text-white bg-green-500 hover:bg-green-700  px-4 py-2 rounded my-5 cur"
            onClick={handleClick}
          >
            save image
          </button>
        </div>
      )}

      <div className="my-5">
        <h2>Saved Images.....</h2>
      </div>

      { imgArray && gallery &&
        imgArray.map((imG: any, index) => (
          <div>
            <img
              key={index}
              src={imG}
              width="200"
              className="m-4 p-2"
              onClick={() => handleImageClick(imG)}
              style={{ cursor: "pointer" }}
            />

            

            <button
              className="text-white bg-red-500 hover:bg-red-700 p-3 rounded me-4 float-right cursor-pointer"
              onClick={ () => handleDeleteImage(imG)}
            >
              x
            </button>

            
          </div>
        ))}

     
    </>
  );
});
