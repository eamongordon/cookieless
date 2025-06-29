"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Copy, Plus, Check, Key } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { CreateApiKeyModal } from "../modal/create-api-key-modal";
import { deleteTeamApiKeyWraper, deleteUserApiKeyWrapper } from "@/lib/actions";
import { useRouter } from "next/navigation";
import { Separator } from "../ui/separator";

interface ApiKey {
    id: string;
    name: string;
    createdAt: Date | null;
}

interface ApiKeyListProps {
    apiKeys: ApiKey[];
    isTeam?: boolean;
    teamId?: string;
}

export function ApiKeyList({ apiKeys, isTeam = false, teamId }: ApiKeyListProps) {
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [copiedKeys, setCopiedKeys] = useState<Set<string>>(new Set());
    const router = useRouter();

    const handleDelete = async (id: string) => {
        setDeletingId(id);
        try {
            if (isTeam && teamId) {
                await deleteTeamApiKeyWraper(teamId, id);
            } else {
                await deleteUserApiKeyWrapper(id);
            }
            router.refresh();
            toast.success("API key deleted successfully");
        } catch (error) {
            toast.error("Failed to delete API key");
        } finally {
            setDeletingId(null);
        }
    };

    const copyToClipboard = (text: string, keyId: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Copied to clipboard");
        setCopiedKeys(prev => new Set(prev).add(keyId));
    };

    return (
        <>
            <div className="flex flex-row justify-between items-center">
                <div className="flex flex-col space-y-2">
                    <h1 className="text-2xl font-semibold">API Keys</h1>
                    <p className="text-muted-foreground">Manage your API keys for programmatic access to your data.</p>
                </div>
                <CreateApiKeyModal
                    teamId={teamId}
                />
            </div>
            <Separator className="mt-2" />
            <div className="container mx-auto py-6">
                <div className="space-y-6">
                    {apiKeys.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="flex flex-col items-center text-center space-y-6">
                                <Key size={35} strokeWidth={1.5} />
                                <div className="flex flex-col gap-2">
                                    <h3 className="text-lg md:text-xl font-semibold">No API keys yet</h3>
                                    <p className="text-muted-foreground">
                                        Create your first API key to get started with programmatic access.
                                    </p>
                                </div>
                                <CreateApiKeyModal
                                    teamId={teamId}
                                    variant="outline"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {apiKeys.map((apiKey) => (
                                <Card key={apiKey.id}>
                                    <CardHeader>
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <CardTitle className="text-lg">{apiKey.name}</CardTitle>
                                                <CardDescription className="flex items-center gap-2">
                                                    <span>Created {apiKey.createdAt ? new Date(apiKey.createdAt).toLocaleDateString() : "Unknown"}</span>
                                                </CardDescription>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleDelete(apiKey.id)}
                                                    disabled={deletingId === apiKey.id}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                                            <code className="text-sm font-mono flex-1">
                                                ck_••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                                            </code>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => copyToClipboard(apiKey.id, apiKey.id)}
                                            >
                                                {copiedKeys.has(apiKey.id) ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Copy className="w-4 h-4" />
                                                )}
                                            </Button>
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Keep your API key secure and don&apos;t share it publicly.
                                        </p>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
