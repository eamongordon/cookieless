import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

export default function SubscribePage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2">Almost there!</h1>
                    <p className="text-muted-foreground">Choose your plan to get started with Cookieless.</p>
                </div>
                
                <Card className="w-full">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">Pro Plan</CardTitle>
                        <CardDescription>Perfect for growing businesses</CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-6">
                        <div className="text-center">
                            <div className="text-4xl font-bold">$10</div>
                            <div className="text-sm text-muted-foreground">per month</div>
                        </div>
                        
                        <div className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-medium">Monthly Base Fee</div>
                                    <div className="text-sm text-muted-foreground">$10/month for platform access</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-medium">Usage-Based Pricing</div>
                                    <div className="text-sm text-muted-foreground">$10 per 100,000 events tracked</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-medium">Real-time Analytics</div>
                                    <div className="text-sm text-muted-foreground">Track your website performance in real-time</div>
                                </div>
                            </div>
                            
                            <div className="flex items-start space-x-3">
                                <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                                <div>
                                    <div className="font-medium">Advanced Reporting</div>
                                    <div className="text-sm text-muted-foreground">Comprehensive insights and custom reports</div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-muted p-4 rounded-lg">
                            <div className="text-sm font-medium mb-1">Example Monthly Cost</div>
                            <div className="text-sm text-muted-foreground">
                                For 500,000 events: $10 (base) + $50 (usage) = <span className="font-semibold">$60/month</span>
                            </div>
                        </div>
                    </CardContent>
                    
                    <CardFooter>
                        <Button className="w-full" size="lg">
                            Subscribe Now
                        </Button>
                    </CardFooter>
                </Card>
                
                <div className="text-center mt-6">
                    <p className="text-xs text-muted-foreground">
                        Cancel anytime • No setup fees
                    </p>
                </div>
            </div>
        </div>
    );
}