"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, Button, Input } from "@/components/ui/primitives";
import { Upload, Trash2, Copy, Search, ImageIcon, Loader2 } from "lucide-react";
import { useState } from "react";

export default function MediaLibrary() {
    const queryClient = useQueryClient();
    const [isUploading, setIsUploading] = useState(false);

    const { data: media, isLoading } = useQuery({
        queryKey: ["admin", "cms", "media"],
        queryFn: () => api.get("/api/v1/admin/cms/media").then(res => res.data)
    });

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            await api.post("/api/v1/admin/cms/media/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            queryClient.invalidateQueries({ queryKey: ["admin", "cms", "media"] });
        } catch (err) {
            console.error("Upload failed", err);
        } finally {
            setIsUploading(false);
        }
    };

    const copyUrl = (url: string) => {
        navigator.clipboard.writeText(window.location.origin + url);
        alert("URL Copied to clipboard!");
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Media Library</h1>
                    <p className="text-muted-foreground">Manage your website images and assets.</p>
                </div>
                <div className="relative">
                    <input
                        type="file"
                        id="media-upload"
                        className="hidden"
                        onChange={handleUpload}
                        disabled={isUploading}
                    />
                    <label htmlFor="media-upload">
                        <Button asChild disabled={isUploading} className="gap-2 cursor-pointer">
                            <span>
                                {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
                                Upload Media
                            </span>
                        </Button>
                    </label>
                </div>
            </div>

            <div className="flex gap-4 items-center">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search media by filename..." className="pl-10 rounded-full" />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {media?.map((m: any) => (
                        <Card key={m.id} className="group relative overflow-hidden transition-all hover:ring-2 ring-primary">
                            <div className="aspect-square bg-muted flex items-center justify-center relative">
                                {m.mime?.startsWith('image/') ? (
                                    <img src={m.url} alt={m.filename} className="w-full h-full object-cover" />
                                ) : (
                                    <ImageIcon size={40} className="text-muted-foreground" />
                                )}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button variant="secondary" size="icon" onClick={() => copyUrl(m.url)} title="Copy URL"><Copy size={16} /></Button>
                                    <Button variant="destructive" size="icon" title="Delete"><Trash2 size={16} /></Button>
                                </div>
                            </div>
                            <div className="p-2 border-t bg-card truncate text-[10px] font-medium text-muted-foreground">
                                {m.filename}
                            </div>
                        </Card>
                    ))}
                    {(!media || media.length === 0) && (
                        <div className="col-span-full text-center py-20 border-2 border-dashed rounded-xl text-muted-foreground">
                            No media files found. Upload your first asset!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
