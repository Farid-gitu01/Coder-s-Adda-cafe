// Menu page logic: category display, food filters, cart and modal behavior

const categories = [
  { name: 'Hot & Cold Coffee', image: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=500&q=80' },
  { name: 'Tea & Refreshments', image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80' },
  { name: 'Milkshakes & Smoothies', image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=500&q=80' },
  { name: 'Sandwiches', image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=500&q=80' },
  { name: 'Burgers', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80' },
  { name: 'Pizza', image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&q=80' },
  { name: 'Pasta & Noodles', image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=500&q=80' },
  { name: 'Fries & Quick Bites', image: 'https://images.unsplash.com/photo-1576101672265-86bf7b858f8f?auto=format&fit=crop&w=500&q=80' },
  { name: 'Cakes & Desserts', image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=500&q=80' },
  { name: 'Waffles & Pancakes', image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=500&q=80' }
];

const foodData = [
  // Hot & Cold Coffee
  { id: 1, name: 'Classic Cappuccino', category: 'Hot & Cold Coffee', description: 'A balanced espresso with smooth milk foam and a rich coffee finish.', price: 179, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 98 },
  { id: 2, name: 'Hazelnut Latte', category: 'Hot & Cold Coffee', description: 'Silky milk latte with roasted hazelnut aroma and smooth texture.', price: 220, image: 'https://images.unsplash.com/photo-1497636577773-f1231844b336?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9, popularity: 96 },
  { id: 3, name: 'Cold Brew', category: 'Hot & Cold Coffee', description: 'Slow-steeped cold brew with a mellow, bold profile and gentle sweetness.', price: 210, image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 95 },
  { id: 4, name: 'Mocha Gold', category: 'Hot & Cold Coffee', description: 'Dark chocolate mocha topped with creamy foam and cocoa crunch.', price: 240, image: 'https://images.unsplash.com/photo-1504753793650-d4a2b783c15e?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9, popularity: 99 },
  { id: 5, name: 'Americano', category: 'Hot & Cold Coffee', description: 'Double espresso shot with hot water for a crisp, clean coffee taste.', price: 160, image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 90 },
  { id: 6, name: 'Caramel Latte', category: 'Hot & Cold Coffee', description: 'Creamy caramel sweetness layered with espresso and velvety milk.', price: 230, image: 'https://images.unsplash.com/photo-1459755486867-b55449bb39ff?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 94 },
  { id: 7, name: 'Flat White', category: 'Hot & Cold Coffee', description: 'A rich, smooth espresso drink with microfoam and balanced bitterness.', price: 200, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 91 },
  { id: 8, name: 'Vanilla Iced Coffee', category: 'Hot & Cold Coffee', description: 'Chilled coffee blended with vanilla cream for a refreshing finish.', price: 230, image: 'https://images.unsplash.com/photo-1461988091159-192b6df7054f?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 92 },
  { id: 9, name: 'Irish Coffee', category: 'Hot & Cold Coffee', description: 'A bold coffee blend stirred with cream and a warm whiskey note.', price: 300, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.7, popularity: 88 },
  { id: 10, name: 'Espresso Shot', category: 'Hot & Cold Coffee', description: 'Pure espresso intensity with a vibrant aroma and smooth crema.', price: 120, image: 'https://images.unsplash.com/photo-1511920170033-f8396924c348?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 86 },

  // Tea & Refreshments
  { id: 11, name: 'Masala Chai', category: 'Tea & Refreshments', description: 'Classic Indian chai with warm spices and a comforting finish.', price: 120, image: 'https://images.unsplash.com/photo-1515823064-d6e0c04616a7?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 93 },
  { id: 12, name: 'Green Tea', category: 'Tea & Refreshments', description: 'Light and refreshing tea with a natural grassy aroma and mellow taste.', price: 110, image: 'https://images.unsplash.com/photo-1523906630133-f6934a1ab2b9?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.5, popularity: 81 },
  { id: 13, name: 'Lemon Iced Tea', category: 'Tea & Refreshments', description: 'Chilled tea infused with lemon for a clean, citrusy lift.', price: 140, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 84 },
  { id: 14, name: 'Peach Tea', category: 'Tea & Refreshments', description: 'Refreshing peach tea with a crisp sweet finish and Tonic notes.', price: 150, image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.5, popularity: 83 },
  { id: 15, name: 'Rose Milk', category: 'Tea & Refreshments', description: 'Cool and floral milk beverage blended with rose syrup and cream.', price: 170, image: 'https://images.unsplash.com/photo-1577805947697-89e18249d767?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 86 },
  { id: 16, name: 'Mint Cooler', category: 'Tea & Refreshments', description: 'Fresh mint cooler with a bright, refreshing citrus twist.', price: 160, image: 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 88 },
  { id: 17, name: 'Saffron Tea', category: 'Tea & Refreshments', description: 'Fragrant saffron-infused tea with creamy undertones and warmth.', price: 180, image: 'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 91 },
  { id: 18, name: 'Kiwi Cooler', category: 'Tea & Refreshments', description: 'Vibrant kiwi beverage with sparkling freshness and tropical sweetness.', price: 175, image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.4, popularity: 80 },
  { id: 19, name: 'Black Tea', category: 'Tea & Refreshments', description: 'Classic black tea with a strong aroma and smooth sipping finish.', price: 100, image: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.5, popularity: 79 },
  { id: 20, name: 'Coconut Mint Shake', category: 'Tea & Refreshments', description: 'Creamy cooling blend of coconut milk and fresh mint leaves.', price: 190, image: 'https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 82 },

  // Milkshakes & Smoothies
  { id: 21, name: 'Classic Chocolate Shake', category: 'Milkshakes & Smoothies', description: 'Rich chocolate milkshake with creamy texture and deep cocoa flavour.', price: 260, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9, popularity: 98 },
  { id: 22, name: 'Strawberry Bliss', category: 'Milkshakes & Smoothies', description: 'Sweet strawberry shake blended with vanilla cream and ice.', price: 240, image: 'https://images.unsplash.com/photo-1553787499-6f7f6a7a1517?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 94 },
  { id: 23, name: 'Mango Smoothie', category: 'Milkshakes & Smoothies', description: 'Sun-ripened mango blended smooth with yogurt and tropical sweetness.', price: 250, image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 95 },
  { id: 24, name: 'Banana Nut Shake', category: 'Milkshakes & Smoothies', description: 'Creamy banana shake finished with a subtle nutty crunch.', price: 250, image: 'https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 90 },
  { id: 25, name: 'Blueberry Burst', category: 'Milkshakes & Smoothies', description: 'Fresh blueberry and yogurt smoothie with a naturally sweet finish.', price: 260, image: 'https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 87 },
  { id: 26, name: 'Oreo Shake', category: 'Milkshakes & Smoothies', description: 'Crushed cookies blended into a smooth, indulgent milkshake.', price: 270, image: 'https://images.unsplash.com/photo-1553456558-aff63285bdd1?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9, popularity: 99 },
  { id: 27, name: 'Peanut Butter Shake', category: 'Milkshakes & Smoothies', description: 'Silky peanut butter shake with subtle sweetness and a nutty finish.', price: 260, image: 'https://images.unsplash.com/photo-1526312426976-f4d021e5a39b?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.5, popularity: 82 },
  { id: 28, name: 'Pineapple Cooler', category: 'Milkshakes & Smoothies', description: 'Tangy pineapple smoothie packed with tropical freshness.', price: 230, image: 'https://images.unsplash.com/photo-1622483767028-3f66f2b7420a?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 84 },
  { id: 29, name: 'Vanilla Bean Shake', category: 'Milkshakes & Smoothies', description: 'Velvety vanilla shake with creamy notes and a clean finish.', price: 240, image: 'https://images.unsplash.com/photo-1582715478177-3aab7ec8f2df?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 89 },
  { id: 30, name: 'Coffee Smoothie', category: 'Milkshakes & Smoothies', description: 'A chilled coffee blend with cream and a fresh creamy finish.', price: 280, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 92 },

  // Sandwiches
  { id: 31, name: 'Veg Club Sandwich', category: 'Sandwiches', description: 'Layered with veggies, sauces, and toasted golden bread.', price: 220, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 90 },
  { id: 32, name: 'Paneer Tikka Sandwich', category: 'Sandwiches', description: 'Smoky paneer tikka tucked into soft grilled bread.', price: 250, image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 94 },
  { id: 33, name: 'Grilled Veg Sandwich', category: 'Sandwiches', description: 'A garden-fresh sandwich packed with crunchy vegetables and herbs.', price: 210, image: 'https://images.unsplash.com/photo-1554433607-66b5efe9d304?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.5, popularity: 83 },
  { id: 34, name: 'Chicken Caesar Wrap', category: 'Sandwiches', description: 'Grilled chicken and Caesar salad wrapped in a soft tortilla.', price: 280, image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.7, popularity: 88 },
  { id: 35, name: 'Cheese Corn Toastie', category: 'Sandwiches', description: 'Toasted bread loaded with sweet corn, cheese, and herbs.', price: 200, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 82 },
  { id: 36, name: 'Smoked Chicken Sandwich', category: 'Sandwiches', description: 'Juicy smoked chicken with lettuce and creamy herb spread.', price: 290, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.8, popularity: 91 },
  { id: 37, name: 'Italian Veg Sandwich', category: 'Sandwiches', description: 'Italian flavors with pesto, olives, and crunchy vegetables.', price: 240, image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.5, popularity: 80 },
  { id: 38, name: 'Egg Mayo Sandwich', category: 'Sandwiches', description: 'Classic egg mayo layered with crisp greens and toasted bread.', price: 180, image: 'https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.4, popularity: 78 },
  { id: 39, name: 'Ham & Cheese Sandwich', category: 'Sandwiches', description: 'Melty cheese and ham between toasted slices with crunchy greens.', price: 260, image: 'https://images.unsplash.com/photo-1553909489-cd47e0ef937f?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.6, popularity: 85 },
  { id: 40, name: 'Tandoori Paneer Sandwich', category: 'Sandwiches', description: 'Tandoori-spiced paneer with onions, mint, and a creamy finish.', price: 260, image: 'https://images.unsplash.com/photo-1534790566855-4cb788d389ec?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 92 },

  // Burgers
  { id: 41, name: 'Classic Veg Burger', category: 'Burgers', description: 'Crispy veg patty with lettuce, onion, and signature sauce.', price: 180, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 90 },
  { id: 42, name: 'Paneer Burger', category: 'Burgers', description: 'Grilled paneer patty with fresh toppings and smoky sauce.', price: 220, image: 'https://images.unsplash.com/photo-1550317138-10000687a72b?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 92 },
  { id: 43, name: 'Crispy Chicken Burger', category: 'Burgers', description: 'Crunchy chicken fillet with cheese, lettuce, and house sauce.', price: 260, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.8, popularity: 94 },
  { id: 44, name: 'Mushroom Burger', category: 'Burgers', description: 'Loaded with juicy mushrooms, caramelized onions, and creamy dressing.', price: 230, image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 81 },
  { id: 45, name: 'Double Cheese Burger', category: 'Burgers', description: 'A hearty double patty with melted cheese and signature sauce.', price: 290, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.9, popularity: 97 },
  { id: 46, name: 'Peri Peri Burger', category: 'Burgers', description: 'Bold peri peri spice with juicy patty and crunchy lettuce.', price: 260, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.7, popularity: 88 },
  { id: 47, name: 'BBQ Chicken Burger', category: 'Burgers', description: 'Tender grilled chicken glazed with BBQ sauce and cheddar.', price: 280, image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.8, popularity: 95 },
  { id: 48, name: 'Crispy Veg Burger', category: 'Burgers', description: 'Crunchy vegetable patty with cucumber, onion, and house mayo.', price: 200, image: 'https://images.unsplash.com/photo-1512152272829-e3139592d56f?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.5, popularity: 84 },
  { id: 49, name: 'Loaded Burger', category: 'Burgers', description: 'Packed with cheese, onion rings, lettuce, and smoky sauce.', price: 310, image: 'https://images.unsplash.com/photo-1549611016-3a70d82b6d47?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.9, popularity: 96 },
  { id: 50, name: 'Tandoori Burger', category: 'Burgers', description: 'A smoky tandoori twist with juicy patty and crunchy toppings.', price: 270, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.7, popularity: 89 },

  // Pizza
  { id: 51, name: 'Margherita Pizza', category: 'Pizza', description: 'Classic tomato, mozzarella, and basil on a thin crust.', price: 260, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 96 },
  { id: 52, name: 'Paneer Tikka Pizza', category: 'Pizza', description: 'Smoky paneer pieces with onion, capsicum, and sauce.', price: 320, image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9, popularity: 98 },
  { id: 53, name: 'Veg Supreme Pizza', category: 'Pizza', description: 'Loaded with vegetables, olives, cheese, and herbs.', price: 340, image: 'https://images.unsplash.com/photo-1548365328-9f547fb9587c?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 93 },
  { id: 54, name: 'Pepperoni Pizza', category: 'Pizza', description: 'A classic favorite with spicy pepperoni and melted mozzarella.', price: 360, image: 'https://images.unsplash.com/photo-1528137871618-79d95a0dc5f8?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.8, popularity: 91 },
  { id: 55, name: 'Farmhouse Pizza', category: 'Pizza', description: 'Filled with fresh veggies and a rich cheese layer.', price: 330, image: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 89 },
  { id: 56, name: 'BBQ Chicken Pizza', category: 'Pizza', description: 'Smoky chicken strips with barbecue sauce and cheddar.', price: 370, image: 'https://images.unsplash.com/photo-1511407397940-d57f68e81203?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.8, popularity: 92 },
  { id: 57, name: 'Mushroom Delight', category: 'Pizza', description: 'Loaded with mushrooms, garlic, cheese, and herb sauce.', price: 300, image: 'https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 87 },
  { id: 58, name: 'Cheese Burst Pizza', category: 'Pizza', description: 'Extra cheese loaded crust with creamy dairy richness.', price: 390, image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9, popularity: 99 },
  { id: 59, name: 'Onion Capsicum Pizza', category: 'Pizza', description: 'Classic combo of onions and capsicum with a cheesy finish.', price: 290, image: 'https://images.unsplash.com/photo-1552539618-7eec9b4d1796?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 85 },
  { id: 60, name: 'Paneer Alfredo Pizza', category: 'Pizza', description: 'Creamy Alfredo base with paneer and roasted veggies.', price: 350, image: 'https://images.unsplash.com/photo-1548365328-9f547fb9587c?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 90 },

  // Pasta & Noodles
  { id: 61, name: 'Alfredo Pasta', category: 'Pasta & Noodles', description: 'Creamy white sauce pasta with herbs and a smooth finish.', price: 260, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 94 },
  { id: 62, name: 'Red Sauce Pasta', category: 'Pasta & Noodles', description: 'Classic tomato pasta with basil and rich Italian seasoning.', price: 240, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 90 },
  { id: 63, name: 'Veg Noodles', category: 'Pasta & Noodles', description: 'Noodles tossed with vegetables, soy sauce, and aromatic herbs.', price: 230, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 88 },
  { id: 64, name: 'Chicken Hakka Noodles', category: 'Pasta & Noodles', description: 'Wok-tossed noodles with chicken, vegetables, and soy flavor.', price: 290, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.8, popularity: 96 },
  { id: 65, name: 'Mushroom Pasta', category: 'Pasta & Noodles', description: 'Earthy mushroom pasta in a creamy garlic herb sauce.', price: 270, image: 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 86 },
  { id: 66, name: 'Spicy Garlic Noodles', category: 'Pasta & Noodles', description: 'Silky noodles with spicy garlic sauce and crunchy veggies.', price: 260, image: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 85 },
  { id: 67, name: 'Paneer Noodles', category: 'Pasta & Noodles', description: 'Soft noodles with paneer cubes and vibrant Indo-Chinese seasoning.', price: 280, image: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 92 },
  { id: 68, name: 'Arrabbiata Pasta', category: 'Pasta & Noodles', description: 'Spicy tomato pasta with garlic, chili, and parmesan richness.', price: 260, image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 89 },
  { id: 69, name: 'Chicken Alfredo Pasta', category: 'Pasta & Noodles', description: 'Creamy chicken pasta layered with rich garlic sauce and herbs.', price: 320, image: 'https://images.unsplash.com/photo-1555949258-eb67b1ef0ceb?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.8, popularity: 95 },
  { id: 70, name: 'Sesame Noodles', category: 'Pasta & Noodles', description: 'A savory sesame twist with noodles, greens, and soft crunch.', price: 250, image: 'https://images.unsplash.com/photo-1526312426976-f4d021e5a39b?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.5, popularity: 82 },

  // Fries & Quick Bites
  { id: 71, name: 'Loaded Fries', category: 'Fries & Quick Bites', description: 'Golden fries topped with cheese, jalapenos, and herbs.', price: 180, image: 'https://images.unsplash.com/photo-1576101672265-86bf7b858f8f?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 92 },
  { id: 72, name: 'Peri Peri Fries', category: 'Fries & Quick Bites', description: 'Spicy crinkle fries tossed with peri peri seasoning.', price: 170, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 90 },
  { id: 73, name: 'Cheese Nachos', category: 'Fries & Quick Bites', description: 'Crispy nachos loaded with cheese sauce and salsa dip.', price: 220, image: 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 89 },
  { id: 74, name: 'Garlic Bread', category: 'Fries & Quick Bites', description: 'Crisp toasted bread brushed with garlic butter and herbs.', price: 160, image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 83 },
  { id: 75, name: 'Potato Wedges', category: 'Fries & Quick Bites', description: 'Crispy wedges with seasoning and a smoky pepper finish.', price: 180, image: 'https://images.unsplash.com/photo-1576101672265-86bf7b858f8f?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 84 },
  { id: 76, name: 'Onion Rings', category: 'Fries & Quick Bites', description: 'Crunchy, golden onion rings with a crisp coating.', price: 170, image: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.5, popularity: 80 },
  { id: 77, name: 'Chicken Nuggets', category: 'Fries & Quick Bites', description: 'Tender chicken bites with a crisp outer coating.', price: 220, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.7, popularity: 87 },
  { id: 78, name: 'Veg Nuggets', category: 'Fries & Quick Bites', description: 'Crispy bites of mixed vegetables in a golden crumb coating.', price: 200, image: 'https://images.unsplash.com/photo-1541592106381-b31e9677c0e5?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.5, popularity: 78 },
  { id: 79, name: 'Crispy Corn', category: 'Fries & Quick Bites', description: 'Crunchy corn bites served with a creamy tangy dip.', price: 190, image: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.4, popularity: 77 },
  { id: 80, name: 'Mini Burger Platter', category: 'Fries & Quick Bites', description: 'A sharing platter of mini burgers with fries and dips.', price: 320, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=800&q=80', type: 'non-veg', rating: 4.8, popularity: 94 },

  // Cakes & Desserts
  { id: 81, name: 'Chocolate Fudge Cake', category: 'Cakes & Desserts', description: 'Dense chocolate cake with a rich ganache finish.', price: 260, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9, popularity: 98 },
  { id: 82, name: 'Classic Cheesecake', category: 'Cakes & Desserts', description: 'Creamy cheesecake with a crumbly biscuit base and berry topping.', price: 280, image: 'https://images.unsplash.com/photo-1533134242443-d4fd215305ad?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 92 },
  { id: 83, name: 'Tiramisu Cup', category: 'Cakes & Desserts', description: 'Italian dessert layered with coffee cream and cocoa.', price: 240, image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 90 },
  { id: 84, name: 'Brownie Sundae', category: 'Cakes & Desserts', description: 'Warm brownie slices topped with creamy ice cream.', price: 300, image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9, popularity: 96 },
  { id: 85, name: 'Red Velvet Cake', category: 'Cakes & Desserts', description: 'Soft velvet sponge with rich cream cheese frosting.', price: 290, image: 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 88 },
  { id: 86, name: 'Ferrero Cake', category: 'Cakes & Desserts', description: 'Chocolate cake layered with Ferrero cream and nutty chunks.', price: 330, image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9, popularity: 97 },
  { id: 87, name: 'Gulab Jamun', category: 'Cakes & Desserts', description: 'Traditional soft gulab jamun served warm with syrup.', price: 180, image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 84 },
  { id: 88, name: 'Lava Cake', category: 'Cakes & Desserts', description: 'Warm chocolate cake with a melted center and vanilla cream.', price: 260, image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 91 },
  { id: 89, name: 'Almond Cake', category: 'Cakes & Desserts', description: 'Soft almond sponge with creamy frosting and toasted nuts.', price: 250, image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.5, popularity: 80 },
  { id: 90, name: 'Ice Cream Bowl', category: 'Cakes & Desserts', description: 'A playful bowl of ice cream with chocolate drizzles and toppings.', price: 220, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 86 },

  // Waffles & Pancakes
  { id: 91, name: 'Classic Waffle', category: 'Waffles & Pancakes', description: 'Golden waffle crisp outside and fluffy inside.', price: 220, image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 88 },
  { id: 92, name: 'Choco Waffle', category: 'Waffles & Pancakes', description: 'Crispy waffle topped with chocolate sauce and cocoa dust.', price: 240, image: 'https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 94 },
  { id: 93, name: 'Pancake Stack', category: 'Waffles & Pancakes', description: 'Soft stacked pancakes with maple drizzle and whipped cream.', price: 230, image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 90 },
  { id: 94, name: 'Nutella Waffle', category: 'Waffles & Pancakes', description: 'Warm waffle loaded with Nutella and crunchy toppings.', price: 260, image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9, popularity: 97 },
  { id: 95, name: 'Strawberry Pancake', category: 'Waffles & Pancakes', description: 'Fluffy pancakes topped with fresh strawberry compote.', price: 240, image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 89 },
  { id: 96, name: 'Banana Pancake', category: 'Waffles & Pancakes', description: 'Soft pancakes layered with banana slices and caramel sauce.', price: 250, image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.6, popularity: 82 },
  { id: 97, name: 'Blueberry Waffle', category: 'Waffles & Pancakes', description: 'Golden waffle topped with blueberry compote and cream.', price: 250, image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.7, popularity: 87 },
  { id: 98, name: 'Caramel Pancake', category: 'Waffles & Pancakes', description: 'Fluffy pancakes with caramel drizzle and butter crunch.', price: 260, image: 'https://images.unsplash.com/photo-1520201163981-8cc95007dd2a?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 93 },
  { id: 99, name: 'Belgian Waffle', category: 'Waffles & Pancakes', description: 'Classic Belgian waffle with whipped cream and seasonal fruit.', price: 280, image: 'https://images.unsplash.com/photo-1528207776546-365bb710ee93?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.9, popularity: 98 },
  { id: 100, name: 'Choco Chip Pancake', category: 'Waffles & Pancakes', description: 'Soft pancakes loaded with chocolate chips and warm syrup.', price: 270, image: 'https://images.unsplash.com/photo-1554520735-0a6b8b6ce8b7?auto=format&fit=crop&w=800&q=80', type: 'veg', rating: 4.8, popularity: 95 }
];

const MENU_STORAGE_KEY = 'codersCupMenu';

// Load owner-managed menu edits while preserving the original default catalog when no saved menu exists.
try {
  const savedMenu = JSON.parse(localStorage.getItem(MENU_STORAGE_KEY) || 'null');
  if (Array.isArray(savedMenu) && savedMenu.length) {
    foodData.splice(0, foodData.length, ...savedMenu);
  } else {
    localStorage.setItem(MENU_STORAGE_KEY, JSON.stringify(foodData));
  }
} catch (error) {
  // The built-in catalog remains available if browser storage is unavailable or malformed.
}

window.codersCupFoodData = foodData;
window.codersCupMenuCategories = categories;

const state = {
  search: '',
  category: 'all',
  type: 'all',
  sort: 'popular'
};

// Share the existing menu catalog with the account dashboard and checkout.
window.codersCupFoodData = foodData;

const CART_KEY = 'codersCupCart';
let cart = loadCart();
let currentModalItem = null;
let quantityInModal = 1;

function slugify(text) {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function buildCategoryChips() {
  const nav = document.getElementById('category-navigation');
  const select = document.getElementById('category-filter');

  if (!nav || !select) return;

  categories.forEach((category) => {
    const item = document.createElement('button');
    item.type = 'button';
    item.className = 'category-chip';
    item.dataset.category = category.name;
    item.innerHTML = `
      <img src="${category.image}" alt="${category.name}" />
      <div>
        <strong>${category.name}</strong>
        <span>${foodData.filter((food) => food.category === category.name).length} items</span>
      </div>
    `;

    item.addEventListener('click', () => {
      state.category = category.name;
      const matchingSection = document.getElementById(`category-${slugify(category.name)}`);
      if (matchingSection) {
        matchingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      applyFilters();
    });

    nav.appendChild(item);

    const option = document.createElement('option');
    option.value = category.name;
    option.textContent = category.name;
    select.appendChild(option);
  });
}

function getFilteredItems() {
  const filtered = foodData.filter((food) => {
    if (food.available === false) return false;
    const searchableText = `${food.name} ${food.description} ${food.category}`.toLowerCase();
    const matchesSearch = searchableText.includes(state.search.toLowerCase());
    const matchesCategory = state.category === 'all' || food.category === state.category;
    const matchesType = state.type === 'all' || food.type === state.type;
    return matchesSearch && matchesCategory && matchesType;
  });

  filtered.sort((a, b) => {
    if (state.sort === 'low-high') return a.price - b.price;
    if (state.sort === 'high-low') return b.price - a.price;
    return b.popularity - a.popularity;
  });

  return filtered;
}

function renderFoodSections() {
  const container = document.getElementById('food-sections');
  if (!container) return;

  container.innerHTML = '';

  const filteredItems = getFilteredItems();

  const sectionOrder = categories.filter((category) => {
    if (state.category !== 'all' && category.name !== state.category) {
      return false;
    }
    return true;
  });

  if (!sectionOrder.length) {
    container.innerHTML = '<div class="empty-state">No dishes match your current search.</div>';
    return;
  }

  sectionOrder.forEach((category) => {
    const categoryFoods = filteredItems.filter((food) => food.category === category.name);
    const section = document.createElement('section');
    section.className = 'food-category';
    section.id = `category-${slugify(category.name)}`;

    if (categoryFoods.length === 0) {
      section.innerHTML = `
        <div class="category-header">
          <h2>${category.name}</h2>
          <span>0 items</span>
        </div>
        <div class="empty-state">No items found in this category.</div>
      `;
      container.appendChild(section);
      return;
    }

    const cards = categoryFoods.map((food) => `
      <article class="food-card" data-id="${food.id}">
        <img src="${food.image}" alt="${food.name}" />
        <div class="card-body">
          <div class="food-top-row">
            <span class="food-type ${food.type}">${food.type}</span>
            <button type="button" class="wishlist-btn" data-action="wishlist" data-id="${food.id}" aria-label="Add to wishlist">♡</button>
          </div>

          <h3>${food.name}</h3>
          <p>${food.description}</p>

          <div class="food-meta">
            <strong>₹${food.price}</strong>
            <span class="food-rating">★ ${food.rating}</span>
          </div>

          <div class="food-actions">
            <button type="button" class="btn btn-primary btn-small add-to-cart" data-id="${food.id}">Add to Cart</button>
            <button type="button" class="btn btn-outline btn-small view-details" data-id="${food.id}">View Details</button>
          </div>
        </div>
      </article>
    `).join('');

    section.innerHTML = `
      <div class="category-header">
        <h2>${category.name}</h2>
        <span>${categoryFoods.length} items</span>
      </div>
      <div class="food-grid">${cards}</div>
    `;

    container.appendChild(section);
  });

  bindFoodCardActions();
  refreshCategoryHighlight();
}

function bindFoodCardActions() {
  const cards = document.querySelectorAll('.food-card');
  cards.forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.add-to-cart') || event.target.closest('.view-details') || event.target.closest('.wishlist-btn')) {
        return;
      }

      const foodId = Number(card.dataset.id);
      openFoodModal(foodId);
    });
  });

  document.querySelectorAll('.add-to-cart').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      addToCart(Number(button.dataset.id));
    });
  });

  document.querySelectorAll('.view-details').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.stopPropagation();
      openFoodModal(Number(button.dataset.id));
    });
  });

  document.querySelectorAll('.wishlist-btn').forEach((button) => {
    const session = JSON.parse(localStorage.getItem('codersCupSession') || 'null');
    if (session?.customerId) {
      const savedIds = JSON.parse(localStorage.getItem(`codersCupWishlist_${session.customerId}`) || '[]');
      if (savedIds.some((id) => Number(id) === Number(button.dataset.id))) {
        button.textContent = '♥';
        button.style.color = '#d6a15d';
      }
    }

    button.addEventListener('click', (event) => {
      event.stopPropagation();
      const itemId = Number(button.dataset.id);
      const item = foodData.find((food) => food.id === itemId);
      const session = JSON.parse(localStorage.getItem('codersCupSession') || 'null');
      if (!session?.customerId || session.role !== 'customer') {
        window.location.href = 'login.html';
        return;
      }

      const wishlistKey = `codersCupWishlist_${session.customerId}`;
      const savedIds = JSON.parse(localStorage.getItem(wishlistKey) || '[]');
      const alreadySaved = savedIds.some((id) => Number(id) === itemId);
      const nextIds = alreadySaved ? savedIds.filter((id) => Number(id) !== itemId) : [...savedIds, itemId];
      localStorage.setItem(wishlistKey, JSON.stringify(nextIds));
      button.textContent = alreadySaved ? '♡' : '♥';
      button.style.color = alreadySaved ? '' : '#d6a15d';
      if (item) alert(`${item.name} ${alreadySaved ? 'removed from' : 'added to'} your wishlist.`);
    });
  });
}

function refreshCategoryHighlight() {
  const chips = document.querySelectorAll('.category-chip');
  chips.forEach((chip) => {
    chip.classList.toggle('active', chip.dataset.category === state.category);
  });

  const select = document.getElementById('category-filter');
  if (select) {
    select.value = state.category;
  }
}

function applyFilters() {
  renderFoodSections();

  const searchInput = document.getElementById('food-search');
  if (searchInput) searchInput.value = state.search;

  const sortSelect = document.getElementById('sort-filter');
  if (sortSelect) sortSelect.value = state.sort;

  const typeSelect = document.getElementById('type-filter');
  if (typeSelect) typeSelect.value = state.type;

  refreshCategoryHighlight();
}

function openFoodModal(foodId) {
  const item = foodData.find((food) => food.id === foodId);
  if (!item) return;

  currentModalItem = item;
  quantityInModal = 1;

  const modal = document.getElementById('food-modal');
  if (!modal) return;

  const imageEl = document.getElementById('modal-image');
  const nameEl = document.getElementById('modal-name');
  const typeEl = document.getElementById('modal-type');
  const descEl = document.getElementById('modal-description');
  const priceEl = document.getElementById('modal-price');
  const ratingEl = document.getElementById('modal-rating');
  const qtyInput = document.getElementById('modal-quantity');

  imageEl.src = item.image;
  imageEl.alt = item.name;
  nameEl.textContent = item.name;
  typeEl.textContent = item.type;
  typeEl.className = `food-type ${item.type}`;
  descEl.textContent = item.description;
  priceEl.textContent = `₹${item.price}`;
  ratingEl.textContent = `★ ${item.rating} Rating`;
  qtyInput.value = quantityInModal;

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
}

function closeFoodModal() {
  const modal = document.getElementById('food-modal');
  if (!modal) return;
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

function addToCart(foodId, quantity = 1) {
  const existing = cart.find((item) => item.id === foodId);

  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.push({ id: foodId, quantity });
  }

  saveCart();
  renderCart();
}

// Reuse this exact cart function from homepage cards; cart data remains under codersCupCart.
window.codersCupAddToCart = addToCart;

function updateCartItem(foodId, change) {
  const item = cart.find((entry) => entry.id === foodId);
  if (!item) return;

  item.quantity += change;
  if (item.quantity <= 0) {
    cart = cart.filter((entry) => entry.id !== foodId);
  }

  saveCart();
  renderCart();
}

function removeCartItem(foodId) {
  cart = cart.filter((item) => item.id !== foodId);
  saveCart();
  renderCart();
}

function renderCart() {
  const cartItemsContainer = document.getElementById('cart-items');
  const subtitle = document.getElementById('cart-subtotal');
  const itemCount = document.getElementById('cart-item-count');
  const cartBadge = document.querySelector('.cart-count');

  if (!cartItemsContainer || !subtitle || !itemCount || !cartBadge) return;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = '<div class="empty-cart">Your cart is empty. Add a few favorites and keep the cafe vibe going.</div>';
    subtitle.textContent = '₹0';
    itemCount.textContent = '0';
    cartBadge.textContent = '0';
    return;
  }

  let subtotal = 0;
  let totalItems = 0;

  cartItemsContainer.innerHTML = cart.map((entry) => {
    const food = foodData.find((item) => item.id === entry.id);
    if (!food) return '';

    subtotal += food.price * entry.quantity;
    totalItems += entry.quantity;

    return `
      <div class="cart-item">
        <img src="${food.image}" alt="${food.name}" />
        <div>
          <h4>${food.name}</h4>
          <p>₹${food.price}</p>
          <div class="cart-actions">
            <div class="qty-control">
              <button type="button" data-action="decrease" data-id="${food.id}">−</button>
              <span>${entry.quantity}</span>
              <button type="button" data-action="increase" data-id="${food.id}">+</button>
            </div>
            <button type="button" class="remove-item" data-action="remove" data-id="${food.id}">Remove</button>
          </div>
        </div>
        <strong>₹${food.price * entry.quantity}</strong>
      </div>
    `;
  }).join('');

  itemCount.textContent = String(totalItems);
  subtitle.textContent = `₹${subtotal}`;
  cartBadge.textContent = String(totalItems);

  document.querySelectorAll('[data-action="increase"]').forEach((button) => {
    button.addEventListener('click', () => updateCartItem(Number(button.dataset.id), 1));
  });

  document.querySelectorAll('[data-action="decrease"]').forEach((button) => {
    button.addEventListener('click', () => updateCartItem(Number(button.dataset.id), -1));
  });

  document.querySelectorAll('[data-action="remove"]').forEach((button) => {
    button.addEventListener('click', () => removeCartItem(Number(button.dataset.id)));
  });
}

function loadCart() {
  try {
    const savedCart = localStorage.getItem(CART_KEY);
    return savedCart ? JSON.parse(savedCart) : [];
  } catch (error) {
    return [];
  }
}

function saveCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

function setupFilterControls() {
  const searchInput = document.getElementById('food-search');
  const categoryDropdown = document.getElementById('category-filter');
  const typeDropdown = document.getElementById('type-filter');
  const sortDropdown = document.getElementById('sort-filter');

  searchInput.addEventListener('input', (event) => {
    state.search = event.target.value.trim();
    renderFoodSections();
  });

  categoryDropdown.addEventListener('change', (event) => {
    state.category = event.target.value;
    renderFoodSections();
  });

  typeDropdown.addEventListener('change', (event) => {
    state.type = event.target.value;
    renderFoodSections();
  });

  sortDropdown.addEventListener('change', (event) => {
    state.sort = event.target.value;
    renderFoodSections();
  });
}

function setupCartDrawer() {
  const cartDrawer = document.getElementById('cart-drawer');
  const cartBackdrop = document.getElementById('cart-backdrop');
  const cartTrigger = document.querySelector('.cart-trigger');
  const closeCart = document.querySelector('.close-cart');

  if (!cartDrawer || !cartBackdrop || !cartTrigger || !closeCart) return;

  const toggleCart = () => {
    cartDrawer.classList.toggle('open');
    cartBackdrop.classList.toggle('visible');
  };

  cartTrigger.addEventListener('click', toggleCart);
  closeCart.addEventListener('click', toggleCart);
  cartBackdrop.addEventListener('click', toggleCart);
}

function setupModalControls() {
  const modal = document.getElementById('food-modal');
  const closeButton = document.querySelector('.modal-close');

  if (!modal || !closeButton) return;

  closeButton.addEventListener('click', closeFoodModal);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeFoodModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeFoodModal();
    }
  });

  const qtyInput = document.getElementById('modal-quantity');
  document.querySelectorAll('.qty-btn').forEach((button) => {
    button.addEventListener('click', () => {
      const direction = button.dataset.qtyAction === 'increase' ? 1 : -1;
      let nextValue = Number(qtyInput.value) + direction;
      if (nextValue < 1) nextValue = 1;
      qtyInput.value = nextValue;
      quantityInModal = nextValue;
    });
  });

  qtyInput.addEventListener('input', () => {
    let value = Number(qtyInput.value);
    if (!value || value < 1) value = 1;
    qtyInput.value = value;
    quantityInModal = value;
  });

  const addBtn = document.getElementById('modal-add-btn');
  addBtn.addEventListener('click', () => {
    if (currentModalItem) {
      addToCart(currentModalItem.id, quantityInModal);
      closeFoodModal();
    }
  });
}

function initMenuPage() {
  if (!document.getElementById('category-navigation')) return;

  const requestedCategory = new URLSearchParams(window.location.search).get('category');
  if (requestedCategory && categories.some((category) => category.name === requestedCategory)) {
    state.category = requestedCategory;
  }

  buildCategoryChips();
  setupFilterControls();
  setupCartDrawer();
  setupModalControls();
  renderFoodSections();
  renderCart();

  const requestedFoodId = Number(new URLSearchParams(window.location.search).get('item'));
  if (requestedFoodId && foodData.some((food) => food.id === requestedFoodId)) {
    const requestedFood = foodData.find((food) => food.id === requestedFoodId);
    state.category = requestedFood.category;
    applyFilters();
    window.setTimeout(() => openFoodModal(requestedFoodId), 0);
  }

  const yearEl = document.getElementById('year');
  if (yearEl) {
    yearEl.textContent = new Date().getFullYear();
  }
}

// Keep already-open customer tabs in sync with owner menu edits in the same browser.
window.addEventListener('storage', (event) => {
  if (event.key !== MENU_STORAGE_KEY || !event.newValue) return;
  try {
    const updatedMenu = JSON.parse(event.newValue);
    if (!Array.isArray(updatedMenu)) return;
    foodData.splice(0, foodData.length, ...updatedMenu);
    window.codersCupFoodData = foodData;
    if (document.getElementById('category-navigation')) renderFoodSections();
    renderCart();
  } catch (error) {
    // Keep the last valid menu catalog if another tab writes invalid data.
  }
});

document.addEventListener('DOMContentLoaded', initMenuPage);
