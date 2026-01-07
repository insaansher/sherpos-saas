"use client";

import { useQuery } from "@tanstack/react-query";
import api from "@/lib/api";
import { Card, CardContent, Button, Badge } from "@/components/ui/primitives";
import { FileText, Plus, Pencil, Eye, Calendar } from "lucide-react";
import Link from "next/link";

export default function BlogEditor() {
    const { data: posts, isLoading } = useQuery({
        queryKey: ["admin", "cms", "blog"],
        queryFn: () => api.get("/api/v1/public/cms/blog").then(res => res.data)
    });

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Blog Manager</h1>
                    <p className="text-muted-foreground">Write and publish articles to your website.</p>
                </div>
                <Button className="gap-2">
                    <Plus size={18} />
                    New Post
                </Button>
            </div>

            <div className="grid gap-6">
                {posts?.map((post: any) => (
                    <Card key={post.slug}>
                        <CardContent className="p-0 flex">
                            {post.cover_url ? (
                                <img src={post.cover_url} className="w-48 h-32 object-cover shrink-0" alt="" />
                            ) : (
                                <div className="w-48 h-32 bg-muted flex items-center justify-center shrink-0">
                                    <FileText className="text-muted-foreground" />
                                </div>
                            )}
                            <div className="p-6 flex-1 flex flex-col justify-between">
                                <div>
                                    <div className="flex justify-between items-start mb-2">
                                        <h3 className="text-xl font-bold">{post.title}</h3>
                                        <Badge variant="success">Published</Badge>
                                    </div>
                                    <p className="text-muted-foreground text-sm line-clamp-1">{post.excerpt}</p>
                                </div>
                                <div className="flex items-center justify-between mt-4">
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Calendar size={14} />
                                        {new Date(post.published_at).toLocaleDateString()}
                                    </div>
                                    <div className="flex gap-2">
                                        <Link href={`/blog/${post.slug}`} target="_blank">
                                            <Button variant="ghost" size="sm" className="gap-2">
                                                <Eye size={14} /> Preview
                                            </Button>
                                        </Link>
                                        <Button variant="secondary" size="sm" className="gap-2">
                                            <Pencil size={14} /> Edit
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
                {(!posts || posts.length === 0) && (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl">
                        <FileText className="mx-auto mb-4 text-muted-foreground" size={40} />
                        <h3 className="text-lg font-bold">No posts yet</h3>
                        <p className="text-muted-foreground mb-6">Start sharing insights with your customers.</p>
                        <Button>Create your first post</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
