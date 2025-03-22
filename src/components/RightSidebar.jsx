import React from "react";
import "./RightSidebar.css";

const RightSidebar = ({
  song,
  nextSong,
  onSelectSong,
  showPlaylist,
  songs,
}) => {
  if (!song) {
    return (
      <aside className="right-sidebar">
        <h2>Thông tin bài hát</h2>
        <p>Chọn một bài hát để xem thông tin chi tiết.</p>
      </aside>
    );
  }

  const handleSelectSong = (selectedSong) => {
    const currentIndex = songs.findIndex((s) => s.id === selectedSong.id);
    const updatedSongs = songs.slice(currentIndex);
    onSelectSong(selectedSong, updatedSongs);
  };

  return (
    <aside className="right-sidebar">
      <h2>Thông tin bài hát</h2>
      <div className="song-details">
        <img
          src={song.thumbnail_url}
          alt={song.title}
          className="detail-song-thumbnail"
        />
        <h3>{song.title}</h3>
        <p>{song.artist}</p>
        <div className="credits">
          <h4>Credits</h4>
          <p>Main Artist: {song.artist}</p>
          {/* Add more credits as needed */}
        </div>
      </div>
      {nextSong && (
        <div className="next-song" onClick={() => handleSelectSong(nextSong)}>
          <h4>Bài hát tiếp theo</h4>
          <div className="next-song">
            <img
              src={nextSong.thumbnail_url}
              alt={nextSong.title}
              className="next-song-thumbnail"
            />
            <div>
              <h5>{nextSong.title}</h5>
              <p>{nextSong.artist}</p>
            </div>
          </div>
        </div>
      )}
      {showPlaylist && (
        <div className="playlist">
          <h4>Danh sách phát</h4>
          {songs.slice(0, 10).map((song, index) => (
            <div
              key={song.id}
              className="next-song-details"
              onClick={() => handleSelectSong(song)}
            >
              <img
                src={song.thumbnail_url}
                alt={song.title}
                className="next-song-thumbnail"
              />
              <div>
                <h5>
                  {index + 1}. {song.title}
                </h5>
                <p>{song.artist}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
};

export default RightSidebar;
