"use client";
import React, { useEffect, useRef, useState } from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { fabric } from "fabric";
import { MdAdd } from "react-icons/md";

type ImageResourceProps = {
  image: string;
  index: number;
};

export const ImageResource = observer(
  ({ image, index }: ImageResourceProps) => {
    const store = React.useContext(StoreContext);
    const canvasRef = useRef<fabric.Canvas | null>(null);
    const [cropRect, setCropRect] = useState<fabric.Rect | null>(null);
    const [activeObject, setActiveObject] = useState<fabric.Image | null>(null);
    const [storedImage, setStoredImage] = useState<string | null>(null)


    // Ensure the canvas reference is set
    useEffect(() => {
      const canvas = store.getCanvas();
      const image = store.getImages();
      setStoredImage(image[0])

      if (canvas) {
        canvasRef.current = canvas;
      }
    }, [store]);

    const handleAddImage = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;

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

        console.log("in canva", img);
        canvas.add(img);
        canvas.setActiveObject(img);
        canvas.renderAll();
        console.log("active img", img);
        setActiveObject(img);
      });
    };

    const logRectangleInfo = (rect: fabric.Rect) => {
      console.log(
        "Rectangle Info - Left:",
        rect.left,
        "Top:",
        rect.top,
        "Width:",
        rect.width,
        "Height:",
        rect.height
      );
    };

    const constrainRectangle = (rect: fabric.Rect, canvas: fabric.Canvas) => {
      const canvasWidth = canvas.getWidth();
      const canvasHeight = canvas.getHeight();

      // Ensure the rectangle stays within canvas boundaries
      const constrainedLeft = Math.max(
        0,
        Math.min(rect.left ?? 0, canvasWidth - (rect.width ?? 0))
      );
      const constrainedTop = Math.max(
        0,
        Math.min(rect.top ?? 0, canvasHeight - (rect.height ?? 0))
      );

      rect.set({
        left: constrainedLeft,
        top: constrainedTop,
      });

      // Ensure the width and height do not exceed the canvas boundaries
      const constrainedWidth = Math.min(
        rect.width ?? 0,
        canvasWidth - constrainedLeft
      );
      const constrainedHeight = Math.min(
        rect.height ?? 0,
        canvasHeight - constrainedTop
      );

      rect.set({
        width: constrainedWidth,
        height: constrainedHeight,
      });

      logRectangleInfo(rect); // Log rectangle info for debugging
    };




    const adjustCropRectanglePosition = (rect: fabric.Rect, offsetY: number, canvas) => {
      const currentTop = rect.top ?? 0;
      rect.set('top', currentTop + offsetY);
      canvas.renderAll();
    };






    
    const handleCrop = () => {
      const canvas = canvasRef.current;
      if (!canvas || !activeObject) return;

      if (cropRect) {
        constrainRectangle(cropRect, canvas);

        // Draw the crop rectangle
        canvas.renderAll();

        const img = activeObject;
        const imgElement = img.getElement();

        // Ensure image scaling factors are defined
        const scaleX = img.scaleX ?? 1;
        const scaleY = img.scaleY ?? 1;

        // Get crop rectangle bounding box
        const {
          left: rectLeft,
          top: rectTop,
          width: rectWidth,
          height: rectHeight,
        } = cropRect.getBoundingRect();

        // Calculate image position and scale
        const imgLeft = img.left ?? 0;
        const imgTop = img.top ?? 0;

        // Calculate scaled crop dimensions
        const scaledLeft = (rectLeft - imgLeft) / scaleX;
        const scaledTop = (rectTop - imgTop) / scaleY;
        const scaledWidth = rectWidth / scaleX;
        const scaledHeight = rectHeight / scaleY;

        console.log(
          "Crop Rectangle - Left:",
          rectLeft,
          "Top:",
          rectTop,
          "Width:",
          rectWidth,
          "Height:",
          rectHeight
        );
        console.log(
          "Scaled Crop - Left:",
          scaledLeft,
          "Top:",
          scaledTop,
          "Width:",
          scaledWidth,
          "Height:",
          scaledHeight
        );

        // Create a temporary canvas for cropping
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        if (!tempCtx) return;

        // Set temporary canvas size
        tempCanvas.width = scaledWidth;
        tempCanvas.height = scaledHeight;

        // Draw the cropped portion of the image onto the temporary canvas
        tempCtx.drawImage(
          imgElement,
          scaledLeft,
          scaledTop,
          scaledWidth,
          scaledHeight,
          0,
          0,
          scaledWidth,
          scaledHeight
        );

        // Create a data URL for the cropped image
        const croppedImageDataUrl = tempCanvas.toDataURL("image/png");
        store.setAddNewImages(croppedImageDataUrl);



        // Create a new fabric image from the cropped data
        fabric.Image.fromURL(tempCanvas.toDataURL(), (croppedImg) => {
          canvas.clear(); // Clear existing canvas

          // Set properties for the cropped image
          croppedImg.set({
            left: 0,
            top: 0,
            angle: 0,
            padding: 10,
            cornerSize: 10,
          });

          // Add the cropped image to the canvas
          canvas.add(croppedImg);
          canvas.renderAll();
        });

        // Clear the crop rectangle
        canvas.remove(cropRect);
        setCropRect(null);
      } else {
        // Add crop rectangle
        const rect = new fabric.Rect({
          left: 50,
          top: 50,
          width: 100,
          height: 100,
          fill: "rgba(0, 0, 0, 0.3)", // Transparent overlay
          stroke: "red",
          strokeWidth: 2,
          hasControls: true, // Allow resizing and moving
          selectable: true, // Allow selection
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        setCropRect(rect);
        constrainRectangle(rect, canvas);
        adjustCropRectanglePosition(rect, 100, canvas); 

        // Update crop rectangle state on modification
        canvas.on("object:modified", (e) => {
          if (e.target === rect) {
            setCropRect(e.target as fabric.Rect);
          }
        });

        // Disable selection when cropping
        canvas.on("mouse:down", (e) => {
          if (e.target === rect) {
            canvas.selection = false;
          }
        });
      }
    };

    // const handleCrop = () => {
    //   const canvas = canvasRef.current;
    //   if (!canvas || !activeObject) {
    //     console.error('Canvas or active object is not available.');
    //     return;
    //   }

    //   if (cropRect) {
    //     // Crop rectangle is present, perform cropping
    //     console.log('Crop rectangle found:', cropRect);

    //     const { left, top, width, height } = cropRect.getBoundingRect();

    //     // Ensure image scaling factors are defined
    //     const scaleX = activeObject.scaleX ?? 1;
    //     const scaleY = activeObject.scaleY ?? 1;

    //     // Calculate scaled crop dimensions
    //     const scaledLeft = (left - activeObject.left!) / scaleX;
    //     const scaledTop = (top - activeObject.top!) / scaleY;
    //     const scaledWidth = width / scaleX;
    //     const scaledHeight = height / scaleY;

    //     // Create a temporary canvas for cropping
    //     const tempCanvas = document.createElement('canvas');
    //     const tempCtx = tempCanvas.getContext('2d');
    //     if (!tempCtx) return;

    //     // Set temporary canvas size
    //     tempCanvas.width = scaledWidth;
    //     tempCanvas.height = scaledHeight;

    //     // Draw the cropped portion of the image onto the temporary canvas
    //     tempCtx.drawImage(
    //       activeObject.getElement(),
    //       scaledLeft,
    //       scaledTop,
    //       scaledWidth,
    //       scaledHeight,
    //       0,
    //       0,
    //       scaledWidth,
    //       scaledHeight
    //     );

    //     // Create a new fabric image from the cropped data
    //     fabric.Image.fromURL(tempCanvas.toDataURL(), (croppedImg) => {
    //       canvas.clear(); // Clear existing canvas
    //       croppedImg.set({
    //         left: 0,
    //         top: 0,
    //         angle: 0,
    //         padding: 10,
    //         cornerSize: 10,
    //       });
    //       canvas.add(croppedImg);
    //       canvas.renderAll();
    //     });

    //     // Clear crop rectangle
    //     canvas.remove(cropRect);
    //     setCropRect(null);
    //   } else {
    //     console.error('Crop rectangle is not available.');
    //     // Add crop rectangle
    //     const rect = new fabric.Rect({
    //       left: 50,
    //       top: 50,
    //       width: 100,
    //       height: 100,
    //       fill: 'rgba(0, 0, 0, 0.3)', // Transparent overlay
    //       stroke: 'red',
    //       strokeWidth: 2,
    //       hasControls: true, // Allow resizing and moving
    //       selectable: true, // Allow selection
    //     });
    //     canvas.add(rect);
    //     canvas.setActiveObject(rect);
    //     setCropRect(rect);

    //     // Update crop rectangle state on modification
    //     canvas.on('object:modified', (e) => {
    //       if (e.target === rect) {
    //         setCropRect(e.target as fabric.Rect);
    //       }
    //     });

    //     // Disable selection when cropping
    //     canvas.on('mouse:down', (e) => {
    //       if (e.target === rect) {
    //         canvas.selection = false;
    //       }
    //     });
    //   }
    // };

    const handleDownload = () => {
      const canvas = canvasRef.current;
      if (!canvas) {
        console.error("Canvas is not available.");
        return;
      }

      // Get the data URL of the full canvas content
      const dataURL = canvas.toDataURL("image/png");

      // Create a link element to download the image
      const link = document.createElement("a");
      link.href = dataURL;
      link.download = `image-${index}.png`; // Set the file name
      link.click(); // Trigger the download
    };




    const handleAddText = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
  
      // Prompt the user to enter the text
      const text = prompt("Enter the text to add:");
      if (!text) return;
  
      // Create a new Text object
      const textObj = new fabric.Text(text, {
        left: 50, // Position on the canvas
        top: 50,  // Position on the canvas
        fontSize: 20,
        fill: 'white', // Text color
        fontFamily: 'Arial', // Font family
      });
  
      // Add the Text object to the canvas
      canvas.add(textObj);
      canvas.setActiveObject(textObj);
      canvas.renderAll();
    };

    


    
    return (
      <div className="relative rounded-lg overflow-hidden items-center bg-slate-800 m-[15px] flex flex-col ">
        <img src={storedImage as any} alt="image to be edited" />
        <button
          className="hover:bg-[#00a0f5] bg-[rgba(0,0,0,.25)] rounded z-10 text-white font-bold py-1 absolute text-lg bottom-2 right-2"
          onClick={handleAddImage}
        >
          <MdAdd size="25" />
        </button>
        <button
          onClick={handleCrop}
          className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded mb-2"
        >
          {cropRect ? "Apply Crop" : "Crop"}
        </button>
        <button
        onClick={handleAddText}
        className="text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded mb-2"
      >
        Add Text
      </button>
        <button
          onClick={handleDownload}
          className="text-white bg-green-500 hover:bg-green-700 px-4 py-2 rounded mb-2"
        >
          Download
        </button>
      </div>
    );
  }
);
