"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function TopAdSection() {
  return (
    <div className="w-full bg-muted/30 border-b">
      <div className="container mx-auto p-2">
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
          <CardContent className="p-4 text-center">
            <Badge variant="secondary" className="mb-2">
              Advertisement
            </Badge>
            <div className="text-sm text-muted-foreground">Top Banner Ad Space (728x90)</div>
            <div className="mt-2 h-16 bg-muted/50 rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Google Ads will appear here</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function BottomAdSection() {
  return (
    <div className="w-full bg-muted/30 border-t">
      <div className="container mx-auto p-2">
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
          <CardContent className="p-4 text-center">
            <Badge variant="secondary" className="mb-2">
              Advertisement
            </Badge>
            <div className="text-sm text-muted-foreground">Bottom Banner Ad Space (728x90)</div>
            <div className="mt-2 h-16 bg-muted/50 rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground">Google Ads will appear here</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function LeftAdSection() {
  return (
    <div className="hidden lg:block w-48 bg-muted/30 border-r">
      <div className="sticky top-4 p-2">
        <Card className="bg-gradient-to-b from-orange-50 to-red-50 dark:from-orange-950/20 dark:to-red-950/20">
          <CardContent className="p-3 text-center">
            <Badge variant="secondary" className="mb-2 text-xs">
              Ad
            </Badge>
            <div className="text-xs text-muted-foreground mb-2">Left Sidebar (160x600)</div>
            <div className="h-32 bg-muted/50 rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground text-center px-2">Google Ads</span>
            </div>
          </CardContent>
        </Card>

        {/* Additional ad slot */}
        <Card className="mt-4 bg-gradient-to-b from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardContent className="p-3 text-center">
            <Badge variant="secondary" className="mb-2 text-xs">
              Ad
            </Badge>
            <div className="text-xs text-muted-foreground mb-2">Square Ad (300x250)</div>
            <div className="h-24 bg-muted/50 rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground text-center px-2">Google Ads</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export function RightAdSection() {
  return (
    <div className="hidden lg:block w-48 bg-muted/30 border-l">
      <div className="sticky top-4 p-2">
        <Card className="bg-gradient-to-b from-cyan-50 to-teal-50 dark:from-cyan-950/20 dark:to-teal-950/20">
          <CardContent className="p-3 text-center">
            <Badge variant="secondary" className="mb-2 text-xs">
              Ad
            </Badge>
            <div className="text-xs text-muted-foreground mb-2">Right Sidebar (160x600)</div>
            <div className="h-32 bg-muted/50 rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground text-center px-2">Google Ads</span>
            </div>
          </CardContent>
        </Card>

        {/* Additional ad slot */}
        <Card className="mt-4 bg-gradient-to-b from-yellow-50 to-orange-50 dark:from-yellow-950/20 dark:to-orange-950/20">
          <CardContent className="p-3 text-center">
            <Badge variant="secondary" className="mb-2 text-xs">
              Ad
            </Badge>
            <div className="text-xs text-muted-foreground mb-2">Square Ad (300x250)</div>
            <div className="h-24 bg-muted/50 rounded flex items-center justify-center">
              <span className="text-xs text-muted-foreground text-center px-2">Google Ads</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
