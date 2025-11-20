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

export default function UIShowcase() {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-foreground mb-2">
          shadcn/ui + WyaLink Design System
        </h1>
        <p className="text-muted-foreground text-lg">
          Modern UI components with WyaLink's brand colors: Blue, Teal, and Orange
        </p>
      </div>

      {/* Buttons Section */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>
            All button variants with WyaLink branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4">
            <Button>Default (Primary Blue)</Button>
            <Button variant="secondary">Secondary (Teal)</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="link">Link</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="icon">⚙️</Button>
          </div>
          <div className="flex flex-wrap gap-4">
            <Button disabled>Disabled</Button>
            <Button variant="outline" disabled>
              Disabled Outline
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Cards & Badges Section */}
      <Card>
        <CardHeader>
          <CardTitle>Cards & Badges</CardTitle>
          <CardDescription>
            Card components with various badge styles
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Active Plans</CardTitle>
                  <Badge>Primary</Badge>
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
                  <CardTitle className="text-lg">Revenue</CardTitle>
                  <Badge variant="secondary">Teal</Badge>
                </div>
                <CardDescription>Monthly recurring revenue</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">$45,231</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">New Leads</CardTitle>
                  <Badge variant="outline">Outline</Badge>
                </div>
                <CardDescription>This week's new leads</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground">89</div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Form Inputs Section */}
      <Card>
        <CardHeader>
          <CardTitle>Form Inputs</CardTitle>
          <CardDescription>
            Input fields with WyaLink styling
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input type="email" placeholder="your@email.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input type="tel" placeholder="(555) 123-4567" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input type="password" placeholder="••••••••" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
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
            <label className="text-sm font-medium">Customer Name</label>
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
