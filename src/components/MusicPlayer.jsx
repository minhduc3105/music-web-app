import { useEffect, useState, useRef } from "react";
import { supabase } from "../supabase";
import "./MusicPlayer.css";

const MusicPlayer = ({
  song,
  songs,
  onSelectSong,
  user,
  toggleShowPlaylist,
}) => {
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [volume, setVolume] = useState(1); // Volume state
  const audioRef = useRef(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
      audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
      audioRef.current.addEventListener("ended", handleEnded);
      audioRef.current.addEventListener("play", handlePlay);
      audioRef.current.addEventListener("pause", handlePause);
    }
    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener(
          "loadedmetadata",
          handleLoadedMetadata
        );
        audioRef.current.removeEventListener("ended", handleEnded);
        audioRef.current.removeEventListener("play", handlePlay);
        audioRef.current.removeEventListener("pause", handlePause);
      }
    };
  }, [song]);

  useEffect(() => {
    if (audioRef.current && song) {
      audioRef.current.play();
    }
  }, [song]);

  useEffect(() => {
    if (song && user) {
      setIsFavorite(song.favourites.includes(user.id));
    }
  }, [song, user]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const handleTimeUpdate = () => {
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    setDuration(audioRef.current.duration);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    if (isRepeat) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      handleNext();
    }
  };

  const togglePlayPause = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  };

  const toggleRepeat = () => {
    setIsRepeat(!isRepeat);
    refreshPlaylist();
  };

  const toggleShuffle = () => {
    setIsShuffle(!isShuffle);
    refreshPlaylist();
  };

  const handlePrev = () => {
    const currentIndex = songs.findIndex((s) => s.id === song.id);
    const prevIndex = (currentIndex - 1 + songs.length) % songs.length;
    onSelectSong(songs[prevIndex]);
  };

  const handleNext = () => {
    const currentIndex = songs.findIndex((s) => s.id === song.id);
    const nextIndex = isShuffle
      ? Math.floor(Math.random() * songs.length)
      : (currentIndex + 1) % songs.length;
    onSelectSong(songs[nextIndex]);
  };

  const toggleFavorite = async () => {
    const updatedFavourites = isFavorite
      ? song.favourites.filter((id) => id !== user.id)
      : [...song.favourites, user.id];

    const { data, error } = await supabase
      .from("songs")
      .update({ favourites: updatedFavourites })
      .eq("id", song.id);

    if (error) {
      console.error("Error updating favourites:", error.message);
    } else {
      setIsFavorite(!isFavorite);
      onSelectSong({ ...song, favourites: updatedFavourites });
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const refreshPlaylist = (currentSong = song) => {
    const currentIndex = songs.findIndex((s) => s.id === currentSong.id);
    const updatedSongs = songs.slice(currentIndex);
    onSelectSong(currentSong, updatedSongs);
  };

  if (!song) {
    return null;
  }

  return (
    <footer className="music-player">
      <div className="currently-playing">
        <img src={song.thumbnail_url} alt={song.title} />
        <div>
          <h3>{song.title}</h3>
          <p>{song.artist}</p>
        </div>
      </div>
      <div className="playback-controls">
        <button onClick={toggleRepeat} className={isRepeat ? "active" : ""}>
          <i className="fa fa-repeat"></i>
        </button>
        <button onClick={handlePrev}>
          <i className="fa fa-step-backward"></i>
        </button>
        <button onClick={togglePlayPause}>
          <i className={`fa ${isPlaying ? "fa-pause" : "fa-play"}`}></i>
        </button>
        <button onClick={handleNext}>
          <i className="fa fa-step-forward"></i>
        </button>
        <button onClick={toggleShuffle} className={isShuffle ? "active" : ""}>
          <i className="fa fa-random"></i>
        </button>
      </div>
      <div className="progress-bar">
        <span>{formatTime(currentTime)}</span>
        <div className="bar">
          <div
            className="progress"
            style={{ width: `${(currentTime / duration) * 100}%` }}
          ></div>
        </div>
        <span>{formatTime(duration)}</span>
      </div>
      <div className="additional-controls">
        <div className="volume-control">
          <i className="fa fa-volume-up"></i>
          <input
            type="range"
            min="0"
            max="1"
            step="0.01"
            value={volume}
            onChange={(e) => setVolume(e.target.value)}
          />
        </div>
        <button onClick={toggleShowPlaylist}>
          <i className="fa fa-list"></i>
        </button>
        <button onClick={toggleFavorite}>
          <i
            className={`fa ${
              isFavorite ? "fa-solid fa-heart" : "fa-regular fa-heart"
            }`}
          ></i>
        </button>
      </div>
      <audio
        ref={audioRef}
        id="audio-player"
        src={song.url}
        controls
        style={{ display: "none" }}
      ></audio>
    </footer>
  );
};

export default MusicPlayer;
