"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Code } from "@/ui/code";
import { Check, Copy, Globe, Loader2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { testSiteInstallation } from "@/lib/actions/sites";

interface SetupInstructionsProps {
    site: {
        id: string;
        name: string;
    };
}

export default function SetupInstructions({ site }: SetupInstructionsProps) {
    const [copied, setCopied] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
    const [domain, setDomain] = useState("");

    const trackingScript = `<script>
  (function() {
    var script = document.createElement('script');
    script.src = '${process.env.NODE_ENV === 'development' ? 'http://localhost:3000' : 'https://your-domain.com'}/api/track';
    script.async = true;
    script.setAttribute('data-site-id', '${site.id}');
    document.head.appendChild(script);
  })();
</script>`;

    const copyToClipboard = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            toast.success("Copied to clipboard!");
            setTimeout(() => setCopied(false), 2000);
        } catch (err) {
            toast.error("Failed to copy to clipboard");
        }
    };

    const testInstallation = async () => {        
        if (!domain.trim()) {
            toast.error("Please enter your website domain");
            return;
        }

        setTesting(true);
        setTestResult(null);

        try {
            const result = await testSiteInstallation(site.id, domain.trim());
            
            if (result.success) {
                setTestResult('success');
                toast.success("Installation verified successfully!");
            } else {
                setTestResult('error');
                toast.error(result.message || "Installation test failed");
            }
        } catch (error) {
            setTestResult('error');
            toast.error("Failed to test installation");
            console.error("Test installation error:", error);
        } finally {
            setTesting(false);
        }
    };

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold mb-2">Setup Analytics for {site.name}</h2>
                <p className="text-muted-foreground">
                    Add the tracking script to your website to start collecting analytics data.
                </p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Globe className="h-5 w-5" />
                        HTML Tracking Script
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Add this script tag to the &lt;head&gt; section of your website:
                    </p>
                    
                    <div className="relative">
                        <Code className="text-sm">
                            {trackingScript}
                        </Code>
                        <Button
                            size="sm"
                            variant="outline"
                            className="absolute top-2 right-2"
                            onClick={() => copyToClipboard(trackingScript)}
                        >
                            {copied ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>

                    <Alert>
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            Make sure to place this script in the &lt;head&gt; section of every page where you want to track analytics.
                        </AlertDescription>
                    </Alert>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Test Your Installation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Verify that analytics tracking is working correctly on your website.
                    </p>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="domain">Website Address</Label>
                            <Input
                                id="domain"
                                type="text"
                                placeholder="example.com or https://example.com"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                disabled={testing}
                            />
                        </div>

                        <Button
                            onClick={testInstallation}
                            disabled={testing || !domain.trim()}
                            className="w-full sm:w-auto"
                        >
                            {testing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Testing Installation...
                                </>
                            ) : (
                                "Test Installation"
                            )}
                        </Button>

                        {testResult === 'success' && (
                            <Alert className="border-green-200 bg-green-50">
                                <Check className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-800">
                                    Analytics tracking is working correctly! You should start seeing data in your dashboard within a few minutes.
                                </AlertDescription>
                            </Alert>
                        )}

                        {testResult === 'error' && (
                            <Alert className="border-red-200 bg-red-50">
                                <AlertCircle className="h-4 w-4 text-red-600" />
                                <AlertDescription className="text-red-800">
                                    We couldn't detect the tracking script on your website. Please make sure you've added the script to your site and try again.
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>What's Next?</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            Set up custom properties to track additional data
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            Configure conversion funnels to track user journeys
                        </li>
                        <li className="flex items-center gap-2">
                            <Check className="h-4 w-4 text-green-600" />
                            View your analytics dashboard to monitor performance
                        </li>
                    </ul>
                </CardContent>
            </Card>
        </div>
    );
}
