import React, { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext";

const SongItem = ({ name, image, desc, id, index }) => {
  // Add index prop
  const { playWithId } = useContext(PlayerContext);

  return (
    <div
      onClick={() => playWithId(index)} // Use index instead of id
      className="min-w-[180px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
    >
      <img src={image} alt="" className="rounded w-full h-40 object-cover " />
      <p className="font-bold mt-2 mb-1">{name}</p>
      <p className="text-slate-200 text-sm">{desc}</p>
    </div>
  );
};

export default SongItem;
