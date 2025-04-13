import React, { useContext } from "react";
import Sidebar from "./components/Sidebar";
import Player from "./components/Player";
import Display from "./components/Display";
import { PlayerContext } from "./context/PlayerContext";

const App = () => {
  const { audioRef, track, songsData } = useContext(PlayerContext);

  return (
    <div className="h-screen bg-black">
      {songsData.length !== 0 ? (
        <>
          <div className="flex h-[90%]">
            <Sidebar />
            <Display />
          </div>
          <Player />
        </>
      ) : (
        <div className="text-white text-center pt-10">Loading...</div>
      )}
      {/* <audio ref={audioRef} src={track ? track.file : null} preload="auto" /> */}
      <audio
  ref={audioRef}
  src={track?.audio}
  preload="metadata" // Better for Cloudinary files
  crossOrigin="anonymous" // Important for Cloudinary CORS
/>
    </div>
  );
};

export default App;
