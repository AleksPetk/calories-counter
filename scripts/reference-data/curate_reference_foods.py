#!/usr/bin/env python3
"""
Curate QuickCal Reference Foods from USDA FoodData Central SR Legacy (April 2018).

Run from repo root (or this directory) after unzipping SR Legacy JSON:
  python3 scripts/reference-data/curate_reference_foods.py

Outputs:
  src/data/reference/referenceFoods.v1.json
  scripts/reference-data/curation-report.json

Does not invent values. Every row traces to an fdcId from the USDA download.
"""

from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
SOURCE_JSON = Path(__file__).resolve().parent / "sr_legacy" / (
    "FoodData_Central_sr_legacy_food_json_2018-04.json"
)
OUT_JSON = ROOT / "src" / "data" / "reference" / "referenceFoods.v1.json"
REPORT_JSON = Path(__file__).resolve().parent / "curation-report.json"

NUTRIENT_NUMBERS = {
    "calories": "208",  # Energy kcal
    "protein": "203",
    "carbs": "205",
    "fat": "204",
}

# Reject cooked / prepared / branded-like descriptions.
COOKED_OR_EXCLUDED = re.compile(
    r"\b("
    r"cooked|roasted|baked|boiled|fried|grilled|braised|stewed|smoked|"
    r"canned|pickled|salted|brined|dried.*(fruit|apple)|"
    r"frozen.*prepared|ready.?to.?eat|bread|cheese|yogurt|yoghurt|"
    r"butter|margarine|oil|sauce|soup|cereal|flour,|protein powder|"
    r"drink|beverage|juice|wine|beer|cola|soda|chocolate|"
    r"candy|cookie|cracker|chips|snack|pizza|sandwich|hot.?dog|"
    r"sausage|bacon|ham,|deli|lunchmeat|nugget|patty|"
    r"with added solution|enhanced|mechanically separated|"
    r"infant|babyfood|formula"
    r")\b",
    re.I,
)

# Must look raw / dry / uncooked for inclusion when description is ambiguous.
RAWISH = re.compile(r"\b(raw|uncooked|dry|dried)\b", re.I)

# Spec: (id_slug, category, state, display_name, must_include_tokens, prefer_tokens, reject_extra)
# must_include_tokens: all must appear in description (case-insensitive)
SPECS = [
    # Meat & poultry
    ("chicken_breast_skinless_raw", "meat_poultry", "raw", "Chicken breast, skinless, raw",
     ["chicken", "breast", "raw", "meat only"], ["skinless", "boneless"], ["meat and skin", "solution"]),
    ("chicken_thigh_skinless_raw", "meat_poultry", "raw", "Chicken thigh, skinless, raw",
     ["chicken", "thigh", "raw", "meat only"], ["skinless"], ["meat and skin", "solution"]),
    ("chicken_thigh_with_skin_raw", "meat_poultry", "raw", "Chicken thigh, with skin, raw",
     ["chicken", "thigh", "raw", "meat and skin"], [], ["meat only", "solution"]),
    ("chicken_wing_raw", "meat_poultry", "raw", "Chicken wing, raw",
     ["chicken", "wing", "raw", "meat and skin"], [], ["meat only", "solution"]),
    ("turkey_breast_raw", "meat_poultry", "raw", "Turkey breast, raw",
     ["turkey", "breast", "raw"], ["meat only"], ["solution", "smoked"]),
    ("turkey_ground_raw", "meat_poultry", "raw", "Ground turkey, raw",
     ["turkey", "ground", "raw"], [], ["cooked", "patty"]),
    ("beef_sirloin_raw", "meat_poultry", "raw", "Beef sirloin, raw",
     ["beef", "sirloin", "raw"], ["top sirloin", "separable lean"], ["cooked"]),
    ("beef_tenderloin_raw", "meat_poultry", "raw", "Beef tenderloin, raw",
     ["beef", "tenderloin", "raw"], ["separable lean"], ["cooked"]),
    ("beef_ribeye_raw", "meat_poultry", "raw", "Beef ribeye, raw",
     ["beef", "ribeye", "raw"], ["rib eye", "separable"], ["cooked"]),
    ("beef_ground_90_raw", "meat_poultry", "raw", "Ground beef, 90% lean, raw",
     ["beef", "ground", "90", "raw"], ["lean"], ["cooked", "loaf", "patty"]),
    ("beef_ground_80_raw", "meat_poultry", "raw", "Ground beef, 80% lean, raw",
     ["beef", "ground", "80", "raw"], ["lean"], ["cooked", "loaf", "patty"]),
    ("beef_chuck_raw", "meat_poultry", "raw", "Beef chuck, raw",
     ["beef", "chuck", "raw"], ["separable lean"], ["cooked"]),
    ("beef_brisket_raw", "meat_poultry", "raw", "Beef brisket, raw",
     ["beef", "brisket", "raw"], ["separable"], ["cooked"]),
    ("pork_loin_raw", "meat_poultry", "raw", "Pork loin, raw",
     ["pork", "loin", "raw"], ["separable lean"], ["cooked", "cured"]),
    ("pork_tenderloin_raw", "meat_poultry", "raw", "Pork tenderloin, raw",
     ["pork", "tenderloin", "raw"], [], ["cooked", "cured"]),
    ("pork_belly_raw", "meat_poultry", "raw", "Pork belly, raw",
     ["pork", "belly", "raw"], [], ["cooked", "cured"]),
    ("pork_ground_raw", "meat_poultry", "raw", "Ground pork, raw",
     ["pork", "ground", "raw"], [], ["cooked", "sausage"]),
    ("pork_chop_raw", "meat_poultry", "raw", "Pork chop, loin, raw",
     ["pork", "loin", "chop", "raw"], ["separable"], ["cooked", "cured"]),
    ("lamb_leg_raw", "meat_poultry", "raw", "Lamb leg, raw",
     ["lamb", "leg", "raw"], ["separable lean"], ["cooked"]),
    ("lamb_loin_raw", "meat_poultry", "raw", "Lamb loin, raw",
     ["lamb", "loin", "raw"], ["separable"], ["cooked"]),
    ("lamb_ground_raw", "meat_poultry", "raw", "Ground lamb, raw",
     ["lamb", "ground", "raw"], [], ["cooked"]),
    ("veal_loin_raw", "meat_poultry", "raw", "Veal loin, raw",
     ["veal", "loin", "raw"], ["separable"], ["cooked"]),
    ("duck_breast_raw", "meat_poultry", "raw", "Duck breast, raw",
     ["duck", "breast", "raw"], [], ["cooked"]),
    ("chicken_drumstick_raw", "meat_poultry", "raw", "Chicken drumstick, raw",
     ["chicken", "drumstick", "raw"], ["meat and skin"], ["solution"]),

    # Fish & seafood
    ("salmon_atlantic_raw", "fish_seafood", "raw", "Salmon, Atlantic, raw",
     ["salmon", "atlantic", "raw"], ["farmed", "wild"], ["smoked", "cooked", "canned"]),
    ("salmon_chinook_raw", "fish_seafood", "raw", "Salmon, chinook, raw",
     ["salmon", "chinook", "raw"], [], ["smoked", "cooked", "canned"]),
    ("tuna_bluefin_raw", "fish_seafood", "raw", "Tuna, bluefin, raw",
     ["tuna", "bluefin", "raw"], [], ["canned", "cooked"]),
    ("tuna_yellowfin_raw", "fish_seafood", "raw", "Tuna, yellowfin, raw",
     ["tuna", "yellowfin", "raw"], [], ["canned", "cooked"]),
    ("cod_atlantic_raw", "fish_seafood", "raw", "Cod, Atlantic, raw",
     ["cod", "atlantic", "raw"], [], ["cooked", "canned"]),
    ("cod_pacific_raw", "fish_seafood", "raw", "Cod, Pacific, raw",
     ["cod", "pacific", "raw"], [], ["cooked", "canned"]),
    ("mackerel_atlantic_raw", "fish_seafood", "raw", "Mackerel, Atlantic, raw",
     ["mackerel", "atlantic", "raw"], [], ["cooked", "canned", "smoked"]),
    ("trout_rainbow_raw", "fish_seafood", "raw", "Trout, rainbow, raw",
     ["trout", "rainbow", "raw"], [], ["cooked", "smoked"]),
    ("halibut_atlantic_raw", "fish_seafood", "raw", "Halibut, Atlantic, raw",
     ["halibut", "atlantic", "raw"], [], ["cooked"]),
    ("sea_bass_raw", "fish_seafood", "raw", "Sea bass, raw",
     ["sea bass", "raw"], [], ["cooked"]),
    ("tilapia_raw", "fish_seafood", "raw", "Tilapia, raw",
     ["tilapia", "raw"], [], ["cooked"]),
    ("haddock_raw", "fish_seafood", "raw", "Haddock, raw",
     ["haddock", "raw"], [], ["cooked", "smoked"]),
    ("shrimp_raw", "fish_seafood", "raw", "Shrimp, raw",
     ["crustaceans", "shrimp", "raw"], [], ["cooked", "canned", "breaded"]),
    ("squid_raw", "fish_seafood", "raw", "Squid, raw",
     ["squid", "raw"], ["mollusks"], ["cooked", "fried"]),
    ("octopus_raw", "fish_seafood", "raw", "Octopus, raw",
     ["octopus", "raw"], [], ["cooked"]),
    ("mussels_raw", "fish_seafood", "raw", "Mussels, raw",
     ["mussel", "raw"], [], ["cooked", "canned"]),
    ("scallops_raw", "fish_seafood", "raw", "Scallops, raw",
     ["scallop", "raw"], [], ["cooked", "breaded", "fried"]),
    ("crab_raw", "fish_seafood", "raw", "Crab, blue, raw",
     ["crab", "blue", "raw"], [], ["cooked", "canned"]),
    ("clams_raw", "fish_seafood", "raw", "Clams, raw",
     ["clam", "raw"], [], ["cooked", "canned"]),

    # Eggs
    ("egg_whole_raw", "eggs", "raw", "Whole egg, raw",
     ["egg", "whole", "raw"], ["fresh"], ["cooked", "dried"]),
    ("egg_white_raw", "eggs", "raw", "Egg white, raw",
     ["egg", "white", "raw"], [], ["cooked", "dried"]),
    ("egg_yolk_raw", "eggs", "raw", "Egg yolk, raw",
     ["egg", "yolk", "raw"], [], ["cooked", "dried"]),

    # Grains (uncooked / dry)
    ("rice_white_uncooked", "grains", "uncooked", "White rice, uncooked",
     ["rice", "white", "raw"], ["long-grain", "unenriched"], ["cooked", "flour", "instant", "parboiled", "glutinous"]),
    ("rice_brown_uncooked", "grains", "uncooked", "Brown rice, uncooked",
     ["rice", "brown", "raw"], ["long-grain"], ["cooked", "flour"]),
    ("oats_dry", "grains", "dry", "Oats, dry",
     ["oats"], ["raw", "regular"], ["cooked", "cereal", "instant"]),
    ("barley_pearled_dry", "grains", "dry", "Barley, pearled, dry",
     ["barley", "pearled"], ["raw"], ["cooked", "flour"]),
    ("quinoa_uncooked", "grains", "uncooked", "Quinoa, uncooked",
     ["quinoa", "uncooked"], [], []),
    ("buckwheat_groats_dry", "grains", "dry", "Buckwheat groats, dry",
     ["buckwheat"], ["groats", "raw"], ["cooked", "flour"]),
    ("millet_raw", "grains", "uncooked", "Millet, uncooked",
     ["millet", "raw"], [], ["cooked", "flour", "puffed"]),
    ("cornmeal_dry", "grains", "dry", "Cornmeal, dry",
     ["cornmeal"], ["whole-grain", "yellow"], ["cooked", "bread"]),
    ("bulgur_dry", "grains", "dry", "Bulgur, dry",
     ["bulgur", "dry"], [], ["cooked"]),
    ("couscous_dry", "grains", "dry", "Couscous, dry",
     ["couscous", "dry"], [], ["cooked"]),
    ("pasta_dry", "grains", "dry", "Pasta, dry",
     ["pasta", "dry", "enriched"], [], ["cooked", "whole", "fresh", "gluten-free"]),
    ("noodles_egg_dry", "grains", "dry", "Egg noodles, dry",
     ["noodles", "egg", "dry"], ["enriched"], ["cooked", "spinach"]),
    ("wheat_flour_whole", "grains", "dry", "Whole-wheat flour, dry",
     ["wheat flour", "whole-grain"], [], ["white", "self-rising", "bread"]),
    ("rye_flour_dry", "grains", "dry", "Rye flour, dry",
     ["rye flour"], ["dark", "medium"], ["bread"]),
    ("amaranth_uncooked", "grains", "uncooked", "Amaranth grain, uncooked",
     ["amaranth grain", "uncooked"], [], ["cooked", "leaves"]),
    ("wild_rice_uncooked", "grains", "uncooked", "Wild rice, uncooked",
     ["wild rice", "raw"], [], ["cooked"]),
    ("spelt_uncooked", "grains", "uncooked", "Spelt, uncooked",
     ["spelt", "uncooked"], [], ["cooked"]),

    # Beans & legumes dry
    ("lentils_dry", "beans_legumes", "dry", "Lentils, dry",
     ["lentils", "raw"], [], ["cooked", "sprouted", "canned"]),
    ("chickpeas_dry", "beans_legumes", "dry", "Chickpeas, dry",
     ["chickpeas", "raw"], ["garbanzo"], ["cooked", "canned", "flour"]),
    ("black_beans_dry", "beans_legumes", "dry", "Black beans, dry",
     ["beans", "black", "mature seeds", "raw"], [], ["cooked", "canned"]),
    ("kidney_beans_dry", "beans_legumes", "dry", "Kidney beans, dry",
     ["beans", "kidney", "raw"], ["all types", "red"], ["cooked", "canned"]),
    ("navy_beans_dry", "beans_legumes", "dry", "Navy beans, dry",
     ["beans", "navy", "raw"], [], ["cooked", "canned"]),
    ("pinto_beans_dry", "beans_legumes", "dry", "Pinto beans, dry",
     ["beans", "pinto", "raw"], [], ["cooked", "canned"]),
    ("soybeans_dry", "beans_legumes", "dry", "Soybeans, dry",
     ["soybeans", "mature seeds", "raw"], [], ["cooked", "roasted", "flour", "oil"]),
    ("green_peas_dry", "beans_legumes", "dry", "Green peas, split, dry",
     ["peas", "split", "raw"], ["green"], ["cooked", "canned"]),
    ("lima_beans_dry", "beans_legumes", "dry", "Lima beans, dry",
     ["lima", "beans", "raw"], ["mature"], ["cooked", "canned"]),
    ("mung_beans_dry", "beans_legumes", "dry", "Mung beans, dry",
     ["mung", "beans", "raw"], [], ["cooked", "sprouted", "canned"]),
    ("adzuki_beans_dry", "beans_legumes", "dry", "Adzuki beans, dry",
     ["adzuki", "beans", "raw"], [], ["cooked", "canned"]),
    ("fava_beans_dry", "beans_legumes", "dry", "Fava beans, dry",
     ["broadbeans", "raw"], ["fava"], ["cooked", "canned"]),
    ("black_eyed_peas_dry", "beans_legumes", "dry", "Black-eyed peas, dry",
     ["cowpeas", "common", "raw"], [], ["cooked", "canned"]),
    ("edamame_raw", "beans_legumes", "raw", "Edamame (soybeans), green, raw",
     ["soybeans", "green", "raw"], [], ["cooked", "canned"]),

    # Vegetables raw
    ("potato_raw", "vegetables", "raw", "Potato, raw",
     ["potato", "raw"], ["flesh and skin"], ["cooked", "flour", "chips"]),
    ("sweet_potato_raw", "vegetables", "raw", "Sweet potato, raw",
     ["sweet potato", "raw"], [], ["cooked", "canned"]),
    ("onion_raw", "vegetables", "raw", "Onion, raw",
     ["onions", "raw"], [], ["cooked", "dehydrated", "powder"]),
    ("carrot_raw", "vegetables", "raw", "Carrot, raw",
     ["carrots", "raw"], [], ["cooked", "canned", "juice", "dehydrated"]),
    ("broccoli_raw", "vegetables", "raw", "Broccoli, raw",
     ["broccoli", "raw"], [], ["cooked", "frozen"]),
    ("spinach_raw", "vegetables", "raw", "Spinach, raw",
     ["spinach", "raw"], [], ["cooked", "canned", "frozen"]),
    ("cabbage_raw", "vegetables", "raw", "Cabbage, raw",
     ["cabbage", "raw"], [], ["cooked", "sauerkraut"]),
    ("tomato_raw", "vegetables", "raw", "Tomato, raw",
     ["tomatoes", "red", "ripe", "raw"], [], ["cooked", "canned", "juice", "sauce", "paste"]),
    ("bell_pepper_raw", "vegetables", "raw", "Bell pepper, raw",
     ["peppers", "sweet", "raw"], ["green", "red", "yellow"], ["cooked", "canned"]),
    ("cucumber_raw", "vegetables", "raw", "Cucumber, raw",
     ["cucumber", "raw"], [], ["pickles"]),
    ("lettuce_iceberg_raw", "vegetables", "raw", "Lettuce, iceberg, raw",
     ["lettuce", "iceberg", "raw"], [], []),
    ("lettuce_romaine_raw", "vegetables", "raw", "Lettuce, romaine, raw",
     ["lettuce", "cos", "romaine", "raw"], [], []),
    ("zucchini_raw", "vegetables", "raw", "Zucchini, raw",
     ["squash", "zucchini", "raw"], [], ["cooked"]),
    ("eggplant_raw", "vegetables", "raw", "Eggplant, raw",
     ["eggplant", "raw"], [], ["cooked", "pickled"]),
    ("cauliflower_raw", "vegetables", "raw", "Cauliflower, raw",
     ["cauliflower", "raw"], [], ["cooked", "frozen"]),
    ("pumpkin_raw", "vegetables", "raw", "Pumpkin, raw",
     ["pumpkin", "raw"], [], ["cooked", "canned", "pie"]),
    ("mushroom_white_raw", "vegetables", "raw", "Mushrooms, white, raw",
     ["mushrooms", "white", "raw"], [], ["cooked", "canned"]),
    ("asparagus_raw", "vegetables", "raw", "Asparagus, raw",
     ["asparagus", "raw"], [], ["cooked", "canned"]),
    ("green_beans_raw", "vegetables", "raw", "Green beans, raw",
     ["beans", "snap", "green", "raw"], [], ["cooked", "canned"]),
    ("corn_sweet_raw", "vegetables", "raw", "Sweet corn, raw",
     ["corn", "sweet", "raw"], [], ["cooked", "canned", "cream"]),
    ("garlic_raw", "vegetables", "raw", "Garlic, raw",
     ["garlic", "raw"], [], ["powder", "salt"]),
    ("ginger_raw", "vegetables", "raw", "Ginger root, raw",
     ["ginger root", "raw"], [], []),
    ("celery_raw", "vegetables", "raw", "Celery, raw",
     ["celery", "raw"], [], ["cooked", "juice"]),
    ("beet_raw", "vegetables", "raw", "Beet, raw",
     ["beets", "raw"], [], ["cooked", "canned", "pickled"]),
    ("radish_raw", "vegetables", "raw", "Radish, raw",
     ["radishes", "raw"], [], []),
    ("kale_raw", "vegetables", "raw", "Kale, raw",
     ["kale", "raw"], [], ["cooked"]),
    ("brussels_sprouts_raw", "vegetables", "raw", "Brussels sprouts, raw",
     ["brussels sprouts", "raw"], [], ["cooked"]),
    ("leek_raw", "vegetables", "raw", "Leek, raw",
     ["leeks", "raw"], [], ["cooked"]),
    ("turnip_raw", "vegetables", "raw", "Turnip, raw",
     ["turnips", "raw"], [], ["cooked"]),
    ("parsnip_raw", "vegetables", "raw", "Parsnip, raw",
     ["parsnips", "raw"], [], ["cooked"]),
    ("artichoke_raw", "vegetables", "raw", "Artichoke, raw",
     ["artichokes", "raw"], ["globe"], ["cooked", "canned", "marinated"]),
    ("okra_raw", "vegetables", "raw", "Okra, raw",
     ["okra", "raw"], [], ["cooked", "frozen"]),

    # Fruits raw
    ("apple_raw", "fruits", "raw", "Apple, raw",
     ["apples", "raw"], ["with skin"], ["dried", "juice", "sauce", "canned"]),
    ("banana_raw", "fruits", "raw", "Banana, raw",
     ["bananas", "raw"], [], ["dehydrated", "chips"]),
    ("orange_raw", "fruits", "raw", "Orange, raw",
     ["oranges", "raw"], ["all commercial"], ["juice", "peel"]),
    ("tangerine_raw", "fruits", "raw", "Tangerine / mandarin, raw",
     ["tangerines", "raw"], ["mandarin"], ["juice", "canned"]),
    ("strawberry_raw", "fruits", "raw", "Strawberry, raw",
     ["strawberries", "raw"], [], ["frozen", "canned"]),
    ("blueberry_raw", "fruits", "raw", "Blueberry, raw",
     ["blueberries", "raw"], [], ["frozen", "canned", "dried"]),
    ("raspberry_raw", "fruits", "raw", "Raspberry, raw",
     ["raspberries", "raw"], [], ["frozen", "canned"]),
    ("grapes_raw", "fruits", "raw", "Grapes, raw",
     ["grapes", "raw"], ["american", "red or green"], ["juice", "raisins"]),
    ("mango_raw", "fruits", "raw", "Mango, raw",
     ["mangos", "raw"], [], ["dried", "nectar"]),
    ("pineapple_raw", "fruits", "raw", "Pineapple, raw",
     ["pineapple", "raw"], ["all varieties"], ["canned", "juice"]),
    ("kiwi_raw", "fruits", "raw", "Kiwi, raw",
     ["kiwifruit", "raw"], [], []),
    ("watermelon_raw", "fruits", "raw", "Watermelon, raw",
     ["watermelon", "raw"], [], ["juice"]),
    ("cantaloupe_raw", "fruits", "raw", "Cantaloupe, raw",
     ["melons", "cantaloupe", "raw"], [], []),
    ("honeydew_raw", "fruits", "raw", "Honeydew melon, raw",
     ["melons", "honeydew", "raw"], [], []),
    ("peach_raw", "fruits", "raw", "Peach, raw",
     ["peaches", "raw"], [], ["canned", "dried", "frozen"]),
    ("pear_raw", "fruits", "raw", "Pear, raw",
     ["pears", "raw"], [], ["canned", "dried", "juice"]),
    ("plum_raw", "fruits", "raw", "Plum, raw",
     ["plums", "raw"], [], ["dried", "canned"]),
    ("cherry_raw", "fruits", "raw", "Cherry, raw",
     ["cherries", "raw"], ["sweet"], ["canned", "frozen", "juice"]),
    ("avocado_raw", "fruits", "raw", "Avocado, raw",
     ["avocados", "raw"], ["all commercial"], []),
    ("lemon_raw", "fruits", "raw", "Lemon, raw",
     ["lemons", "raw", "without peel"], [], ["juice", "peel only"]),
    ("lime_raw", "fruits", "raw", "Lime, raw",
     ["limes", "raw"], [], ["juice"]),
    ("grapefruit_raw", "fruits", "raw", "Grapefruit, raw",
     ["grapefruit", "raw"], [], ["juice", "canned"]),
    ("papaya_raw", "fruits", "raw", "Papaya, raw",
     ["papayas", "raw"], [], []),
    ("pomegranate_raw", "fruits", "raw", "Pomegranate, raw",
     ["pomegranates", "raw"], [], ["juice"]),
    ("fig_raw", "fruits", "raw", "Fig, raw",
     ["figs", "raw"], [], ["dried", "canned"]),
    ("apricot_raw", "fruits", "raw", "Apricot, raw",
     ["apricots", "raw"], [], ["dried", "canned"]),
    ("blackberry_raw", "fruits", "raw", "Blackberry, raw",
     ["blackberries", "raw"], [], ["canned", "frozen"]),

    # Nuts & seeds
    ("almonds_raw", "nuts_seeds", "raw", "Almonds, raw",
     ["nuts", "almonds"], [], ["oil", "butter", "roasted", "blanched", "honey", "chocolate"]),
    ("walnuts_raw", "nuts_seeds", "raw", "Walnuts, raw",
     ["nuts", "walnuts", "english"], [], ["oil", "roasted"]),
    ("cashews_raw", "nuts_seeds", "raw", "Cashews, raw",
     ["nuts", "cashew", "raw"], [], ["oil", "roasted", "dry roasted"]),
    ("pistachios_raw", "nuts_seeds", "raw", "Pistachios, raw",
     ["nuts", "pistachio", "raw"], [], ["roasted", "dry roasted", "salted"]),
    ("peanuts_raw", "nuts_seeds", "raw", "Peanuts, raw",
     ["peanuts", "all types", "raw"], [], ["oil", "roasted", "butter", "boiled", "flour"]),
    ("hazelnuts_raw", "nuts_seeds", "raw", "Hazelnuts, raw",
     ["nuts", "hazelnuts", "filberts"], [], ["oil", "roasted", "blanched"]),
    ("brazil_nuts_raw", "nuts_seeds", "raw", "Brazil nuts, raw",
     ["nuts", "brazilnuts", "dried"], [], ["oil"]),
    ("pecans_raw", "nuts_seeds", "raw", "Pecans, raw",
     ["nuts", "pecans"], [], ["oil", "roasted", "dry roasted", "sugar"]),
    ("macadamia_raw", "nuts_seeds", "raw", "Macadamia nuts, raw",
     ["nuts", "macadamia", "raw"], [], ["oil", "roasted", "dry roasted"]),
    ("chia_seeds_dry", "nuts_seeds", "dry", "Chia seeds, dry",
     ["seeds", "chia", "dried"], [], []),
    ("flax_seeds_dry", "nuts_seeds", "dry", "Flax seeds, dry",
     ["seeds", "flaxseed"], [], ["oil", "meal"]),
    ("pumpkin_seeds_dry", "nuts_seeds", "dry", "Pumpkin seeds, dry",
     ["seeds", "pumpkin and squash seed kernels", "dried"], [], ["roasted"]),
    ("sunflower_seeds_dry", "nuts_seeds", "dry", "Sunflower seeds, dry",
     ["seeds", "sunflower", "dried"], [], ["oil", "roasted", "butter"]),
    ("sesame_seeds_dry", "nuts_seeds", "dry", "Sesame seeds, dry",
     ["seeds", "sesame", "dried"], ["whole"], ["oil", "tahini", "flour", "toasted"]),
]


def nutrient_map(food: dict) -> dict[str, float | None]:
    out = {k: None for k in NUTRIENT_NUMBERS}
    for entry in food.get("foodNutrients") or []:
        nut = entry.get("nutrient") or {}
        number = str(nut.get("number") or "")
        amount = entry.get("amount")
        for key, num in NUTRIENT_NUMBERS.items():
            if number == num and amount is not None:
                out[key] = float(amount)
    return out


def score_candidate(desc: str, must: list[str], prefer: list[str], reject: list[str]) -> float | None:
    d = desc.lower()
    # Hard reject prepared/cooked forms (word boundaries — do not match "uncooked").
    if re.search(r"\b(cooked|roasted|baked|boiled|fried|grilled|canned|smoked)\b", d):
        return None
    if COOKED_OR_EXCLUDED.search(d) and not RAWISH.search(d):
        if "dried" in d and any(x in d for x in ("nuts", "seeds", "beans", "peas", "lentil")):
            pass
        else:
            return None
    for token in must:
        if token.lower() not in d:
            return None
    for token in reject:
        # Word-boundary reject so "cooked" does not kill "uncooked".
        if not re.search(rf"\b{re.escape(token.lower())}\b", d):
            continue
        return None
    score = 10.0
    for token in prefer:
        if token.lower() in d:
            score += 3.0
    # Prefer shorter / more generic descriptions
    score -= len(d) / 200.0
    if re.search(r"\braw\b", d):
        score += 2.0
    if re.search(r"\b(uncooked|dry|dried)\b", d):
        score += 1.5
    return score


def pick_food(foods: list[dict], must, prefer, reject):
    best = None
    best_score = None
    for food in foods:
        desc = food.get("description") or ""
        s = score_candidate(desc, must, prefer, reject)
        if s is None:
            continue
        if best_score is None or s > best_score:
            best = food
            best_score = s
    return best, best_score


def round_macro(v: float | None) -> float | None:
    if v is None:
        return None
    return round(v, 1)


def main() -> None:
    if not SOURCE_JSON.exists():
        raise SystemExit(f"Missing USDA source: {SOURCE_JSON}")

    with SOURCE_JSON.open() as fh:
        foods = json.load(fh)["SRLegacyFoods"]

    items = []
    report = {"matched": [], "missing": [], "source": "USDA FoodData Central SR Legacy April 2018"}
    used_fdc = set()

    for slug, category, state, display, must, prefer, reject in SPECS:
        food, score = pick_food(foods, must, prefer, reject)
        if not food:
            report["missing"].append({"id": slug, "display": display, "must": must})
            continue
        nuts = nutrient_map(food)
        if nuts["calories"] is None:
            report["missing"].append({"id": slug, "display": display, "reason": "no energy kcal"})
            continue
        fdc_id = int(food["fdcId"])
        if fdc_id in used_fdc:
            # Allow intentional skips if duplicate - try next best by excluding this fdc
            # For now skip duplicate fdc
            report["missing"].append({"id": slug, "display": display, "reason": f"duplicate fdc {fdc_id}"})
            continue
        used_fdc.add(fdc_id)
        item = {
            "id": f"ref_{slug}",
            "name": f"{display} — per 100 g",
            "displayName": display,
            "category": category,
            "state": state,
            "servingBasis": "per_100g",
            "calories": round(nuts["calories"]),
            "protein": round_macro(nuts["protein"]) if nuts["protein"] is not None else 0.0,
            "carbs": round_macro(nuts["carbs"]) if nuts["carbs"] is not None else 0.0,
            "fat": round_macro(nuts["fat"]) if nuts["fat"] is not None else 0.0,
            "fdcId": fdc_id,
            "usdaDescription": food["description"],
            "source": "sr_legacy",
            "sourceVersion": "2018-04",
            "dataType": food.get("dataType") or "SR Legacy",
        }
        items.append(item)
        report["matched"].append(
            {
                "id": item["id"],
                "fdcId": fdc_id,
                "usdaDescription": food["description"],
                "score": score,
            }
        )

    dataset = {
        "format": "quickcal-reference-foods",
        "version": 1,
        "source": {
            "name": "USDA FoodData Central",
            "dataType": "SR Legacy",
            "release": "2018-04",
            "license": "CC0 1.0 Universal (public domain)",
            "url": "https://fdc.nal.usda.gov/",
            "attribution": (
                "U.S. Department of Agriculture, Agricultural Research Service. "
                "FoodData Central, 2018. https://fdc.nal.usda.gov/."
            ),
        },
        "itemCount": len(items),
        "items": items,
    }

    OUT_JSON.parent.mkdir(parents=True, exist_ok=True)
    OUT_JSON.write_text(json.dumps(dataset, indent=2) + "\n")
    REPORT_JSON.write_text(json.dumps(report, indent=2) + "\n")
    print(f"Wrote {len(items)} items -> {OUT_JSON}")
    print(f"Missing: {len(report['missing'])}")
    for m in report["missing"][:30]:
        print("  missing:", m)


if __name__ == "__main__":
    main()
