"use client";

import { fabric } from "fabric";
import React, { useEffect, useState, useRef } from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import { Resources } from "./Resources";
import { ElementsPanel } from "./panels/ElementsPanel";
import { Menu } from "./Menu";
import { TimeLine } from "./TimeLine";
import { Store } from "@/store/Store";
import "@/utils/fabric-utils";

export const EditorWithStore = () => {
  const [store] = useState(new Store());
  return (
    <StoreContext.Provider value={store}>
      <Editor></Editor>
    </StoreContext.Provider>
  );
};

export const Editor = observer(() => {

  const store = React.useContext(StoreContext);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [cropRect, setCropRect] = useState<fabric.Rect | null>(null);
  const [canvasSize, setCanvasSize] = useState<{
    width: number;
    height: number;
  } | null>(null);

  
  const sizes = [
    { width: 400, height: 300, label: "Small" },
    { width: 600, height: 400, label: "Medium" },
    { width: 800, height: 550, label: "Large" },
    { width: 900, height: 550, label: "XL" },
  ];

  useEffect(() => {
    if (!canvasSize) return;

    // Remove the old canvas if it exists
    if (fabricCanvasRef.current) {
      fabricCanvasRef.current.dispose();
    }

    const canvas = new fabric.Canvas("canvas", {
      height: canvasSize.height,
      width: canvasSize.width,
      backgroundColor: "#ffffff",
      preserveObjectStacking: true,

    });
    fabric.Object.prototype.transparentCorners = false;
    fabric.Object.prototype.cornerColor = "#00a0f5";
    fabric.Object.prototype.cornerStyle = "circle";
    fabric.Object.prototype.cornerStrokeColor = "#0063d8";
    fabric.Object.prototype.cornerSize = 10;

    // canvas mouse down without target should deselect active object
    canvas.on("mouse:down", function (e) {
      if (!e.target) {
        store.setSelectedElement(null);
      }
    });

    store.setCanvas(canvas);
    fabric.util.requestAnimFrame(function render() {
      canvas.renderAll();
      fabric.util.requestAnimFrame(render);
    });

    
    // Clean up when the component is unmounted or size changes
    return () => {
      if (fabricCanvasRef.current) {
        fabricCanvasRef.current.dispose();
      }
    };
  }, [canvasSize]);

  const removeSelectedImage = () => {
    const canvas = store.getCanvas();
    store.setCropRect(null);
    canvas?.clear();
  };

  const handleSizeChange = (size: { width: number; height: number }) => {
    setCanvasSize(size);
  };

  return (
    <div className="grid grid-rows-[500px_1fr] grid-cols-[80px_250px_1fr] h-[100svh] overflow-hidden">
      <div className="tile row-span-2 flex flex-col">
        <Menu />
      </div>
      <div className="row-span-2 flex flex-col overflow-scroll">
        <Resources />
      </div>

      <div
        id="grid-canvas-container"
        className="col-start-3 mt-0 bg-slate-100 flex flex-col justify-start h-screen "
      >
        
          <p className="text-center">Select Editor</p>
        <div className="flex  items-center justify-center gap-10 my-3">
          {sizes.map((size) => (
            <button
              key={size.label}
              onClick={() => handleSizeChange(size)}
              className="mx-2 text-white bg-blue-500 hover:bg-blue-700 px-4 py-2 rounded"
            >
              {size.label}
            </button>
          ))}
        </div>

        <canvas id="canvas" className="ml-5 pl-5"/>
      </div>
      <button
        onClick={removeSelectedImage}
        className="text-white bg-red-500 hover:bg-red-700 px-4 py-2 rounded mb-2 ms-2 h-10 w-20"
      >
        remove
      </button>
      {/* <div className="col-start-4 row-start-1"> 
        <ElementsPanel />
      </div>  */}
      {/* <div className="col-start-3 row-start-2 col-span-2 relative px-[10px] py-[4px] overflow-scroll">
        <TimeLine />
      </div> */}
      <div className="col-span-4 text-right px-2 text-[0.5em] bg-black text-white">
        Crafted By Amit Digga
      </div>
    </div>
  );
});
