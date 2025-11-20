import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Settings,
  User,
  Mail,
  Phone,
  Search,
  Lock
} from "lucide-react"
import { Button } from "../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Badge } from "../components/ui/badge"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table"

export default function DesignSystem() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          WyaLink Design System
        </h1>
        <p className="text-muted-foreground text-lg">
          Complete design system reference for LinkOS featuring WyaLink brand colors, messaging colors, and shadcn/ui components
        </p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons with Icons</CardTitle>
          <CardDescription>
            All button variants with WyaLink branding and lucide-react icons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>
              <Settings className="mr-2 h-4 w-4" />
              Default (Primary Blue)
            </Button>
            <Button variant="secondary">
              <User className="mr-2 h-4 w-4" />
              Secondary (Teal)
            </Button>
            <Button variant="destructive">
              <XCircle className="mr-2 h-4 w-4" />
              Destructive
            </Button>
            <Button variant="outline">
              <Search className="mr-2 h-4 w-4" />
              Outline
            </Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Disabled Outline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Messaging Colors Section */}
      <Card>
        <CardHeader>
          <CardTitle>Messaging Colors</CardTitle>
          <CardDescription>
            Status indicators with WyaLink's messaging color palette
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg bg-success text-success-foreground flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6" />
              <div>
                <div className="font-semibold">Success</div>
                <div className="text-sm opacity-90">#01df72</div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-error text-error-foreground flex items-center gap-3">
              <XCircle className="h-6 w-6" />
              <div>
                <div className="font-semibold">Error</div>
                <div className="text-sm opacity-90">#f82834</div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-warning text-warning-foreground flex items-center gap-3">
              <AlertTriangle className="h-6 w-6" />
              <div>
                <div className="font-semibold">Warning</div>
                <div className="text-sm opacity-90">#fcb700</div>
              </div>
            </div>
            <div className="p-4 rounded-lg bg-info text-info-foreground flex items-center gap-3">
              <Info className="h-6 w-6" />
              <div>
                <div className="font-semibold">Info</div>
                <div className="text-sm opacity-90">#00bafe</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* WyaLink Gradient */}
      <Card>
        <CardHeader>
          <CardTitle>WyaLink Brand Gradient</CardTitle>
          <CardDescription>
            Linear gradient at 135° from Teal to Blue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-32 rounded-lg bg-gradient-brand flex items-center justify-center text-white">
            <div className="text-center">
              <div className="text-2xl font-bold mb-2">WyaLink Gradient</div>
              <div className="text-sm opacity-90">135° • #36b1b3 → #005075</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Badge Variants Section */}
      <Card>
        <CardHeader>
          <CardTitle>Badge Variants</CardTitle>
          <CardDescription>
            All badge variants including brand and messaging colors
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Brand Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge>Primary (Blue)</Badge>
              <Badge variant="secondary">Secondary (Teal)</Badge>
              <Badge variant="destructive">Destructive</Badge>
              <Badge variant="outline">Outline</Badge>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Messaging Badges</h3>
            <div className="flex flex-wrap gap-2">
              <Badge variant="success">Success</Badge>
              <Badge variant="error">Error</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="info">Info</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards & Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cards with Status Badges</CardTitle>
          <CardDescription>
            Real-world examples using messaging color badges
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Active Plans</CardTitle>
                  <Badge variant="success">Active</Badge>
                </div>
                <CardDescription>Current subscription count</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">1,234</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Service Issues</CardTitle>
                  <Badge variant="warning">Attention</Badge>
                </div>
                <CardDescription>Tickets requiring review</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">12</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Failed Payments</CardTitle>
                  <Badge variant="error">Critical</Badge>
                </div>
                <CardDescription>Requires immediate action</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-error">5</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Messaging Color Shades Section */}
      <Card>
        <CardHeader>
          <CardTitle>Messaging Color Shade Variations</CardTitle>
          <CardDescription>
            Complete shade palette (50-900) for flexible design applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Success Shades */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                Success Shades
              </h3>
              <div className="space-y-1">
                <div className="h-8 rounded bg-success-50 flex items-center px-3 text-xs font-medium text-foreground">50 - Backgrounds</div>
                <div className="h-8 rounded bg-success-200 flex items-center px-3 text-xs font-medium text-foreground">200 - Hover States</div>
                <div className="h-8 rounded bg-success-400 flex items-center px-3 text-xs font-medium text-white">400 - Primary (#01df72)</div>
                <div className="h-8 rounded bg-success-600 flex items-center px-3 text-xs font-medium text-white">600 - Emphasis</div>
                <div className="h-8 rounded bg-success-800 flex items-center px-3 text-xs font-medium text-white">800 - Dark Mode</div>
              </div>
            </div>

            {/* Error Shades */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Error Shades
              </h3>
              <div className="space-y-1">
                <div className="h-8 rounded bg-error-50 flex items-center px-3 text-xs font-medium text-foreground">50 - Backgrounds</div>
                <div className="h-8 rounded bg-error-200 flex items-center px-3 text-xs font-medium text-foreground">200 - Hover States</div>
                <div className="h-8 rounded bg-error-400 flex items-center px-3 text-xs font-medium text-white">400 - Primary (#f82834)</div>
                <div className="h-8 rounded bg-error-600 flex items-center px-3 text-xs font-medium text-white">600 - Emphasis</div>
                <div className="h-8 rounded bg-error-800 flex items-center px-3 text-xs font-medium text-white">800 - Dark Mode</div>
              </div>
            </div>

            {/* Warning Shades */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                <AlertTriangle className="h-4 w-4" />
                Warning Shades
              </h3>
              <div className="space-y-1">
                <div className="h-8 rounded bg-warning-50 flex items-center px-3 text-xs font-medium text-foreground">50 - Backgrounds</div>
                <div className="h-8 rounded bg-warning-200 flex items-center px-3 text-xs font-medium text-foreground">200 - Hover States</div>
                <div className="h-8 rounded bg-warning-400 flex items-center px-3 text-xs font-medium text-foreground">400 - Primary (#fcb700)</div>
                <div className="h-8 rounded bg-warning-600 flex items-center px-3 text-xs font-medium text-white">600 - Emphasis</div>
                <div className="h-8 rounded bg-warning-800 flex items-center px-3 text-xs font-medium text-white">800 - Dark Mode</div>
              </div>
            </div>

            {/* Info Shades */}
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                <Info className="h-4 w-4" />
                Info Shades
              </h3>
              <div className="space-y-1">
                <div className="h-8 rounded bg-info-50 flex items-center px-3 text-xs font-medium text-foreground">50 - Backgrounds</div>
                <div className="h-8 rounded bg-info-200 flex items-center px-3 text-xs font-medium text-foreground">200 - Hover States</div>
                <div className="h-8 rounded bg-info-400 flex items-center px-3 text-xs font-medium text-white">400 - Primary (#00bafe)</div>
                <div className="h-8 rounded bg-info-600 flex items-center px-3 text-xs font-medium text-white">600 - Emphasis</div>
                <div className="h-8 rounded bg-info-800 flex items-center px-3 text-xs font-medium text-white">800 - Dark Mode</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Inputs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs with Icons</CardTitle>
          <CardDescription>
            Input fields with WyaLink styling and lucide-react icons
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                Email
              </label>
              <Input type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Phone
              </label>
              <Input type="tel" placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Lock className="h-4 w-4 text-muted-foreground" />
                Password
              </label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Search className="h-4 w-4 text-muted-foreground" />
                Search
              </label>
              <Input type="search" placeholder="Search customers..." />
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button>Submit Form</Button>
        </CardFooter>
      </Card>

      {/* Table Section */}
      <Card>
        <CardHeader>
          <CardTitle>Data Tables</CardTitle>
          <CardDescription>
            Responsive tables with hover states
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your recent customers</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Plan</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">John Doe</TableCell>
                <TableCell>Unlimited 5G</TableCell>
                <TableCell>
                  <Badge>Active</Badge>
                </TableCell>
                <TableCell className="text-right">$50.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Jane Smith</TableCell>
                <TableCell>Premium Plus</TableCell>
                <TableCell>
                  <Badge variant="secondary">Active</Badge>
                </TableCell>
                <TableCell className="text-right">$75.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Mike Johnson</TableCell>
                <TableCell>Basic Plan</TableCell>
                <TableCell>
                  <Badge variant="outline">Pending</Badge>
                </TableCell>
                <TableCell className="text-right">$30.00</TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Sarah Williams</TableCell>
                <TableCell>Family Plan</TableCell>
                <TableCell>
                  <Badge>Active</Badge>
                </TableCell>
                <TableCell className="text-right">$120.00</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Color Palette Section */}
      <Card>
        <CardHeader>
          <CardTitle>WyaLink Color Palette</CardTitle>
          <CardDescription>
            Brand colors properly applied across all components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">
                Primary (Blue)
              </h3>
              <div className="space-y-2">
                <div className="h-12 rounded-md bg-primary-800 flex items-center justify-center text-white text-sm font-medium">
                  #00254a
                </div>
                <div className="h-12 rounded-md bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
                  #004b80
                </div>
                <div className="h-12 rounded-md bg-primary-400 flex items-center justify-center text-white text-sm font-medium">
                  #3379ab
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">
                Secondary (Teal)
              </h3>
              <div className="space-y-2">
                <div className="h-12 rounded-md bg-secondary-700 flex items-center justify-center text-white text-sm font-medium">
                  #135354
                </div>
                <div className="h-12 rounded-md bg-secondary-400 flex items-center justify-center text-white text-sm font-medium">
                  #36b1b3
                </div>
                <div className="h-12 rounded-md bg-secondary-200 flex items-center justify-center text-foreground text-sm font-medium">
                  #95e0e0
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-semibold text-sm text-muted-foreground">
                Accent (Orange)
              </h3>
              <div className="space-y-2">
                <div className="h-12 rounded-md bg-accent-700 flex items-center justify-center text-white text-sm font-medium">
                  #8c3809
                </div>
                <div className="h-12 rounded-md bg-accent-400 flex items-center justify-center text-white text-sm font-medium">
                  #f37021
                </div>
                <div className="h-12 rounded-md bg-accent-200 flex items-center justify-center text-foreground text-sm font-medium">
                  #ffb68a
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Example */}
      <Card>
        <CardHeader>
          <CardTitle>Complete Example</CardTitle>
          <CardDescription>
            A realistic card combining multiple components
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Customer Name
            </label>
            <Input placeholder="Enter customer name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Plan Selection</label>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                Basic
              </Button>
              <Button variant="default" className="flex-1">
                Premium
              </Button>
              <Button variant="secondary" className="flex-1">
                Enterprise
              </Button>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge>New Customer</Badge>
            <Badge variant="secondary">Verified</Badge>
            <Badge variant="outline">Priority</Badge>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline">Cancel</Button>
          <Button>Create Account</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
