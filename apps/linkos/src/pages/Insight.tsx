import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { getMVNOPlans, type MVNOPlan } from '@wyalink/supabase-client'
import { Card } from '@wyalink/ui'

// Carrier porting information (comprehensive list from reference)
const CARRIERS = [
  { name: "AirVoice", account: "SIM card number", pin: "Last 4 digits of phone number", support: "888-944-2355", tips: null },
  { name: "AT&T (Postpaid)", account: "9- or 12-digit wireless account number (not the phone number)", pin: "6-digit Number Transfer PIN (*PORT, myAT&T app, or online)", support: "888-898-7685 (Port Center)", tips: "Find account at myAT&T: Profile > Sign-in Info > My linked accounts. If bundled with wireline/Internet/DIRECTV, the wireless account is separate." },
  { name: "AT&T (Prepaid)", account: "2-digit account number", pin: "4-digit number", support: "800-901-9878 (Member Service)", tips: "Prepaid and Postpaid have separate account numbers." },
  { name: "Boost / Dish Wireless", account: "9-digit account number (not the phone number)", pin: "4-digit number", support: "833-502-6678", tips: null },
  { name: "Consumer Cellular", account: "Typically starts with 1000; upper-right of bill/online account (not the phone number)", pin: "6-digit alphanumeric; sent to each device and tied to that number", support: "888-750-5519", tips: "You may be asked for account owner name, last 4 of SSN, and billing address." },
  { name: "Cricket", account: "9-digit account number (not the phone number)", pin: "4-digit Authorization ID (AID)", support: "800-274-2538 (Port Center)", tips: "Reset AID: call 855-246-2461, enter '1111' 3 times, press # to get one-time PIN by text, then set new PIN." },
  { name: "Google Fi (Project Fi)", account: "5-digit account number (Manage plan > Leave Google Fi)", pin: "5-digit PIN (same flow as account number)", support: "844-825-5234 (Port Center) or in-app/chat", tips: null },
  { name: "Metro", account: "9-digit account number (from payment confirmation texts)", pin: "8-digit number (remove 4-digit high-security PIN if present, then set 8-digit)", support: "888-863-8768 (Port Center)", tips: null },
  { name: "Mint Mobile", account: "12-digit account number", pin: "4-digit number (default last 4 of phone number)", support: "800-683-7392", tips: null },
  { name: "T-Mobile (Postpaid)", account: "9-digit account number (online account)", pin: "6-digit Number Transfer PIN (MyT-Mobile or dial 611/800-937-8997)", support: "800-937-8997 (Port Center)", tips: "Disable Number Lock in security settings if enabled." },
  { name: "T-Mobile (Prepaid)", account: "9-digit account number (online account or support)", pin: "4-digit number", support: "877-778-2106 (Port Center)", tips: null },
  { name: "Verizon (Postpaid)", account: "9-digit account number (MyVerizon; not the MDN)", pin: "6-digit Number Transfer PIN (MyVerizon > Number Transfer PIN > Generate or dial #PORT)", support: "Verizon Care", tips: null },
  { name: "Verizon Prepaid", account: "Shown on bill/online account", pin: "6-digit Number Transfer PIN (MyVerizon > Number Transfer PIN > Generate or dial #PORT)", support: "Verizon Care", tips: "Billing ZIP may be required." },
  { name: "Visible", account: "Shown in account", pin: "6-digit Number Transfer PIN (request via app: Account > Port-Out PIN; delivered by email)", support: "Verizon Care", tips: "PIN valid 7 days. Max 3 PINs per 24 hours. Requesting a new PIN invalidates prior ones. Email PIN can take up to 60 minutes. You can invalidate the latest PIN via the link in email/SMS." },
  { name: "Xfinity Mobile / Comcast", account: "10-digit number (usually starts with 100; on the bill)", pin: "Request via account: Devices > select number > Transfer your number (PIN by text)", support: "888-936-4968", tips: "Use only for Xfinity Mobile lines. Billing ZIP may be required." },
]

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
        <p className="text-gray-600">Employee Portal — Resources, Tools, and Information</p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search Insight... (press / to focus)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
        active
          ? 'border-primary-500 text-primary-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      <Icon name={icon} size={18} />
      {label}
    </button>
  )
}

function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const props = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const }

  switch (name) {
    case "home": return (<svg {...props}><path d="M3 10.5L12 3l9 7.5"/><path d="M5 10v10h14V10"/></svg>)
    case "phone": return (<svg {...props}><path d="M22 16.92a4.65 4.65 0 01-5 4.58c-7.5 0-13.5-6-13.5-13.5a4.65 4.65 0 014.58-5H9l2 5-3 2a12.15 12.15 0 007 7l2-3 5 2z"/></svg>)
    case "swap": return (<svg {...props}><path d="M22 2v6h-6"/><path d="M22 8L16 2"/><path d="M2 22v-6h6"/><path d="M2 16l6 6"/></svg>)
    case "book": return (<svg {...props}><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M20 22H6.5A2.5 2.5 0 014 19.5V4.5A2.5 2.5 0 016.5 2H20z"/></svg>)
    case "layers": return (<svg {...props}><path d="m12 2 9 5-9 5-9-5 9-5z"/><path d="m3 12 9 5 9-5"/></svg>)
    case "tag": return (<svg {...props}><path d="M20.59 13.41L12 22l-8-8 8-8 8.59 8.41z"/><circle cx="7.5" cy="14.5" r="1.5"/></svg>)
    case "link": return (<svg {...props}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>)
    default: return (<svg {...props}><circle cx="12" cy="12" r="10"/></svg>)
  }
}

function DashboardTab({ onNavigate }: { onNavigate: (tab: Tab) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <div className="text-center py-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to Insight</h2>
          <p className="text-gray-600">Your one-stop portal for everything you need to serve customers</p>
        </div>
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
  return (
    <button
      onClick={onClick}
      className="p-6 bg-white border border-gray-200 rounded-lg hover:border-primary-500 hover:shadow-md transition-all text-center"
    >
      <div className="flex justify-center mb-3 text-primary-600">
        <Icon name={icon} size={32} />
      </div>
      <div className="font-semibold text-gray-900">{label}</div>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Contact</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <input
            type="text"
            placeholder="Name/Department"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="tel"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="email"
            placeholder="Email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <button
            onClick={addContact}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            Add Contact
          </button>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <p className="text-gray-600">No contacts found</p>}
        {filtered.map((contact, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h4 className="font-semibold text-gray-900">{contact.label}</h4>
                <a href={`tel:${contact.phone}`} className="text-primary-600 hover:underline block mt-1">
                  {contact.phone}
                </a>
                {contact.email && (
                  <a href={`mailto:${contact.email}`} className="text-primary-600 hover:underline block mt-1 text-sm">
                    {contact.email}
                  </a>
                )}
              </div>
              <button
                onClick={() => removeContact(i)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

function PortingTab({ query }: { query: string }) {
  const filtered = CARRIERS.filter(c =>
    c.name.toLowerCase().includes(query.toLowerCase()) ||
    c.account.toLowerCase().includes(query.toLowerCase()) ||
    c.pin.toLowerCase().includes(query.toLowerCase()) ||
    c.support.toLowerCase().includes(query.toLowerCase()) ||
    (c.tips && c.tips.toLowerCase().includes(query.toLowerCase()))
  )

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-sm text-gray-700">
          <p className="font-semibold mb-2">Porting Guide</p>
          <p>Find account and PIN requirements for major carriers. This information helps speed up number porting requests.</p>
        </div>
      </Card>

      {filtered.length === 0 && <p className="text-gray-600">No carriers found</p>}
      {filtered.map((carrier) => (
        <Card key={carrier.name}>
          <h4 className="text-lg font-semibold text-gray-900 mb-3">{carrier.name}</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Account #:</span>
              <p className="text-gray-600 mt-1">{carrier.account}</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">PIN:</span>
              <p className="text-gray-600 mt-1">{carrier.pin}</p>
            </div>
            <div className="md:col-span-2">
              <span className="font-semibold text-gray-700">Support:</span>
              <p className="text-gray-600 mt-1">{carrier.support}</p>
            </div>
            {carrier.tips && (
              <div className="md:col-span-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
                <span className="font-semibold text-amber-900">Tips:</span>
                <p className="text-amber-800 mt-1 text-xs">{carrier.tips}</p>
              </div>
            )}
          </div>
        </Card>
      ))}
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Article</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Article Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            placeholder="Category (e.g., Policy, Network)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="url"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="md:col-span-2">
            <button
              onClick={addArticle}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Article
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <p className="text-gray-600">No articles found</p>}
        {filtered.map((article, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between mb-2">
              <span className="text-xs font-semibold text-primary-600 uppercase">{article.category}</span>
              <button
                onClick={() => removeArticle(i)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">{article.title}</h4>
            {article.description && <p className="text-sm text-gray-600 mb-3">{article.description}</p>}
            <a
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:underline"
            >
              Open Article →
            </a>
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

  if (loading) return <p className="text-gray-600">Loading plans...</p>

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">MVNO Plans Quick Reference</h3>
            <p className="text-sm text-gray-600 mt-1">View detailed plans in the Plans module</p>
          </div>
          <Link
            to="/plans"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            Manage Plans
          </Link>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filtered.length === 0 && <p className="text-gray-600">No plans found</p>}
        {filtered.map((plan) => {
          const totalData = (plan.high_priority_data_mb || 0) + (plan.general_data_mb || 0) + (plan.low_priority_data_mb || 0)
          return (
            <Card key={plan.id}>
              <h4 className="text-xl font-bold text-gray-900 mb-1">{plan.plan_name}</h4>
              <div className="text-2xl font-bold text-primary-600 mb-3">{formatPrice(plan.prices)}</div>
              <div className="space-y-1 text-sm text-gray-700">
                <div><span className="font-semibold">Talk:</span> {plan.voice_minutes === null ? 'Unlimited' : `${plan.voice_minutes} min`}</div>
                <div><span className="font-semibold">Text:</span> {plan.sms_messages === null ? 'Unlimited' : `${plan.sms_messages} msgs`}</div>
                <div><span className="font-semibold">Data:</span> {totalData > 0 ? formatDataAmount(totalData) : 'N/A'}</div>
              </div>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function PromotionsTab({ query: _query }: { query: string }) {
  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Current Promotions</h3>
            <p className="text-sm text-gray-600 mt-1">View and manage promotions in the Promotions module</p>
          </div>
          <Link
            to="/promotions"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm"
          >
            Manage Promotions
          </Link>
        </div>
      </Card>

      <Card>
        <p className="text-gray-600 text-center py-8">
          Active promotions will appear here. Add promotions in the Promotions module.
        </p>
      </Card>
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
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Quick Link</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="text"
            placeholder="Link Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="url"
            placeholder="URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <input
            type="text"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
          <div className="md:col-span-3">
            <button
              onClick={addLink}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              Add Link
            </button>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 && <p className="text-gray-600">No links found</p>}
        {filtered.map((link, i) => (
          <Card key={i}>
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-semibold text-gray-900">{link.title}</h4>
              <button
                onClick={() => removeLink(i)}
                className="text-red-600 hover:text-red-800"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            {link.description && <p className="text-sm text-gray-600 mb-3">{link.description}</p>}
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:underline"
            >
              Open Link →
            </a>
          </Card>
        ))}
      </div>
    </div>
  )
}
