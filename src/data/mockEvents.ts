import { PlannerEvent } from '../types/event';

export const INITIAL_EVENTS: PlannerEvent[] = [
  {
    id: 'evt-wedding-01',
    title: 'Elena & Julian’s Coastal Villa Wedding',
    type: 'wedding',
    tagline: 'An intimate sun-kissed celebration by the olive groves and seaside cliffs',
    date: '2026-09-18',
    time: '16:30',
    location: 'Amalfi Coast / Positano, Italy (or Big Sur Coastal Retreat)',
    venueName: 'Villa Bellisima Gardens & Terrace',
    targetGuestCount: 95,
    totalBudget: 42000,
    currency: '$',
    coverImage: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    theme: 'Warm Mediterranean Elegance, Terracotta, Olive Greens & Limoncello Glow',
    priorityFocus: 'Exceptional food & wine pairing, live acoustic jazz, and relaxed sunset photography',
    budgetCategories: [
      { id: 'cat-1', name: 'Venue & Lodging', allocated: 14000, actual: 14200, color: '#0d9488', iconName: 'Building' },
      { id: 'cat-2', name: 'Catering & Cocktails', allocated: 12500, actual: 11800, color: '#f59e0b', iconName: 'Utensils' },
      { id: 'cat-3', name: 'Photography & Cinema', allocated: 5500, actual: 5200, color: '#6366f1', iconName: 'Camera' },
      { id: 'cat-4', name: 'Floral, Decor & Lighting', allocated: 4800, actual: 4400, color: '#ec4899', iconName: 'Sparkles' },
      { id: 'cat-5', name: 'Music & Entertainment', allocated: 3200, actual: 3000, color: '#8b5cf6', iconName: 'Music' },
      { id: 'cat-6', name: 'Stationery & Favors', allocated: 2000, actual: 1650, color: '#10b981', iconName: 'Mail' }
    ],
    budgetItems: [
      { id: 'b-1', categoryId: 'cat-1', title: 'Villa Rental (Full Day + Overnight Suite)', estimatedCost: 14000, actualCost: 14200, isPaid: true, dueDate: '2026-04-10', notes: 'Deposit and security paid' },
      { id: 'b-2', categoryId: 'cat-2', title: '4-Course Tuscan Sunset Dinner (95 pax)', estimatedCost: 9500, actualCost: 9200, isPaid: true, dueDate: '2026-07-01' },
      { id: 'b-3', categoryId: 'cat-2', title: 'Aperitivo Bar & Signature Spritz Cocktails', estimatedCost: 3000, actualCost: 2600, isPaid: false, dueDate: '2026-09-01' },
      { id: 'b-4', categoryId: 'cat-3', title: 'Golden Hour Photo + 4K Drone Film (10h)', estimatedCost: 5500, actualCost: 5200, isPaid: true, dueDate: '2026-06-15' },
      { id: 'b-5', categoryId: 'cat-4', title: 'Olive Branch Arches & Cascading Peonies', estimatedCost: 3200, actualCost: 3000, isPaid: false, dueDate: '2026-08-20' },
      { id: 'b-6', categoryId: 'cat-4', title: 'Fairy Lighting & Terracotta Centerpieces', estimatedCost: 1600, actualCost: 1400, isPaid: true, dueDate: '2026-08-01' },
      { id: 'b-7', categoryId: 'cat-5', title: 'Acoustic Guitar Duo (Ceremony + Cocktail)', estimatedCost: 1400, actualCost: 1300, isPaid: true, dueDate: '2026-07-15' },
      { id: 'b-8', categoryId: 'cat-5', title: 'Sunset DJ & Brass Horn Performer', estimatedCost: 1800, actualCost: 1700, isPaid: false, dueDate: '2026-09-10' },
      { id: 'b-9', categoryId: 'cat-6', title: 'Handmade Letterpress Invitations + Calligraphy', estimatedCost: 1200, actualCost: 1100, isPaid: true, dueDate: '2026-05-15' },
      { id: 'b-10', categoryId: 'cat-6', title: 'Custom Bottled Olive Oil & Limoncello Favors', estimatedCost: 800, actualCost: 550, isPaid: true, dueDate: '2026-08-01' }
    ],
    milestones: [
      { id: 'm-1', timePhase: '6 Months Before', title: 'Secure Cliffside Villa Venue & Catering Contract', dueDate: '2026-03-15', completed: true, priority: 'high', category: 'Venue', assignee: 'Elena' },
      { id: 'm-2', timePhase: '4 Months Before', title: 'Send Save-the-Dates & Launch Digital RSVP Portal', dueDate: '2026-05-01', completed: true, priority: 'high', category: 'Guests', assignee: 'Julian' },
      { id: 'm-3', timePhase: '3 Months Before', title: 'Floral Mockup & Wine Tasting Menu Finalization', dueDate: '2026-06-10', completed: true, priority: 'medium', category: 'Catering', assignee: 'Elena' },
      { id: 'm-4', timePhase: '2 Months Before', title: 'Approve Photography Shot-List & Drone Clearance', dueDate: '2026-07-15', completed: false, priority: 'medium', category: 'Media', assignee: 'Julian' },
      { id: 'm-5', timePhase: '1 Month Before', title: 'Lock Final Headcount & Table Chart for Calligrapher', dueDate: '2026-08-18', completed: false, priority: 'high', category: 'Guests', assignee: 'Elena' },
      { id: 'm-6', timePhase: 'Event Week', title: 'Rehearsal Dinner & Welcome Aperitivo Cocktail', dueDate: '2026-09-17', completed: false, priority: 'medium', category: 'Schedule', assignee: 'Julian' }
    ],
    dayOfSchedule: [
      { id: 'sch-1', time: '11:00 AM', title: 'Bridal Party Hair & Makeup Styling Begins', durationMin: 180, location: 'Villa Bridal Suite', responsible: 'Lead Stylist Chiara', notes: 'Champagne and fruit platter delivered at 11:30', completed: false },
      { id: 'sch-2', time: '01:30 PM', title: 'Floral Arch & Ceremony Audio Setup', durationMin: 90, location: 'Seaside Lawn', responsible: 'Bloom Atelier & Sound Engineer', notes: 'Ensure battery backup for wireless microphones', completed: false, vendorAlert: 'Check wind forecast for arch stabilization' },
      { id: 'sch-3', time: '03:15 PM', title: 'First Look & Couple Portraits in Olive Grove', durationMin: 60, location: 'Upper Terrace & Grove', responsible: 'Photographer Marco', notes: 'Keep bouquet in water until 3:10 PM', completed: false },
      { id: 'sch-4', time: '04:30 PM', title: 'Ceremony Begins (Acoustic Strings)', durationMin: 45, location: 'Seaside Lawn', responsible: 'Officiant Mateo & String Duo', notes: 'Ring bearer cues at 4:38 PM', completed: false },
      { id: 'sch-5', time: '05:15 PM', title: 'Cocktail Hour & Golden Hour Antipasti', durationMin: 75, location: 'Lemon Grove Terrace', responsible: 'Catering Lead Giancarlo', notes: 'Signature Limoncello Spritz served on arrival', completed: false },
      { id: 'sch-6', time: '06:30 PM', title: 'Plated Dinner & Welcome Toasts', durationMin: 120, location: 'Pergola Pavilion', responsible: 'Host & Best Man', notes: 'Father of Bride toast at 6:50 PM, Maid of Honor at 7:30 PM', completed: false },
      { id: 'sch-7', time: '08:45 PM', title: 'Millefoglie Cake Cutting & Sparkling Toast', durationMin: 30, location: 'Lower Terrace', responsible: 'Caterer & DJ', notes: 'Live pastry chef builds cake in front of guests', completed: false },
      { id: 'sch-8', time: '09:15 PM', title: 'Live Brass & DJ Dance Party', durationMin: 180, location: 'Courtyard Ballroom', responsible: 'DJ & Brass Performer', notes: 'Late night woodfired pizza served at 11:00 PM', completed: false }
    ],
    vendors: [
      {
        id: 'v-1',
        name: 'Villa Bellisima Estate',
        category: 'Venue',
        status: 'contract_signed',
        contactPerson: 'Sophia Rossi',
        email: 'events@villabellisima.com',
        phone: '+39 089 872 104',
        quotedPrice: 14000,
        finalPrice: 14200,
        notes: 'Includes access from 9:00 AM on wedding day until 11:00 AM next morning.',
        checklist: [
          { id: 'vc-1', text: 'Confirm arrival access for florists at 8:30 AM', done: true },
          { id: 'vc-2', text: 'Verify noise ordinance cutoff at 12:30 AM', done: true },
          { id: 'vc-3', text: 'Secure generator backup for audio & fairy lights', done: true }
        ],
        lastUpdate: '2 hours ago - Approved load-in schedule'
      },
      {
        id: 'v-2',
        name: 'Amalfi Sol Catering & Cellars',
        category: 'Catering',
        status: 'contract_signed',
        contactPerson: 'Chef Giancarlo',
        email: 'giancarlo@amalfisol.it',
        phone: '+39 089 871 992',
        quotedPrice: 12500,
        finalPrice: 11800,
        notes: 'Includes 4-course dinner, 3 signature cocktails, local vintage wines, and waitstaff.',
        checklist: [
          { id: 'vc-4', text: 'Tasting session completed (Wild mushroom risotto selected)', done: true },
          { id: 'vc-5', text: 'Finalize counts for 8 vegetarian and 4 gluten-free guests', done: true },
          { id: 'vc-6', text: 'Confirm woodfired pizza station setup for late night', done: false }
        ],
        lastUpdate: 'Yesterday - Accommodated 2 dairy allergies'
      },
      {
        id: 'v-3',
        name: 'Marco V. Cinema & Fine Art Stills',
        category: 'Photography',
        status: 'confirmed',
        contactPerson: 'Marco Valentini',
        email: 'marco@fineartmarco.com',
        phone: '+39 347 112 400',
        quotedPrice: 5500,
        finalPrice: 5200,
        notes: '2 Photographers + 1 Drone operator for 10 hours. Teaser video delivered in 5 days.',
        checklist: [
          { id: 'vc-7', text: 'Signed drone flight clearance over coastal cliffs', done: true },
          { id: 'vc-8', text: 'Send VIP family member portrait grouping list', done: false },
          { id: 'vc-9', text: 'Pre-wedding sunset scout session on Sept 16', done: true }
        ],
        lastUpdate: '3 days ago - Shot list reviewed'
      },
      {
        id: 'v-4',
        name: 'Bloom & Citrus Floral Studio',
        category: 'Floral & Decor',
        status: 'proposal_received',
        contactPerson: 'Alessia Conti',
        email: 'alessia@bloomcitrus.com',
        phone: '+39 338 901 882',
        quotedPrice: 4800,
        finalPrice: 4400,
        notes: 'Ceremony ground floral crescent, 10 table runners with fresh lemons, bridal bouquet & boutonnieres.',
        checklist: [
          { id: 'vc-10', text: 'Select terracotta urn shapes for ceremony path', done: true },
          { id: 'vc-11', text: 'Review sample boutonnière pin style', done: false },
          { id: 'vc-12', text: 'Confirm breakdown time after midnight', done: false }
        ],
        lastUpdate: '5 hours ago - Sent revised floral arch rendering'
      }
    ],
    guests: [
      { id: 'g-1', name: 'Julian Vance & Elena Rossi', email: 'elena.rossi@example.com', group: 'VIP', rsvpStatus: 'attending', plusOnes: 0, dietary: 'None', tableNumber: 'Table 1 (Couple)', checkedIn: true, notes: 'Hosts' },
      { id: 'g-2', name: 'Dr. Arthur Vance', email: 'arthur.vance@example.com', group: 'Family', rsvpStatus: 'attending', plusOnes: 1, dietary: 'Gluten-Free', tableNumber: 'Table 2', checkedIn: true, notes: 'Father of Groom (Speech)' },
      { id: 'g-3', name: 'Clara & Matteo Rossi', email: 'clara.rossi@example.com', group: 'Family', rsvpStatus: 'attending', plusOnes: 0, dietary: 'Vegetarian', tableNumber: 'Table 2', checkedIn: true, notes: 'Parents of Bride' },
      { id: 'g-4', name: 'Marcus Sterling', email: 'marcus.s@example.com', group: 'Friends', rsvpStatus: 'attending', plusOnes: 1, dietary: 'None', tableNumber: 'Table 3', songRequest: 'L-O-V-E by Nat King Cole', checkedIn: false, notes: 'Best Man' },
      { id: 'g-5', name: 'Camilla Dupont', email: 'camilla.d@example.com', group: 'Friends', rsvpStatus: 'attending', plusOnes: 0, dietary: 'Pescatarian', tableNumber: 'Table 3', songRequest: 'Volare (Nel Blu Dipinto Di Blu)', checkedIn: false, notes: 'Maid of Honor' },
      { id: 'g-6', name: 'Dante & Sofia Bianchi', email: 'dante.b@example.com', group: 'Friends', rsvpStatus: 'attending', plusOnes: 1, dietary: 'Nut Allergy', tableNumber: 'Table 4', songRequest: 'You Make My Dreams Come True', checkedIn: false },
      { id: 'g-7', name: 'Professor Lawrence K.', email: 'lawrence.k@example.com', group: 'Colleagues', rsvpStatus: 'declined', plusOnes: 0, dietary: '', checkedIn: false, notes: 'Sent warm congratulations card' },
      { id: 'g-8', name: 'Nadia Chen', email: 'nadia.chen@example.com', group: 'Friends', rsvpStatus: 'pending', plusOnes: 1, checkedIn: false, notes: 'Awaiting travel confirmation' }
    ],
    creative: {
      themeTitle: 'Sunlit Terracotta & Coastal Flora',
      vibeDescription: 'Effortlessly luxurious Mediterranean seaside gathering with warm terracotta hues, aromatic rosemary and olive branches, soft candlelight, and sparkling champagne.',
      palette: [
        { name: 'Terracotta Warmth', hex: '#c86446' },
        { name: 'Olive Grove', hex: '#606c38' },
        { name: 'Limoncello Cream', hex: '#fefae0' },
        { name: 'Sea Salt White', hex: '#f8f9fa' },
        { name: 'Warm Amber Gold', hex: '#dda15e' }
      ],
      decorConcepts: [
        'Cascading olive branch chandeliers intertwined with dimmable micro-fairy lights',
        'Handmade Italian ceramic table numbers with Amalfi lemon motifs',
        'Floor-level floral crescents framing the ceremony looking over the ocean',
        'Personalized calligraphy tiles serving as both place cards and guest takeaways'
      ],
      signatureItems: [
        { name: 'The Amalfi Golden Spritz', type: 'cocktail', description: 'Handcrafted Limoncello, crisp Prosecco DOCG, sparkling soda, and fresh garden mint sprig.', ingredientsOrHighlights: 'Amalfi lemon zest, organic mint, brut sparkling wine' },
        { name: 'Seaside Rosemary Gin Fizz', type: 'cocktail', description: 'Botanical gin infused with coastal rosemary, elderflower liqueur, and charred grapefruit.', ingredientsOrHighlights: 'Locally distilled gin, St. Germain, fresh pink grapefruit' },
        { name: 'Citrus Olive Blossom Mocktail', type: 'mocktail', description: 'Sparkling tonic with crushed blood orange, rosemary simple syrup, and a splash of Mediterranean lemon juice.', ingredientsOrHighlights: 'Zero-proof, refreshing summer cooler' },
        { name: 'Tuscan Truffle & Wild Mushroom Risotto', type: 'entree', description: 'Acquerello aged carnaroli rice simmered in herb stock with shaved black truffles and aged Parmigiano Reggiano.', ingredientsOrHighlights: 'Vegetarian standout highlight' }
      ],
      invitations: [
        {
          id: 'inv-1',
          style: 'Formal & Elegant',
          headline: 'Together with their families, Elena & Julian invite you to celebrate love by the sea',
          body: 'Join us on Friday, the eighteenth of September, two thousand twenty-six at half past four in the afternoon for vows, dinner, and dancing under the stars at Villa Bellisima.',
          rsvpCallout: 'Kindly respond by July 15th via our digital portal: celebration.live/elena-julian'
        },
        {
          id: 'inv-2',
          style: 'Warm & Welcoming',
          headline: 'Under the olive trees and over the ocean waves...',
          body: 'We are getting married! Pack your sunglasses and dancing shoes for an unforgettable weekend in Italy. Sunset vows followed by wine, laughter, and an Italian feast.',
          rsvpCallout: 'Please confirm your dietary preferences and song requests by July 15th.'
        }
      ],
      speeches: [
        {
          id: 'sp-1',
          speakerRole: 'Best Man (Marcus)',
          title: 'From College Roommates to Finding His Forever Match',
          estimatedDuration: '4 minutes',
          content: 'Good evening everyone. For those who do not know me, I am Marcus, Julian’s college roommate and longtime accomplice... When Julian first told me about Elena after their first date in Rome, he didn’t just say it went well. He said, "Marcus, cancel my weekend plans, I need to learn how to cook so she actually takes me seriously." Seeing them together today, watching how they lift each other up with such gentle patience and laughter, leaves no doubt in my mind that they are home with each other. Here is to a lifetime of sunset toasts!'
        },
        {
          id: 'sp-2',
          speakerRole: 'Father of the Bride',
          title: 'Watching Elena Fly & Welcoming Julian to the Family',
          estimatedDuration: '5 minutes',
          content: 'Ladies and gentlemen, family, and dear friends who travelled from near and far... When Elena was little, she had a habit of collecting sea glass along the shore, finding beauty in every rough stone smoothed by the waves. In Julian, she found someone with a heart as vast and steadfast as this ocean before us. Julian, from the first dinner at our home, you were already family. May your love always be as radiant as tonight.'
        }
      ],
      favorsOrActivities: [
        'Custom 100ml bottles of estate extra virgin olive oil sealed with wax stamp',
        'Polaroid guestbook table with metallic gold pens and Mediterranean sticker set',
        'Live gelato cart pulling up at 10:30 PM with pistachio and stracciatella'
      ]
    },
    activityFeed: [
      { id: 'act-1', timestamp: '10 mins ago', author: 'Chef Giancarlo', role: 'Vendor', action: 'Updated catering notes with dietary substitute for Table 2', type: 'vendor' },
      { id: 'act-2', timestamp: '35 mins ago', author: 'Clara Rossi', role: 'Host', action: 'Confirmed vegetarian meal choice and added plus-one note', type: 'guest' },
      { id: 'act-3', timestamp: '2 hours ago', author: 'EventCraft AI', role: 'AI Assistant', action: 'Optimized budget allocation: saved $400 on stationery by batching digital seals', type: 'ai' },
      { id: 'act-4', timestamp: 'Yesterday', author: 'Elena Rossi', role: 'Lead Planner', action: 'Finalized Ceremony timeline schedule with Acoustic Strings duo', type: 'timeline' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'evt-birthday-02',
    title: 'Marcus’s 30th Neon Synthwave & Rooftop Arcade',
    type: 'birthday',
    tagline: 'An electric milestone birthday with custom vintage arcade cabinets, craft cocktails, and retro DJ beats',
    date: '2026-11-14',
    time: '19:30',
    location: 'Skyline Warehouse Lounge, Austin, TX',
    venueName: 'The Prism Loft & Rooftop Terrace',
    targetGuestCount: 60,
    totalBudget: 8500,
    currency: '$',
    coverImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80',
    theme: 'Cyberpunk Neon Glow, 80s Synthwave, Interactive Vintage Arcades & Craft Smash Burgers',
    priorityFocus: 'High energy games tournament, immersive neon lighting, punchy cocktails, and non-stop retro dance vibes',
    budgetCategories: [
      { id: 'cat-b1', name: 'Venue Rental', allocated: 2500, actual: 2400, color: '#6366f1', iconName: 'Building' },
      { id: 'cat-b2', name: 'Interactive Arcades & Lights', allocated: 2200, actual: 2150, color: '#ec4899', iconName: 'Sparkles' },
      { id: 'cat-b3', name: 'Bar & Gourmet Smash Burgers', allocated: 2400, actual: 2250, color: '#f59e0b', iconName: 'Utensils' },
      { id: 'cat-b4', name: 'DJ & Sound System', allocated: 900, actual: 850, color: '#8b5cf6', iconName: 'Music' },
      { id: 'cat-b5', name: 'Cake, Favors & Glow Merch', allocated: 500, actual: 480, color: '#10b981', iconName: 'Gift' }
    ],
    budgetItems: [
      { id: 'bi-1', categoryId: 'cat-b1', title: 'Prism Loft Rooftop 6-Hour Private Booking', estimatedCost: 2500, actualCost: 2400, isPaid: true, dueDate: '2026-10-01' },
      { id: 'bi-2', categoryId: 'cat-b2', title: '4 Classic Arcade Cabinets Rental (Street Fighter, PacMan, Mario Kart)', estimatedCost: 1500, actualCost: 1450, isPaid: true, dueDate: '2026-10-20' },
      { id: 'bi-3', categoryId: 'cat-b2', title: 'Laser Projection & Color Tube Neon Lighting Package', estimatedCost: 700, actualCost: 700, isPaid: true, dueDate: '2026-10-25' },
      { id: 'bi-4', categoryId: 'cat-b3', title: 'Mobile Smashburger Food Truck (2 sliders + fries per guest)', estimatedCost: 1500, actualCost: 1400, isPaid: false, dueDate: '2026-11-10' },
      { id: 'bi-5', categoryId: 'cat-b3', title: 'Signature Smoked Old Fashioned Bar Setup', estimatedCost: 900, actualCost: 850, isPaid: false, dueDate: '2026-11-10' },
      { id: 'bi-6', categoryId: 'cat-b4', title: 'DJ NeonVibe (Retro 80s/90s Electro & House)', estimatedCost: 900, actualCost: 850, isPaid: true, dueDate: '2026-10-15' },
      { id: 'bi-7', categoryId: 'cat-b5', title: 'Custom 8-Bit Pixel 30th Birthday Cake', estimatedCost: 300, actualCost: 280, isPaid: true, dueDate: '2026-11-05' },
      { id: 'bi-8', categoryId: 'cat-b5', title: 'Custom LED Wristbands & Retro Enamel Pins', estimatedCost: 200, actualCost: 200, isPaid: true, dueDate: '2026-11-01' }
    ],
    milestones: [
      { id: 'mb-1', timePhase: '2 Months Before', title: 'Book Rooftop Loft & Arcade Vendor', dueDate: '2026-09-15', completed: true, priority: 'high', category: 'Venue', assignee: 'Marcus' },
      { id: 'mb-2', timePhase: '1 Month Before', title: 'Send Neon Digital Invites & Open Game Tournament Poll', dueDate: '2026-10-15', completed: true, priority: 'high', category: 'Guests', assignee: 'Tanya' },
      { id: 'mb-3', timePhase: '2 Weeks Before', title: 'Food Truck Menu Lock & Bar Supplies Delivery', dueDate: '2026-11-01', completed: false, priority: 'medium', category: 'Catering', assignee: 'Marcus' },
      { id: 'mb-4', timePhase: 'Event Day', title: 'Arcade Setup & Laser Calibration Test', dueDate: '2026-11-14', completed: false, priority: 'high', category: 'Equipment', assignee: 'Tech Lead Dave' }
    ],
    dayOfSchedule: [
      { id: 'schb-1', time: '04:00 PM', title: 'Arcade Cabinets & Sound System Load-In', durationMin: 120, location: 'Loft Main Floor', responsible: 'Arcade Express Team', notes: 'Ensure dedicated 20A breaker for gaming machines', completed: false },
      { id: 'schb-2', time: '06:30 PM', title: 'Food Truck Arrival & Bar Prep', durationMin: 60, location: 'Loft Alley Parking', responsible: 'Heavy Metal Burger Co.', notes: 'Vegan patties prepped in separate griddle', completed: false },
      { id: 'schb-3', time: '07:30 PM', title: 'Doors Open, Welcome Cocktails & Free Play', durationMin: 60, location: 'Rooftop + Arcade Room', responsible: 'Marcus & Tanya', notes: 'Distribute glow bands and drink tickets', completed: false },
      { id: 'schb-4', time: '08:45 PM', title: 'Mario Kart 64 Knockout Championship', durationMin: 45, location: 'Giant Projector Screen', responsible: 'Host Marcus (MC)', notes: 'Winner gets retro gold cartridge trophy', completed: false },
      { id: 'schb-5', time: '09:45 PM', title: 'Cake Cutting & 30th Birthday Roast/Toast', durationMin: 25, location: 'Center Lounge', responsible: 'Tanya & Friends', notes: 'Cue "Never Gonna Give You Up" synth remix', completed: false },
      { id: 'schb-6', time: '10:15 PM', title: 'DJ Peak Synthwave Set & Late Night Snacks', durationMin: 120, location: 'Rooftop Dancefloor', responsible: 'DJ NeonVibe', notes: 'Truffle parmesan tater tots served', completed: false }
    ],
    vendors: [
      {
        id: 'vb-1',
        name: 'The Prism Loft Space',
        category: 'Venue',
        status: 'contract_signed',
        contactPerson: 'Zoe Reed',
        email: 'zoe@theprismloft.com',
        phone: '512-555-0199',
        quotedPrice: 2500,
        finalPrice: 2400,
        checklist: [
          { id: 'vcb-1', text: 'Freight elevator reserved for 4:00 PM load-in', done: true },
          { id: 'vcb-2', text: 'Rooftop heater units checked and fueled', done: true }
        ],
        notes: 'Security guard provided by venue from 8:00 PM to midnight.'
      },
      {
        id: 'vb-2',
        name: 'Retro Arcade Express Austin',
        category: 'Entertainment',
        status: 'contract_signed',
        contactPerson: 'Dave Miller',
        email: 'dave@retroarcadeatx.com',
        phone: '512-555-0812',
        quotedPrice: 1500,
        finalPrice: 1450,
        checklist: [
          { id: 'vcb-3', text: 'Free-play coins mode enabled on all machines', done: true },
          { id: 'vcb-4', text: 'HDMI output cable for Mario Kart big screen tournament', done: true }
        ],
        notes: 'Delivering 4 machines: Street Fighter II Turbo, Pac-Man, Mario Kart Arcade, NBA Jam.'
      }
    ],
    guests: [
      { id: 'gb-1', name: 'Marcus Sterling', email: 'marcus@example.com', group: 'VIP', rsvpStatus: 'attending', plusOnes: 0, checkedIn: true, notes: 'Birthday Guy' },
      { id: 'gb-2', name: 'Tanya Morales', email: 'tanya@example.com', group: 'VIP', rsvpStatus: 'attending', plusOnes: 1, checkedIn: true, notes: 'Co-Host / Planner' },
      { id: 'gb-3', name: 'Samira Patel', email: 'samira@example.com', group: 'Friends', rsvpStatus: 'attending', plusOnes: 1, dietary: 'Vegan', songRequest: 'Blue Monday - New Order', checkedIn: false },
      { id: 'gb-4', name: 'Jordan Vance', email: 'jordan@example.com', group: 'Friends', rsvpStatus: 'attending', plusOnes: 0, dietary: 'None', songRequest: 'Blinding Lights - The Weeknd', checkedIn: false },
      { id: 'gb-5', name: 'Alex Rivera', email: 'alex.r@example.com', group: 'Colleagues', rsvpStatus: 'attending', plusOnes: 1, dietary: 'None', songRequest: 'Midnight City - M83', checkedIn: false },
      { id: 'gb-6', name: 'Chris Evans', email: 'chris.e@example.com', group: 'Friends', rsvpStatus: 'declined', plusOnes: 0, checkedIn: false, notes: 'Out of town on work conference' }
    ],
    creative: {
      themeTitle: 'Neon Cyber Lounge: Level 30 Unlocked',
      vibeDescription: 'An intoxicating fusion of 1980s neon nostalgia, high-octane multiplayer arcade battles, vibrant magenta and electric cyan lighting, with punchy gourmet comfort food.',
      palette: [
        { name: 'Electric Cyan', hex: '#00f5d4' },
        { name: 'Neon Magenta', hex: '#f72585' },
        { name: 'Deep Space Navy', hex: '#0b091a' },
        { name: 'Synthwave Purple', hex: '#7209b7' },
        { name: 'Laser Lime', hex: '#39ff14' }
      ],
      decorConcepts: [
        'Custom 3D neon sign: "LEVEL 30: MARCUS"',
        'LED infinity mirror photo booth with retro VHS timestamp filter',
        'Grid floor decal with neon wireframe tape patterns',
        'Glowing LED cocktail glasses and blacklight reactive cocktail garnishes'
      ],
      signatureItems: [
        { name: 'The 8-Bit Smoked Old Fashioned', type: 'cocktail', description: 'Bourbon infused with toasted pecans, smoked orange bitters, served over pixel ice cube.', ingredientsOrHighlights: 'Smoked oak chips, Luxardo cherry, orange peel' },
        { name: 'Hyperdrive Electric Mule', type: 'cocktail', description: 'Vodka, blue curacao, freshly squeezed lime, and spicy ginger beer with a glowing sugar rim.', ingredientsOrHighlights: 'Vibrant neon blue with spicy ginger kick' },
        { name: 'Pixel Punch (Zero-Proof)', type: 'mocktail', description: 'Tart passion fruit, guava puree, coconut water, sparkling yuzu, and popping boba pearls.', ingredientsOrHighlights: 'Boba pearls that burst with mango flavor' },
        { name: 'Double Smash Slider with Truffle Aioli', type: 'entree', description: 'Crisp seared wagyu blend beef patties with caramelized shallots and melted aged cheddar on brioche.', ingredientsOrHighlights: 'Served hot from the food truck window' }
      ],
      invitations: [
        {
          id: 'invb-1',
          style: 'Playful & Whimsical',
          headline: 'PLAYER 1 HAS REACHED LEVEL 30! Insert Coin to Join Marcus',
          body: 'You are summoned to the ultimate rooftop arcade bash. Free play retro cabinets, street smashburgers, craft cocktails, and high-score glory.',
          rsvpCallout: 'Lock your slot & submit your high-score gamertag: party.io/marcus-30'
        }
      ],
      speeches: [
        {
          id: 'spb-1',
          speakerRole: 'Best Friend / Co-Host (Tanya)',
          title: '30 Years of Chaos, Laughter & Never Growing Up',
          estimatedDuration: '3 minutes',
          content: 'Listen up everyone! They say your twenties are for figuring out what you want to do, and your thirties are for finally doing it. Knowing Marcus for over a decade, I can safely report he spent his twenties mastering Mario Kart shortcuts and perfecting his smashburger technique. Marcus, you bring genuine excitement and warmth into every room you step into. Happy 30th birthday, buddy!'
        }
      ],
      favorsOrActivities: [
        'Mario Kart 64 Grand Prix with custom acrylic champion trophy',
        'Custom collectible retro enamel arcade tokens for all guests',
        'Polaroid prints clipped to a glowing neon wire tree'
      ]
    },
    activityFeed: [
      { id: 'actb-1', timestamp: '15 mins ago', author: 'Retro Arcade Express', role: 'Vendor', action: 'Confirmed NBA Jam delivery window between 3:30 - 4:00 PM', type: 'vendor' },
      { id: 'actb-2', timestamp: '1 hour ago', author: 'Samira Patel', role: 'Guest', action: 'RSVP confirmed (Vegan option selected)', type: 'guest' },
      { id: 'actb-3', timestamp: '3 hours ago', author: 'EventCraft AI', role: 'AI Assistant', action: 'Generated tournament bracket structure for 16-player Mario Kart playoff', type: 'ai' }
    ],
    updatedAt: new Date().toISOString()
  },
  {
    id: 'evt-community-03',
    title: 'Oakwood Annual Lantern & Street Food Community Festival',
    type: 'community',
    tagline: 'A vibrant neighborhood gathering featuring local artisans, multicultural food stalls, lantern making, and acoustic park performances',
    date: '2026-10-10',
    time: '14:00',
    location: 'Oakwood Central Park & Amphitheater',
    venueName: 'Oakwood Community Commons & Lake Meadow',
    targetGuestCount: 450,
    totalBudget: 16500,
    currency: '$',
    coverImage: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&w=1200&q=80',
    theme: 'Warm Harvest Glow, Cultural Harmony, Family Friendly, Eco-Conscious Zero Waste',
    priorityFocus: 'Accessible family activities, support for 15 local food vendors, safety logistics, and sunset floating lantern release',
    budgetCategories: [
      { id: 'cat-c1', name: 'Permits, Park Sanitation & Security', allocated: 3800, actual: 3600, color: '#0d9488', iconName: 'Shield' },
      { id: 'cat-c2', name: 'Sound Stage & Lighting', allocated: 4500, actual: 4400, color: '#6366f1', iconName: 'Music' },
      { id: 'cat-c3', name: 'Eco Lantern Supplies & Workshops', allocated: 2800, actual: 2650, color: '#f59e0b', iconName: 'Sparkles' },
      { id: 'cat-c4', name: 'Volunteer Hospitality & First Aid', allocated: 1800, actual: 1600, color: '#ec4899', iconName: 'Heart' },
      { id: 'cat-c5', name: 'Promotions, Signage & Waste Stations', allocated: 2400, actual: 2100, color: '#10b981', iconName: 'Leaf' },
      { id: 'cat-c6', name: 'Contingency Reserve', allocated: 1200, actual: 400, color: '#64748b', iconName: 'DollarSign' }
    ],
    budgetItems: [
      { id: 'bc-1', categoryId: 'cat-c1', title: 'City Park Special Event Permit & Sound Variance', estimatedCost: 1200, actualCost: 1200, isPaid: true, dueDate: '2026-07-15' },
      { id: 'bc-2', categoryId: 'cat-c1', title: 'Off-duty EMS & Police Traffic Detail', estimatedCost: 1600, actualCost: 1500, isPaid: true, dueDate: '2026-08-01' },
      { id: 'bc-3', categoryId: 'cat-c1', title: 'Eco Portable Restroom Units & Handwash Stations', estimatedCost: 1000, actualCost: 900, isPaid: true, dueDate: '2026-09-01' },
      { id: 'bc-4', categoryId: 'cat-c2', title: 'Amphitheater PA Audio System & Solar Powered Stage', estimatedCost: 3200, actualCost: 3100, isPaid: false, dueDate: '2026-09-25' },
      { id: 'bc-5', categoryId: 'cat-c2', title: 'Bistro String Lights & Water Reflectors', estimatedCost: 1300, actualCost: 1300, isPaid: true, dueDate: '2026-09-10' },
      { id: 'bc-6', categoryId: 'cat-c3', title: '500 Biodegradable Rice Paper Lanterns & LED Tea Lights', estimatedCost: 2000, actualCost: 1900, isPaid: true, dueDate: '2026-08-15' },
      { id: 'bc-7', categoryId: 'cat-c3', title: 'Kids Art Table Calligraphy Inks & Brushes', estimatedCost: 800, actualCost: 750, isPaid: true, dueDate: '2026-09-15' },
      { id: 'bc-8', categoryId: 'cat-c5', title: 'Compost & Recycle Sorting Stations with Green Team Signage', estimatedCost: 1400, actualCost: 1250, isPaid: true, dueDate: '2026-09-20' }
    ],
    milestones: [
      { id: 'mc-1', timePhase: '3 Months Before', title: 'Secure Municipal Parks Department Permit & Insurance', dueDate: '2026-07-01', completed: true, priority: 'high', category: 'Permits', assignee: 'Committee Chair Sarah' },
      { id: 'mc-2', timePhase: '2 Months Before', title: 'Curate 15 Local Artisan & Multicultural Food Stalls', dueDate: '2026-08-10', completed: true, priority: 'high', category: 'Vendors', assignee: 'Vendor Coordinator Ken' },
      { id: 'mc-3', timePhase: '1 Month Before', title: 'Recruit 35 Volunteer Marshals & Green Team Members', dueDate: '2026-09-10', completed: true, priority: 'medium', category: 'Volunteers', assignee: 'Community Lead Maya' },
      { id: 'mc-4', timePhase: 'Event Week', title: 'Safety Briefing & Park Audio Rigging Walkthrough', dueDate: '2026-10-08', completed: false, priority: 'high', category: 'Operations', assignee: 'Operations Lead Sarah' }
    ],
    dayOfSchedule: [
      { id: 'schc-1', time: '09:00 AM', title: 'Park Gates Open for Staging & Solar Power Generator Checks', durationMin: 120, location: 'North Parking Lot & Meadow', responsible: 'Operations Crew', notes: 'Check emergency vehicle lane is completely clear', completed: false },
      { id: 'schc-2', time: '11:30 AM', title: 'Food Truck & Artisan Booth Inspection (Health Dept Check)', durationMin: 90, location: 'Market Promenade', responsible: 'Ken & Health Inspector', notes: 'Verify fire extinguishers and water wash stations at all 15 booths', completed: false },
      { id: 'schc-3', time: '01:30 PM', title: 'Volunteer Orientation & Radio Handoff', durationMin: 30, location: 'Pavilion Headquarters', responsible: 'Maya & Volunteer Marshals', notes: 'Hand out neon yellow volunteer vests and maps', completed: false },
      { id: 'schc-4', time: '02:00 PM', title: 'Festival Gates Open to Public & Kids Lantern Workshop Starts', durationMin: 180, location: 'Meadow Tents', responsible: 'Arts Collective & Volunteers', notes: 'Lantern painting and wishes writing stations active', completed: false },
      { id: 'schc-5', time: '04:00 PM', title: 'Multicultural Dance & Youth Symphony Performances', durationMin: 90, location: 'Amphitheater Stage', responsible: 'Sound Team & Performers', notes: 'Oakwood Youth Strings followed by Taiko Drummers', completed: false },
      { id: 'schc-6', time: '06:30 PM', title: 'Sunset Mayor Address & Community Citizen Honors', durationMin: 30, location: 'Amphitheater Stage', responsible: 'Mayor & Committee Chair Sarah', notes: 'Announce Volunteer of the Year award', completed: false },
      { id: 'schc-7', time: '07:15 PM', title: 'Sunset Lantern Walk & Floating Reflection Ceremony', durationMin: 60, location: 'Park Lake Boardwalk', responsible: 'Safety Marshals & Fire Dept', notes: 'Volunteers assist children with water placement; 100% retrieved by Green Team in nets after ceremony', completed: false },
      { id: 'schc-8', time: '08:45 PM', title: 'Closing Acoustic Ensemble & Park Cleanup Begins', durationMin: 90, location: 'Whole Park', responsible: 'Green Team & Volunteers', notes: 'Leave No Trace park inspection by 10:30 PM', completed: false }
    ],
    vendors: [
      {
        id: 'vc-1',
        name: 'Oakwood Municipal Parks Dept',
        category: 'Permits & Venue',
        status: 'confirmed',
        contactPerson: 'Director Henderson',
        email: 'parks@oakwoodgov.org',
        phone: '555-013-4422',
        quotedPrice: 1200,
        finalPrice: 1200,
        checklist: [
          { id: 'vcc-1', text: 'Lake retrieval safety plan signed with water patrol', done: true },
          { id: 'vcc-2', text: 'Restroom keys and irrigation water supply unlocked', done: true }
        ],
        notes: 'Full permit granted with approval for acoustic music up to 85dB until 9:30 PM.'
      },
      {
        id: 'vc-2',
        name: 'EcoSound Solar Audio & Lighting',
        category: 'Audio/Visual',
        status: 'confirmed',
        contactPerson: 'Liam Foster',
        email: 'liam@ecosoundstages.com',
        phone: '555-019-8871',
        quotedPrice: 4500,
        finalPrice: 4400,
        checklist: [
          { id: 'vcc-3', text: 'Confirm battery bank charge from solar panels', done: true },
          { id: 'vcc-4', text: 'Run cables under rubber cable ramps across footpaths', done: false }
        ],
        notes: 'Includes wireless handheld mics, monitor wedges, and 12 LED stage wash fixtures.'
      }
    ],
    guests: [
      { id: 'gc-1', name: 'Sarah Jenkins (Committee Chair)', email: 'sarah.j@oakwoodfestival.org', group: 'Committee', rsvpStatus: 'attending', plusOnes: 0, checkedIn: true, notes: 'Lead Organizer' },
      { id: 'gc-2', name: 'Kenji Sato (Vendor Lead)', email: 'kenji.s@oakwoodfestival.org', group: 'Committee', rsvpStatus: 'attending', plusOnes: 0, checkedIn: true, notes: 'Food trucks & stalls' },
      { id: 'gc-3', name: 'Councilwoman Maria Hernandez', email: 'm.hernandez@city.gov', group: 'VIP', rsvpStatus: 'attending', plusOnes: 2, checkedIn: false, notes: 'Delivering welcome remarks' },
      { id: 'gc-4', name: 'Oakwood Green Team (35 Volunteers)', email: 'greenteam@oakwoodfestival.org', group: 'Community', rsvpStatus: 'attending', plusOnes: 0, checkedIn: true, notes: 'Eco sorting & clean up' }
    ],
    creative: {
      themeTitle: 'Luminous Autumn: Harvest of Stories',
      vibeDescription: 'An inclusive, heart-warming neighborhood festival celebrating community solidarity, cultural cuisines, and collective hopes illuminated through hundreds of floating lake lanterns.',
      palette: [
        { name: 'Lantern Amber', hex: '#f59e0b' },
        { name: 'Autumn Maple Red', hex: '#dc2626' },
        { name: 'Pine Needle Forest', hex: '#166534' },
        { name: 'Warm Parchment', hex: '#fef3c7' },
        { name: 'Twilight Deep Sky', hex: '#1e293b' }
      ],
      decorConcepts: [
        'Overhead biodegradable paper bunting and woven bamboo lantern arches',
        'Interactive community wish wall where neighbors pin hand-painted memories',
        'Floating LED eco-lantern launch along the lake reflective pier',
        'Storytelling circle under the ancient Oak with hay-bale seating and warm blankets'
      ],
      signatureItems: [
        { name: 'Spiced Spun Apple Cider', type: 'mocktail', description: 'Fresh local orchard apple press steeped with cinnamon bark, star anise, and orange zest.', ingredientsOrHighlights: 'Served warm in compostable bamboo cups' },
        { name: 'Golden Ginger Turmeric Fizz', type: 'mocktail', description: 'Pressed ginger, sparkling water, honey, and fresh lemon with a fresh mint leaf.', ingredientsOrHighlights: 'Invigorating autumn refresher' },
        { name: 'Global Street Food Bites', type: 'appetizer', description: 'Tasting passport covering empanadas, fresh vegetable samosas, bao buns, and falafel skewers.', ingredientsOrHighlights: '100% sourced from resident-owned small businesses' }
      ],
      invitations: [
        {
          id: 'invc-1',
          style: 'Warm & Welcoming',
          headline: 'Light up the night together: Oakwood Annual Lantern Festival',
          body: 'Bring your family, friends, and neighbors to celebrate our community. Enjoy live local music, 15 street food vendors, children’s lantern crafting, and our sunset lake illumination.',
          rsvpCallout: 'Admission is free. Pre-register for your complimentary eco-lantern kit at oakwoodfestival.org'
        }
      ],
      speeches: [
        {
          id: 'spc-1',
          speakerRole: 'Committee Chair (Sarah Jenkins)',
          title: 'The Threads That Weave Our Neighborhood Together',
          estimatedDuration: '4 minutes',
          content: 'Good evening neighbors, friends, and families! Looking out at the lake tonight, seeing hundreds of hands crafting lanterns and sharing meals across every culture in our community, I am reminded of what makes Oakwood so deeply special. In a fast and noisy world, we pause tonight to listen to each other, to celebrate our local artisans, and to light a spark of hope together. Thank you to our 40 amazing volunteers, our local businesses, and every one of you for making this town our home.'
        }
      ],
      favorsOrActivities: [
        'Free lantern decorating workshop with non-toxic watercolor paints',
        'Local maker artisan market with handmade candles and ceramics',
        'Eco-scavenger hunt for kids with plantable wildflower seed paper badges'
      ]
    },
    activityFeed: [
      { id: 'actc-1', timestamp: '5 mins ago', author: 'Kenji Sato', role: 'Vendor', action: 'All 15 food vendors cleared electrical permits and grease disposal setup', type: 'vendor' },
      { id: 'actc-2', timestamp: '40 mins ago', author: 'Maya Lin', role: 'Lead Planner', action: '35 Volunteer Marshals checked in for orientation', type: 'guest' },
      { id: 'actc-3', timestamp: '2 hours ago', author: 'EventCraft AI', role: 'AI Assistant', action: 'Drafted crowd flow and safety contingency advisory for peak 7:00 PM lake crossing', type: 'ai' }
    ],
    updatedAt: new Date().toISOString()
  }
];
