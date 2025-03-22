import { useEffect, useState } from "react";
import { supabase } from "../supabase";
import "./Songs.css";

const Songs = ({ onSelectSong }) => {
  const [songs, setSongs] = useState([]);

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    const { data, error } = await supabase.from("songs").select("*");

    if (error) {
      console.error("Lỗi lấy danh sách bài hát:", error.message);
    } else {
      setSongs(data);
    }
  };

  const deleteSong = async (id) => {
    const { error } = await supabase.from("songs").delete().eq("id", id);

    if (error) {
      console.error("Lỗi xóa bài hát:", error.message);
    } else {
      setSongs(songs.filter((song) => song.id !== id));
    }
  };

  return (
    <div>
      <h1>
        <i class="fa-solid fa-music"></i> Song List
      </h1>

      <ul className="song-list">
        {songs.map((song, index) => (
          <li
            key={song.id}
            className="song-item"
            onClick={() => onSelectSong(song)}
          >
            <span className="song-index">{index + 1}</span>
            <img
              src={song.thumbnail_url}
              alt={song.title}
              className="song-thumbnail"
            />
            <div className="song-info">
              <p className="song-title">{song.title}</p>
              <p className="song-artist">{song.artist}</p>
            </div>
            <div className="song-actions">
              <span className="song-duration">3:18</span>
              <a
                href="#"
                className="delete-button"
                onClick={(e) => {
                  e.stopPropagation();
                  deleteSong(song.id);
                }}
              >
                <i className="fa-solid fa-trash"></i>
              </a>
              <a
                href={song.url}
                download={song.title}
                className="download-button"
                onClick={(e) => e.stopPropagation()}
              >
                <i className="fa-solid fa-download"></i>
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Songs;
