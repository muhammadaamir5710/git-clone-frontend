import type { Metadata } from "next";
import FolderPageComponent from "../components/FolderPageComponent";

interface PageProps {
  params: {
    folderId: string;
  };
}

export async function generateMetadata({
  params,
}: any): Promise<Metadata> {
  return {
    title: `Folder ${params.folderId}`,
  };
}

export default function Page({ params }: any) {
  return <FolderPageComponent folderId={params.folderId} />;
}
