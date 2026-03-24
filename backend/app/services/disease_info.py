"""
Disease information database for AgroSight.

This module contains comprehensive disease data structures and lookup functions.
In production, consider moving this to the PostgreSQL diseases table for easier updates.

Each disease entry contains:
- Basic info: name, crop_type, severity_level
- Cause: What pathogen/condition causes it
- Treatment: Organic and chemical solutions
- Prevention: How to prevent the disease
"""

from typing import Dict, Optional, List

# Language-agnostic disease data (English as master)
DISEASES_DATABASE: Dict[str, Dict] = {
    "tomato_late_blight": {
        "id": 1,
        "name": "Tomato Late Blight",
        "crop_type": "Tomato",
        "severity_level": "high",
        "cause": "Phytophthora infestans fungus — spreads in cool, wet conditions",
        "organic_treatment": "Spray neem oil solution (3%) weekly; Remove infected leaves; Improve circulating air",
        "chemical_treatment": "Apply copper-based fungicide (e.g., Bordeaux mixture 1%); Mancozeb spray",
        "prevention": [
            "Avoid overhead watering — water at soil level only",
            "Space plants 60cm apart for air circulation",
            "Rotate crops yearly — avoid tomato on same plot for 3 years",
            "Use disease-resistant varieties (e.g., 'Rocky', 'Matabel')",
            "Remove lower leaves as plants mature",
            "Mulch to prevent soil splash",
        ],
    },
    "tomato_early_blight": {
        "id": 2,
        "name": "Tomato Early Blight",
        "crop_type": "Tomato",
        "severity_level": "medium",
        "cause": "Alternaria solani fungus — spreads from soil splash and lower leaves",
        "organic_treatment": "Spray sulfur dust (5%) every 10 days; Remove infected leaves; Increase airflow",
        "chemical_treatment": "Chlorothalonil fungicide spray; Mancozeb weekly",
        "prevention": [
            "Remove lower leaves (up to 30cm) every 2 weeks",
            "Mulch heavily to prevent soil splash",
            "Space plants 60-90cm apart",
            "Avoid wetting foliage during irrigation",
            "Rotate crops for 3+ years",
            "Use certified disease-free seeds",
        ],
    },
    "potato_late_blight": {
        "id": 3,
        "name": "Potato Late Blight",
        "crop_type": "Potato",
        "severity_level": "high",
        "cause": "Phytophthora infestans fungus — causes crop failure in wet seasons",
        "organic_treatment": "Copper fungicide spray (Bordeaux 1%); Bacillus subtilis bioagent",
        "chemical_treatment": "Metalaxyl + Mancozeb combination; Cymoxanil spray",
        "prevention": [
            "Plant disease-resistant varieties (e.g., 'Kufri Chandramukhi')",
            "Ridge planting (improves drainage)",
            "Remove volunteers (self-grown plants from previous harvest)",
            "Scout fields weekly during monsoon",
            "Avoid overhead irrigation",
            "Proper crop sanitation — remove infected tubers",
        ],
    },
    "wheat_rust": {
        "id": 4,
        "name": "Wheat Leaf Rust",
        "crop_type": "Wheat",
        "severity_level": "medium",
        "cause": "Puccinia triticina fungus — wind-dispersed, thrives in cool-wet weather",
        "organic_treatment": "Sulfur dust spray (5%); Improve ventilation; Use resistant varieties",
        "chemical_treatment": "Propiconazole spray; Azoxystrobin fungicide",
        "prevention": [
            "Use certified rust-resistant varieties",
            "Plant at recommended density",
            "Avoid excessive nitrogen fertilizer",
            "Remove volunteers and weeds",
            "Scout fields during tillering and ear-formation stages",
            "Timely harvest to avoid secondary infections",
        ],
    },
    "rice_blast": {
        "id": 5,
        "name": "Rice Blast",
        "crop_type": "Rice",
        "severity_level": "high",
        "cause": "Magnaporthe oryzae fungus — spreads via spores in humid conditions",
        "organic_treatment": "Copper fungicide spray; Pseudomonas aeruginosa bioagent",
        "chemical_treatment": "Tricyclazole spray; Propiconazole + Carbendazim",
        "prevention": [
            "Use resistant varieties (e.g., 'IR 64', 'MTU 1001')",
            "Maintain 5-10cm water depth throughout crop",
            "Balance nitrogen (high N increases susceptibility)",
            "Proper spacing (18-20cm rows)",
            "Clean water sources",
            "Remove volunteer rice",
        ],
    },
    "apple_powdery_mildew": {
        "id": 6,
        "name": "Apple Powdery Mildew",
        "crop_type": "Apple",
        "severity_level": "medium",
        "cause": "Podosphaera leucotricha fungus — thrives in dry, warm conditions",
        "organic_treatment": "Sulfur dust (5-8%) spray; Neem oil; Remove infected shoots",
        "chemical_treatment": "Wettable sulfur spray; Dinocap fungicide",
        "prevention": [
            "Prune for open canopy (improve light penetration)",
            "Remove infected branches immediately",
            "Plant disease-resistant rootstocks",
            "Avoid high-nitrogen fertilizer",
            "Ensure good air circulation",
            "Timely pruning during dormancy",
        ],
    },
    "grape_powdery_mildew": {
        "id": 7,
        "name": "Powdery Mildew (Grape)",
        "crop_type": "Grape",
        "severity_level": "medium",
        "cause": "Uncinula necator fungus — white powder on leaves and berries",
        "organic_treatment": "Sulfur dust spray (8%) every 10-14 days; Neem oil spray",
        "chemical_treatment": "Wettable sulfur; Dinocap; Triadimenol spray",
        "prevention": [
            "Proper canopy management — thin leaves for light",
            "Avoid excessive nitrogen",
            "Space vines 2-3m apart",
            "Improve air circulation",
            "Remove infected shoots early",
            "Use disease-resistant varieties",
        ],
    },
    "mango_anthracnose": {
        "id": 8,
        "name": "Mango Anthracnose",
        "crop_type": "Mango",
        "severity_level": "medium",
        "cause": "Colletotrichum gloeosporioides fungus — causes fruit rot and leaf spots",
        "organic_treatment": "Copper sulfate spray (0.5%); Neem oil; Remove affected fruits",
        "chemical_treatment": "Carbendazim spray; Mancozeb + Copper fungicide",
        "prevention": [
            "Remove infected fruits and leaves",
            "Improve tree canopy ventilation",
            "Avoid wounding fruits during harvest",
            "Use fungicide spray during pre-flowering",
            "Sanitize pruning tools",
            "Avoid water-stress conditions",
        ],
    },
    "banana_leaf_spot": {
        "id": 9,
        "name": "Banana Leaf Spot (Sigatoka)",
        "crop_type": "Banana",
        "severity_level": "high",
        "cause": "Pseudocercospora fijiensis fungus — causes rapid leaf senescence",
        "organic_treatment": "Copper oxychloride spray (0.5%); Neem oil; Leaf removal",
        "chemical_treatment": "Mancozeb spray; Azoxystrobin fungicide",
        "prevention": [
            "Remove dead leaves and pseudostems",
            "Ensure adequate drainage",
            "Avoid overhead irrigation",
            "Use disease-free planting material",
            "Rotate fields",
            "Plant-to-plant spacing 3-4m",
        ],
    },
    "cotton_leaf_curl_virus": {
        "id": 10,
        "name": "Cotton Leaf Curl Virus",
        "crop_type": "Cotton",
        "severity_level": "high",
        "cause": "Whitefly-transmitted virus — causes leaf curling and plant stunting",
        "organic_treatment": "Remove infected plants; Control whitefly with neem oil; Yellow sticky traps",
        "chemical_treatment": "Imidacloprid for whitefly control; Virus-symptomatic plants uproot immediately",
        "prevention": [
            "Plant resistant varieties",
            "Use yellow sticky traps for early whitefly detection",
            "Row spacing 60-90cm for air circulation",
            "Control weeds (alternate hosts)",
            "Avoid planting near infected fields",
            "Certified disease-free seeds",
        ],
    },
}

# Language-specific disease names (add more languages as needed)
DISEASE_TRANSLATIONS = {
    "tomato_late_blight": {
        "en": "Tomato Late Blight",
        "te": "టమాటో లేట్ బ్లైట్",
        "hi": "टमाटर लेट ब्लाइट",
    },
    "tomato_early_blight": {
        "en": "Tomato Early Blight",
        "te": "టమాటో ఎర్లీ బ్లైట్",
        "hi": "टमाटर अर्ली ब्लाइट",
    },
    "rice_blast": {
        "en": "Rice Blast",
        "te": "చాలు అస్పృశ్య",
        "hi": "चावल ब्लास्ट",
    },
}


async def seed_diseases_table(db_session):
    """
    Populate the diseases table with initial data.
    
    Call this once during first startup to load disease data.
    
    Example:
        >>> from app.database import async_session_maker
        >>> from app.services.disease_info import seed_diseases_table
        >>> async with async_session_maker() as session:
        ...     await seed_diseases_table(session)
        ...     await session.commit()
    """
    from app.models import Disease
    from sqlalchemy import select
    
    # Check if data already exists
    result = await db_session.execute(select(Disease).limit(1))
    if result.scalars().first():
        print("Diseases table already populated. Skipping seed.")
        return
    
    print("Seeding diseases table...")
    for key, disease_data in DISEASES_DATABASE.items():
        disease = Disease(
            id=disease_data["id"],
            name=disease_data["name"],
            crop_type=disease_data["crop_type"],
            cause=disease_data["cause"],
            organic_treatment=disease_data["organic_treatment"],
            chemical_treatment=disease_data["chemical_treatment"],
            prevention="\n".join(disease_data["prevention"]),  # Join list to newline-separated string
            severity_level=disease_data["severity_level"],
        )
        db_session.add(disease)
    
    await db_session.commit()
    print(f"✓ Seeded {len(DISEASES_DATABASE)} diseases into database")


def get_disease_by_name(disease_name: str, language: str = "en") -> Optional[Dict]:
    """
    Look up disease info by name.
    
    Args:
        disease_name: Disease key (e.g., "tomato_late_blight") or full name
        language: Response language ("en", "te", "hi")
    
    Returns:
        Disease info dict or None if not found
    """
    # Normalize disease name
    key = disease_name.lower().replace(" ", "_").replace("(", "").replace(")", "")
    
    if key not in DISEASES_DATABASE:
        return None
    
    disease = DISEASES_DATABASE[key].copy()
    
    # Translate disease name if translation exists
    if key in DISEASE_TRANSLATIONS:
        disease["name"] = DISEASE_TRANSLATIONS[key].get(language, disease["name"])
    
    return disease


def get_all_crop_types() -> List[str]:
    """Return list of all supported crop types."""
    return sorted(set(d["crop_type"] for d in DISEASES_DATABASE.values()))


def get_diseases_by_crop(crop_type: str) -> List[Dict]:
    """Get all diseases affecting a specific crop."""
    return [
        d for d in DISEASES_DATABASE.values()
        if d["crop_type"].lower() == crop_type.lower()
    ]
