import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  getMVNOPlans,
  getActiveCarriers,
  createCarrier,
  updateCarrier,
  deleteCarrier,
  getActivePromotions,
  useIsAdmin,
  type MVNOPlan,
  type Carrier,
  type Promotion,
} from '@wyalink/supabase-client'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/card'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Input } from '../components/ui/input'
import {
  Search,
  Home,
  Phone,
  ArrowLeftRight,
  BookOpen,
  Layers,
  Tag,
  Link as LinkIcon,
  Plus,
  Trash2,
  Edit,
  X,
} from 'lucide-react'

type Tab = 'dashboard' | 'contacts' | 'porting' | 'kb' | 'plans' | 'promos' | 'links'

interface Contact {
  label: string
  phone: string
  email?: string
}

interface Article {
  title: string
  url: string
  category: string
  description: string
}

interface QuickLink {
  title: string
  url: string
  description: string
}

const DEFAULT_CONTACTS: Contact[] = [
  { label: "Customer Support", phone: "1-800-555-1234", email: "support@wyalink.com" },
  { label: "Technical Support", phone: "1-800-555-5678", email: "tech@wyalink.com" },
  { label: "Billing Department", phone: "1-800-555-9012", email: "billing@wyalink.com" },
]

const DEFAULT_ARTICLES: Article[] = [
  { title: "WyaLink 5 Promises", url: "#", category: "Onboarding", description: "Internal quality and service commitments overview" },
  { title: "Device Return Policy", url: "#", category: "Policy", description: "Key terms, RMA steps, restocking fees, and timelines" },
  { title: "CBRS Node Bring-Up Checklist", url: "#", category: "Network", description: "Site survey, spectrum scan, provisioning, and acceptance tests" },
]

const DEFAULT_LINKS: QuickLink[] = [
  { title: "Employee Handbook", url: "#", description: "Company policies and procedures" },
  { title: "Time Tracking Portal", url: "#", description: "Submit timesheets and PTO requests" },
  { title: "Benefits Portal", url: "#", description: "Health insurance, 401k, and other benefits" },
]

function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      return initialValue
    }
  })

  const setValue = (value: T) => {
    try {
      setStoredValue(value)
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (error) {
      console.error(error)
    }
  }

  return [storedValue, setValue]
}

export default function Insight() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard')
  const [searchQuery, setSearchQuery] = useState('')

  // Clear search when changing tabs
  useEffect(() => {
    setSearchQuery('')
  }, [activeTab])

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <img
            src="/logos/insight-logo-primary.svg"
            alt="Insight"
            className="h-10 w-auto"
          />
        </div>
        <p className="text-muted-foreground">Employee Portal — Resources, Tools, and Information</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-muted-foreground" />
          </div>
          <Input
            type="text"
            placeholder="Search Insight... (press / to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 h-12"
          />
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8 overflow-x-auto">
          <TabButton label="Dashboard" icon="home" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <TabButton label="Contacts" icon="phone" active={activeTab === 'contacts'} onClick={() => setActiveTab('contacts')} />
          <TabButton label="Port Guide" icon="swap" active={activeTab === 'porting'} onClick={() => setActiveTab('porting')} />
          <TabButton label="Knowledge Base" icon="book" active={activeTab === 'kb'} onClick={() => setActiveTab('kb')} />
          <TabButton label="Plans" icon="layers" active={activeTab === 'plans'} onClick={() => setActiveTab('plans')} />
          <TabButton label="Promotions" icon="tag" active={activeTab === 'promos'} onClick={() => setActiveTab('promos')} />
          <TabButton label="Links" icon="link" active={activeTab === 'links'} onClick={() => setActiveTab('links')} />
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'dashboard' && <DashboardTab onNavigate={setActiveTab} />}
        {activeTab === 'contacts' && <ContactsTab query={searchQuery} />}
        {activeTab === 'porting' && <PortingTab query={searchQuery} />}
        {activeTab === 'kb' && <KnowledgeBaseTab query={searchQuery} />}
        {activeTab === 'plans' && <PlansTab query={searchQuery} />}
        {activeTab === 'promos' && <PromotionsTab query={searchQuery} />}
        {activeTab === 'links' && <LinksTab query={searchQuery} />}
      </div>
    </div>
  )
}

function TabButton({ label, icon, active, onClick }: { label: string; icon: string; active: boolean; onClick: () => void }) {
  const IconComponent = {
    home: Home,
    phone: Phone,
    swap: ArrowLeftRight,
    book: BookOpen,
    layers: Layers,
    tag: Tag,
    link: LinkIcon,
  }[icon] || Home

  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
        active
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
      }`}
    >
      <IconComponent className="h-[18px] w-[18px]" />
      {label}
    </button>
  )
}

function DashboardTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-3xl">Welcome to Insight</CardTitle>
          <CardDescription>Your one-stop portal for everything you need to serve customers</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickTile label="Important Contacts" icon="phone" onClick={() => onNavigate('contacts')} />
        <QuickTile label="Porting Guide" icon="swap" onClick={() => onNavigate('porting')} />
        <QuickTile label="Knowledge Base" icon="book" onClick={() => onNavigate('kb')} />
        <QuickTile label="MVNO Plans" icon="layers" onClick={() => onNavigate('plans')} />
        <QuickTile label="Promotions" icon="tag" onClick={() => onNavigate('promos')} />
        <QuickTile label="Quick Links" icon="link" onClick={() => onNavigate('links')} />
      </div>
    </div>
  )
}

function QuickTile({ label, icon, onClick }: { label: string; icon: string; onClick: () => void }) {
  const IconComponent = {
    home: Home,
    phone: Phone,
    swap: ArrowLeftRight,
    book: BookOpen,
    layers: Layers,
    tag: Tag,
    link: LinkIcon,
  }[icon] || Home

  return (
    <button
      onClick={onClick}
      className="p-6 bg-white border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all text-center"
    >
      <div className="flex justify-center mb-3 text-primary-600">
        <IconComponent className="h-8 w-8" />
      </div>
      <div className="font-semibold">{label}</div>
    </button>
  )
}

function ContactsTab({ query }: { query: string }) {
  const [contacts, setContacts] = useLocalStorage<Contact[]>('insight.contacts', DEFAULT_CONTACTS)
  const [label, setLabel] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')

  const addContact = () => {
    if (!label || !phone) return
    setContacts([{ label, phone, email: email || undefined }, ...contacts])
    setLabel('')
    setPhone('')
    setEmail('')
  }

  const removeContact = (index: number) => {
    setContacts(contacts.filter((_, i) => i !== index))
  }

  const filtered = contacts.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.phone.toLowerCase().includes(query.toLowerCase()) ||
    (c.email && c.email.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Contact</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <Input
              type="text"
              placeholder="Name/Department"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
            <Input
              type="tel"
              placeholder="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <Input
              type="email"
              placeholder="Email (optional)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Button onClick={addContact}>
              Add Contact
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <p className="text-muted-foreground">No contacts found</p>}
        {filtered.map((contact, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-semibold">{contact.label}</h4>
                  <a href={`tel:${contact.phone}`} className="text-primary-600 hover:underline block mt-1">
                    {contact.phone}
                  </a>
                  {contact.email && (
                    <a href={`mailto:${contact.email}`} className="text-primary-600 hover:underline block mt-1 text-sm">
                      {contact.email}
                    </a>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeContact(i)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PortingTab({ query }: { query: string }) {
  const isAdmin = useIsAdmin()
  const [carriers, setCarriers] = useState<Carrier[]>([])
  const [loading, setLoading] = useState(true)
  const [editingCarrier, setEditingCarrier] = useState<Carrier | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  useEffect(() => {
    fetchCarriers()
  }, [])

  const fetchCarriers = async () => {
    try {
      const result = await getActiveCarriers()
      if (result.data) setCarriers(result.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this carrier?')) return
    const result = await deleteCarrier(id)
    if (!result.error) {
      fetchCarriers()
    } else {
      alert('Failed to delete carrier: ' + result.error.message)
    }
  }

  const filtered = carriers.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.account_info.toLowerCase().includes(query.toLowerCase()) ||
    c.pin_info.toLowerCase().includes(query.toLowerCase()) ||
    (c.support_number && c.support_number.toLowerCase().includes(query.toLowerCase())) ||
    (c.tips && c.tips.toLowerCase().includes(query.toLowerCase()))
  )

  if (loading) return <p className="text-muted-foreground">Loading carriers...</p>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Porting Guide</CardTitle>
              <CardDescription>Find account and PIN requirements for major carriers. This information helps speed up number porting requests.</CardDescription>
            </div>
            {isAdmin && (
              <Button onClick={() => setIsCreating(true)} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Carrier
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {filtered.length === 0 && <p className="text-muted-foreground">No carriers found</p>}
      {filtered.map((carrier) => (
        <Card key={carrier.id}>
          <CardContent className="pt-6">
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-lg font-semibold">{carrier.name}</h4>
              {isAdmin && (
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditingCarrier(carrier)}
                    title="Edit"
                  >
                    <Edit className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(carrier.id)}
                    className="text-destructive hover:text-destructive"
                    title="Delete"
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-semibold">Account #:</span>
                <p className="text-muted-foreground mt-1">{carrier.account_info}</p>
              </div>
              <div>
                <span className="font-semibold">PIN:</span>
                <p className="text-muted-foreground mt-1">{carrier.pin_info}</p>
              </div>
              <div className="md:col-span-2">
                <span className="font-semibold">Support:</span>
                <p className="text-muted-foreground mt-1">{carrier.support_number || 'N/A'}</p>
              </div>
              {carrier.tips && (
                <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <span className="font-semibold text-amber-900">Tips:</span>
                  <p className="text-amber-800 mt-1 text-xs">{carrier.tips}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Edit/Create Carrier Modal */}
      {(editingCarrier || isCreating) && (
        <CarrierModal
          carrier={editingCarrier}
          onClose={() => {
            setEditingCarrier(null)
            setIsCreating(false)
          }}
          onSave={() => {
            fetchCarriers()
            setEditingCarrier(null)
            setIsCreating(false)
          }}
        />
      )}
    </div>
  )
}

function KnowledgeBaseTab({ query }: { query: string }) {
  const [articles, setArticles] = useLocalStorage<Article[]>('insight.articles', DEFAULT_ARTICLES)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [category, setCategory] = useState('')
  const [description, setDescription] = useState('')

  const addArticle = () => {
    if (!title || !url) return
    setArticles([{ title, url, category: category || 'General', description }, ...articles])
    setTitle('')
    setUrl('')
    setCategory('')
    setDescription('')
  }

  const removeArticle = (index: number) => {
    setArticles(articles.filter((_, i) => i !== index))
  }

  const filtered = articles.filter(a =>
    a.title.toLowerCase().includes(query.toLowerCase()) ||
    a.category.toLowerCase().includes(query.toLowerCase()) ||
    a.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Article</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              type="text"
              placeholder="Article Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Category (e.g., Policy, Network)"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <Input
              type="url"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="md:col-span-2">
              <Button onClick={addArticle}>
                Add Article
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <p className="text-muted-foreground">No articles found</p>}
        {filtered.map((article, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-semibold text-primary-600 uppercase">{article.category}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArticle(i)}
                  className="h-6 w-6 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <h4 className="font-semibold mb-2">{article.title}</h4>
              {article.description && <p className="text-sm text-muted-foreground mb-3">{article.description}</p>}
              <a
                href={article.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline"
              >
                Open Article →
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PlansTab({ query }: { query: string }) {
  const [plans, setPlans] = useState<MVNOPlan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const result = await getMVNOPlans({ status: 'active' })
      if (result.data) setPlans(result.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = plans.filter(p =>
    p.plan_name.toLowerCase().includes(query.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
  )

  const formatDataAmount = (mb: number | null) => {
    if (mb === null) return 'Unlimited'
    if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`
    return `${mb} MB`
  }

  const formatPrice = (prices: Record<string, number> | null) => {
    if (!prices) return 'N/A'
    const monthly = prices['monthly'] || prices['1'] || Object.values(prices)[0]
    return monthly ? `$${monthly.toFixed(2)}/mo` : 'N/A'
  }

  if (loading) return <p className="text-muted-foreground">Loading plans...</p>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>MVNO Plans Quick Reference</CardTitle>
              <CardDescription>View detailed plans in the Plans module</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to="/plans">
                Manage Plans
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.length === 0 && <p className="text-muted-foreground">No plans found</p>}
        {filtered.map((plan) => {
          const totalData = (plan.high_priority_data_mb || 0) + (plan.general_data_mb || 0) + (plan.low_priority_data_mb || 0)
          return (
            <Card key={plan.id}>
              <CardContent className="pt-6">
                <h4 className="text-xl font-bold mb-1">{plan.plan_name}</h4>
                <div className="text-2xl font-bold text-primary-600 mb-3">{formatPrice(plan.prices)}</div>
                <div className="space-y-1 text-sm">
                  <div><span className="font-semibold">Talk:</span> {plan.voice_minutes === null ? 'Unlimited' : `${plan.voice_minutes} min`}</div>
                  <div><span className="font-semibold">Text:</span> {plan.sms_messages === null ? 'Unlimited' : `${plan.sms_messages} msgs`}</div>
                  <div><span className="font-semibold">Data:</span> {totalData > 0 ? formatDataAmount(totalData) : 'N/A'}</div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function PromotionsTab({ query }: { query: string }) {
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    try {
      const result = await getActivePromotions()
      if (result.data) setPromotions(result.data)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const filtered = promotions.filter(p =>
    p.promotion_name.toLowerCase().includes(query.toLowerCase()) ||
    (p.promotion_code && p.promotion_code.toLowerCase().includes(query.toLowerCase())) ||
    (p.promotion_description && p.promotion_description.toLowerCase().includes(query.toLowerCase()))
  )

  const formatDiscount = (promo: Promotion) => {
    if (promo.discount_type === 'percent') {
      return `${promo.discount_amount}% off`
    } else {
      return `$${promo.discount_amount.toFixed(2)} off`
    }
  }

  const formatDuration = (promo: Promotion) => {
    if (promo.discount_duration === 'one_time') {
      return 'One-time discount'
    } else {
      return promo.recurring_months ? `${promo.recurring_months} months` : 'Recurring'
    }
  }

  if (loading) return <p className="text-muted-foreground">Loading promotions...</p>

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Promotions</CardTitle>
              <CardDescription>View and manage promotions in the Promotions module</CardDescription>
            </div>
            <Button asChild size="sm">
              <Link to="/promotions">
                Manage Promotions
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>

      {filtered.length === 0 && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center py-8">
              {promotions.length === 0 ? 'No active promotions. Add promotions in the Promotions module.' : 'No promotions found'}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((promo) => (
          <Card key={promo.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="text-lg font-semibold">{promo.promotion_name}</h4>
                <Badge variant="success">Active</Badge>
              </div>

              {promo.promotion_code && (
                <div className="mb-3 p-2 bg-gray-100 rounded border border-gray-300 text-center">
                  <span className="text-xs font-semibold text-muted-foreground">CODE:</span>{' '}
                  <span className="text-sm font-bold text-primary-600">{promo.promotion_code}</span>
                </div>
              )}

              {promo.promotion_description && (
                <p className="text-sm text-muted-foreground mb-3">{promo.promotion_description}</p>
              )}

              <div className="space-y-1 text-sm">
                <div>
                  <span className="font-semibold">Discount:</span>{' '}
                  <span className="text-primary-600 font-semibold">{formatDiscount(promo)}</span>
                </div>
                <div>
                  <span className="font-semibold">Duration:</span>{' '}
                  <span className="text-muted-foreground">{formatDuration(promo)}</span>
                </div>
                {promo.valid_until && (
                  <div>
                    <span className="font-semibold">Expires:</span>{' '}
                    <span className="text-muted-foreground">{new Date(promo.valid_until).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function LinksTab({ query }: { query: string }) {
  const [links, setLinks] = useLocalStorage<QuickLink[]>('insight.links', DEFAULT_LINKS)
  const [title, setTitle] = useState('')
  const [url, setUrl] = useState('')
  const [description, setDescription] = useState('')

  const addLink = () => {
    if (!title || !url) return
    setLinks([{ title, url, description }, ...links])
    setTitle('')
    setUrl('')
    setDescription('')
  }

  const removeLink = (index: number) => {
    setLinks(links.filter((_, i) => i !== index))
  }

  const filtered = links.filter(l =>
    l.title.toLowerCase().includes(query.toLowerCase()) ||
    l.url.toLowerCase().includes(query.toLowerCase()) ||
    l.description.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Quick Link</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Input
              type="text"
              placeholder="Link Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <Input
              type="url"
              placeholder="URL"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
            <Input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
            <div className="md:col-span-3">
              <Button onClick={addLink}>
                Add Link
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <p className="text-muted-foreground">No links found</p>}
        {filtered.map((link, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between mb-2">
                <h4 className="font-semibold">{link.title}</h4>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeLink(i)}
                  className="h-6 w-6 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              {link.description && <p className="text-sm text-muted-foreground mb-3">{link.description}</p>}
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary-600 hover:underline"
              >
                Open Link →
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Carrier Modal Component
function CarrierModal({
  carrier,
  onClose,
  onSave,
}: {
  carrier: Carrier | null
  onClose: () => void
  onSave: () => void
}) {
  const [name, setName] = useState(carrier?.name || '')
  const [accountInfo, setAccountInfo] = useState(carrier?.account_info || '')
  const [pinInfo, setPinInfo] = useState(carrier?.pin_info || '')
  const [supportNumber, setSupportNumber] = useState(carrier?.support_number || '')
  const [tips, setTips] = useState(carrier?.tips || '')
  const [saving, setSaving] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const data = {
        name,
        account_info: accountInfo,
        pin_info: pinInfo,
        support_number: supportNumber || undefined,
        tips: tips || undefined,
      }

      if (carrier) {
        const result = await updateCarrier(carrier.id, data)
        if (result.error) throw result.error
      } else {
        const result = await createCarrier(data)
        if (result.error) throw result.error
      }

      onSave()
    } catch (err) {
      alert('Failed to save carrier: ' + (err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">
              {carrier ? 'Edit Carrier' : 'Add New Carrier'}
            </h2>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              disabled={saving}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Carrier Name *
              </label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="e.g., AT&T (Postpaid)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Account # Information *
              </label>
              <textarea
                value={accountInfo}
                onChange={(e) => setAccountInfo(e.target.value)}
                required
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g., 9- or 12-digit wireless account number (not the phone number)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                PIN Information *
              </label>
              <textarea
                value={pinInfo}
                onChange={(e) => setPinInfo(e.target.value)}
                required
                rows={2}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="e.g., 6-digit Number Transfer PIN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Support Number
              </label>
              <Input
                type="text"
                value={supportNumber}
                onChange={(e) => setSupportNumber(e.target.value)}
                placeholder="e.g., 888-898-7685"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Tips & Notes
              </label>
              <textarea
                value={tips}
                onChange={(e) => setTips(e.target.value)}
                rows={3}
                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Additional information, tips, or special instructions..."
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? 'Saving...' : carrier ? 'Update Carrier' : 'Add Carrier'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
