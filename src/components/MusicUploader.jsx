import { useState } from "react";
import { supabase } from "../supabase";
import "./MusicUploader.css";

const MusicUploader = () => {
  const [file, setFile] = useState(null);
  const [musicUrl, setMusicUrl] = useState(null);
  const [fileType, setFileType] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [songName, setSongName] = useState("");
  const [artist, setArtist] = useState("");
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailUrl, setThumbnailUrl] = useState(null);

  // Hàm upload file nhạc lên Supabase Storage
  const uploadMusic = async () => {
    if (!file) {
      alert("Chọn một file nhạc trước!");
      return;
    }

    setIsUploading(true);
    const musicFilePath = `music/${Date.now()}_${file.name}`;
    const thumbnailFilePath = thumbnail
      ? `thumbnails/${Date.now()}_${thumbnail.name}`
      : "thumbnails/thumbnailDefault.png";

    const { data: musicData, error: musicError } = await supabase.storage
      .from("music-files")
      .upload(musicFilePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (musicError) {
      console.error("Lỗi upload nhạc:", musicError.message);
      setIsUploading(false);
      return;
    }

    let thumbnailData, thumbnailError;
    if (thumbnail) {
      ({ data: thumbnailData, error: thumbnailError } = await supabase.storage
        .from("thumbnails")
        .upload(thumbnailFilePath, thumbnail, {
          cacheControl: "3600",
          upsert: false,
        }));

      if (thumbnailError) {
        console.error("Lỗi upload thumbnail:", thumbnailError.message);
        setIsUploading(false);
        return;
      }
    } else {
      thumbnailData = { path: thumbnailFilePath };
    }

    console.log("Upload thành công:", musicData.path, thumbnailData.path);
    const musicUrl = await getMusicUrl(musicData.path, file.type);
    const thumbnailUrl = await getThumbnailUrl(thumbnailData.path);

    // Save song details in the database
    const { data: songData, error: songError } = await supabase
      .from("songs")
      .insert([
        {
          title: songName,
          artist: artist,
          url: musicUrl,
          thumbnail_url: thumbnailUrl,
        },
      ]);

    if (songError) {
      console.error("Lỗi lưu thông tin bài hát:", songError.message);
    } else {
      console.log("Lưu thông tin bài hát thành công:", songData);
    }

    setIsUploading(false);
  };

  // Hàm lấy URL file nhạc từ Supabase Storage
  const getMusicUrl = async (filePath, type) => {
    const { data } = supabase.storage
      .from("music-files")
      .getPublicUrl(filePath);

    setMusicUrl(data.publicUrl);
    setFileType(type);
    return data.publicUrl;
  };

  // Hàm lấy URL thumbnail từ Supabase Storage
  const getThumbnailUrl = async (filePath) => {
    const { data } = supabase.storage.from("thumbnails").getPublicUrl(filePath);

    setThumbnailUrl(data.publicUrl);
    return data.publicUrl;
  };

  return (
    <div className="upload-container">
      <div className="upload-components">
        <h2>
          {" "}
          <i class="fa-solid fa-music"></i>Upload & Play Music
        </h2>
        <p>Up load music file</p>
        {/* Input chọn file nhạc 🎶 */}
        <input
          type="file"
          accept="audio/mp3, audio/ogg, audio/wav"
          onChange={(e) => {
            setFile(e.target.files[0]);
            setFileType(e.target.files[0].type);
          }}
        />

        <p>Upload thumbnail</p>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            setThumbnail(e.target.files[0]);
          }}
        />

        {/* Input tên bài hát */}
        <input
          type="text"
          placeholder="Tên bài hát"
          value={songName}
          onChange={(e) => setSongName(e.target.value)}
        />

        {/* Input tên ca sĩ */}
        <input
          type="text"
          placeholder="Tên ca sĩ"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
        />

        {/* Nút Upload */}
        <button onClick={uploadMusic} disabled={isUploading}>
          {isUploading ? "Uploading..." : "Upload"}
        </button>

        {/* Hiển thị audio player nếu có nhạc */}
        {musicUrl && (
          <div>
            <h3>Now Playing:</h3>
            {thumbnailUrl && <img src={thumbnailUrl} alt="Thumbnail" />}
            <p>
              {songName} - {artist}
            </p>
            <audio controls>
              {fileType.includes("mp3") && (
                <source src={musicUrl} type="audio/mp3" />
              )}
              {fileType.includes("ogg") && (
                <source src={musicUrl} type="audio/ogg" />
              )}
              {fileType.includes("wav") && (
                <source src={musicUrl} type="audio/wav" />
              )}
              Trình duyệt không hỗ trợ phát nhạc.
            </audio>
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicUploader;
