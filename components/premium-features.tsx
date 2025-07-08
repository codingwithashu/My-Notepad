"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Crown, Zap, Cloud, Users, Shield, Sparkles } from "lucide-react"

export function PremiumFeatures() {
  const [showUpgrade, setShowUpgrade] = useState(false)

  const features = [
    {
      icon: <Cloud className="w-5 h-5" />,
      title: "Cloud Sync",
      description: "Sync your notes across all devices",
      premium: true,
    },
    {
      icon: <Users className="w-5 h-5" />,
      title: "Collaboration",
      description: "Share and collaborate on notes in real-time",
      premium: true,
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Advanced AI",
      description: "Unlimited AI suggestions and writing assistance",
      premium: true,
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Priority Support",
      description: "Get help when you need it most",
      premium: true,
    },
  ]

  const plans = [
    {
      name: "Free",
      price: "$0",
      period: "forever",
      features: [
        "Unlimited local notes",
        "Basic templates",
        "Export to TXT, PDF, HTML",
        "Dark/Light mode",
        "Basic AI assistance (5/day)",
      ],
      current: true,
    },
    {
      name: "Pro",
      price: "$9",
      period: "month",
      features: [
        "Everything in Free",
        "Cloud sync across devices",
        "Unlimited AI assistance",
        "Advanced templates",
        "Collaboration features",
        "Priority support",
        "Custom themes",
        "Advanced export options",
      ],
      popular: true,
    },
    {
      name: "Team",
      price: "$19",
      period: "month",
      features: [
        "Everything in Pro",
        "Team workspaces",
        "Admin controls",
        "Advanced sharing",
        "Team analytics",
        "Custom integrations",
        "Dedicated support",
      ],
    },
  ]

  return (
    <>
      {/* Upgrade Prompt - Shows occasionally */}
      {Math.random() < 0.1 && (
        <div className="fixed bottom-4 left-4 z-40">
          <Card className="w-80 shadow-lg border-2 border-yellow-200 dark:border-yellow-800">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                <CardTitle className="text-lg">Upgrade to Pro</CardTitle>
                <Badge className="bg-yellow-500 text-yellow-50">Limited Time</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                Unlock cloud sync, unlimited AI, and collaboration features.
              </p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => setShowUpgrade(true)}>
                  <Zap className="w-4 h-4 mr-1" />
                  Upgrade
                </Button>
                <Button variant="ghost" size="sm">
                  Maybe Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Upgrade Dialog */}
      <Dialog open={showUpgrade} onOpenChange={setShowUpgrade}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="w-6 h-6 text-yellow-500" />
              Upgrade to Premium
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Feature Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <Card key={index} className="relative">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="text-blue-500">{feature.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-semibold flex items-center gap-2">
                          {feature.title}
                          {feature.premium && (
                            <Badge variant="secondary" className="text-xs">
                              Pro
                            </Badge>
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">{feature.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pricing Plans */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan, index) => (
                <Card key={index} className={`relative ${plan.popular ? "ring-2 ring-blue-500" : ""}`}>
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                      Most Popular
                    </Badge>
                  )}
                  <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{plan.name}</CardTitle>
                    <div className="text-3xl font-bold">
                      {plan.price}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.period}</span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="text-sm flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full"
                      variant={plan.current ? "outline" : plan.popular ? "default" : "outline"}
                      disabled={plan.current}
                    >
                      {plan.current ? "Current Plan" : "Choose Plan"}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <p>All plans include a 14-day free trial. Cancel anytime.</p>
              <p>Questions? Contact us at support@mynotepad.com</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
