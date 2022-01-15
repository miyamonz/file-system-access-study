import { useState } from "react";
import { atom, useAtom } from "jotai";
import { get, set } from "idb-keyval";
import { VideoViewer } from "./VideoViewer";

const prevFileHandle = await get("lastFileHandle");
if (prevFileHandle) {
}
const fileHandleAtom = atom<FileSystemFileHandle | null>(
  prevFileHandle ?? null
);
const fileHandleAtomWithPersistence = atom(
  (get) => get(fileHandleAtom),
  (get, setAtom, newHandle) => {
    console.log(newHandle);
    setAtom(fileHandleAtom, newHandle);
    set("lastFileHandle", newHandle).then(console.log);
  }
);

function App() {
  const [fileHandle, setFileHandle] = useAtom(fileHandleAtomWithPersistence);

  const [ok, setOk] = useState(false);

  async function getFile() {
    const fileHandle = await openFile();
    setFileHandle(fileHandle);
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
      {fileHandle && (
        <button
          onClick={() => {
            fileHandle.requestPermission({ mode: "read" }).then((res) => {
              if (res === "granted") {
                setOk(true);
              }
            });
          }}
        >
          {fileHandle.name}
        </button>
      )}
      {fileHandle && ok && <VideoViewer fileHandle={fileHandle} />}
    </div>
  );
}

export default App;

async function openFile(): Promise<FileSystemFileHandle> {
  const [fileHandle] = await window.showOpenFilePicker({
    multiple: false,
  });

  return fileHandle;
}
