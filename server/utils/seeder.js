const User = require('../models/User');
const Customer = require('../models/Customer');
const Lead = require('../models/Lead');
const Task = require('../models/Task');
const Activity = require('../models/Activity');
const Notification = require('../models/Notification');

const seedDataIfEmpty = async () => {
  try {
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      return;
    }

    console.log('Seeding initial CRM360 demo dataset...');

    // 1. Create Users
    const admin = await User.create({
      name: 'Sarah Connor (Admin)',
      email: 'admin@crm360.com',
      password: 'Password@123',
      role: 'Admin',
      phone: '+1 (555) 019-2831'
    });

    const manager = await User.create({
      name: 'Michael Scott (Manager)',
      email: 'manager@crm360.com',
      password: 'Password@123',
      role: 'Sales Manager',
      phone: '+1 (555) 018-9942'
    });

    const executive = await User.create({
      name: 'Jim Halpert (Sales Exec)',
      email: 'sales@crm360.com',
      password: 'Password@123',
      role: 'Sales Executive',
      phone: '+1 (555) 017-3319'
    });

    // 2. Create Customers
    const customersData = [
      {
        name: 'Apex Global Enterprises',
        email: 'billing@apexglobal.com',
        phone: '+1 (415) 890-1234',
        company: 'Apex Global Inc',
        status: 'Active',
        industry: 'Technology',
        address: '100 Mission St, San Francisco, CA',
        assignedTo: executive._id,
        notes: 'Enterprise tier client, renewal in Q4'
      },
      {
        name: 'BlueStone Health Network',
        email: 'procurement@bluestone.org',
        phone: '+1 (212) 445-9876',
        company: 'BlueStone Health',
        status: 'Active',
        industry: 'Healthcare',
        address: '750 Lexington Ave, New York, NY',
        assignedTo: manager._id,
        notes: 'Expanding to 5 regional clinic locations'
      },
      {
        name: 'Vanguard Logistics',
        email: 'ops@vanguardlog.com',
        phone: '+1 (312) 670-3400',
        company: 'Vanguard Freight & Freight',
        status: 'Active',
        industry: 'Logistics',
        address: '300 S Wacker Dr, Chicago, IL',
        assignedTo: executive._id,
        notes: 'API integration completed successfully'
      },
      {
        name: 'Starlight Retailers',
        email: 'accounts@starlightretail.com',
        phone: '+1 (206) 555-8812',
        company: 'Starlight Retail Group',
        status: 'Active',
        industry: 'Retail',
        address: '1201 3rd Ave, Seattle, WA',
        assignedTo: executive._id,
        notes: 'Point of sale hardware upgrade planned'
      },
      {
        name: 'Omega Financial Capital',
        email: 'info@omegafin.com',
        phone: '+1 (617) 902-3341',
        company: 'Omega Capital Partners',
        status: 'Inactive',
        industry: 'Finance',
        address: '100 Federal St, Boston, MA',
        assignedTo: manager._id,
        notes: 'Paused subscription during internal audit'
      }
    ];

    const createdCustomers = await Customer.insertMany(customersData);

    // 3. Create Leads across the pipeline
    const leadsData = [
      {
        title: 'Enterprise CRM Migration (500 seats)',
        contactName: 'David Vance',
        contactEmail: 'david.vance@solarsystems.io',
        contactPhone: '+1 (408) 789-2211',
        company: 'SolarSystems IO',
        status: 'New',
        value: 45000,
        source: 'Website',
        assignedTo: executive._id,
        notes: 'Requested product walkthrough via pricing page'
      },
      {
        title: 'Cloud Infrastructure Monitoring Suite',
        contactName: 'Elena Rostova',
        contactEmail: 'elena@novatech.co',
        contactPhone: '+1 (512) 349-8800',
        company: 'NovaTech Solutions',
        status: 'Contacted',
        value: 28000,
        source: 'LinkedIn',
        assignedTo: executive._id,
        notes: 'Had introductory call; sending technical spec sheet'
      },
      {
        title: 'Security Compliance Auditing License',
        contactName: 'Marcus Thorne',
        contactEmail: 'mthorne@cyberguard.net',
        contactPhone: '+1 (703) 890-4455',
        company: 'CyberGuard Systems',
        status: 'Qualified',
        value: 62000,
        source: 'Referral',
        assignedTo: manager._id,
        notes: 'Budget verified. Legal reviewing standard terms'
      },
      {
        title: 'Multi-Tenant SaaS Expansion',
        contactName: 'Claire Bennett',
        contactEmail: 'cbennett@hypergrowth.ai',
        contactPhone: '+1 (650) 441-9922',
        company: 'HyperGrowth AI',
        status: 'Proposal Sent',
        value: 78000,
        source: 'Website',
        assignedTo: manager._id,
        notes: 'Custom SLA proposal delivered on Monday'
      },
      {
        title: 'Annual Enterprise Software Deal',
        contactName: 'Gregory House',
        contactEmail: 'ghouse@princetonmed.edu',
        contactPhone: '+1 (609) 258-3000',
        company: 'Princeton Diagnostics',
        status: 'Won',
        value: 95000,
        source: 'Event',
        assignedTo: executive._id,
        notes: 'Contract signed! Onboarding started.',
        isConverted: true,
        customerId: createdCustomers[0]._id
      },
      {
        title: 'Regional Supply Chain Pilot',
        contactName: 'Arthur Dent',
        contactEmail: 'adent@magrathea.co.uk',
        contactPhone: '+44 20 7946 0912',
        company: 'Magrathea Logistics',
        status: 'Lost',
        value: 32000,
        source: 'Cold Call',
        assignedTo: executive._id,
        notes: 'Chose incumbent vendor due to legacy database ties'
      }
    ];

    const createdLeads = await Lead.insertMany(leadsData);

    // 4. Create Tasks
    const tasksData = [
      {
        title: 'Prepare executive proposal deck for HyperGrowth AI',
        description: 'Detail custom deployment SLA, failover clusters, and pricing tier.',
        status: 'In Progress',
        priority: 'Urgent',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        assignedTo: manager._id,
        relatedTo: {
          itemType: 'Lead',
          itemId: createdLeads[3]._id,
          itemName: createdLeads[3].title
        }
      },
      {
        title: 'Schedule follow-up demo with NovaTech CTO',
        description: 'Demonstrate role-based permissions and analytics dashboards.',
        status: 'Todo',
        priority: 'High',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        assignedTo: executive._id,
        relatedTo: {
          itemType: 'Lead',
          itemId: createdLeads[1]._id,
          itemName: createdLeads[1].title
        }
      },
      {
        title: 'Quarterly review call with Apex Global Enterprises',
        description: 'Check user seat adoption and discuss Q4 enterprise renewal.',
        status: 'Todo',
        priority: 'Medium',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        assignedTo: executive._id,
        relatedTo: {
          itemType: 'Customer',
          itemId: createdCustomers[0]._id,
          itemName: createdCustomers[0].name
        }
      },
      {
        title: 'Send welcome packet to Princeton Diagnostics',
        description: 'Deliver API credentials, technical documentation and sandbox access.',
        status: 'Completed',
        priority: 'Low',
        dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        assignedTo: executive._id,
        relatedTo: {
          itemType: 'Customer',
          itemId: createdCustomers[0]._id,
          itemName: createdCustomers[0].name
        }
      }
    ];

    await Task.insertMany(tasksData);

    // 5. Create Activities
    await Activity.create({
      type: 'Meeting',
      description: 'Discovery call held with SolarSystems IO regarding migration requirements.',
      relatedTo: { itemType: 'Lead', itemId: createdLeads[0]._id },
      createdBy: executive._id
    });

    await Activity.create({
      type: 'Conversion',
      description: 'Lead converted to customer account upon contract finalization.',
      relatedTo: { itemType: 'Customer', itemId: createdCustomers[0]._id },
      createdBy: executive._id
    });

    // 6. Create Notifications
    await Notification.create({
      recipient: executive._id,
      title: 'New Lead Assigned',
      message: 'You have been assigned to Enterprise CRM Migration (SolarSystems IO)',
      type: 'lead',
      link: '/leads',
      isRead: false
    });

    await Notification.create({
      recipient: manager._id,
      title: 'Urgent Task Due Soon',
      message: 'Prepare executive proposal deck for HyperGrowth AI is due in 48 hours',
      type: 'deadline',
      link: '/tasks',
      isRead: false
    });

    console.log('CRM360 initial demo dataset seeded successfully!');
    console.log('Demo Credentials:');
    console.log(' - Admin: admin@crm360.com / Password@123');
    console.log(' - Manager: manager@crm360.com / Password@123');
    console.log(' - Sales Exec: sales@crm360.com / Password@123');
  } catch (error) {
    console.error('Error during data seeding:', error.message);
  }
};

module.exports = { seedDataIfEmpty };
