import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { hash } from 'bcryptjs'

const firstNames = ['James', 'Emma', 'Michael', 'Sophia', 'William', 'Olivia', 'Alexander', 'Isabella', 'Benjamin', 'Mia', 'Daniel', 'Charlotte', 'Henry', 'Amelia', 'Sebastian', 'Harper', 'Jack', 'Evelyn', 'Aiden', 'Abigail']
const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin']
const companies = ['TechCorp Inc.', 'Global Solutions Ltd', 'Innovate Partners', 'Digital Dynamics', 'Cloud Systems LLC', 'Data Insights Co', 'Future Tech Solutions', 'Smart Business Inc', 'Enterprise Plus', 'Growth Partners']
const industries = ['Technology', 'Finance', 'Healthcare', 'Manufacturing', 'Retail', 'Consulting', 'Real Estate', 'Education', 'Transportation', 'Energy']
const sources = ['Website', 'Referral', 'Social Media', 'Cold Call', 'Trade Show', 'Email Campaign', 'Partner', 'Advertisement']
const departments = ['Sales', 'Marketing', 'Operations', 'Finance', 'Human Resources']
const positions = ['Sales Manager', 'Account Executive', 'Business Developer', 'Sales Director', 'VP of Sales', 'Sales Representative']

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()))
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export async function GET() {
  try {
    // Check if already seeded
    const existingUsers = await db.user.count()
    if (existingUsers > 0) {
      return NextResponse.json({ message: 'Database already seeded', skipped: true })
    }

    // Create Pipeline Stages
    const pipelineStages = await Promise.all([
      db.pipelineStage.create({ data: { name: 'Lead', color: '#64748b', order: 1, description: 'Initial contact or lead identification' } }),
      db.pipelineStage.create({ data: { name: 'Qualified', color: '#06b6d4', order: 2, description: 'Lead has been qualified' } }),
      db.pipelineStage.create({ data: { name: 'Proposal', color: '#f59e0b', order: 3, description: 'Proposal sent to prospect' } }),
      db.pipelineStage.create({ data: { name: 'Negotiation', color: '#8b5cf6', order: 4, description: 'Negotiating terms' } }),
      db.pipelineStage.create({ data: { name: 'Closed Won', color: '#10b981', order: 5, description: 'Deal successfully closed' } }),
      db.pipelineStage.create({ data: { name: 'Closed Lost', color: '#ef4444', order: 6, description: 'Deal lost' } }),
    ])

    // Create Users
    const defaultPasswordHash = await hash('password123', 10)
    const users = await Promise.all([
      db.user.create({ data: { email: 'admin@bdams.com', name: 'Admin User', password: defaultPasswordHash, role: 'ADMIN', department: 'Management', position: 'CEO', phone: '+1-555-0100', isActive: true } }),
      db.user.create({ data: { email: 'sarah.manager@bdams.com', name: 'Sarah Johnson', password: defaultPasswordHash, role: 'MANAGER', department: 'Sales', position: 'Sales Director', phone: '+1-555-0101', isActive: true } }),
      db.user.create({ data: { email: 'michael.senior@bdams.com', name: 'Michael Chen', password: defaultPasswordHash, role: 'MANAGER', department: 'Marketing', position: 'Marketing Director', phone: '+1-555-0102', isActive: true } }),
      db.user.create({ data: { email: 'emma.agent@bdams.com', name: 'Emma Wilson', password: defaultPasswordHash, role: 'AGENT', department: 'Sales', position: 'Account Executive', phone: '+1-555-0103', isActive: true } }),
      db.user.create({ data: { email: 'alex.agent@bdams.com', name: 'Alex Rodriguez', password: defaultPasswordHash, role: 'AGENT', department: 'Sales', position: 'Sales Representative', phone: '+1-555-0104', isActive: true } }),
      db.user.create({ data: { email: 'lisa.agent@bdams.com', name: 'Lisa Thompson', password: defaultPasswordHash, role: 'AGENT', department: 'Sales', position: 'Business Developer', phone: '+1-555-0105', isActive: true } }),
      db.user.create({ data: { email: 'david.agent@bdams.com', name: 'David Kim', password: defaultPasswordHash, role: 'AGENT', department: 'Marketing', position: 'Marketing Specialist', phone: '+1-555-0106', isActive: true } }),
      db.user.create({ data: { email: 'jennifer.agent@bdams.com', name: 'Jennifer Martinez', password: defaultPasswordHash, role: 'AGENT', department: 'Sales', position: 'Account Executive', phone: '+1-555-0107', isActive: true } }),
      db.user.create({ data: { email: 'robert.viewer@bdams.com', name: 'Robert Brown', password: defaultPasswordHash, role: 'VIEWER', department: 'Operations', position: 'Operations Analyst', phone: '+1-555-0108', isActive: true } }),
      db.user.create({ data: { email: 'amanda.agent@bdams.com', name: 'Amanda Lee', password: defaultPasswordHash, role: 'AGENT', department: 'Sales', position: 'Sales Representative', phone: '+1-555-0109', isActive: true } }),
      db.user.create({ data: { email: 'chris.agent@bdams.com', name: 'Chris Taylor', password: defaultPasswordHash, role: 'AGENT', department: 'Sales', position: 'Business Developer', phone: '+1-555-0110', isActive: true } }),
      db.user.create({ data: { email: 'nicole.agent@bdams.com', name: 'Nicole Davis', password: defaultPasswordHash, role: 'AGENT', department: 'Marketing', position: 'Content Manager', phone: '+1-555-0111', isActive: true } }),
    ])

    const agents = users.filter(u => u.role === 'AGENT' || u.role === 'MANAGER')

    // Create Leads
    const leads: Awaited<ReturnType<typeof db.lead.create>>[] = []
    for (let i = 0; i < 45; i++) {
      const firstName = randomElement(firstNames)
      const lastName = randomElement(lastNames)
      const lead = await db.lead.create({
        data: {
          firstName,
          lastName,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${randomElement(['gmail.com', 'company.com', 'business.org', 'enterprise.net', 'corp.io'])}`,
          phone: `+1-555-${randomInt(1000, 9999)}`,
          company: randomElement(companies),
          position: randomElement(['CEO', 'CTO', 'VP Sales', 'Director', 'Manager', 'Owner']),
          source: randomElement(sources),
          status: randomElement(['NEW', 'CONTACTED', 'QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'WON', 'LOST']),
          temperature: randomElement(['COLD', 'WARM', 'HOT']),
          estimatedValue: randomInt(5000, 150000),
          notes: `Lead sourced from ${randomElement(sources)}. Interest shown in our services.`,
          assignedToId: randomElement(agents).id,
          createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        }
      })
      leads.push(lead)
    }

    // Create Clients
    const clients: Awaited<ReturnType<typeof db.client.create>>[] = []
    for (let i = 0; i < 18; i++) {
      const client = await db.client.create({
        data: {
          companyName: `${randomElement(companies)} ${['LLC', 'Inc', 'Ltd', 'Corp', 'Group'][i % 5]}`,
          industry: randomElement(industries),
          website: `https://www.company${i + 1}.com`,
          address: `${randomInt(100, 999)} Business Ave`,
          city: randomElement(['New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix', 'San Francisco', 'Seattle', 'Boston']),
          country: 'United States',
          primaryContactName: `${randomElement(firstNames)} ${randomElement(lastNames)}`,
          primaryContactEmail: `contact@company${i + 1}.com`,
          primaryContactPhone: `+1-555-${randomInt(2000, 9999)}`,
          notes: 'Long-term client relationship',
          totalRevenue: randomInt(50000, 500000),
          dealCount: randomInt(1, 8),
          assignedToId: randomElement(agents).id,
        }
      })
      clients.push(client)
    }

    // Create Deals
    const deals: Awaited<ReturnType<typeof db.deal.create>>[] = []
    for (let i = 0; i < 28; i++) {
      const lead = randomElement(leads)
      const stage = randomElement(pipelineStages)
      const value = randomInt(10000, 200000)
      
      const deal = await db.deal.create({
        data: {
          title: `${lead.company || lead.firstName + ' ' + lead.lastName} - Deal #${i + 1}`,
          value,
          status: stage.name === 'Closed Won' ? 'WON' : stage.name === 'Closed Lost' ? 'LOST' : 'OPEN',
          probability: stage.order * 15,
          expectedCloseDate: randomDate(new Date(), new Date(2025, 11, 31)),
          description: 'Potential deal for consulting services',
          leadId: lead.id,
          clientId: Math.random() > 0.5 ? randomElement(clients).id : null,
          stageId: stage.id,
          assignedToId: randomElement(agents).id,
          createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        }
      })
      deals.push(deal)
    }

    // Create Tasks
    const taskTitles = ['Follow up call', 'Send proposal', 'Schedule meeting', 'Prepare contract', 'Review documents', 'Update CRM', 'Send follow-up email', 'Prepare presentation']
    for (let i = 0; i < 35; i++) {
      await db.task.create({
        data: {
          title: randomElement(taskTitles),
          description: 'Task description and notes',
          priority: randomElement(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
          status: randomElement(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']),
          dueDate: randomDate(new Date(), new Date(2025, 2, 28)),
          leadId: Math.random() > 0.6 ? randomElement(leads).id : null,
          clientId: Math.random() > 0.6 ? randomElement(clients).id : null,
          assignedToId: randomElement(agents).id,
          createdBy: randomElement(users).id,
        }
      })
    }

    // Create Activities
    const activityTypes = ['CALL', 'EMAIL', 'MEETING', 'NOTE', 'TASK']
    const activityTitles = [
      'Initial discovery call', 'Product demo meeting', 'Proposal follow-up', 
      'Contract negotiation', 'Check-in call', 'Email introduction',
      'Weekly sync meeting', 'Quarterly review', 'Support call'
    ]
    for (let i = 0; i < 55; i++) {
      await db.activity.create({
        data: {
          type: randomElement(activityTypes),
          title: randomElement(activityTitles),
          description: 'Activity details and notes from the interaction',
          duration: randomElement([15, 30, 45, 60, 90, 120]),
          leadId: Math.random() > 0.4 ? randomElement(leads).id : null,
          clientId: Math.random() > 0.5 ? randomElement(clients).id : null,
          userId: randomElement(users).id,
          createdAt: randomDate(new Date(2024, 0, 1), new Date()),
        }
      })
    }

    // Create Documents
    const docTypes = ['PROPOSAL', 'CONTRACT', 'INVOICE', 'OTHER']
    const docNames = ['Service Agreement', 'Project Proposal', 'Invoice Q1', 'Contract Amendment', 'ND Agreement', 'Scope Document']
    for (let i = 0; i < 12; i++) {
      await db.document.create({
        data: {
          name: `${randomElement(docNames)}_${i + 1}.pdf`,
          type: randomElement(docTypes),
          fileUrl: `/documents/doc_${i + 1}.pdf`,
          fileSize: randomInt(50000, 5000000),
          mimeType: 'application/pdf',
          leadId: Math.random() > 0.5 ? randomElement(leads).id : null,
          clientId: Math.random() > 0.5 ? randomElement(clients).id : null,
          uploadedById: randomElement(users).id,
        }
      })
    }

    return NextResponse.json({ 
      message: 'Database seeded successfully',
      stats: {
        users: users.length,
        pipelineStages: pipelineStages.length,
        leads: leads.length,
        clients: clients.length,
        deals: deals.length,
        tasks: 35,
        activities: 55,
        documents: 12
      }
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: 'Failed to seed database' }, { status: 500 })
  }
}
