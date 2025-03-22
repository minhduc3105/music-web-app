import { useEffect, useState } from "react";
import { supabase } from "../supabase";

const Favourite = ({ user, onSelectSong }) => {
  const [favoriteSongs, setFavoriteSongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const fetchFavoriteSongs = async () => {
      if (!user) return;

      setLoading(true);
      setErrorMessage("");

      try {
        const { data, error } = await supabase
          .from("songs")
          .select("*")
          .filter("favourites", "cs", JSON.stringify([user.id]));

        if (error) {
          throw error;
        }

        setFavoriteSongs(data || []);
      } catch (error) {
        console.error("Error fetching favorite songs:", error.message);
        setErrorMessage("Không thể tải danh sách yêu thích.");
      } finally {
        setLoading(false);
      }
    };

    fetchFavoriteSongs();
  }, [user]);

  return (
    <div>
      <h2>
        <i class="fa-solid fa-music"></i> Favorite List
      </h2>

      {loading && <p>Loading...</p>}
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <ul className="song-list">
        {favoriteSongs.map((song, index) => (
          <li
            key={song.id}
            className="song-item"
            onClick={() => onSelectSong(song, favoriteSongs)}
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

export default Favourite;
