"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { File, Folder, Plus, Upload } from "lucide-react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function DashboardPage() {
  const { user, logout, loading: authLoading } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<FileType[]>([]);
  const [folders, setFolders] = useState<FolderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [newFolderName, setNewFolderName] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (!user && !authLoading) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [filesRes, foldersRes] = await Promise.all([
        api.get("/files"),
        api.get("/folders"),
      ]);
      setFiles(filesRes.data);
      setFolders(foldersRes.data);
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFolder = async () => {
    try {
      const res = await api.post("/folders", { name: newFolderName });
      setFolders([...folders, res.data]);
      setNewFolderName("");
      toast.success("Folder created successfully");
    } catch (error) {
      toast.error("Failed to create folder");
      throw error;
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const file = e.target.files[0];
    setSelectedFile(file);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await api.post("/files/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setFiles([...files, res.data]);
      toast.success("File uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload file");
    } finally {
      setSelectedFile(null);
    }
  };

  const handleFolderCreated = (newFolder: FolderType) => {
    setFolders((prev) => [...prev, newFolder]);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("Failed to logout");
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Skeleton className="w-[100px] h-[20px] rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-semibold text-gray-900">My Drive</h1>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-medium text-gray-900">My Files</h2>
          <div className="flex space-x-2">
            <CreateFolderDialog onFolderCreated={handleFolderCreated} />

            <Button asChild variant="outline" size="sm">
              <label htmlFor="file-upload">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </label>
            </Button>
          </div>
        </div>

        {selectedFile && (
          <div className="mb-4 p-3 bg-blue-50 rounded-md text-sm text-blue-700">
            Uploading {selectedFile.name}...
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-lg" />
            ))}
          </div>
        ) : (
          <>
            {folders.length > 0 && (
              <div className="mb-8">
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Folders
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {folders.map((folder) => (
                    <Card
                      key={folder._id}
                      className="cursor-pointer hover:bg-gray-50"
                      onClick={() => router.push(`/dashboard/${folder._id}`)}
                    >
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <Folder className="h-6 w-6 text-yellow-500" />
                          <CardTitle className="text-sm">
                            {folder.name}
                          </CardTitle>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Files</h3>
              {files.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No files yet</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {files.map((file) => (
                    <Card key={file._id} className="hover:bg-gray-50">
                      <CardHeader>
                        <div className="flex items-center space-x-3">
                          <File className="h-6 w-8 text-blue-500" />
                          <CardTitle className="text-sm">
                            {file.name.length > 25
                              ? `${file.name.slice(0, 25)}...`
                              : file.name}{" "}
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
          </>
        )}
      </main>
    </div>
  );
}
