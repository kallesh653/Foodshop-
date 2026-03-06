/* ============================================================
   FOODSHOP - Shared Data Store (localStorage)
   ============================================================ */

const DB_KEY = 'foodshop_data';

const DEFAULT_DATA = {
  business: {
    name: 'Yakksh Foodstuff Trading FZE LLC',
    ownerName: 'Savann Prajaapatii',
    ownerRole: 'Owner and Manager',
    category: 'General Trading, Import-Export, Fresh Fruits & Vegetables, Spices, Snack Foods, Cereals and Grains, Laundry and Detergents',
    address: 'Fruits and Vegetables Market, Al Aweer, Dubai, United Arab Emirates',
    mobileIndia: '+919558870135',
    mobileUAE: '+971504870135',
    email: 'yakkshfoodstuff@gmail.com',
    whatsapp: '971504870135',
    aboutUs: 'Yakksh Foodstuff Trading FZE LLC is a global import and re-export company specialising in high-quality fresh fruits, vegetables, and food products, with strategic operations in <strong>United Arab Emirates and India</strong>. Leveraging a strong international network, we connect exporters and importers worldwide while maintaining strict quality standards across the supply chain. Our <strong>Mission and Vision</strong> focus on delivering premium products through innovation, sustainability, and operational excellence, fostering trusted, long-term partnerships and creating value for customers across the global food industry.',
    bannerImage: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
    logoImage: 'https://images.unsplash.com/photo-1611735341450-74d61e660ad2?w=200&q=80',
    facebook: 'https://facebook.com',
    instagram: 'https://instagram.com',
    linkedin: 'https://linkedin.com',
    youtube: '',
    twitter: '',
    adminPassword: 'admin123',
    pageViews: 351,
    showInstallBtn: true,
    defaultCountry: '+91'
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
      id: 'p1',
      name: 'Bitter Gourd',
      description: 'Exporter & Importer of Bitter Gourd (Karela) from India. Known for its distinctive bitter flavor and numerous health benefits. Our experience ensures the best quality product at the best prices. Well-connected sourcing network for quick and efficient delivery.',
      image: 'https://images.unsplash.com/photo-1628771065518-0d82f1938462?w=600&q=80',
      order: 1
    },
    {
      id: 'p2',
      name: 'Cabbage',
      description: 'Exporter & Importer of high-quality Cabbage from India. Indian Cabbage is a popular vegetable widely consumed across the world. We are a trusted supplier of export-quality Cabbage sourced directly from farms with prompt delivery.',
      image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&q=80',
      order: 2
    },
    {
      id: 'p3',
      name: 'Carrot',
      description: 'Fresh, export-quality Carrots sourced from the finest farms. Rich in beta-carotene and nutrients, our carrots meet international quality standards with consistent supply and competitive pricing.',
      image: 'https://images.unsplash.com/photo-1447175008436-054170c2e979?w=600&q=80',
      order: 3
    },
    {
      id: 'p4',
      name: 'Tomato',
      description: 'Premium quality Tomatoes for export and import. Freshly harvested and carefully packed to retain nutrition and freshness during long-distance transport. Available year-round with reliable supply chains.',
      image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&q=80',
      order: 4
    },
    {
      id: 'p5',
      name: 'Mango',
      description: 'World-renowned Indian Mangoes exported globally. Alphonso, Kesar, and other premium varieties available. Carefully graded and packed to ensure peak ripeness and flavor upon delivery.',
      image: 'https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?w=600&q=80',
      order: 5
    },
    {
      id: 'p6',
      name: 'Onion',
      description: 'High-quality fresh Onions for export markets. Sorted, cleaned, and packed in various grades. Reliable supply from major onion growing regions of India with competitive pricing.',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&q=80',
      order: 6
    },
    {
      id: 'p7',
      name: 'Oats',
      description: 'Oats help lower blood sugar and cholesterol levels, protect against skin irritation, and reduce constipation. Very filling, making them helpful for weight loss. Among the most nutrient-dense foods you can eat. Consumed as a cereal grain for its health benefits.',
      image: 'https://images.unsplash.com/photo-1495214783159-3503fd1b572d?w=600&q=80',
      order: 7
    },
    {
      id: 'p8',
      name: 'Wheat',
      description: 'Wheat is a rich source of carbohydrates and fibre. Helps regulate digestion and promotes fullness. High-fibre diets reduce risk of heart disease, stroke, and some cancers. Provides essential vitamins and minerals including thiamin, niacin, vitamin B6, calcium, iron, and potassium.',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=600&q=80',
      order: 8
    }
  ]
};

const FoodshopDB = {
  get() {
    try {
      const raw = localStorage.getItem(DB_KEY);
      if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
      const stored = JSON.parse(raw);
      // Merge with defaults to handle new fields
      return {
        business: { ...DEFAULT_DATA.business, ...stored.business },
        services: stored.services || DEFAULT_DATA.services,
        products: stored.products || DEFAULT_DATA.products
      };
    } catch (e) {
      return JSON.parse(JSON.stringify(DEFAULT_DATA));
    }
  },

  save(data) {
    try {
      localStorage.setItem(DB_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('Save failed', e);
      return false;
    }
  },

  getBusiness() {
    return this.get().business;
  },

  saveBusiness(biz) {
    const data = this.get();
    data.business = { ...data.business, ...biz };
    return this.save(data);
  },

  getProducts() {
    const data = this.get();
    return [...data.products].sort((a, b) => (a.order || 0) - (b.order || 0));
  },

  saveProducts(products) {
    const data = this.get();
    data.products = products;
    return this.save(data);
  },

  addProduct(product) {
    const data = this.get();
    const maxOrder = data.products.length > 0
      ? Math.max(...data.products.map(p => p.order || 0))
      : 0;
    product.id = 'p_' + Date.now();
    product.order = maxOrder + 1;
    data.products.push(product);
    return this.save(data);
  },

  updateProduct(id, updates) {
    const data = this.get();
    const idx = data.products.findIndex(p => p.id === id);
    if (idx === -1) return false;
    data.products[idx] = { ...data.products[idx], ...updates };
    return this.save(data);
  },

  deleteProduct(id) {
    const data = this.get();
    data.products = data.products.filter(p => p.id !== id);
    return this.save(data);
  },

  getServices() {
    return this.get().services;
  },

  saveServices(services) {
    const data = this.get();
    data.services = services;
    return this.save(data);
  },

  incrementViews() {
    const data = this.get();
    data.business.pageViews = (data.business.pageViews || 0) + 1;
    this.save(data);
    return data.business.pageViews;
  }
};
