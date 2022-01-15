import { useState } from "react";

function App() {
  const [url, setUrl] = useState("");

  async function getFile() {
    const fileHandle = await openFile();
    const fileData = await fileHandle.getFile();
    const src = URL.createObjectURL(fileData);
    setUrl(src);
  }

  return (
    <div>
      hello
      <button
        onClick={() => {
          getFile();
        }}
      >
        open
      </button>
      <video controls src={url} style={{ width: "100vw" }}></video>
    </div>
  );
}

export default App;

export async function openFile(): Promise<FileSystemFileHandle> {
  const [fileHandle] = await window.showOpenFilePicker({
    multiple: false,
  });

  return fileHandle;
}
