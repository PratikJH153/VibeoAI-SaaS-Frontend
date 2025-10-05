"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface CreateSessionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId?: string | number;
}

export function CreateSessionModal({
  open,
  onOpenChange,
  projectId,
}: CreateSessionModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // dynamic lists for URLs/files
  const [videoUrls, setVideoUrls] = useState<string[]>([""]);
  const [pdfUrls, setPdfUrls] = useState<string[]>([""]);
  const [fileUrls, setFileUrls] = useState<string[]>([""]);
  // file inputs (drag & drop or picker)
  const [videoFiles, setVideoFiles] = useState<File[]>([]);
  const [otherFiles, setOtherFiles] = useState<File[]>([]);
  const [pdfFiles, setPdfFiles] = useState<File[]>([]);

  // generic drop handler helper
  const handleDropFiles = (
    files: FileList | null,
    setter: (f: File[]) => void,
    existing: File[]
  ) => {
    if (!files) return;
    setter([...existing, ...Array.from(files)]);
  };

  const updateList = (
    setter: (v: any) => void,
    list: string[],
    idx: number,
    value: string
  ) => {
    const copy = [...list];
    copy[idx] = value;
    setter(copy);
  };

  const addItem = (setter: (v: any) => void, list: string[]) => {
    setter([...list, ""]);
  };

  const removeItem = (
    setter: (v: any) => void,
    list: string[],
    idx: number
  ) => {
    const copy = list.filter((_, i) => i !== idx);
    setter(copy.length ? copy : [""]); // keep at least one input
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      projectId,
      title,
      description,
      videoUrls: videoUrls.filter(Boolean),
      pdfUrls: pdfUrls.filter(Boolean),
      fileUrls: fileUrls.filter(Boolean),
      // include file metadata; real upload should happen to backend or storage
      videoFiles: videoFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
      pdfFiles: pdfFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
      otherFiles: otherFiles.map((f) => ({
        name: f.name,
        size: f.size,
        type: f.type,
      })),
    };

    console.log("Creating session:", payload);
    // TODO: wire to backend API

    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[650px] max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Create New Session</DialogTitle>
          <DialogDescription>
            Add a session to this project. You can provide video, PDF and other
            file URLs.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="space-y-2 space-x-1 pt-4 overflow-auto"
          style={{ maxHeight: "66vh" }}
        >
          <div className="space-y-2 space-x-1">
            <Label htmlFor="title">Session Title</Label>
            <Input
              id="title"
              placeholder="Intro usability test — Q4"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Short notes about the session"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>Video URLs</Label>
            <div className="space-y-2">
              {/* Drag & drop / picker for video files */}
              <div
                className="border border-dashed rounded p-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropFiles(
                    e.dataTransfer.files,
                    setVideoFiles,
                    videoFiles
                  );
                }}
              >
                <input
                  id="video-files"
                  type="file"
                  accept="video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    handleDropFiles(e.target.files, setVideoFiles, videoFiles);
                    e.currentTarget.value = ""; // reset
                  }}
                />
                <label
                  htmlFor="video-files"
                  className="cursor-pointer text-sm text-muted-foreground"
                >
                  Drag & drop videos here or click to select
                </label>
                {videoFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {videoFiles.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="text-sm">
                          {f.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({Math.round(f.size / 1024)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setVideoFiles(
                              videoFiles.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {videoUrls.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={v}
                    onChange={(e) =>
                      updateList(setVideoUrls, videoUrls, i, e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeItem(setVideoUrls, videoUrls, i)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => addItem(setVideoUrls, videoUrls)}
              >
                + Add video URL
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>PDFs</Label>
            <div className="space-y-2">
              {/* Drag & drop / picker for pdf files */}
              <div
                className="border border-dashed rounded p-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropFiles(e.dataTransfer.files, setPdfFiles, pdfFiles);
                }}
              >
                <input
                  id="pdf-files"
                  type="file"
                  accept="application/pdf"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    handleDropFiles(e.target.files, setPdfFiles, pdfFiles);
                    e.currentTarget.value = "";
                  }}
                />
                <label
                  htmlFor="pdf-files"
                  className="cursor-pointer text-sm text-muted-foreground"
                >
                  Drag & drop PDFs here or click to select
                </label>
                {pdfFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {pdfFiles.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="text-sm">
                          {f.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({Math.round(f.size / 1024)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setPdfFiles(pdfFiles.filter((_, i) => i !== idx))
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pdfUrls.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={v}
                    onChange={(e) =>
                      updateList(setPdfUrls, pdfUrls, i, e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeItem(setPdfUrls, pdfUrls, i)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => addItem(setPdfUrls, pdfUrls)}
              >
                + Add PDF URL
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Files</Label>
            <div className="space-y-2">
              {/* Drag & drop / picker for other files */}
              <div
                className="border border-dashed rounded p-3"
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault();
                  handleDropFiles(
                    e.dataTransfer.files,
                    setOtherFiles,
                    otherFiles
                  );
                }}
              >
                <input
                  id="other-files"
                  type="file"
                  accept="*"
                  multiple
                  className="hidden"
                  onChange={(e) => {
                    if (!e.target.files) return;
                    handleDropFiles(e.target.files, setOtherFiles, otherFiles);
                    e.currentTarget.value = "";
                  }}
                />
                <label
                  htmlFor="other-files"
                  className="cursor-pointer text-sm text-muted-foreground"
                >
                  Drag & drop files here or click to select
                </label>
                {otherFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {otherFiles.map((f, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between gap-2"
                      >
                        <div className="text-sm">
                          {f.name}{" "}
                          <span className="text-xs text-muted-foreground">
                            ({Math.round(f.size / 1024)} KB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={() =>
                            setOtherFiles(
                              otherFiles.filter((_, i) => i !== idx)
                            )
                          }
                        >
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {fileUrls.map((v, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    placeholder="https://..."
                    value={v}
                    onChange={(e) =>
                      updateList(setFileUrls, fileUrls, i, e.target.value)
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => removeItem(setFileUrls, fileUrls, i)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="ghost"
                onClick={() => addItem(setFileUrls, fileUrls)}
              >
                + Add file URL
              </Button>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Create Session
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
