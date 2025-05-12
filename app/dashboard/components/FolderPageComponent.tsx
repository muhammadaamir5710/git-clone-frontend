"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { File, Folder, Upload, ArrowLeft } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { CreateFolderDialog } from "@/components/CreateFolderDialog";

type FileType = {
  _id: string;
  name: string;
  type: string;
  size: number;
  createdAt: string;
};

type FolderType = {
  _id: string;
  name: string;
  createdAt: string;
};

interface FolderContentProps {
  folderId: string;
}

export default function FolderPageComponent({ folderId }: FolderContentProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<FileType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [currentFolder, setCurrentFolder] = useState<FolderType | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [folderPath, setFolderPath] = useState<FolderType[]>([]);

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchFolderData();
    }
  }, [user, folderId]);

  const fetchFolderData = async () => {
    try {
      setLoading(true);
      const [folderRes, contentsRes] = await Promise.all([
        api.get(`/folders/${folderId}`),
        api.get(`/folders/${folderId}/contents`),
      ]);

      setCurrentFolder(folderRes.data);
      setFiles(contentsRes.data.files);
      setFolders(contentsRes.data.folders);

      const pathRes = await api.get(`/folders/${folderId}/path`);
      setFolderPath(pathRes.data);
    } catch (error) {
      toast.error("Failed to load folder contents");
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folderId", folderId);

      const response = await api.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFiles((prevFiles) => [...prevFiles, response.data]);
      toast.success("File uploaded successfully");
    } catch (error) {
      console.error("File upload error:", error);
      toast.error("Failed to upload file");
    } finally {
      setUploading(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleNewFolder = async (newFolder: FolderType) => {
    setFolders([...folders, newFolder]);
  };

  const handleFolderCreated = (newFolder: FolderType) => {
    setFolders((prev) => [...prev, newFolder]);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <button onClick={() => router.push("/dashboard")}>My Drive</button>
          {folderPath.map((folder) => (
            <div key={folder._id} className="flex items-center">
              <span className="mx-1">/</span>
              <button
                onClick={() => router.push(`/dashboard/${folder._id}`)}
                className="hover:text-gray-700"
              >
                {folder.name}
              </button>
            </div>
          ))}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">Folder Contents</h2>
          <div className="flex space-x-2">
            <CreateFolderDialog
              parentId={folderId}
              onFolderCreated={handleFolderCreated}
            />{" "}
            <Button asChild variant="outline" size="sm" disabled={uploading}>
              <label htmlFor="folder-file-upload">
                <Upload className="mr-2 h-4 w-4" />
                {uploading ? "Uploading..." : "Upload File"}
                <input
                  id="folder-file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploading}
                />
              </label>
            </Button>
          </div>
        </div>

        {uploading && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
            Uploading file...
          </div>
        )}

        {folders.length > 0 && (
          <div className="mb-8">
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Subfolders
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {folders.map((folder) => (
                <Link key={folder._id} href={`/dashboard/${folder._id}`}>
                  <Card className="cursor-pointer hover:bg-gray-50">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <Folder className="h-6 w-6 text-yellow-500" />
                        <CardTitle className="text-sm">{folder.name}</CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div>
          <h3 className="text-sm font-medium text-gray-500 mb-2">Files</h3>
          {files.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No files in this folder</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file) => (
                <Card key={file._id} className="hover:bg-gray-50">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <File className="h-6 w-6 text-blue-500" />
                      <CardTitle className="text-sm break-words whitespace-normal">
                        {file.name.length > 25
                          ? `${file.name.slice(0, 25)}...`
                          : file.name}
                      </CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-xs">
                      {Math.round(file.size / 1024)} KB
                    </CardDescription>
                    <CardDescription className="text-xs">
                      {new Date(file.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
