"use client"

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Check } from "lucide-react"
import { useState } from "react"

export function SubscriptionCard() {
    const [events, setEvents] = useState([500000]) // Default to 500k events
    
    // Calculate pricing based on events
    const basePrice = 10
    const eventsCount = events[0] || 0
    const includedEvents = 100000 // First 100K events included in base fee
    const additionalEvents = Math.max(0, eventsCount - includedEvents)
    const usagePrice = Math.ceil(additionalEvents / 100000) * 10
    const totalPrice = basePrice + usagePrice
    
    // Format numbers for display
    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`
        } else if (num >= 1000) {
            return `${(num / 1000).toFixed(0)}K`
        }
        return num.toString()
    }

    return (
        <Card className="w-full">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Pro Plan</CardTitle>
                <CardDescription>Perfect for growing businesses</CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
                <div className="text-center">
                    <div className="text-4xl font-bold">${totalPrice}</div>
                    <div className="text-sm text-muted-foreground">per month</div>
                </div>
                
                {/* Interactive Events Slider */}
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                    <div className="flex justify-between items-center">
                        <label className="text-sm font-medium">Monthly Events</label>
                        <span className="text-sm font-semibold">{formatNumber(eventsCount)} events</span>
                    </div>
                    <Slider
                        value={events}
                        onValueChange={setEvents}
                        min={100000}
                        max={5000000}
                        step={100000}
                        className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>100K</span>
                        <span>2.5M</span>
                        <span>5M</span>
                    </div>
                </div>
                
                {/* Features Section */}
                <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-medium">100K Events Included</div>
                            <div className="text-sm text-muted-foreground">First 100,000 events included in base subscription</div>
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
                    
                    <div className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-medium">Unlimited Sites</div>
                            <div className="text-sm text-muted-foreground">Connect as many websites as you need</div>
                        </div>
                    </div>
                    
                    <div className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <div className="font-medium">Cookie-free Tracking</div>
                            <div className="text-sm text-muted-foreground">GDPR compliant without cookie banners</div>
                        </div>
                    </div>
                </div>
                
                {/* Pricing Breakdown */}
                <div className="space-y-3 p-4 bg-muted/30 rounded-lg">
                    <div className="text-sm font-medium mb-2">Pricing Breakdown</div>
                    <div className="flex justify-between text-sm">
                        <span>Base subscription (includes 100K events)</span>
                        <span>${basePrice}</span>
                    </div>
                    {additionalEvents > 0 && (
                        <div className="flex justify-between text-sm">
                            <span>Additional usage ({formatNumber(additionalEvents)} events)</span>
                            <span>${usagePrice}</span>
                        </div>
                    )}
                    <div className="border-t pt-2 flex justify-between font-semibold">
                        <span>Total per month</span>
                        <span>${totalPrice}</span>
                    </div>
                </div>
            </CardContent>
            
            <CardFooter>
                <Button className="w-full" size="lg">
                    Subscribe Now
                </Button>
            </CardFooter>
        </Card>
    )
}
