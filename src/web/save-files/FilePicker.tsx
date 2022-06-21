import { writeAllFiles, writeSaveFile } from "../store/store";
import { RenderableProps } from "preact";
import { useCallback, useContext, useRef } from "preact/hooks";
import { CollectionContext } from "../store/CollectionContext";
import { parseSaveFile } from "../store/parser";
import { Character } from "../../scripts/character/types";
import { ItemStorageType } from "../../scripts/items/types/ItemLocation";

export interface FilePickerProps {
  folder: boolean;
}

export function FilePicker({
  folder,
  children,
}: RenderableProps<FilePickerProps>) {
  const { setCollection, setSingleFile } = useContext(CollectionContext);
  const input = useRef<HTMLInputElement>(null);

  const handleChange = useCallback(async () => {
    if (input.current?.files) {
      const usableFiles = [];
      for (const file of input.current.files) {
        // Only use the root files in case there is a backup folder
        if (
          file.webkitRelativePath.split("/").length > 2
          || file.name.endsWith(".d2i")
        ) {
          console.log("Skipping file: " + file.webkitRelativePath);
          continue;
        }

        if (file.name.endsWith(".d2x") || file.name.endsWith(".sss")) {
          usableFiles.push({
            isStash: true,
            file,
          });
        } else if (file.name.endsWith(".d2s")) {
          usableFiles.push({
            isStash: false,
            file,
          });
        }
      }

      if (folder) {
        await writeAllFiles(usableFiles.map((original) => original.file));

        setCollection(
          await Promise.all(
            usableFiles.map(async (original) => {
              const file = await parseSaveFile(original.file);

              // PD2 + PlugY seems to be storing the 1st tab of the Personal Stash inside the d2s file AND the whole stash in the d2x file.
              if (!original.isStash) {
                const character = file as Character;
                character.items = character.items.filter(
                  (item) => item.stored !== ItemStorageType.STASH
                );
              }

              return file;
            })
          )
        );
      } else {
        const original = usableFiles[0];
        await writeSaveFile(original.file);

        const file = await parseSaveFile(original.file);

        // PD2 + PlugY seems to be storing the 1st tab of the Personal Stash inside the d2s file AND the whole stash in the d2x file.
        if (!original.isStash) {
          const character = file as Character;
          character.items = character.items.filter(
            item => item.stored !== ItemStorageType.STASH
          );
        }

        setSingleFile(file);
      }
      // Clear the input so we can re-upload the same file later.
      input.current.value = "";
    }
  }, [folder, setCollection, setSingleFile]);

  const inputAttrs = folder
    ? { directory: true, webkitdirectory: true, multiple: true }
    : { accept: ".sss,.d2x,.d2s" };

  return (
    <span class="filepicker">
      <button
        class={folder ? "button" : "button danger"}
        onClick={() => input.current?.click()}
      >
        {children}
      </button>
      <input
        class="hidden"
        ref={input}
        type="file"
        {...inputAttrs}
        onChange={handleChange}
      />
    </span>
  );
}
