import { useCallback, useEffect, useRef, useState } from "react";
import {
  Film,
  ImageIcon,
  Info,
  Pause,
  Play,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import SelectField from "../../ui/SelectField";
import { motion } from "framer-motion";

import Swal from "sweetalert2";
import TextEditor from "../../ui/TextEditor";
import { InputField } from "../../ui/InputField";
import useAxiosPublic from "../../../Utils/Hooks/useAxiosPublic";
import useAuth from "../../../Utils/Hooks/useAuth";
import { v4 as uuidv4 } from "uuid";

export default function ProductModal({ onClose, refetch }) {
  const axiosPublic = useAxiosPublic();
  const [attributes, setAttributes] = useState({});
  const [variants, setVariants] = useState([]);
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const videoRef = useRef([]);
  const mediaURLs = useRef({});
  const thumbnailRef = useRef(null);

  const [isPaused, setIsPaused] = useState({});

  const baseUrl = import.meta.env.VITE_BASEURL;

  const [thumbnail, setThumbnail] = useState(null);

  const [form, setForm] = useState(() => ({
    id: null,
    productName: "",
    regular_price: 0,
    sale_price: 0,
    discount: 0,
    rating: 0,
    isBestSeller: false,
    isHot: false,
    isNew: true,
    isTrending: false,
    isLimitedStock: false,
    isExclusive: false,
    isFlashSale: false,
    category: "",
    subcategory: "",
    subcategory_item: "",
    description: "",
    stock: 0,
    brand: "",
    weight: 1,
    images: [],
    variants_images: [],
    thumbnail: null,

    createdAt: new Date().toLocaleString("en-CA", {
      timeZone: "Asia/Dhaka",
      hour12: false,
    }),
    updatedAt: null,
    sellerId: "",
    sellerName: "",
    sellerStoreName: "",
  }));

  const handleAttributeChange = (attr, value) => {
    setAttributes((prev) => ({ ...prev, [attr]: value }));
  };
  const addedVariants = variants.map((v) => {
    const { attributes, tempId, ...rest } = v; // attributes spread + tempId separate
    return { ...rest, ...attributes, id: tempId }; // combine everything
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

    variants.forEach((v) => {
      // duplicate/overlap check: আগের variant-এর keys (price/stock ছাড়া)
      const keysToCheck = Object.keys(v).filter(
        (key) => !["regular_price", "sale_price", "stock"].includes(key),
      );

      // ✅ Exact duplicate: আগের variant-এর সব key নতুন variant-এ value মিলছে
      const allMatch = keysToCheck.every(
        (key) => v[key] === allAttributes[key],
      );

      // কোন attribute মিলেছে
      const matchCount = keysToCheck.filter(
        (key) => v[key] && v[key] === allAttributes[key],
      ).length;

      // 🔹 নতুন attribute আছে কি না
      const newAttributesCount = Object.keys(allAttributes).filter(
        (key) =>
          !["regular_price", "sale_price", "stock"].includes(key) &&
          !(key in v),
      ).length;

      // ✅ Partial overlap: কিছু match হয়েছে + নতুন attribute আছে
      const hasPartialOverlap =
        matchCount > 0 && !allMatch && newAttributesCount > 0;

      if (allMatch) isExactDuplicate = true;
      else if (hasPartialOverlap) isOverlap = true;
    });

    if (isExactDuplicate) {
      Swal.fire({
        icon: "error",
        title: `This variant is a duplicate of an existing variant!`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          const cleared = Object.keys(allAttributes).reduce(
            (acc, key) => ({ ...acc, [key]: "" }),
            {},
          );
          return setAttributes(cleared);
        }
      });
      return;
    }

    if (isOverlap) {
      Swal.fire({
        icon: "warning",
        title: `This variant partially overlaps with an existing variant.`,
      }).then((result) => {
        /* Read more about isConfirmed, isDenied below */
        if (result.isConfirmed) {
          const cleared = Object.keys(allAttributes).reduce(
            (acc, key) => ({ ...acc, [key]: "" }),
            {},
          );
          return setAttributes(cleared);
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
      attributes: { ...cleanAttributes }, // সব custom attributes এখানে
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
    setForm((prev) => ({
      ...prev,
      stock: totalStock,
    }));

    // input clear
    setAttributes(
      Object.keys(attributes).reduce((acc, key) => ({ ...acc, [key]: "" }), {}),
    );
  };

  const handleRemoveVariant = (id) => {
    const updatedVariants = addedVariants.filter((v) => v.id !== id);
    setVariants(updatedVariants);
  };

  const onImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    const validFiles = [];
    let hasInvalid = false;

    files.forEach((file) => {
      if (file.type.startsWith("image")) {
        hasInvalid = true;
      } else if (
        file.type.startsWith("image") ||
        file.type.startsWith("video")
      ) {
        validFiles.push({
          id: uuidv4(), // ⭐ unique id
          file,
        });
      }
    });

    if (hasInvalid) {
      Swal.fire({
        icon: "error",
        title: "File too large!",
        text: "Each image must be less than 1MB.",
        confirmButtonColor: "#FF0055",
      });
    }

    if (validFiles.length === 0) return;

    setForm((prev) => ({
      ...prev,
      images: [...(prev.images || []), ...validFiles],
    }));
  };

  const onVariantImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    const validFiles = [];
    let hasInvalidSize = false;
    let hasInvalidType = false;

    files.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        hasInvalidType = true;
        return;
      }

      validFiles.push({
        id: uuidv4(), // ✅ নতুন UUID
        file,
        url: null, // নতুন ফাইলের জন্য url নেই
      });
    });

    if (hasInvalidType) {
      Swal.fire({
        icon: "error",
        title: "Invalid file type!",
        text: "Only image files are allowed.",
        confirmButtonColor: "#FF0055",
      });
    }

    if (hasInvalidSize) {
      Swal.fire({
        icon: "error",
        title: "Image too large!",
        text: "Each image must be less than 2MB.",
        confirmButtonColor: "#FF0055",
      });
    }

    if (validFiles.length === 0) return;

    setForm((prev) => ({
      ...prev,
      variants_images: [...(prev.variants_images || []), ...validFiles],
    }));

    e.target.value = ""; // same file reselect fix
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setThumbnail(file); // no base64 needed now
  };

  const removeImage = (id) => {
    setForm((s) => ({
      ...s,
      images: s.images.filter((img) => img.id !== id),
    }));

    // URL clean up (memory leak avoid)
    if (mediaURLs.current[id]) {
      URL.revokeObjectURL(mediaURLs.current[id]);
      delete mediaURLs.current[id];
    }
  };

  // 🔽 Define subcategories for each category

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
          name: "Special Bundles",
          items: ["Combo Pack", "Mystery Box"],
          attributes: [
            "type",
            "size",
            "material",
            "color",
            "weight",
            "warranty",
          ],
        },
      ],
    },
    {
      name: "Fashion",
      sub: [
        {
          name: "Men's Clothing",
          items: [
            "T-Shirt",
            "Polo Shirt",
            "Shirt",
            "Pant",
            "Shorts",
            "Joggers",
            "Panjabi",
            "Sherwani",
            "Lungi",
            "Pajama",
            "Kurta",
            "Katua",
            "Jacket",
            "Coat",
            "Hoodie",
            "Sweater",
            "Sweatshirt",
            "Cardigan",
            "Blazer",
            "Waistcoat",
            "Raincoat",
            "Thermal Inner",
          ],
          attributes: ["type", "size", "material", "color"],
        },
        {
          name: "Women's Clothing",
          items: [
            "Top",
            "T-Shirt",
            "Shirt",
            "Kurti",
            "Katua",
            "Tunic",
            "Jacket",
            "Coat",
            "Hoodie",
            "Sweater",
            "Blazer",
            "Gown",
            "Skirt",
            "Palazzo",
            "Leggings",
            "Jeggings",
            "Saree",
            "Salwar Kameez",
            "Three Piece",
            "Two Piece",
            "Nighty",
            "Loungewear",
            "Hijab",
            "Niqab",
            "Burqa",
            "Shawl",
            "Dupatta",
          ],
          attributes: ["type", "size", "material", "color"],
        },
        {
          name: "Kids' Clothing",
          items: [
            "Kids T-Shirt",
            "Kids Polo Shirt",
            "Kids Shirt",
            "Kids Pant",
            "Kids Shorts",
            "Kids Sweatshirt",
            "Kids Jacket",
            "Kids Katua",
            "Kids Kurta",
            "Kids Hoodie",
            "Kids Sweater",
            "Kids Dress",
            "Baby T-Shirt",
            "Baby Shirt",
            "Baby Pant",
            "Baby Jumpsuit",
            "Baby Romper",
            "Baby Frock",
            "Baby Pajama",
          ],
          attributes: ["age", "type", "size", "material", "color"],
        },
        {
          name: "Inner & Sleepwear",
          items: [
            "Bra",
            "Panty",
            "Lingerie Set",
            "Nightwear Set",
            "Boxer",
            "Trunk",
            "Brief",
            "Vest",
            "Thermal Wear",
          ],
          attributes: ["type", "size", "color", "material"],
        },
        {
          name: "Footwear",
          items: [
            "Shoes",
            "Sandal",
            "Slipper",
            "Flip Flop",
            "Loafer",
            "Boot",
            "Heel",
            "Flat",
            "Wedge",
            "Kids Shoes",
            "Kids Sandal",
            "Kids Slipper",
            "Kids Flip Flop",
            "Kids Loafer",
            "Baby Shoes",
            "Baby Sandal",
            "Baby Slipper",
          ],
          attributes: ["type", "size", "material", "color"],
        },
        {
          name: "Fashion Accessories",
          items: [
            "Wrist Watch",
            "Smart Watch Strap",
            "Sunglass",
            "Optical Frame",
            "Belt",
            "Wallet",
            "Card Holder",
            "Handbag",
            "Shoulder Bag",
            "Tote Bag",
            "Backpack",
            "Travel Bag",
            "Luggage",
            "Cap",
            "Hat",
            "Tie",
            "Fabric Mask",
            "Scarf",
            "Socks",
            "Gloves",
            "Umbrella",
          ],
          attributes: ["type", "size", "material", "color"],
        },
        {
          name: "Jewelry",
          items: [
            "Necklace",
            "Pendant",
            "Earring",
            "Nose Pin",
            "Ring",
            "Bracelet",
            "Bangle",
            "Anklet",
            "Toe Ring",
            "Bridal Jewelry",
          ],
          attributes: ["type", "size", "material", "color"],
        },
        {
          name: "Special Bundles",
          items: ["Combo Pack", "Mystery Box"],
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
          name: "Special Bundles",
          items: ["Combo Pack", "Mystery Box"],
          attributes: ["type", "size", "material", "color", "weight", "volume"],
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
          name: "Special Bundles",
          items: ["Combo Pack", "Mystery Box"],
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
          name: "Special Bundles",
          items: ["Combo Pack", "Mystery Box"],
          attributes: ["type", "weight", "volume", "quantity"],
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

  const getVariantsFor = (subcategoryItem) => {
    return subcategoryItem?.attributes || [];
  };

  const variablesType =
    variants.length > 0
      ? [
          ...new Set(
            variants.flatMap((v) => {
              const { attributes } = v;
              return [
                ...Object.keys(attributes ?? {}).map((k) => k.toLowerCase()),
              ];
            }),
          ),
        ]
      : getVariantsFor(subcategoryItem).map((v) => String(v).toLowerCase());

  const handleCreate = async () => {
    if (
      form.productName.trim() === "" ||
      form.category.trim() === "" ||
      form.subcategory.trim() === "" ||
      form.subcategory_item.trim() === "" ||
      (form.images.length === 0 && !thumbnail) ||
      form.regular_price <= 0
    ) {
      return Swal.fire({
        icon: "error",
        title: "Please fill all required fields!",
        showConfirmButton: false,
        toast: true,
        position: "top",
        timer: 1500,
      });
    } else {
      try {
        setLoading(true); // 🔴 loading start
        setUploadProgress(0);

        const formData = new FormData();

        // Normal fields যোগ করুন
        for (let key in form) {
          if (key !== "images" && key !== "variants_images") {
            if (key === "thumbnail") {
              formData.append(key, thumbnail);
            }

            formData.append(key, form[key]);
          }
        }

        // Images & videos যোগ করুন
        (form.images || []).forEach((file) => {
          formData.append("images", file.file); // Multer single/multiple জন্য একই নাম
        });
        (form.variants_images || []).forEach((file) => {
          formData.append("variants_images", file.file); // Multer single/multiple জন্য একই নাম
        });

        formData.append("variants", JSON.stringify(variants));

        const res = await axiosPublic.post("/products", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            if (!progressEvent.total) return;

            const percent = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total,
            );

            setUploadProgress(percent);
          },
        });

        if (res.data.createdCount > 0) {
          Swal.fire({
            icon: "success",
            title: `${form.productName} has been added successfully`,
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
    }
  };

  const getGridCols = (len) => {
    if (len <= 1) return "grid-cols-1";
    if (len === 2) return "sm:grid-cols-2 grid-cols-1";
    if (len === 3) return "sm:grid-cols-3 grid-cols-1";
    if (len === 4) return "sm:grid-cols-4 grid-cols-1";
    if (len === 5) return "sm:grid-cols-5 grid-cols-1";
    return "sm:grid-cols-3 grid-cols-1"; // fallback
  };

  const tableHeaders =
    variants.length > 0
      ? [
          ...new Set(
            variants.flatMap((v) => {
              const { attributes, regular_price, sale_price, stock } = v;
              return [
                ...Object.keys(attributes ?? {}).map((k) => k.toLowerCase()),
                ...Object.keys({ regular_price, sale_price, stock }).map((k) =>
                  k.toLowerCase(),
                ),
              ];
            }),
          ),
        ]
      : [];

  useEffect(() => {
    setForm({
      id: null,
      productName: "",
      regular_price: 0,
      sale_price: 0,
      discount: 0,
      rating: 0,
      isBestSeller: false,
      isHot: false,
      isNew: true,
      isTrending: false,
      isLimitedStock: false,
      isExclusive: false,
      isFlashSale: false,
      category: "",
      subcategory: "",
      subcategory_item: "",
      description: "",
      stock: 0,
      brand: "",
      weight: 1,
      images: [],
      variants_images: [],
      thumbnail: null,
      createdAt: new Date().toLocaleString("en-CA", {
        timeZone: "Asia/Dhaka",
        hour12: false,
      }),
      updatedAt: null,
      sellerId: user.id,
      sellerName: user.full_name,
      sellerStoreName: user.store_name,
    });
  }, []);

  useEffect(() => {
    const total = Object.values(variants)
      .flat()
      .reduce((acc, v) => acc + (v.stock || 0), 0);

    setForm((prev) => ({ ...prev, stock: total }));
  }, [variants]);

  const handleChange = useCallback(
    (newContent) => setForm((s) => ({ ...s, description: newContent })),
    [],
  );

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
    const currentVideo = videoRef.current[id];
    if (!currentVideo) return;

    try {
      // 🔴 pause all other videos
      Object.entries(videoRef.current).forEach(([key, v]) => {
        if (v && key !== id) {
          v.pause();
          setIsPaused((p) => ({ ...p, [key]: true }));
        }
      });

      if (currentVideo.paused) {
        await currentVideo.play();
        currentVideo.muted = false;
        setIsPaused((p) => ({ ...p, [id]: false }));
      } else {
        currentVideo.pause();
        currentVideo.muted = true;
        setIsPaused((p) => ({ ...p, [id]: true }));
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
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-3xl bg-white rounded shadow overflow-auto max-h-[90vh] relative"
      >
        <header className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-[#FF0055] to-[#FF7B7B] text-white">
          <div className="flex items-center justify-between">
            {/* Title */}
            <h2 className="text-xl font-semibold">New Product</h2>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Instruction */}
              <a
                href="/instruction#"
                className="flex items-center gap-1 text-sm font-semibold px-4 py-1.5 rounded-md bg-white text-[#FF0055] shadow hover:bg-gray-100 transition"
              >
                <Info size={16} />
                Instruction
              </a>

              {/* Close */}
              <button
                onClick={onClose}
                className="p-1 rounded hover:bg-white/20 transition cursor-pointer"
              >
                <X size={22} />
              </button>
            </div>
          </div>
        </header>

        <div className="p-4 ">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <InputField
                  label="Product Name"
                  className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                  placeholder="Product Name"
                  onChange={(e) =>
                    setForm((s) => ({ ...s, productName: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Brand */}
              <div>
                <InputField
                  label="Brand"
                  className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                  placeholder="Brand"
                  onChange={(e) =>
                    setForm((s) => ({ ...s, brand: e.target.value }))
                  }
                  required
                />
              </div>

              {/* Regular Price */}
              <div>
                <InputField
                  type="number"
                  label=" Regular Price (৳)"
                  className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                  placeholder="Regular Price"
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
                  required
                />
              </div>
              {/* Sale Price */}
              <div>
                <InputField
                  type="number"
                  label=" Sale Price (৳)"
                  className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                  placeholder="Sale Price"
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
                />
              </div>
              {/* Total Stock */}
              <div>
                <InputField
                  type="number"
                  label=" Total Stock"
                  className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                  placeholder="Total Stock"
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
                />
              </div>

              {/* Discount */}
              <div>
                <InputField
                  type="number"
                  label=" Discount (%)"
                  className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                  placeholder="Discount"
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
                    label=" Rating (0-5)"
                    className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                    placeholder="Rating"
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
                    onKeyDown={(e) => {
                      if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                        e.preventDefault(); // keyboard up/down disable
                      }
                    }}
                    onWheel={(e) => e.target.blur()}
                  />
                </div>
              )}

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <SelectField
                  selectValue={form.category}
                  selectValueChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      category: e.target.value,
                      subcategory: "",
                    }))
                  }
                  isWide={true}
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {categories.map((cat) => (
                    <option key={cat.name}>{cat.name}</option>
                  ))}
                </SelectField>
              </div>

              {/* Dynamic Subcategory */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory
                </label>
                <SelectField
                  selectValue={form.subcategory}
                  selectValueChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      subcategory: e.target.value,
                    }))
                  }
                  isWide={true}
                  disabled={form.category === ""}
                >
                  <option value="" disabled>
                    Select Subcategory
                  </option>
                  {availableSubcategories.map((sub) => (
                    <option key={sub.name}>{sub.name}</option>
                  ))}
                </SelectField>
              </div>
              {/* Dynamic Subcategory Item */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategory Item
                </label>
                <SelectField
                  selectValue={form.subcategory_item}
                  selectValueChange={(e) =>
                    setForm((s) => ({
                      ...s,
                      subcategory_item: e.target.value,
                    }))
                  }
                  isWide={true}
                  disabled={form.subcategory === ""}
                >
                  <option value="" disabled>
                    Select Subcategory Item
                  </option>
                  {availableSubcategoryItems.map((subItem) => (
                    <option key={subItem}>{subItem}</option>
                  ))}
                </SelectField>
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <TextEditor value={form.description} onChange={handleChange} />
              </div>
            </div>

            <section className="border border-gray-200 rounded-3xl p-6 bg-gray-50 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {" "}
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
                      name={"thumbnail"}
                      accept=".jpg,.jpeg,.png"
                      ref={thumbnailRef}
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
                      const { id, file } = item; // ✅ id destructure
                      const isVideo = file.type.startsWith("video");

                      if (!mediaURLs.current[id]) {
                        mediaURLs.current[id] = URL.createObjectURL(file); // ✅ id-based
                      }

                      const mediaURL = mediaURLs.current[id];

                      return (
                        <div
                          key={id} // ✅ index → id
                          className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group border"
                        >
                          {!isVideo ? (
                            <img
                              src={mediaURL}
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition"
                            />
                          ) : (
                            <div className="relative w-full h-full">
                              <video
                                ref={(el) => (videoRef.current[id] = el)} // ✅ id-based
                                src={mediaURL}
                                playsInline
                                muted
                                preload="metadata"
                                className="w-full h-full object-cover"
                                onEnded={
                                  () =>
                                    setIsPaused((p) => ({ ...p, [id]: true })) // ✅ id-based
                                }
                              />

                              <button
                                onClick={() => togglePlayPause(id)} // ✅ id-based
                                className="absolute inset-0 m-auto w-10 h-10 bg-black/60 hover:bg-black/80 
              rounded-full flex items-center justify-center text-white"
                              >
                                {isPaused[id] !== false ? (
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
                            onClick={() => removeImage(id)} // ✅ index → id
                            className="absolute top-2 right-2 p-1.5 bg-white rounded-lg shadow hover:bg-red-500 hover:text-white"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}

                    {/* Add More */}
                    <div className="relative aspect-square border-2 border-dashed border-gray-300 bg-gray-50 hover:border-[#FF0055] rounded-2xl flex flex-col items-center justify-center  cursor-pointer group">
                      <input
                        type="file"
                        multiple
                        onChange={onImageChange}
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

            {/* Badge */}

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

            <div
              className={`transition-all duration-500 ease-in-out overflow-hidden ${
                form.subcategory_item !== "" && variablesType?.length > 0
                  ? "max-h-max opacity-100 my-4"
                  : "max-h-0 opacity-0"
              }`}
            >
              <div>
                <h4 className="font-medium">Product Variants (Options)</h4>

                <div className="px-5 py-5 bg-[#F9FAFB] rounded-2xl border-gray-300 border space-y-4">
                  <div
                    className={`grid ${getGridCols(
                      variablesType?.length,
                    )}   gap-4 `}
                  >
                    {variablesType.map((type, idx) => (
                      <div key={idx}>
                        <div className="flex gap-2  ">
                          <InputField
                            type="text"
                            label={type.replace("_", " ")}
                            className="  w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                            placeholder={`${type.replace("_", " ")}`}
                            value={attributes[type] || ""}
                            onChange={(e) =>
                              handleAttributeChange(type, e.target.value)
                            }
                          />
                        </div>
                      </div>
                    ))}

                    <div>
                      <div className="flex gap-2  ">
                        <InputField
                          label="Regular Price"
                          type="number"
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                              e.preventDefault(); // keyboard up/down disable
                            }
                          }}
                          onWheel={(e) => e.target.blur()}
                          placeholder={`Regular Price`}
                          className=" w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                          required
                          value={
                            attributes.regular_price !== undefined &&
                            attributes.regular_price !== ""
                              ? attributes.regular_price
                              : form.regular_price || ""
                          }
                          onChange={(e) => {
                            const val = e.target.value;
                            handleAttributeChange(
                              "regular_price",
                              parseInt(val),
                            );
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-2  ">
                        <InputField
                          label="Sale Price"
                          type="number"
                          placeholder={`Sale Price`}
                          className=" w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                          value={
                            attributes.sale_price !== undefined &&
                            attributes.sale_price !== ""
                              ? attributes.sale_price
                              : form.sale_price || ""
                          }
                          required
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
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex gap-2  ">
                        <InputField
                          label="Stock"
                          type="number"
                          placeholder={`Stock`}
                          className=" w-full border border-gray-300 rounded-lg px-3 py-3 focus:border-[#FF0055] focus:ring-2 focus:ring-[#FF0055] focus:outline-none shadow-sm bg-white"
                          value={attributes.stock || ""}
                          onChange={(e) =>
                            handleAttributeChange(
                              "stock",
                              parseInt(e.target.value),
                            )
                          }
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                              e.preventDefault(); // keyboard up/down disable
                            }
                          }}
                          onWheel={(e) => e.target.blur()}
                          required
                        />
                      </div>
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
                      Optional images for this variant
                    </p>
                  </div>

                  {/* Gallery */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {(form.variants_images || []).map((item) => {
                      const id = item.id || uuidv4(); // যদি কোনো UUID না থাকে, নতুন বানানো হবে
                      let mediaURL = "";

                      if (item.file instanceof File) {
                        if (!mediaURLs.current[id]) {
                          mediaURLs.current[id] = URL.createObjectURL(
                            item.file,
                          );
                        }
                        mediaURL = mediaURLs.current[id];
                      } else if (typeof item === "string" || item.url) {
                        mediaURL = item.url
                          ? item.url
                          : item.startsWith("/uploads")
                            ? `${baseUrl}${item}`
                            : item;
                      }

                      return (
                        <div
                          key={id}
                          className="relative group rounded-2xl overflow-hidden border bg-gray-100 aspect-square"
                        >
                          {/* Image */}
                          <img
                            src={mediaURL}
                            alt=""
                            className="w-full h-full object-fill transition-transform duration-300 group-hover:scale-110"
                          />

                          {/* Remove */}
                          <button
                            onClick={() =>
                              setForm((prev) => ({
                                ...prev,
                                variants_images: prev.variants_images.filter(
                                  (img) => img.id !== id,
                                ),
                              }))
                            }
                            className="absolute top-2 right-2 p-1.5 bg-white/90 
        rounded-lg shadow md:opacity-0 md:group-hover:opacity-100 
        hover:bg-red-500 hover:text-white transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}

                    {/* Add Image */}
                    <label
                      className="relative aspect-square rounded-2xl border-2 border-dashed 
      border-gray-300 hover:border-[#FF0055] bg-gray-50 
      flex flex-col items-center justify-center cursor-pointer 
      transition group"
                    >
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

                {variants.length > 0 && (
                  <div className="overflow-x-auto bg-white rounded-box shadow-sm my-4">
                    <table className="table text-center w-full">
                      <thead className="text-black">
                        <tr>
                          {tableHeaders.map((key) => (
                            <th className="capitalize" key={key}>
                              {key.replace("_", " ")}
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
                                <td key={key}>{variant[key]}</td>
                              ))}

                            <td>
                              <button
                                onClick={() => handleRemoveVariant(variant.id)}
                                className=" bg-red-100 hover:bg-[#e92323] text-red-600 rounded  px-3 py-2  hover:text-white cursor-pointer"
                              >
                                <Trash2 size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-2 justify-end">
              <button
                onClick={handleCreate}
                className="px-3 py-1 rounded bg-[#00C853] hover:bg-[#00B34A] text-white cursor-pointer"
              >
                Create
              </button>
              <button
                onClick={onClose}
                className="px-3 py-1 rounded text-white bg-[#f72c2c] hover:bg-[#e92323] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
