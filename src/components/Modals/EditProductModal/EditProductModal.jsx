import { useRef, useState } from "react";
import SelectField from "../../ui/SelectField";
import TextEditor from "../../ui/TextEditor";
import {
  Film,
  ImageIcon,
  Pause,
  Play,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import Swal from "sweetalert2";
import { InputField } from "../../ui/InputField";
import useAxiosPublic from "../../../Utils/Hooks/useAxiosPublic";
import { v4 as uuidv4 } from "uuid";
import useAuth from "../../../Utils/Hooks/useAuth";

export default function EditProductModal({ product = {}, onClose, refetch }) {
  const baseUrl = import.meta.env.VITE_BASEURL;
  const axiosPublic = useAxiosPublic();
  const { user } = useAuth();

  const [form, setForm] = useState({
    productName: product.product_name || "",
    brand: product.brand || "No Brand",
    regular_price: product.regular_price || 0,
    sale_price: product.sale_price || 0,
    discount: product.discount || 0,
    rating: product.rating || 0,
    category: product.category || "",
    subcategory: product.subcategory || "",
    subcategory_item: product.subcategory_item || "",
    description: product.description || "",
    stock: product.stock || 0,
    images: (product.images || []).map((url) => ({
      id: uuidv4(),
      file: null,
      url,
    })),
    variants_images: (product.variants_images || []).map((item) => ({
      id: uuidv4(),
      file: item instanceof File ? item : null,
      url: typeof item === "string" ? item : null,
    })),

    thumbnail: product.thumbnail || null,

    isBestSeller: product.isbestseller || false,
    isHot: product.ishot || false,
    isNew: product.isnew || false,
    isTrending: product.istrending || false,
    isLimitedStock: product.islimitedstock || false,
    isExclusive: product.isexclusive || false,
    isFlashSale: product.isflashsale || false,
    createdAt: product.createdat,
    updatedAt: new Date().toLocaleString("en-CA", {
      timeZone: "Asia/Dhaka",
      hour12: false,
    }),
    sellerId: product.sellerId || "",
    sellerName: product.sellerName || "",
    sellerStoreName: product.sellerStoreName || "",
  });

  const [thumbnail, setThumbnail] = useState(product.thumbnail || null);
  const videoRefs = useRef([]); // All refs stored here
  const mediaURLs = useRef({});
  const thumbnailRef = useRef(null);
  const mediaRef = useRef(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [pausedVideos, setPausedVideos] = useState(
    form.images.reduce((acc, _, i) => ({ ...acc, [i]: true }), {}),
  ); // Store pause state per index

  const [attributes, setAttributes] = useState({});
  const [variants, setVariants] = useState(product?.variants || []);

  const handleAttributeChange = (attr, value) => {
    setAttributes((prev) => ({ ...prev, [attr]: value }));
  };

  const addedVariants = variants?.map((v) => {
    const { attributes, tempId, ...rest } = v; // attributes spread + tempId separate
    const variantId = v?.id ? v.id : tempId;
    return { ...rest, ...attributes, id: variantId }; // combine everything
  });

  const addVariant = () => {
    const allAttributes = { ...attributes };

    // অন্তত একটি value আছে কিনা
    const hasAnyValue = Object.values(allAttributes).some(
      (v) => String(v).trim() !== "",
    );
    if (!hasAnyValue) return;

    let isExactDuplicate = false;
    let isOverlap = false;

    if (isExactDuplicate) {
      Swal.fire({
        icon: "error",
        title: `This variant is a duplicate of an existing variant!`,
      }).then((result) => {
        if (result.isConfirmed) {
          setAttributes(
            Object.keys(allAttributes).reduce(
              (acc, key) => ({ ...acc, [key]: "" }),
              {},
            ),
          );
        }
      });
      return;
    }

    if (isOverlap) {
      Swal.fire({
        icon: "warning",
        title: `This variant partially overlaps with an existing variant.`,
      }).then((result) => {
        if (result.isConfirmed) {
          setAttributes(
            Object.keys(allAttributes).reduce(
              (acc, key) => ({ ...acc, [key]: "" }),
              {},
            ),
          );
        }
      });
      return;
    }

    const tempId = uuidv4();
    const cleanAttributes = Object.fromEntries(
      Object.entries(attributes).filter(
        ([key, value]) =>
          !["regular_price", "sale_price", "stock"].includes(key) &&
          String(value).trim() !== "",
      ),
    );

    const newVariant = {
      tempId,
      attributes: { ...cleanAttributes },
      regular_price: attributes.regular_price || form.regular_price || 0,
      sale_price: attributes.sale_price || form.sale_price || 0,
      stock: attributes.stock || 0,
    };

    const updatedVariants = [...variants, newVariant];

    setVariants(updatedVariants);

    const totalStock = updatedVariants.reduce(
      (sum, v) => sum + (v.stock || 0),
      0,
    );
    setForm((prev) => ({ ...prev, stock: totalStock }));

    // input clear
    setAttributes(
      Object.keys(attributes).reduce((acc, key) => ({ ...acc, [key]: "" }), {}),
    );
  };

  const removeVariant = (id) => {
    const updated = addedVariants.filter((v) => v.id !== id);
    // 🟢 UPDATED: variant বাদ দিলে total stock পুনরায় হিসাব
    const totalStock = updated.reduce((sum, v) => sum + (v.stock || 0), 0);
    setVariants(updated);

    setForm((prev) => ({
      ...prev,
      stock: totalStock,
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    const validFiles = [];

    files.forEach((file) => {
      if (file.type.startsWith("image") || file.type.startsWith("video")) {
        validFiles.push({
          id: uuidv4(), // ⭐ unique id
          file,
          url: null,
        });
      }
    });

    if (validFiles.length === 0) return;

    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...validFiles],
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file); // no base64 needed now
  };

  const onVariantImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    const validImages = [];

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;

      if (file.type.startsWith("image")) {
        validImages.push({
          id: uuidv4(), // ✅ unique ID for each file
          file,
          url: null,
        });
      }
    });

    if (!validImages.length) return;

    setForm((prev) => ({
      ...prev,
      variants_images: [...(prev.variants_images || []), ...validImages],
    }));

    e.target.value = "";
  };
  const removeImage = (id) => {
    setForm((prev) => {
      const updatedImages = prev.images.filter((img) => img.id !== id);

      // যদি সব images remove হয়, mediaURLs clear করে দাও
      if (updatedImages.length === 0) {
        mediaRef.current.value = null;
      }

      return {
        ...prev,
        images: updatedImages,
      };
    });
  };

  const categories = [
    {
      name: "Electronics",
      sub: [
        {
          name: "Mobile Phones",
          items: ["Smartphone", "Feature Phone"],
          attributes: [
            "model",
            "ram",
            "storage",
            "color",
            "screen size",
            "battery capacity",
            "warranty",
          ],
        },
        {
          name: "Tablets & Readers",
          items: ["Tablet", "E-Reader"],
          attributes: [
            "model",
            "ram",
            "storage",
            "color",
            "screen size",
            "battery capacity",
            "warranty",
          ],
        },
        {
          name: "Mobile Accessories",
          items: [
            "Charger",
            "USB Cable",
            "Power Bank",
            "Battery",
            "Mobile Cover",
            "Screen Protector",
            "Camera Lens Protector",
            "Charging Dock",
            "Mobile Stand",
            "Mobile Mouse & Keyboard",
            "Selfie Stick",
            "Tripod",
            "Smart Watch",
            "Ring Light",
            "Phone Cooling Fan",
            "SIM Ejector Pin",
          ],
          attributes: ["type", "compatibility", "color", "size"],
        },
        {
          name: "Audio & Headphones",
          items: [
            "Earphones",
            "Earbuds",
            "Headphones",
            "Speaker",
            "Sound Bar",
            "Home Theater",
            "Karaoke System",
            "Microphone",
            "Audio Interface",
            "Sound Card",
          ],
          attributes: ["type", "connectivity", "color", "battery life"],
        },
        {
          name: "Computers & Laptops",
          items: ["Laptop", "Desktop", "Mini PC", "All In One PC", "Monitor"],
          attributes: [
            "model",
            "processor",
            "ram",
            "storage",
            "color",
            "screen size",
            "warranty",
            "weight",
          ],
        },
        {
          name: "Computer Accessories",
          items: [
            "Keyboard",
            "Mouse",
            "Mouse Pad",
            "Laptop Stand",
            "Monitor Stand",
            "Cooling Pad",
            "Laptop Charger",
            "Laptop Battery",
            "Keyboard Cover",
            "Screen Protector",
            "Laptop Bag",
            "USB Hub",
            "Docking Station",
            "Hard Disk",
            "SSD",
            "Pen Drive",
            "Memory Card",
            "Card Reader",
            "Webcam",
            "Headphone Stand",
          ],
          attributes: ["type", "compatibility", "color", "size"],
        },
        {
          name: "Printers & Scanners",
          items: [
            "Printer",
            "Scanner",
            "Photocopy Machine",
            "Printer Ink",
            "POS Machine",
            "Barcode Scanner",
            "Barcode Printer",
            "Label Printer",
            "Cash Drawer",
            "Money Counter",
            "Paper Shredder",
          ],
          attributes: [
            "type",
            "connectivity",
            "color",
            "warranty",
            "size",
            "weight",
          ],
        },
        {
          name: "Television & Display",
          items: [
            "Television",
            "Set Top Box",
            "Streaming Device",
            "Projector",
            "Projector Screen",
            "Television Remote",
            "Television Stand",
            "Television Wall Mount",
          ],
          attributes: [
            "screen size",
            "resolution",
            "color",
            "smart tv",
            "warranty",
            "weight",
          ],
        },
        {
          name: "Power & Electricals",
          items: [
            "UPS",
            "Inverter",
            "Solar Panel",
            "Solar Charge Controller",
            "Solar Battery",
            "Voltage Stabilizer",
            "Extension Board",
            "Electrical Wire",
            "Power Cable",
            "Plug",
            "Switch",
            "Socket",
            "Circuit Breaker",
            "Fuse",
            "Emergency Light",
          ],
          attributes: [
            "type",
            "capacity",
            "color",
            "voltage",
            "size",
            "weight",
          ],
        },
        {
          name: "Camera & Security",
          items: [
            "Camera",
            "Lens",
            "Filter",
            "Battery",
            "Charger",
            "Tripod",
            "Gimbal",
            "Bag",
            "Drone",
            "CCTV",
            "IP Camera",
            "PTZ Camera",
            "DVR",
            "NVR",
            "Video Door Bell",
            "Smart Door Lock",
          ],
          attributes: [
            "type",
            "resolution",
            "color",
            "night vision",
            "warranty",
            "size",
          ],
        },
        {
          name: "Combo Packs",
          items: [
            "Mobile Combo",
            "Gadget Combo",
            "Computer Combo",
            "Power Combo",
          ],
          attributes: [
            "type",
            "size",
            "material",
            "color",
            "weight",
            "warranty",
          ],
        },
        {
          name: "Mystery Box",
          items: ["99 Taka", "299 Taka", "499 Taka", "999 Taka", "1499 Taka"],
          attributes: ["type", "size", "material", "color"],
        },
      ],
    },
    {
      name: "Fashion",
      sub: [
        {
          name: "Men's Apparel",
          items: [
            "T-Shirt",
            "Polo T-Shirt",
            "Shirt",
            "Tank Top",
            "Fatua",
            "Kurta",
            "Panjabi",
            "Sherwani",
            "Jeans",
            "Cargo Pants",
            "Chinos",
            "Trousers",
            "Shorts",
            "Pajama",
            "Lungi",
            "Dhoti",
            "Katua",
          ],
          attributes: ["type", "size", "material", "color"],
        },
        {
          name: "Women's Apparel",
          items: [
            "T-Shirt",
            "Polo T-Shirt",
            "Shirt",
            "Tank Top",
            "Salwar Kameez",
            "Trousers",
            "Jeans",
            "Leggings",
            "Palazzo",
            "Shorts",
            "Skirt",
            "Kurti",
            "Tunic",
            "Fatua",
            "Kaftan",
            "Gown",
            "Saree",
            "Abaya",
            "Burqa",
          ],
          attributes: ["type", "size", "material", "color"],
        },
        {
          name: "Kid's Apparel",
          items: [
            "T-Shirt",
            "Polo T-Shirt",
            "Shirt",
            "Tank Top",
            "Jeans",
            "Trousers",
            "Cargo Pants",
            "Chinos",
            "Shorts",
            "Leggings",
            "Skirt",
            "Kurti",
            "Frock",
            "Kurta",
            "Panjabi",
            "Fatua",
            "Katua",
            "Salwar Kameez",
          ],
          attributes: ["age", "type", "size", "material", "color"],
        },
        {
          name: "Baby's Apparel",
          items: [
            "T-Shirt",
            "Frock",
            "Romper",
            "Onesie",
            "Sleepsuit",
            "Shorts",
            "Leggings",
            "Nima",
            "Cloth Nappy",
            "Nappy Cover",
            "Bib",
          ],
          attributes: ["age", "type", "size", "material", "color"],
        },
        {
          name: "Outerwear Collection",
          items: [
            "Hoodie",
            "Sweatshirt",
            "Sweater",
            "Cardigan",
            "Jacket",
            "Coat",
            "Blazer",
            "Waistcoat",
            "Koti",
            "Shrug",
          ],
          attributes: ["type", "size", "material", "color"],
        },
        {
          name: "Innerwear",
          items: [
            "Bra",
            "Panties",
            "Briefs",
            "Boxers",
            "Trunks",
            "Undershirt",
            "Camisole",
            "Slip",
            "Shapewear",
            "Thermal Wear",
          ],
          attributes: ["type", "size", "color", "material"],
        },
        {
          name: "Nightwear",
          items: ["Nighty", "Pajama Set", "Robe", "Babydoll"],
          attributes: ["type", "size", "color", "material"],
        },
        {
          name: "Sportswear",
          items: [
            "Sports Bra",
            "Compression Top",
            "Jersey",
            "Tracksuit",
            "Joggers",
            "Sports Leggings",
            "Sports Shorts",
            "Swimsuit",
            "Arm Sleeve",
            "Sweatband",
            "Sports Visor",
          ],
          attributes: ["type", "size", "color", "material"],
        },
        {
          name: "Footwear",
          items: [
            "Sneakers",
            "Sports Shoes",
            "Formal Shoes",
            "Loafer",
            "Sandal",
            "Slipper",
            "Heel",
            "Flat Shoes",
            "Boot",
            "School Shoes",
            "Safety Shoes",
            "Nagra",
            "Baby Soft Shoes",
          ],
          attributes: ["age", "type", "size", "material", "color"],
        },
        {
          name: "Fashion Accessories",
          items: [
            "Keychain",
            "Watch",
            "Spectacles",
            "Sunglasses",
            "Belt",
            "Suspenders",
            "Tie",
            "Bowtie",
            "Tie Pin",
            "Cufflink",
            "Lapel Pin",
            "Pocket Square",
            "Collar Pin",
            "Socks",
            "Handkerchief",
            "Scarf",
            "Muffler",
            "Shawl",
            "Bandana",
            "Beanie",
            "Cap",
            "Hat",
            "Prayer Cap",
            "Turban",
            "Hijab",
            "Niqab",
            "Bindi",
            "Mask",
            "Umbrella",
            "Hairband",
            "Hair Clip",
            "Hair Pin",
            "Hair Tie",
            "Scrunchie",
            "Headband",
            "Ear Muffs",
            "Gloves",
            "Mittens",
            "Wristband",
            "Smart Watch Strap",
          ],
          attributes: ["type", "size", "material", "color"],
        },
        {
          name: "Bags & Travel",
          items: [
            "Backpack",
            "Handbag",
            "Tote Bag",
            "Sling Bag",
            "Waist Bag",
            "Laptop Bag",
            "Briefcase",
            "Duffel Bag",
            "Luggage",
            "Drawstring Bag",
            "Diaper Bag",
            "Cosmetic Bag",
            "Wallet",
            "Card Holder",
            "Purse",
            "Potli",
          ],
          attributes: ["type", "size", "material", "color"],
        },
        {
          name: "Jewelry",
          items: [
            "Jewelry Set",
            "Bridal Set",
            "Necklace",
            "Choker",
            "Chain",
            "Pendant",
            "Locket",
            "Mangalsutra",
            "Ring",
            "Bracelet",
            "Bangle",
            "Ring Bracelet",
            "Anklet",
            "Toe Ring",
            "Nose Pin",
            "Nose Ring",
            "Earring",
            "Ear Cuff",
            "Brooch",
            "Armlet",
            "Waist Chain",
            "Forehead Ornament",
            "Headpiece",
            "Crown",
            "Tiara",
            "Amulet",
          ],
          attributes: ["type", "size", "material", "color"],
        },
        {
          name: "Outfit Sets",
          items: [
            "T-Shirt & Trousers Set",
            "T-Shirt & Shorts Set",
            "Shirt & Pants Set",
            "Hoodie Set",
            "Sweatshirt & Trousers Set",
            "Tracksuit Set",
            "Sportswear Set",
            "Winter Set",
            "Night Dress Set",
            "Kids Dress Set",
            "Baby Dress Set",
            "Panjabi & Pajama Set",
            "Complete Suit Sets",
            "Couple Set",
            "Family Set",
            "Saree & Panjabi Set",
          ],
          attributes: ["age", "type", "size", "material", "color"],
        },
        {
          name: "Combo Packs",
          items: [
            "T-Shirt Combo",
            "Polo T-Shirt Combo",
            "Shirt Combo",
            "Pants Combo",
            "Trousers Combo",
            "Shorts Combo",
            "Socks Combo",
            "Boxer Combo",
            "Briefs Combo",
            "Undershirt Combo",
            "Bra Combo",
            "Panties Combo",
            "Hijab Combo",
            "Panjabi Combo",
            "Saree Combo",
            "Men’s Combo",
            "Women’s Combo",
            "Bodysuit Combo",
            "Romper Combo",
          ],
          attributes: ["age", "type", "size", "material", "color"],
        },
        {
          name: "Mystery Box",
          items: ["99 Taka", "299 Taka", "499 Taka", "999 Taka", "1499 Taka"],
          attributes: ["type", "size", "material", "color"],
        },
      ],
    },
    {
      name: "Health & Beauty",
      sub: [
        {
          name: "Skin Care",
          items: [
            "Face Wash",
            "Cleanser",
            "Scrub",
            "Exfoliator",
            "Mask",
            "Cream",
            "Moisturizer",
            "Sunscreen",
            "Toner",
            "Serum",
            "Face Oil",
          ],
          attributes: ["type", "skin type", "volume", "weight"],
        },
        {
          name: "Hair Care",
          items: [
            "Shampoo",
            "Conditioner",
            "Hair Oil",
            "Serum",
            "Mask",
            "Color",
            "Spray",
            "Gel",
            "Wax",
          ],
          attributes: ["type", "hair type", "volume", "weight"],
        },
        {
          name: "Makeup",
          items: [
            "Foundation",
            "BB Cream",
            "CC Cream",
            "Concealer",
            "Powder",
            "Blush",
            "Highlighter",
            "Bronzer",
            "Eyeshadow",
            "Eyeliner",
            "Kajal",
            "Mascara",
            "Lipstick",
            "Lip Balm",
            "Lip Gloss",
            "Nail Polish",
            "Remover",
          ],
          attributes: ["type", "shade", "volume", "weight"],
        },
        {
          name: "Beauty Tools",
          items: [
            "Makeup Brush",
            "Makeup Sponge",
            "Face Roller",
            "Massager",
            "Facial Steamer",
            "Hair Dryer",
            "Straightener",
            "Curler",
            "Trimmer",
            "Shaver",
            "Epilator",
          ],
          attributes: ["type", "power source", "size", "color"],
        },
        {
          name: "Personal Care",
          items: [
            "Soap",
            "Body Wash",
            "Shower Gel",
            "Body Lotion",
            "Body Butter",
            "Body Scrub",
            "Hand Wash",
            "Hand Cream",
            "Foot Cream",
            "Toothpaste",
            "Toothbrush",
            "Mouthwash",
            "Deodorant",
            "Perfume",
            "Talcum Powder",
          ],
          attributes: ["type", "quantity", "volume", "weight"],
        },
        {
          name: "Feminine & Baby Products",
          items: [
            "Sanitary Napkin",
            "Panty Liner",
            "Menstrual Cup",
            "Pregnancy Test Kit",
            "Baby Shampoo",
            "Baby Soap",
            "Baby Lotion",
            "Baby Oil",
            "Baby Powder",
          ],
          attributes: ["type", "quantity", "volume", "weight"],
        },
        {
          name: "Medical Supplies",
          items: [
            "Thermometer",
            "Blood Pressure Machine",
            "Glucometer",
            "Pulse Oximeter",
            "Nebulizer",
            "Heating Pad",
            "Hot Water Bag",
            "Medical Mask",
            "Sanitizer",
            "Vitamins",
            "Supplements",
            "First Aid Kit",
            "Bandage",
            "Gauze",
            "Medical Gloves",
          ],
          attributes: ["type", "certification", "expiry date", "weight"],
        },
        {
          name: "Combo Packs",
          items: [
            "Daily Skin Care",
            "Hair Care Combo",
            "Men's Grooming Combo",
            "Baby Care Combo",
          ],
          attributes: ["type", "size", "material", "color", "weight", "volume"],
        },
        {
          name: "Mystery Box",
          items: ["99 Taka", "299 Taka", "499 Taka", "999 Taka", "1499 Taka"],
          attributes: ["type", "size", "material", "color"],
        },
      ],
    },
    {
      name: "Home & Living",
      sub: [
        {
          name: "Furniture",
          items: [
            "Sofa",
            "Chair",
            "Table",
            "Bed",
            "Mattress",
            "Wardrobe",
            "Cabinet",
            "Drawer",
            "Shelf",
            "Shoe Rack",
            "Storage Rack",
            "Television Cabinet",
            "Dressing Table",
            "Prayer Stool",
          ],
          attributes: ["type", "material", "color", "dimensions", "weight"],
        },
        {
          name: "Home Appliances",
          items: [
            "Refrigerator",
            "Deep Freezer",
            "Washing Machine",
            "Oven",
            "Rice Cooker",
            "Pressure Cooker",
            "Induction Stove",
            "Electric Stove",
            "Gas Stove",
            "Air Fryer",
            "Sandwich Maker",
            "Waffle Maker",
            "Toaster",
            "Blender",
            "Juicer",
            "Mixer Grinder",
            "Yogurt Maker",
            "Food Processor",
            "Electric Kettle",
            "Coffee Maker",
            "Vacuum Cleaner",
            "Iron",
            "Sewing Machine",
            "Fan",
            "Air Cooler",
            "Room Heater",
            "Water Heater",
            "Geyser",
            "Water Purifier",
            "Air Conditioner",
            "Air Purifier",
            "Humidifier",
            "Dehumidifier",
            "Electric Insect Trap",
            "Electric Rat Trap",
          ],
          attributes: [
            "type",
            "capacity",
            "size",
            "color",
            "warranty",
            "weight",
          ],
        },
        {
          name: "Kitchen & Dining",
          items: [
            "Cooking Pot",
            "Saucepan",
            "Frying Pan",
            "Wok",
            "Knife",
            "Chopper",
            "Peeler",
            "Grater",
            "Spoon",
            "Fork",
            "Plate",
            "Bowl",
            "Glass",
            "Mug",
            "Water Bottle",
            "Lunch Box",
            "Food Container",
            "Spice Box",
            "Oil Dispenser",
            "Cutting Board",
            "Kitchen Scale",
            "Dumpling Maker",
          ],
          attributes: [
            "type",
            "material",
            "color",
            "size",
            "capacity",
            "weight",
          ],
        },
        {
          name: "Cleaning Supplies",
          items: [
            "Air Freshener",
            "Bleach",
            "Broom",
            "Cleaning Brush",
            "Cleaning Cloth",
            "Cleaning Duster",
            "Cleaning Gloves",
            "Dish Wash Gloves",
            "Dishwashing Liquid",
            "Dishwashing Sponge",
            "Disinfectant Spray",
            "Drain Cleaner Tool",
            "Dustpan",
            "Floor Cleaner",
            "Floor Disinfectant",
            "Garbage Bag",
            "Glass Cleaner",
            "Kitchen Gloves",
            "Microfiber Cloth",
            "Mop",
            "Steel Wool",
            "Toilet Brush",
            "Toilet Cleaner",
            "Toilet Freshener",
            "Toilet Plunger",
            "Wiper",
            "Scrubber",
          ],
          attributes: [
            "type",
            "material",
            "color",
            "size",
            "quantity",
            "volume",
            "weight",
          ],
        },
        {
          name: "Home Essentials",
          items: [
            "Curtain",
            "Carpet",
            "Rug",
            "Mat",
            "Doormat",
            "Tissue Box Organizer",
          ],
          attributes: ["type", "material", "color", "size", "weight"],
        },
        {
          name: "Bedding",
          items: [
            "Pillow",
            "Cushion",
            "Bed Sheet",
            "Pillow Cover",
            "Blanket",
            "Comforter",
            "Quilt",
            "Mosquito Net",
          ],
          attributes: ["type", "material", "color", "size", "weight"],
        },
        {
          name: "Lighting & Décor",
          items: [
            "Bulbs",
            "Lights",
            "Lamps",
            "Wall Clock",
            "Photo Frame",
            "Mirror",
            "Flower Vase",
            "Artificial Flower",
          ],
          attributes: ["type", "dimensions", "color"],
        },
        {
          name: "Laundry",
          items: [
            "Laundry Basket",
            "Laundry Bag",
            "Detergent Powder",
            "Detergent Liquid",
            "Iron Board",
            "Hanger",
          ],
          attributes: ["type", "quantity", "weight", "color", "size"],
        },
        {
          name: "Bathroom",
          items: [
            "Bucket",
            "Bathroom Mug",
            "Water Drum",
            "Bathroom Mat",
            "Bathroom Shelf",
            "Soap Dispenser",
            "Toothbrush Holder",
            "Shower Head",
            "Tap",
            "Water Valve",
          ],
          attributes: ["type", "quantity", "volume", "color", "size"],
        },
        {
          name: "Hardware & Tools",
          items: [
            "Hammer",
            "Screwdriver",
            "Plier",
            "Wrench",
            "Measuring Tape",
            "Digital Weighing Scale",
            "Mechanical Scale",
            "Cutter",
            "Drill Machine",
            "Drill Bit",
            "Screw",
            "Nail",
            "Nut",
            "Bolt",
            "Padlock",
          ],
          attributes: ["type", "material", "size", "weight"],
        },
        {
          name: "Religious & Spiritual",
          items: [
            "Prayer Mat",
            "Tasbih",
            "Holy Books",
            "Book Stand",
            "Agarbatti",
            "Dhoop",
            "Diya",
            "Puja Thali",
            "Bell",
            "Religious Idol",
            "Wall Frame",
            "Photo Frame",
            "Prayer Cap",
            "Attar",
            "Rudraksha",
            "Spiritual Bracelet",
            "Yantra",
            "Talisman",
            "Festival Decoration",
            "Donation Box",
          ],
          attributes: ["type", "material", "color", "size", "occasion"],
        },
        {
          name: "Combo Packs",
          items: [
            "Kitchen Combo",
            "Cleaning Combo",
            "Bedding Combo",
            "Dining Combo",
          ],
          attributes: [
            "type",
            "size",
            "material",
            "color",
            "weight",
            "volume",
            "quantity",
          ],
        },
        {
          name: "Mystery Box",
          items: ["99 Taka", "299 Taka", "499 Taka", "999 Taka", "1499 Taka"],
          attributes: ["type", "size", "material", "color"],
        },
      ],
    },
    {
      name: "Grocery & Food",
      sub: [
        {
          name: "Staples & Grains",
          items: [
            "Rice",
            "Wheat",
            "Flour",
            "Semolina",
            "Lentil",
            "Chickpea",
            "Green Pea",
          ],
          attributes: ["type", "weight", "quantity", "volume"],
        },
        {
          name: "Cooking Essentials",
          items: [
            "Salt",
            "Sugar",
            "Molasses",
            "Oil",
            "Ghee",
            "Butter",
            "Spice",
          ],
          attributes: ["type", "weight", "quantity", "volume"],
        },
        {
          name: "Dairy & Protein",
          items: ["Milk", "Powder Milk", "Yogurt", "Cheese", "Egg"],
          attributes: ["type", "weight", "quantity", "volume"],
        },
        {
          name: "Meat & Fish",
          items: ["Chicken", "Beef", "Mutton", "Fish"],
          attributes: ["type", "quantity", "weight"],
        },
        {
          name: "Snacks",
          items: [
            "Biscuit",
            "Cookies",
            "Cake",
            "Chocolate",
            "Candy",
            "Chips",
            "Chanachur",
            "Muri",
            "Chira",
            "Popcorn",
          ],
          attributes: ["type", "weight", "quantity", "volume"],
        },
        {
          name: "Frozen & Packaged Food",
          items: [
            "Frozen Paratha",
            "Ice Cream",
            "Nugget",
            "Singara",
            "Sausage",
            "Ready Meal",
          ],
          attributes: ["type", "weight", "quantity", "volume"],
        },
        {
          name: "Beverages",
          items: [
            "Tea",
            "Coffee",
            "Mineral Water",
            "Soft Drink",
            "Energy Drink",
            "Juice",
            "Syrup",
          ],
          attributes: ["type", "weight", "quantity", "volume"],
        },
        {
          name: "Baby Food & Formula",
          items: ["Baby Food", "Baby Cereal"],
          attributes: ["age", "type", "weight", "quantity", "volume"],
        },
        {
          name: "Condiments & Spreads",
          items: ["Honey", "Jam", "Pickle", "Sauce"],
          attributes: ["type", "weight", "quantity", "volume"],
        },
        {
          name: "Combo Packs",
          items: [
            "Monthly Combo",
            "Breakfast Combo",
            "Snacks Combo",
            "Cooking Combo",
          ],
          attributes: ["type", "weight", "volume", "quantity"],
        },
        {
          name: "Mystery Box",
          items: ["99 Taka", "299 Taka", "499 Taka", "999 Taka", "1499 Taka"],
          attributes: ["type", "size", "material", "color"],
        },
      ],
    },
    {
      name: "Sports & Outdoor",
      sub: [
        {
          name: "Sports Equipment",
          items: [
            "Cricket Equipment",
            "Football Equipment",
            "Basketball Equipment",
            "Volleyball Equipment",
            "Badminton Equipment",
            "Tennis Equipment",
            "Table Tennis Equipment",
          ],
          attributes: ["type", "size", "color", "material", "weight"],
        },
        {
          name: "Sports Accessories",
          items: [
            "Cricket Accessories",
            "Football Accessories",
            "Basketball Accessories",
            "Volleyball Accessories",
            "Badminton Accessories",
            "Tennis Accessories",
            "Table Tennis Accessories",
          ],
          attributes: ["type", "color", "size", "material"],
        },
        {
          name: "Fitness & Exercise",
          items: ["Gym Equipment"],
          attributes: ["type", "color", "size", "material", "weight"],
        },
        {
          name: "Cycling",
          items: ["Bicycle", "Helmet", "Light", "Lock"],
          attributes: ["type", "size", "color", "material", "weight"],
        },
        {
          name: "Camping & Hiking",
          items: [
            "Camping Tent",
            "Sleeping Bag",
            "Camping Chair",
            "Camping Table",
            "Hiking Backpack",
            "Hiking Stick",
          ],
          attributes: ["type", "size", "color", "material", "weight"],
        },
        {
          name: "Fishing",
          items: ["Fishing Rod", "Fishing Reel"],
          attributes: ["type", "color", "size", "material"],
        },
      ],
    },
    {
      name: "Toys & Kids",
      sub: [
        {
          name: "Toys",
          items: [
            "Soft Toy",
            "Teddy Bear",
            "Doll",
            "Action Figure",
            "Remote Control Car",
            "Remote Control Drone",
            "Puzzle",
            "Board Game",
            "Building Blocks",
            "Musical Toy",
            "Educational Toy",
            "Science Kit",
          ],
          attributes: ["type", "age", "size", "color", "material"],
        },
        {
          name: "Baby care & Essentials",
          items: [
            "Diaper",
            "Wipes",
            "Kids Water Bottle",
            "Feeder",
            "Sterilizer",
          ],
          attributes: ["type", "age", "quantity", "size"],
        },
        {
          name: "Baby Gear",
          items: [
            "Walker",
            "Stroller",
            "Carrier",
            "Crib",
            "Bed",
            "Mosquito Net",
          ],
          attributes: ["type", "age", "color", "material", "size", "weight"],
        },
        {
          name: "Learning & School Supplies",
          items: ["School Bag", "Lunch Bag", "Stationery", "Books"],
          attributes: ["type", "size", "color", "material"],
        },
      ],
    },
    {
      name: "Pet Supplies",
      sub: [
        {
          name: "Pet Food",
          items: [
            "Cat Food",
            "Dog Food",
            "Bird Food",
            "Fish Food",
            "Turtle Food",
            "Rabbit Food",
          ],
          attributes: ["age", "weight", "quantity", "volume"],
        },
        {
          name: "Pet Accessories",
          items: [
            "Pet Bed",
            "Pet Cage",
            "Pet House",
            "Pet Carrier",
            "Pet Leash",
            "Pet Collar",
            "Pet Harness",
            "Pet Diaper",
            "Pet Wipes",
            "Pet Training Pad",
            "Pet Food Bowl",
            "Pet Water Fountain",
            "Pet Litter Box",
            "Pet Litter Tray & Scooper",
          ],
          attributes: ["age", "type", "size", "color", "material", "weight"],
        },
        {
          name: "Pet Care",
          items: [
            "Pet Shampoo",
            "Pet Conditioner",
            "Pet Brush",
            "Pet Nail Cutter",
            "Pet Toothbrush",
            "Pet Toothpaste",
            "Pet Medicine",
            "Pet Vitamin",
            "Pet Odor Spray",
            "Pet Flea & Tick Treatment",
            "Pet Lice Treatment",
            "Pet Ear Cleaner",
            "Pet Eye Cleaner",
            "Pet First Aid Kit",
            "Pet Litter",
          ],
          attributes: ["type", "age", "volume", "quantity", "weight"],
        },
        {
          name: "Aquarium Supplies",
          items: [
            "Aquarium Tank",
            "Aquarium Stand",
            "Aquarium Filter",
            "Aquarium Light",
            "Oxygen Pump",
            "Aquarium Heater",
          ],
          attributes: ["type", "size", "color", "material", "weight"],
        },
      ],
    },
  ];

  // Get subcategories based on selected category

  const subcategories = categories.find((cat) => cat.name === form.category);
  const availableSubcategories = subcategories?.sub || [];

  const subcategoryItem = availableSubcategories.find(
    (sub) => sub.name === form.subcategory,
  );
  const availableSubcategoryItems = subcategoryItem
    ? subcategoryItem?.items
    : [];

  const LAST_KEYS = ["regular_price", "sale_price", "stock"];
  const getVariantsFor = (subcategoryItem) => {
    return subcategoryItem?.attributes || [];
  };

  const variablesType = (() => {
    if (variants.length === 0) {
      // variants খালি → fallback
      return getVariantsFor(subcategoryItem).map((v) =>
        String(v).toLowerCase(),
      );
    }

    // সব variant থেকে attribute keys collect
    const keys = variants.flatMap((v) => {
      const { attributes } = v;

      if (attributes && Object.keys(attributes).length > 0) {
        // attributes থেকে key
        return Object.keys(attributes).map((k) => k.toLowerCase());
      } else {
        // attributes না থাকলে variant object থেকে key নাও, exclude price/stock/id
        return Object.keys(v)
          .map((k) => k.toLowerCase())
          .filter(
            (k) => !["regular_price", "sale_price", "stock", "id"].includes(k),
          );
      }
    });

    // duplicate remove & fallback
    return keys.length > 0
      ? [...new Set(keys)]
      : getVariantsFor(subcategoryItem).map((v) => String(v).toLowerCase());
  })();

  const tableHeaders = (() => {
    if (variants.length === 0) return [];

    const keys = variants.flatMap((v) => {
      const attrKeys =
        v.attributes && Object.keys(v.attributes).length > 0
          ? Object.keys(v.attributes)
          : [];

      // Root level থেকে price/stock/id include করা
      const rootKeys = Object.keys(v).filter(
        (k) => k !== "attributes" && k !== "id" && k !== "tempId",
      );

      return [...attrKeys, ...rootKeys].map((k) => k.toLowerCase());
    });

    const uniqueKeys = [...new Set(keys)];

    const normalKeys = uniqueKeys.filter((k) => !LAST_KEYS.includes(k));
    const lastKeys = LAST_KEYS.filter((k) => uniqueKeys.includes(k));

    return [...normalKeys, ...lastKeys];
  })();

  const getGridCols = (len) => {
    if (len <= 1) return "grid-cols-1";
    if (len === 2) return "sm:grid-cols-2 grid-cols-1";
    if (len === 3) return "sm:grid-cols-3 grid-cols-1";
    if (len === 4) return "sm:grid-cols-4 grid-cols-1";
    return "sm:grid-cols-3 grid-cols-1";
  };

  const handleSave = async () => {
    try {
      setLoading(true); // 🔴 loading start
      setUploadProgress(0);
      const formData = new FormData();
      formData.append("productName", form.productName);
      formData.append("regular_price", form.regular_price);
      formData.append("sale_price", form.sale_price);
      formData.append("discount", form.discount);
      formData.append("rating", form.rating);
      formData.append("isBestSeller", form.isBestSeller);
      formData.append("isHot", form.isHot);
      formData.append("isNew", form.isNew);
      formData.append("isTrending", form.isTrending);
      formData.append("isLimitedStock", form.isLimitedStock);
      formData.append("isExclusive", form.isExclusive);
      formData.append("isFlashSale", form.isFlashSale);
      formData.append("category", form.category);
      formData.append("subcategory", form.subcategory);
      formData.append("subcategory_item", form.subcategory_item);
      formData.append("description", form.description);
      formData.append("stock", form.stock);
      formData.append("brand", form.brand);
      formData.append("weight", form.weight);
      formData.append("variants", JSON.stringify(variants));

      // Multer-এর জন্য প্রতিটি ফাইল আলাদা append করুন

      form.images
        .filter((img) => img.file)
        .forEach((img) => formData.append("images", img.file));

      // Existing main images
      const existingPaths = form.images
        .filter((img) => img.url)
        .map((img) => img.url);
      formData.append("existingPaths", JSON.stringify(existingPaths));

      // New variant images
      form.variants_images
        .filter((img) => img.file)
        .forEach((img) => formData.append("variants_images", img.file));

      // Existing variant images
      const existingVariantPaths = form.variants_images
        .filter((img) => img.url)
        .map((img) => img.url);
      formData.append(
        "existingVariantPaths",
        JSON.stringify(existingVariantPaths),
      );

      // 🔹 যদি নতুন thumbnail File হয়
      if (thumbnail instanceof File) {
        formData.append("thumbnail", thumbnail);
      } else {
        // 🔹 পুরোনো thumbnail path পাঠাও
        formData.append("existingThumbnail", thumbnail);
      }

      const res = await axiosPublic.put(`/products/${product.id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;

          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );

          setUploadProgress(percent);
        },
      });

      if (res.data.updatedCount > 0) {
        Swal.fire({
          icon: "success",
          title: `${form.productName} has updated successfully`,
          showConfirmButton: false,
          toast: true,
          position: "top",
          timer: 1500,
        });
        refetch();
        onClose();
      }
    } catch (err) {
      console.error(err.response?.data || err.message);
    } finally {
      setLoading(false); // 🔴 loading end
      setUploadProgress(0);
    }
  };

  const renderThumbnailContent = () => {
    if (!thumbnail) {
      return (
        <div className="flex flex-col items-center justify-center space-y-2 p-4">
          <div className="p-3 bg-pink-50 rounded-full group-hover:bg-pink-100 transition-colors">
            <UploadCloud size={28} className="text-[#FF0055]" />
          </div>
          <div className="space-y-1 text-center">
            <p className="text-sm font-medium text-gray-700">
              <span className="text-[#FF0055]">Click to upload</span>
            </p>
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">
              JPG, PNG Required
            </p>
          </div>
        </div>
      );
    }

    const src =
      typeof thumbnail === "string"
        ? thumbnail.includes("/uploads")
          ? `${baseUrl}${thumbnail}`
          : thumbnail
        : URL.createObjectURL(thumbnail);

    return (
      <img
        src={src}
        alt="thumbnail"
        className="w-full h-full object-fill rounded-lg"
      />
    );
  };

  const togglePlayPause = async (id) => {
    const currentVideo = videoRefs.current[id];
    if (!currentVideo) return;

    try {
      // 🔴 pause all other videos
      Object.entries(videoRefs.current).forEach(([vidId, v]) => {
        if (v && vidId !== id) {
          v.pause();
          setPausedVideos((p) => ({ ...p, [vidId]: true }));
        }
      });

      if (currentVideo.paused) {
        await currentVideo.play();
        currentVideo.muted = false;
        setPausedVideos((p) => ({ ...p, [id]: false }));
      } else {
        currentVideo.pause();
        currentVideo.muted = true;
        setPausedVideos((p) => ({ ...p, [id]: true }));
      }
    } catch (err) {
      console.error("Video play blocked:", err);
    }
  };

  if (loading) {
    return (
      <div className="fixed top-0 left-0 w-screen h-screen bg-black/40 flex items-center justify-center z-50">
        <div className="bg-white px-6 py-5 rounded-xl shadow w-72 space-y-3">
          <p className="text-sm font-medium text-gray-700 text-center">
            Uploading product...
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-[#00C853] transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>

          {/* Percentage */}
          <p className="text-xs text-gray-600 text-center">{uploadProgress}%</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-3xl bg-white rounded shadow overflow-auto max-h-[90vh] relative ">
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#FF0055] to-[#FF7B7B] text-white">
          <h2 className="text-xl font-semibold">Edit Product </h2>
          <button
            onClick={onClose}
            className="hover:text-gray-200 transition-colors cursor-pointer"
          >
            <X size={24} />
          </button>
        </header>

        <div className="space-y-4 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Product Name */}
            <div>
              <InputField
                label="  Product Name"
                className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                defaultValue={form.productName}
                onChange={(e) =>
                  setForm((s) => ({ ...s, productName: e.target.value }))
                }
                placeholder="Product Name"
              />
            </div>

            {/* Brand */}
            <div>
              <InputField
                label=" Brand"
                className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                defaultValue={form.brand}
                onChange={(e) =>
                  setForm((s) => ({ ...s, brand: e.target.value }))
                }
                placeholder="Brand"
              />
            </div>

            {/* Prices */}
            <div>
              <InputField
                type="number"
                label="Regular Price"
                className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                defaultValue={form.regular_price || 0}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    regular_price: parseInt(e.target.value) || 0,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault(); // keyboard up/down disable
                  }
                }}
                onWheel={(e) => e.target.blur()}
                placeholder="Regular Price"
              />
            </div>
            <div>
              <InputField
                type="number"
                label="Sale Price"
                className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                defaultValue={form.sale_price || 0}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    sale_price: parseInt(e.target.value) || 0,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault(); // keyboard up/down disable
                  }
                }}
                onWheel={(e) => e.target.blur()}
                placeholder="Sale Price"
              />
            </div>
            <div>
              <InputField
                type="number"
                label="Total Stock"
                className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                defaultValue={form.stock || 0}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    stock: parseInt(e.target.value) || 0,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault(); // keyboard up/down disable
                  }
                }}
                onWheel={(e) => e.target.blur()}
                placeholder="Total Stock"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Discount */}
            <div>
              <InputField
                type="number"
                label="Discount (%)"
                className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                defaultValue={form.discount || 0}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    discount: parseInt(e.target.value),
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                    e.preventDefault(); // keyboard up/down disable
                  }
                }}
                onWheel={(e) => e.target.blur()}
                placeholder="Discount"
              />
            </div>
            {/* Rating */}

            {user?.role !== "seller" && user?.role !== "moderator" && (
              <div>
                <InputField
                  type="number"
                  min="0"
                  max="5"
                  step={0.1}
                  label="Rating (0-5)"
                  className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                  defaultValue={form.rating || 0}
                  onChange={(e) => {
                    const value = parseInt(e.target.value);
                    if (value < 0 || value > 5) {
                      alert("Please enter a value between 0 and 5");
                      e.target.value = 0;
                      setForm((s) => ({ ...s, rating: 0 }));
                    } else {
                      setForm((s) => ({ ...s, rating: value }));
                    }
                  }}
                  onWheel={(e) => e.target.blur()}
                  placeholder="Rating"
                />
              </div>
            )}
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium mb-1">Category</label>
              <SelectField
                selectValue={form.category}
                selectValueChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    category: e.target.value,
                    subcategory: "",
                    subcategory_item: "",
                  }))
                }
                isWide={true}
              >
                {categories.map((cat) => (
                  <option key={cat.name}>{cat.name}</option>
                ))}
              </SelectField>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Subcategory
              </label>
              <SelectField
                selectValue={form.subcategory}
                selectValueChange={(e) =>
                  setForm((s) => ({ ...s, subcategory: e.target.value }))
                }
                isWide={true}
              >
                <option value="" disabled>
                  Select Subcategory
                </option>
                {availableSubcategories.map((sub) => (
                  <option key={sub.name}>{sub.name}</option>
                ))}
              </SelectField>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Subcategory Item
              </label>
              <SelectField
                selectValue={form.subcategory_item}
                selectValueChange={(e) =>
                  setForm((s) => ({ ...s, subcategory_item: e.target.value }))
                }
                isWide={true}
              >
                <option value="" disabled>
                  Select Subcategory Item
                </option>
                {availableSubcategoryItems.map((subItem) => (
                  <option key={subItem}>{subItem}</option>
                ))}
              </SelectField>
            </div>
          </div>
          {/* Description */}
          <div className="mt-4">
            <label className="block text-sm font-medium mb-2">
              Description
            </label>
            <TextEditor
              value={form.description}
              onChange={(v) => setForm((s) => ({ ...s, description: v }))}
            />
          </div>

          <div className="md:col-span-2 pt-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Badge
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {user?.role === "seller" ? (
                <>
                  {["isHot", "isNew", "isLimitedStock"].map((flag) => (
                    <label
                      key={flag}
                      className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#FF0055] transition"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-secondary checkbox-xs rounded-sm"
                        checked={form[flag]}
                        onChange={(e) =>
                          setForm((s) => ({
                            ...s,
                            [flag]: e.target.checked,
                          }))
                        }
                      />
                      <span className="select-none">
                        {flag.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </label>
                  ))}
                </>
              ) : (
                <>
                  {[
                    "isBestSeller",
                    "isHot",
                    "isNew",
                    "isTrending",
                    "isLimitedStock",
                  ].map((flag) => (
                    <label
                      key={flag}
                      className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer hover:text-[#FF0055] transition"
                    >
                      <input
                        type="checkbox"
                        className="checkbox checkbox-secondary checkbox-xs rounded-sm"
                        checked={form[flag]}
                        onChange={(e) =>
                          setForm((s) => ({ ...s, [flag]: e.target.checked }))
                        }
                      />
                      <span className="select-none">
                        {flag.replace(/([A-Z])/g, " $1").trim()}
                      </span>
                    </label>
                  ))}
                </>
              )}
            </div>
          </div>

          <section className="border border-gray-200 rounded-3xl p-6 bg-gray-50 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* PRODUCT THUMBNAIL */}
              <div className="bg-white border rounded-2xl p-5 space-y-3 h-max">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Product Thumbnail
                  </h3>
                </div>

                <div
                  className={`relative group aspect-square flex items-center justify-center border-2 border-dashed rounded-2xl overflow-hidden transition-all ${
                    thumbnail
                      ? "border-emerald-500 bg-emerald-50"
                      : "border-gray-300 bg-gray-50 hover:border-[#FF0055]"
                  }`}
                >
                  <input
                    type="file"
                    name="thumbnail"
                    ref={thumbnailRef}
                    accept=".jpg,.jpeg,.png"
                    onChange={handleImageUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {renderThumbnailContent()}
                  {thumbnail && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 bg-emerald-500 text-white text-[10px] font-bold rounded-md">
                      THUMBNAIL
                    </span>
                  )}
                  {thumbnail && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setThumbnail(null);
                        thumbnailRef.current.value = null;
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow hover:bg-red-500 hover:text-white z-20"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* PRODUCT MEDIA GALLERY */}
              <div className="bg-white border rounded-2xl p-5 space-y-3 md:col-span-2">
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Product Media Gallery
                  </h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {(form.images || []).map((item) => {
                    const id = item.id || crypto.randomUUID();
                    const isVideo =
                      (item.file && item.file.type.startsWith("video")) ||
                      (item.url && /\.(mp4|webm|mov)$/i.test(item.url));

                    let mediaURL = "";
                    if (item.file) {
                      if (!mediaURLs.current[id]) {
                        mediaURLs.current[id] = URL.createObjectURL(item.file);
                      }
                      mediaURL = mediaURLs.current[id];
                    } else if (item.url) {
                      mediaURL = item.url.includes("/uploads")
                        ? `${baseUrl}${item.url}`
                        : item.url;
                    }

                    return (
                      <div
                        key={id}
                        className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group border"
                      >
                        {!isVideo ? (
                          <img
                            src={mediaURL}
                            alt=""
                            className="w-full h-full object-fill group-hover:scale-110 transition"
                          />
                        ) : (
                          <div className="relative w-full h-full">
                            <video
                              ref={(el) => (videoRefs.current[id] = el)}
                              src={mediaURL}
                              playsInline
                              muted
                              preload="metadata"
                              className="w-full h-full object-fill"
                              onEnded={() =>
                                setPausedVideos((p) => ({ ...p, [id]: true }))
                              }
                            />
                            <button
                              onClick={() => togglePlayPause(id)}
                              className="absolute inset-0 m-auto w-10 h-10 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center text-white"
                            >
                              {pausedVideos[id] !== false ? (
                                <Play size={18} />
                              ) : (
                                <Pause size={18} />
                              )}
                            </button>
                            <span className="absolute bottom-2 left-2 bg-black/60 text-white p-1 rounded">
                              <Film size={12} />
                            </span>
                          </div>
                        )}
                        <button
                          onClick={() => removeImage(id)}
                          className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow hover:bg-red-500 hover:text-white"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Add More */}
                  <div className="relative aspect-square border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#FF0055] rounded-2xl flex flex-col items-center justify-center cursor-pointer group">
                    <input
                      type="file"
                      multiple
                      ref={mediaRef}
                      onChange={handleImageChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <ImageIcon
                      size={22}
                      className="text-gray-400 group-hover:text-[#FF0055]"
                    />
                    <span className="text-[11px] text-gray-500 mt-2 group-hover:text-[#FF0055]">
                      Add More
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Variants */}

          <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${
              variablesType?.length > 0
                ? "max-h-max opacity-100 my-4"
                : "max-h-0 opacity-0"
            }`}
          >
            <div>
              <h4 className="font-medium">Product Variants</h4>
              <div className="px-5 py-5 bg-[#F9FAFB] rounded-2xl border-gray-300 border space-y-4">
                <div
                  className={`grid ${getGridCols(
                    variablesType.length,
                  )} gap-4 mt-2`}
                >
                  {variablesType.map((v, i) => (
                    <div key={i}>
                      <InputField
                        label={v.replace("_", " ")}
                        className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                        value={attributes[v] || ""}
                        onChange={(e) =>
                          handleAttributeChange(v, e.target.value)
                        }
                        placeholder={v.replace("_", " ")}
                      />
                    </div>
                  ))}
                  <div>
                    <InputField
                      label="Regular Price"
                      className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                      value={
                        attributes.regular_price !== undefined &&
                        attributes.regular_price !== ""
                          ? attributes.regular_price
                          : form.regular_price || ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        handleAttributeChange("regular_price", parseInt(val));
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault(); // keyboard up/down disable
                        }
                      }}
                      onWheel={(e) => e.target.blur()}
                      placeholder="Regular Price"
                    />
                  </div>
                  <div>
                    <InputField
                      label="Sale Price"
                      className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                      value={
                        attributes.sale_price !== undefined &&
                        attributes.sale_price !== ""
                          ? attributes.sale_price
                          : form.sale_price || ""
                      }
                      onChange={(e) =>
                        handleAttributeChange(
                          "sale_price",
                          parseInt(e.target.value),
                        )
                      }
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault(); // keyboard up/down disable
                        }
                      }}
                      onWheel={(e) => e.target.blur()}
                      placeholder="Sale Price"
                    />
                  </div>
                  <div>
                    <InputField
                      label="Stock"
                      className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                      value={attributes.stock || ""}
                      onChange={(e) =>
                        handleAttributeChange("stock", parseInt(e.target.value))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault(); // keyboard up/down disable
                        }
                      }}
                      onWheel={(e) => e.target.blur()}
                      placeholder="Stock"
                    />
                  </div>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={addVariant}
                    className="px-3 py-1 rounded border border-[#00C853] hover:bg-[#00B34A]  text-[#00C853] hover:text-white cursor-pointer"
                  >
                    Add Variant
                  </button>
                </div>
              </div>

              <section className="border border-gray-200 rounded-3xl p-6 bg-gradient-to-br from-gray-50 to-white space-y-6 my-6">
                {/* Header */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">
                    Variant Image Gallery
                  </h3>
                  <p className="text-xs text-gray-500">
                    Optional images for variants (image only)
                  </p>
                </div>

                {/* Gallery */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {(form.variants_images || []).map((item) => {
                    // নিশ্চিত করা ID থাকবে
                    const id = item.id || uuidv4();

                    // preview URL
                    let previewUrl = "";
                    if (item.file) {
                      // নতুন upload করা file
                      if (!mediaURLs.current[id]) {
                        mediaURLs.current[id] = URL.createObjectURL(item.file);
                      }
                      previewUrl = mediaURLs.current[id];
                    } else if (item.url || typeof item === "string") {
                      // পুরনো DB URL
                      const url = item.url || item;
                      previewUrl = url.startsWith("/uploads")
                        ? `${baseUrl}${url}`
                        : url;
                    }

                    return (
                      <div
                        key={id}
                        className="relative group rounded-2xl overflow-hidden border bg-gray-100 aspect-square"
                      >
                        <img
                          src={previewUrl}
                          alt=""
                          className="w-full h-full object-fill transition-transform duration-300 group-hover:scale-110"
                        />

                        <button
                          onClick={() =>
                            setForm((prev) => ({
                              ...prev,
                              variants_images: prev.variants_images.filter(
                                (img) => (img.id || img) !== id,
                              ),
                            }))
                          }
                          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-lg shadow md:opacity-0 md:group-hover:opacity-100 hover:bg-red-500 hover:text-white transition"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    );
                  })}

                  {/* Add Image */}
                  <label className="relative aspect-square rounded-2xl border-2 border-dashed border-gray-300 hover:border-[#FF0055] bg-gray-50 flex flex-col items-center justify-center cursor-pointer transition group">
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={onVariantImageChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                    />

                    <ImageIcon
                      size={26}
                      className="text-gray-400 group-hover:text-[#FF0055]"
                    />
                    <span className="text-xs text-gray-500 mt-2 group-hover:text-[#FF0055]">
                      Add Images
                    </span>
                  </label>
                </div>
              </section>

              {/* 🟢 UPDATED: total stock এখন form.stock থেকে */}
              <h3 className="mt-3 font-semibold">Total Stock: {form.stock}</h3>
              {variants.length > 0 && (
                <div className="overflow-x-auto bg-white rounded-box shadow-sm my-4">
                  <table className="table text-center w-full">
                    <thead className="text-black">
                      <tr>
                        {tableHeaders.map((h, idx) => (
                          <th key={idx} className="capitalize">
                            {h.replace("_", " ")}
                          </th>
                        ))}
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {addedVariants.map((variant) => (
                        <tr key={variant.id}>
                          {tableHeaders
                            .filter((key) => key !== "id")
                            .map((key) => (
                              <td key={key}>
                                <input
                                  type={
                                    [
                                      "stock",
                                      "regular_price",
                                      "sale_price",
                                    ].includes(key)
                                      ? "number"
                                      : "text"
                                  }
                                  value={variant[key] || 0}
                                  className="w-full border bg-white border-gray-300 rounded-lg px-3 py-2 text-sm focus:border-[#FF0055] focus:ring-1 focus:ring-[#FF0055] focus:outline-none shadow min-w-[90px]"
                                  onChange={(e) => {
                                    const value = [
                                      "stock",
                                      "regular_price",
                                      "sale_price",
                                    ].includes(key)
                                      ? parseInt(e.target.value) || 0
                                      : e.target.value;

                                    const updatedVariants = variants.map((v) =>
                                      v.id === variant.id
                                        ? { ...v, [key]: value }
                                        : v,
                                    );

                                    const totalStock = updatedVariants.reduce(
                                      (sum, v) => sum + (v.stock || 0),
                                      0,
                                    );

                                    setVariants(updatedVariants);
                                    setForm((prev) => ({
                                      ...prev,
                                      stock: totalStock,
                                    }));
                                  }}
                                  onKeyDown={(e) => {
                                    if (
                                      e.key === "ArrowUp" ||
                                      e.key === "ArrowDown"
                                    ) {
                                      e.preventDefault();
                                    }
                                  }}
                                  onWheel={(e) => e.target.blur()}
                                />
                              </td>
                            ))}

                          <td>
                            <div className="flex items-center justify-center">
                              <button
                                onClick={() => removeVariant(variant.id)}
                                className="bg-red-100 hover:bg-[#e92323] text-red-600 rounded px-3 py-2 hover:text-white cursor-pointer"
                              >
                                <Trash2 size={20} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          {/* Action Buttons */}
          <div className="flex justify-end gap-2 mt-4">
            <button
              onClick={handleSave}
              className="px-3 py-1 bg-[#00C853] text-white rounded cursor-pointer"
            >
              Save
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1 bg-[#f72c2c] text-white rounded cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
