import { createFFmpeg } from "@ffmpeg/ffmpeg";
import React, { useState, useRef, useEffect } from "react";
import { suspend } from "suspend-react";
export function timeToStr(time: number) {
  const hour = Math.floor(time / 3600);
  const min = Math.floor((time - hour * 3600) / 60);
  const sec = Math.floor(time - hour * 3600 - min * 60);
  return `${hour}:${min}:${sec}`;
}
export function Video({ url }: { url: string }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef<HTMLVideoElement>(null);
  const videoLength = React.useMemo(() => {
    console.log(ref.current?.duration);
    return ref.current?.duration ?? 10;
  }, [ref, current]);

  const timeStr = React.useMemo(() => timeToStr(current), [current, ref]);

  const [play, setPlay] = useState(false);
  useEffect(() => {
    if (play) ref.current?.play();
    else ref.current?.pause();
  }, [play]);

  return (
    <>
      <video controls ref={ref} src={url} style={{ width: "100vw" }}></video>
      <div>
        <button onClick={() => setPlay((prev) => !prev)}>-</button>
        <input
          type="range"
          value={current}
          max={Math.floor(videoLength)}
          onChange={(e) => {
            setCurrent(Number(e.target.value));
            if (ref.current) {
              ref.current.currentTime = Number(e.target.value);
            }
          }}
          style={{ width: "100vw" }}
        />
        {timeStr}
      </div>
    </>
  );
}
export function VideoViewer({
  fileHandle,
}: {
  fileHandle: FileSystemFileHandle;
}) {
  const file = suspend(() => {
    return fileHandle.getFile();
  }, [fileHandle]);
  const url = React.useMemo(() => URL.createObjectURL(file), [fileHandle]);

  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);

  const [cutFileURL, setCutFileURL] = useState<string | null>(null);

  async function trim() {
    if (!file) return;
    const out = await trimVideo(file, timeToStr(from), timeToStr(to));
    const src = URL.createObjectURL(out);
    setCutFileURL(src);
  }

  return (
    <>
      <Video url={url} />
      <input
        type="range"
        value={from}
        onChange={(e) => setFrom(Number(e.target.value))}
      />
      {timeToStr(from)}
      <br />
      <input
        type="range"
        value={to}
        onChange={(e) => setTo(Number(e.target.value))}
      />
      {timeToStr(to)}
      <br />
      <button onClick={() => trim()}>cut</button>
      {cutFileURL && (
        <video controls src={cutFileURL} style={{ width: "100vw" }}></video>
      )}
    </>
  );
}

const ffmpeg = createFFmpeg({ log: true });
ffmpeg.load();

async function trimVideo(file: File, from: string, to: string) {
  if (!ffmpeg.isLoaded()) {
    await ffmpeg.load();
  }

  const buffer = await file.arrayBuffer();
  const name = "input.mp4";
  ffmpeg.FS("writeFile", name, new Uint8Array(buffer));

  await ffmpeg.run("-i", name, "-ss", from, "-to", to, "out.mp4");
  const output = ffmpeg.FS("readFile", "out.mp4");
  return new Blob([output.buffer], { type: "video/mp4" });
}
