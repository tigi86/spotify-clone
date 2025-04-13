import React, { useContext, useEffect, useRef } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import DisplayHome from "./DisplayHome";
import DisplayAlbum from "./DisplayAlbum";
import { PlayerContext } from "../context/PlayerContext";

const Display = () => {
  const { albumsData } = useContext(PlayerContext);
  const displayRef = useRef();
  const location = useLocation();
  const isAlbum = location.pathname.includes("album");
  const albumId = isAlbum ? location.pathname.split("/").pop() : "";

  // Safely get the album and bgColor with fallbacks
  const album =
    isAlbum && albumsData.length > 0
      ? albumsData?.find((x) => x._id === albumId)
      : null;
  const bgColor = album?.bgColour || "#121212";

  useEffect(() => {
    if (!displayRef.current) return;

    if (isAlbum) {
      displayRef.current.style.background = `linear-gradient(${bgColor},#121212)`;
    } else {
      displayRef.current.style.background = `#121212`;
    }
  }); // Added dependencies to prevent unnecessary re-renders

  return (
    <div
      ref={displayRef}
      className="w-[100%] m-2 px-6 pt-4 rounded bg-[#121212] text-white overflow-auto lg:w-[75%] lg:ml-0"
    >
      {albumsData.length > 0 ? (
        <Routes>
          <Route path="/" element={<DisplayHome />} />
          <Route
            path="/album/:id"
            element={
              album ? (
                <DisplayAlbum album={album} />
              ) : (
                <div>Album not found</div>
              )
            }
          />
        </Routes>
      ) : null}
    </div>
  );
};

export default Display;
