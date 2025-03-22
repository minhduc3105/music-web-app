import { supabase } from "../supabase";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import "./Dashboard.css";
import MusicUploader from "../components/MusicUploader";
import Songs from "../components/Songs";
import Favourite from "../components/Favourite";
import Playlist from "../components/Playlist";
import MusicPlayer from "../components/MusicPlayer";
import RightSidebar from "../components/RightSidebar";

const Header = ({ onContentChange }) => {
  return (
    <header className="top-nav">
      <a
        href="#"
        className="top-nav-item"
        onClick={() => onContentChange("songs")}
      >
        <i className="fa-solid fa-tv"></i> Home
      </a>
      <input type="text" placeholder="Search..." className="search-input" />
      <a href="#" className="top-nav-item top-nav-item-right">
        <i className="fa-solid fa-gear"></i> Setting
      </a>
      <a href="#" className="top-nav-item top-nav-item-right">
        <i className="fa-solid fa-user"></i> Profile
      </a>
    </header>
  );
};

const Sidebar = ({ onLogout, onContentChange }) => {
  return (
    <aside className="sidebar">
      <h2>Menu</h2>
      <ul className="sidebar-menu">
        <a
          href="#"
          className="sidebar-menu-item"
          onClick={() => onContentChange("songs")}
        >
          <i className="fa fa-music"></i> Songs
        </a>
        <a
          href="#"
          className="sidebar-menu-item"
          onClick={() => onContentChange("favourite")}
        >
          <i className="fa-regular fa-bookmark"></i> Favourite
        </a>
        <a
          href="#"
          className="sidebar-menu-item"
          onClick={() => onContentChange("playlist")}
        >
          <i className="fa-solid fa-clipboard-list"></i> Playlist
        </a>
        <a
          href="#"
          className="sidebar-menu-item"
          onClick={() => onContentChange("upload")}
        >
          <i className="fa-solid fa-upload"></i> Upload
        </a>
      </ul>
      <a href="#" className="sidebar-signout" onClick={() => onLogout()}>
        <i className="fa-solid fa-right-from-bracket"></i> Sign Out
      </a>
    </aside>
  );
};

const MainContent = ({ content, onSelectSong, setSongs, user }) => {
  useEffect(() => {
    if (content === "songs") {
      fetchSongs();
    }
  }, [content]);

  const fetchSongs = async () => {
    const { data, error } = await supabase.from("songs").select("*");
    if (error) {
      console.error("Error fetching songs:", error.message);
    } else {
      setSongs(data);
    }
  };

  return (
    <main className="main-content">
      {content === "songs" && <Songs onSelectSong={onSelectSong} />}
      {content === "favourite" && (
        <Favourite user={user} onSelectSong={onSelectSong} />
      )}
      {content === "playlist" && <Playlist />}
      {content === "upload" && <MusicUploader />}
    </main>
  );
};

const Dashboard = () => {
  const [content, setContent] = useState("songs");
  const [selectedSong, setSelectedSong] = useState(null);
  const [songs, setSongs] = useState([]);
  const [showPlaylist, setShowPlaylist] = useState(false); // State for showing playlist
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error || !data.user) {
        navigate("/login");
      } else {
        setUser(data.user);
      }
    };
    checkUser();
  }, [navigate]);

  useEffect(() => {
    getSongList();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleContentChange = (newContent) => {
    setContent(newContent);
  };

  const handleSelectSong = (song, songList = songs) => {
    setSelectedSong(song);
    setSongs(songList);
  };

  const getNextSong = () => {
    if (!selectedSong || songs.length === 0) return null;
    const currentIndex = songs.findIndex((s) => s.id === selectedSong.id);
    const nextIndex = (currentIndex + 1) % songs.length;
    return songs[nextIndex];
  };

  const getSongList = async () => {
    const { data, error } = await supabase.from("songs").select("*");
    if (error) {
      console.error("Error fetching songs:", error.message);
    } else {
      setSongs(data);
    }
  };

  const toggleShowPlaylist = () => {
    setShowPlaylist(!showPlaylist);
  };

  return (
    <div className="container">
      <Header onContentChange={handleContentChange} />
      <Sidebar onLogout={handleLogout} onContentChange={handleContentChange} />
      <MainContent
        content={content}
        onSelectSong={handleSelectSong}
        setSongs={setSongs}
        user={user}
      />
      <RightSidebar
        song={selectedSong}
        nextSong={getNextSong()}
        onSelectSong={handleSelectSong}
        showPlaylist={showPlaylist}
        songs={songs}
      />
      <MusicPlayer
        song={selectedSong}
        songs={songs}
        onSelectSong={handleSelectSong}
        user={user}
        toggleShowPlaylist={toggleShowPlaylist}
      />
    </div>
  );
};

export default Dashboard;
