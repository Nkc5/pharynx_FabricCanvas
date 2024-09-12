"use client";
import React, { useState } from "react";
import { StoreContext } from "@/store";
import { observer } from "mobx-react";
import {
  MdDownload,
  MdVideoLibrary,
  MdImage,
  MdTransform,
  MdTitle,
  MdAudiotrack,
  MdOutlineFormatColorFill,
  MdMovieFilter,
} from "react-icons/md";
import { Store } from "@/store/Store";





export const Menu = observer(() => {
  const store = React.useContext(StoreContext);


const [bool, setBool] = useState(false);
function viewGallery(){
  setBool(!bool);
  store.setGallery(!bool);
}


  return (
    <ul className="bg-white h-full">
      {MENU_OPTIONS.map((option) => {
        const isSelected = store.selectedMenuOption === option.name;
        return (
          <li
            key={option.name}
            className={`h-[72px] w-[72px] flex flex-col items-center justify-center ${
              isSelected ? "bg-slate-200" : ""
            }`}
          >
            <button
              onClick={() => option.action(store)}
              className={`flex flex-col items-center`}
            >
              <option.icon size="20" color={isSelected ? "#000" : "#444"} />
              <div
                className={`text-[0.6rem] hover:text-black ${
                  isSelected ? "text-black" : "text-slate-600"
                }`}
              >
                {option.name}
              </div>
            </button>
          </li>
        );
      })}

      <div className="flex flex-col mt-4 pt-5">
      
        <button  className="text-white bg-blue-500 hover:bg-blue-700 px-1 py-2 rounded mb-2" onClick={store.handleCrop}>{store.getCroptRect() ? "Apply Crop" : "Crop"}</button> <br />
        <button  className="text-white bg-blue-500 hover:bg-blue-700 px-1 py-2 rounded mb-2" onClick={store.handleAddText}>Text</button> <br />
        <button  className="text-white bg-blue-500 hover:bg-blue-700 px-1 py-2 rounded mb-2" onClick={store.handleDownload}>Download</button>

        <button  className="text-white bg-blue-500 hover:bg-blue-700 px-1 py-2 rounded mt-3" onClick={viewGallery}>{bool ?  "hide Gallery": "view Gallery"}</button>

      </div>



    </ul>
  );
});

const MENU_OPTIONS = [
  {
    name: "Image",
    icon: MdImage,
    action: (store: Store) => {
      store.setSelectedMenuOption("Image");
    },
  },
 
];
