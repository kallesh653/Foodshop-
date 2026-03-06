/* ============================================================
   FOODSHOP — Data Store  (localStorage)
   ============================================================ */

const DB_KEY = 'foodshop_v2';

const DEFAULTS = {
  business: {
    name:          'Yakksh Foodstuff Trading FZE LLC',
    ownerName:     'Savann Prajaapatii',
    ownerRole:     'Owner and Manager',
    category:      'General Trading, Import-Export, Fresh Fruits & Vegetables, Spices, Snack Foods, Cereals and Grains, Laundry and Detergents',
    address:       'Fruits and Vegetables Market, Al Aweer, Dubai, United Arab Emirates',
    mobileIndia:   '+91 95588 70135',
    mobileUAE:     '+971 50 487 0135',
    email:         'yakkshfoodstuff@gmail.com',
    whatsapp:      '971504870135',
    aboutUs:       'Yakksh Foodstuff Trading FZE LLC is a global import and re-export company specialising in high-quality fresh fruits, vegetables, and food products, with strategic operations in <strong>United Arab Emirates and India</strong>. Leveraging a strong international network, we connect exporters and importers worldwide while maintaining strict quality standards across the supply chain. Our <strong>Mission and Vision</strong> focus on delivering premium products through innovation, sustainability, and operational excellence, fostering trusted, long-term partnerships and creating value for customers across the global food industry.',
    bannerImage:   'https://images.unsplash.com/photo-1542838132-92c53300491e?w=1200&q=85',
    logoImage:     'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=300&q=85',
    facebook:      'https://facebook.com',
    instagram:     'https://instagram.com',
    linkedin:      'https://linkedin.com',
    youtube:       '',
    twitter:       '',
    adminPassword: 'admin123',
    pageViews:     351,
    showInstallBtn:true,
    defaultCountry:'91',
    establishedYear:'2018',
    tagline:       'Premium Quality. Global Reach.'
  },
  services: [
    'Sourcing and Packaging',
    'Import Services',
    'Export Services',
    'Market Analysis and Research',
    'Quality Control',
    'Logistics and Distribution',
    'Customised Solutions',
    'Customer Support and Assistance'
  ],
  products: [
    {
      id:'prod_01', name:'Bitter Gourd (Karela)', order:1,
      image:'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=700&q=85',
      description:'Exporter & Importer of Bitter Gourd (Karela) from India. Known for its distinctive bitter flavor and numerous health benefits. Our experience ensures the best quality product at the best prices. Well-connected sourcing network for quick and efficient delivery.'
    },
    {
      id:'prod_02', name:'Cabbage', order:2,
      image:'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=700&q=85',
      description:'Exporter & Importer of high-quality Cabbage from India. Indian Cabbage is a popular vegetable widely consumed across the world. We are a trusted supplier of export-quality Cabbage sourced directly from farms with prompt delivery.'
    },
    {
      id:'prod_03', name:'Carrot', order:3,
      image:'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=700&q=85',
      description:'Fresh, export-quality Carrots sourced from the finest farms in India. Rich in beta-carotene and essential nutrients, our carrots meet international quality standards with consistent supply and competitive pricing for global markets.'
    },
    {
      id:'prod_04', name:'Tomato', order:4,
      image:'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=700&q=85',
      description:'Premium quality Tomatoes for export and import. Freshly harvested and carefully packed to retain nutrition and freshness during long-distance transport. Available year-round with reliable supply chains and multiple grade options.'
    },
    {
      id:'prod_05', name:'Mango', order:5,
      image:'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=700&q=85',
      description:'World-renowned Indian Mangoes exported globally. Alphonso, Kesar, and other premium varieties available. Carefully graded and packed to ensure peak ripeness and flavor upon delivery to international buyers.'
    },
    {
      id:'prod_06', name:'Onion', order:6,
      image:'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=700&q=85',
      description:'High-quality fresh Onions for export markets worldwide. Sorted, cleaned, and packed in various grades as per buyer specifications. Reliable supply from major onion growing regions of India with competitive pricing year-round.'
    },
    {
      id:'prod_07', name:'Green Chilli', order:7,
      image:'https://images.unsplash.com/photo-1583119022894-919a68a3d0e3?w=700&q=85',
      description:'Fresh, vibrant Green Chillies sourced from prime growing regions of India. Available in multiple heat levels for different culinary requirements. Exported fresh with proper cold-chain logistics to maintain peak quality.'
    },
    {
      id:'prod_08', name:'Potato', order:8,
      image:'https://images.unsplash.com/photo-1518977822534-7049a61ee0c2?w=700&q=85',
      description:'Premium grade Potatoes available in bulk for international markets. Carefully sorted by size and quality, our potatoes are packed hygienically for export. Consistent year-round supply with competitive pricing from Indian farms.'
    },
    {
      id:'prod_09', name:'Lemon', order:9,
      image:'https://images.unsplash.com/photo-1571575173700-afb9492d4010?w=700&q=85',
      description:'Fresh, juicy Lemons with high citric acid content exported to global markets. Carefully selected for uniform size and quality. Available in both Indian and Eureka varieties with consistent supply throughout the year.'
    },
    {
      id:'prod_10', name:'Garlic', order:10,
      image:'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=700&q=85',
      description:'Premium quality Garlic from India, known for its strong aroma and medicinal properties. Available in fresh, dried, and processed forms. Exported to Middle East, Europe and Asian markets with proper phytosanitary certifications.'
    },
    {
      id:'prod_11', name:'Ginger', order:11,
      image:'https://images.unsplash.com/photo-1615485291234-9d694218aeb3?w=700&q=85',
      description:'Fresh and dry Ginger of superior quality, sourced from prime ginger-growing regions of Kerala and other states. High in gingerol content with excellent aroma. Widely used in culinary and medicinal applications globally.'
    },
    {
      id:'prod_12', name:'Banana', order:12,
      image:'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=700&q=85',
      description:'Premium quality Bananas exported fresh from India. Available in multiple varieties including Cavendish and Robusta. Harvested at optimal ripeness and packed with care for export to ensure maximum shelf life and customer satisfaction.'
    },
    {
      id:'prod_13', name:'Pomegranate', order:13,
      image:'https://images.unsplash.com/photo-1541344999736-83eca272f6fc?w=700&q=85',
      description:'Export-quality Indian Pomegranates with bright red arils and excellent taste. India\'s Bhagwa variety is among the most sought-after globally. Carefully graded and packed to maintain freshness during international shipments.'
    },
    {
      id:'prod_14', name:'Cumin Seeds (Jeera)', order:14,
      image:'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=700&q=85',
      description:'Premium quality Cumin Seeds (Jeera) from Rajasthan and Gujarat — India\'s top cumin producing states. High volatile oil content with excellent aroma. Available in machine-cleaned and double-cleaned grades for export to global spice markets.'
    },
    {
      id:'prod_15', name:'Turmeric', order:15,
      image:'https://images.unsplash.com/photo-1615485925600-97237c4fc1ec?w=700&q=85',
      description:'High curcumin content Turmeric finger and powder exported from India. Erode and Nizamabad varieties with excellent colour and aroma. Widely used in food, pharmaceuticals and cosmetics industries worldwide.'
    },
    {
      id:'prod_16', name:'Rice (Basmati)', order:16,
      image:'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=700&q=85',
      description:'Premium Basmati Rice with long grains, excellent aroma and fluffy texture. Aged for enhanced flavor development. Exported to the Middle East, Europe and North America in various pack sizes from 1kg consumer packs to 25kg bulk bags.'
    },
    {
      id:'prod_17', name:'Wheat', order:17,
      image:'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=700&q=85',
      description:'Wheat is a rich source of carbohydrates and fibre. Helps regulate digestion and promotes fullness. High-fibre diets reduce risk of heart disease, stroke, and some cancers. Provides essential vitamins and minerals including thiamin, niacin, vitamin B6, calcium, iron, and potassium.'
    },
    {
      id:'prod_18', name:'Oats', order:18,
      image:'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=700&q=85',
      description:'Oats help lower blood sugar and cholesterol levels, protect against skin irritation, and reduce constipation. Very filling, making them helpful for weight loss. Among the most nutrient-dense foods you can eat. Consumed as a cereal grain for its health benefits.'
    }
  ]
};

const FoodshopDB = {
  get() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULTS));
      const stored = JSON.parse(raw);
      return {
        business: { ...DEFAULTS.business, ...stored.business },
        services:  stored.services  || DEFAULTS.services,
        products:  stored.products  || DEFAULTS.products
      };
    } catch { return JSON.parse(JSON.stringify(DEFAULTS)); }
  },

  save(data) {
    try { localStorage.setItem(DB_KEY, JSON.stringify(data)); return true; }
    catch(e) { console.error('DB save error', e); return false; }
  },

  getBusiness()       { return this.get().business; },
  saveBusiness(biz)   { const d = this.get(); d.business = { ...d.business, ...biz }; return this.save(d); },

  getProducts()       { return [...this.get().products].sort((a,b)=>(a.order||0)-(b.order||0)); },
  saveProducts(prods) { const d = this.get(); d.products = prods; return this.save(d); },

  addProduct(p) {
    const d   = this.get();
    const max = d.products.reduce((m,x) => Math.max(m, x.order||0), 0);
    p.id    = 'prod_' + Date.now();
    p.order = max + 1;
    d.products.push(p);
    return this.save(d);
  },

  updateProduct(id, updates) {
    const d   = this.get();
    const idx = d.products.findIndex(p => p.id === id);
    if (idx < 0) return false;
    d.products[idx] = { ...d.products[idx], ...updates };
    return this.save(d);
  },

  deleteProduct(id) {
    const d   = this.get();
    d.products = d.products.filter(p => p.id !== id);
    return this.save(d);
  },

  getServices()         { return this.get().services; },
  saveServices(services){ const d = this.get(); d.services = services; return this.save(d); },

  incrementViews() {
    const d = this.get();
    d.business.pageViews = (d.business.pageViews || 0) + 1;
    this.save(d);
    return d.business.pageViews;
  }
};
