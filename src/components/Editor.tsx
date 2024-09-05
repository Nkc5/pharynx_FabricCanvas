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
}

export const Editor = observer(() => {
  const store = React.useContext(StoreContext);
  const fabricCanvasRef = useRef<fabric.Canvas | null>(null);
  const [cropRect, setCropRect] = useState<fabric.Rect | null>(null);


  useEffect(() => {
    const canvas = new fabric.Canvas("canvas", {
      height: 500,
      width: 600,
      backgroundColor: "#ededed",
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


  }, []);



  const removeSelectedImage = () => {
    if (store.canvas) {
      const activeObject = store.canvas.getActiveObject(); // Get the currently selected object
      console.log("Active Object:", activeObject);
      console.log("Canvas objects:", store.canvas.getObjects())
      
      if (activeObject && activeObject.type === 'image') {
        store.canvas.remove(activeObject); // Remove the image from the canvas
        store.canvas.discardActiveObject(); // Deselect the object
        store.canvas.renderAll(); // Re-render the canvas to reflect changes
      } else {
        console.log("No image selected or the selected object is not an image.");
      }
    } else {
      console.log("Canvas is not initialized.");
    }
  };
  




  return (
    <div className="grid grid-rows-[500px_1fr] grid-cols-[72px_250px_1fr] h-[100svh] overflow-hidden">

      <div className="tile row-span-2 flex flex-col">
        <Menu />
      </div>
      <div className="row-span-2 flex flex-col overflow-scroll">
        <Resources  />
      </div>
      <div id="grid-canvas-container" className="col-start-3  bg-slate-100 flex justify-center items-center h-screen">
        <canvas id="canvas"  />
        <button onClick={removeSelectedImage} className="text-white bg-red-500 hover:bg-red-700 px-4 py-2 rounded ms-2 mb-2">remove</button>
      </div>
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
