import { createContext, useEffect, useRef, useState } from "react";
import axios from "axios";

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
  const audioRef = useRef();
  const seekBg = useRef();
  const seekBar = useRef();

  const url = "http://localhost:4000";

  const [songsData, setSongsData] = useState([]);
  const [albumsData, setAlbumsData] = useState([]);
  const [track, setTrack] = useState(null);
  const [playStatus, setPlayStatus] = useState(false);
  const [time, setTime] = useState({
    currentTime: { second: 0, minute: 0 },
    totalTime: { second: 0, minute: 0 },
  });
  const [userInteracted, setUserInteracted] = useState(false);

  // Handle user interaction for audio play
  useEffect(() => {
    const handleInteraction = () => {
      setUserInteracted(true);
      document.removeEventListener("click", handleInteraction);
    };
    document.addEventListener("click", handleInteraction);
    return () => document.removeEventListener("click", handleInteraction);
  }, []);

  const getSongsData = async () => {
    try {
      const response = await axios.get(`${url}/api/song/list`);

      // FIX: Add id property and ensure file URLs are correct
      const songsWithIds = response.data.songs.map((song, index) => ({
        ...song,
        id: index,
        // No need to modify file URL here if backend already provides full URL
      }));

      setSongsData(songsWithIds);
      if (songsWithIds.length > 0) {
        setTrack(songsWithIds[0]);
      }
    } catch (error) {
      console.error("Error fetching songs:", error);
    }
  };

  const getAlbumsData = async () => {
    try {
      const response = await axios.get(`${url}/api/album/list`);
      setAlbumsData(response.data.albums);
    } catch (error) {
      console.error("Error fetching albums:", error);
    }
  };

  const play = async () => {
    if (!audioRef.current || !track) return;

    try {
      await audioRef.current.play();
      setPlayStatus(true);
    } catch (err) {
      console.error("Playback failed:", err);
      setPlayStatus(false);
    }
  };

  const pause = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setPlayStatus(false);
    }
  };
  const playWithId = async (id) => {
    if (id >= 0 && id < songsData.length) {
      const selectedTrack = songsData[id];
      // console.log("Selected track:", selectedTrack);

      // 1. Pause and reset current audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }

      // 2. Set new track
      setTrack(selectedTrack);

      // 3. Wait for React state to update
      await new Promise((resolve) => setTimeout(resolve, 50));

      if (audioRef.current) {
        try {
          // 4. Set CORS mode and source
          audioRef.current.crossOrigin = "anonymous";
          audioRef.current.src = selectedTrack.audio;

          // 5. Important: Add event listeners first
          await new Promise((resolve, reject) => {
            audioRef.current.oncanplaythrough = () => {
              // console.log("Audio ready to play");
              resolve();
            };
            audioRef.current.onerror = (e) => {
              console.error("Audio error:", e);
              reject(new Error("Audio load failed"));
            };

            // Load the audio
            audioRef.current.load();
          });

          // 6. Only play if user has interacted
          if (userInteracted) {
            // console.log("Attempting to play...");
            await audioRef.current.play();
            setPlayStatus(true);
            // console.log("Playback started successfully");
          }
        } catch (err) {
          console.error("Playback error:", err);
          setPlayStatus(false);

          // 7. Fallback for Cloudinary issues
          if (err.name === "NotSupportedError") {
            console.log("Trying alternative playback method");
            const audio = new Audio(selectedTrack.audio);
            audio.crossOrigin = "anonymous";
            await audio
              .play()
              .catch((e) => console.error("Fallback failed:", e));
          }
        }
      }
    }

    // await songsData.map((item) => {
    //   if (id === item._id) {
    //     setTrack(item);
    //   }
    // });

    // await audioRef.current.play();
    // setPlayStatus(true);
  };
  const previous = () => {
    // if (track?.id > 0) {
    //   playWithId(track.id - 1);
    // }

    songsData.map(async (item, index) => {
      if (track._id === item._id && index > 0) {
        await setTrack(songsData[index - 1]);
        await audioRef.current.play();
        setPlayStatus(true);
      }
    });
  };

  const next = () => {
    // if (track?.id < songsData.length - 1) {
    //   playWithId(track.id + 1);
    // }

    songsData.map(async (item, index) => {
      if (track._id === item._id && index < songsData.length) {
        await setTrack(songsData[index + 1]);
        await audioRef.current.play();
        setPlayStatus(true);
      }
    });
  };

  const seekSong = (e) => {
    if (audioRef.current && seekBg.current) {
      const seekPosition =
        (e.nativeEvent.offsetX / seekBg.current.offsetWidth) *
        audioRef.current.duration;
      audioRef.current.currentTime = seekPosition;
    }
  };

  useEffect(() => {
    const updateTime = () => {
      if (audioRef.current && !isNaN(audioRef.current.duration)) {
        seekBar.current.style.width = `${
          (audioRef.current.currentTime / audioRef.current.duration) * 100
        }%`;

        setTime({
          currentTime: {
            second: Math.floor(audioRef.current.currentTime % 60),
            minute: Math.floor(audioRef.current.currentTime / 60),
          },
          totalTime: {
            second: Math.floor(audioRef.current.duration % 60),
            minute: Math.floor(audioRef.current.duration / 60),
          },
        });
      }
    };

    const audio = audioRef.current;
    audio?.addEventListener("timeupdate", updateTime);
    return () => audio?.removeEventListener("timeupdate", updateTime);
  }, []);

  useEffect(() => {
    getSongsData();
    getAlbumsData();
  }, []);

  const contextValue = {
    audioRef,
    seekBar,
    seekBg,
    track,
    time,
    playStatus,
    play,
    pause,
    playWithId,
    previous,
    next,
    seekSong,
    songsData,
    albumsData,
    setTrack,
  };

  return (
    <PlayerContext.Provider value={contextValue}>
      {props.children}
    </PlayerContext.Provider>
  );
};

export default PlayerContextProvider;

// import { createContext, useEffect, useRef, useState } from "react";
// import axios from "axios";

// export const PlayerContext = createContext();

// const PlayerContextProvider = (props) => {
//   const audioRef = useRef();
//   const seekBg = useRef();
//   const seekBar = useRef();

//   const url = "http://localhost:4000";

//   const [songsData, setSongsData] = useState([]);
//   const [albumsData, setAlbumsData] = useState([]);
//   const [track, setTrack] = useState(null);
//   const [playStatus, setPlayStatus] = useState(false);
//   const [time, setTime] = useState({
//     currentTime: { second: 0, minute: 0 },
//     totalTime: { second: 0, minute: 0 },
//   });
//   const [isLoading, setIsLoading] = useState(true);
//   const [userInteracted, setUserInteracted] = useState(false);

//   // Set user interacted flag on any user action
//   useEffect(() => {
//     const handleFirstInteraction = () => {
//       setUserInteracted(true);
//       document.removeEventListener("click", handleFirstInteraction);
//       document.removeEventListener("keydown", handleFirstInteraction);
//       document.removeEventListener("touchstart", handleFirstInteraction);
//     };

//     document.addEventListener("click", handleFirstInteraction);
//     document.addEventListener("keydown", handleFirstInteraction);
//     document.addEventListener("touchstart", handleFirstInteraction);

//     return () => {
//       document.removeEventListener("click", handleFirstInteraction);
//       document.removeEventListener("keydown", handleFirstInteraction);
//       document.removeEventListener("touchstart", handleFirstInteraction);
//     };
//   }, []);

//   // Data fetching functions
//   const getSongsData = async () => {
//     try {
//       const response = await axios.get(`${url}/api/song/list`);
//       const songs = response.data.songs.map((song, index) => ({
//         ...song,
//         id: index, // Ensure each song has an id property
//       }));
//       setSongsData(songs);
//       if (songs.length > 0 && !track) {
//         setTrack(songs[0]);
//       }
//     } catch (error) {
//       console.error("Error fetching songs:", error);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const getAlbumsData = async () => {
//     try {
//       const response = await axios.get(`${url}/api/album/list`);
//       setAlbumsData(response.data.albums);
//     } catch (error) {
//       console.error("Error fetching albums:", error);
//     }
//   };

//   // Audio control functions
//   const play = async () => {
//     if (!audioRef.current || !track) return;

//     try {
//       await audioRef.current.play();
//       setPlayStatus(true);
//     } catch (error) {
//       console.log("Playback requires user interaction");
//       setPlayStatus(false);
//     }
//   };

//   const pause = () => {
//     if (audioRef.current) {
//       audioRef.current.pause();
//       setPlayStatus(false);
//     }
//   };

//   const playWithId = async (id) => {
//     if (!songsData[id]) return;

//     await setTrack(songsData[id]);

//     // Only auto-play if user has interacted
//     if (userInteracted) {
//       await play();
//     } else {
//       setPlayStatus(false);
//     }
//   };

//   const previous = () => {
//     if (track?.id > 0) {
//       playWithId(track.id - 1);
//     }
//   };

//   const next = () => {
//     if (track?.id < songsData.length - 1) {
//       playWithId(track.id + 1);
//     }
//   };

//   const seekSong = (e) => {
//     if (audioRef.current && !isNaN(audioRef.current.duration)) {
//       const seekPosition =
//         (e.nativeEvent.offsetX / seekBg.current.offsetWidth) *
//         audioRef.current.duration;
//       audioRef.current.currentTime = Math.min(
//         seekPosition,
//         audioRef.current.duration
//       );
//     }
//   };

//   // Update time and seek bar
//   useEffect(() => {
//     const updateTime = () => {
//       if (audioRef.current && !isNaN(audioRef.current.duration)) {
//         const percentage =
//           (audioRef.current.currentTime / audioRef.current.duration) * 100;
//         seekBar.current.style.width = `${percentage}%`;

//         setTime({
//           currentTime: {
//             second: Math.floor(audioRef.current.currentTime % 60),
//             minute: Math.floor(audioRef.current.currentTime / 60),
//           },
//           totalTime: {
//             second: Math.floor(audioRef.current.duration % 60),
//             minute: Math.floor(audioRef.current.duration / 60),
//           },
//         });
//       }
//     };

//     const audio = audioRef.current;
//     if (audio) {
//       audio.addEventListener("timeupdate", updateTime);
//       return () => audio.removeEventListener("timeupdate", updateTime);
//     }
//   }, []);

//   // Load data on mount
//   useEffect(() => {
//     getSongsData();
//     getAlbumsData();
//   }, []);

//   // Handle track changes
//   useEffect(() => {
//     if (track && userInteracted) {
//       play().catch((e) => console.log("Autoplay blocked:", e.message));
//     }
//   }, [track, userInteracted]);

//   const contextValue = {
//     audioRef,
//     seekBar,
//     seekBg,
//     track,
//     time,
//     playStatus,
//     isLoading,
//     userInteracted,
//     play,
//     pause,
//     playWithId,
//     previous,
//     next,
//     seekSong,
//     songsData,
//     albumsData,
//     setTrack,
//   };

//   return (
//     <PlayerContext.Provider value={contextValue}>
//       {props.children}
//     </PlayerContext.Provider>
//   );
// };

// export default PlayerContextProvider;
