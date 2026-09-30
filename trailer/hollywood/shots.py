"""Shot list for "PARCEL A" — the Hollywood cut.

Every shot is generated as video (text-to-video), with a narrator line and, where the
story has one, an on-screen year. Story beats follow greathousefarmwiki.wordpress.com:
each attempt to make Mary's occupation permissive is met by her assertion of ownership,
year by year, until 1974 — a licence she never accepted, later ruled to bind her
"whether or not she accepted" it.

Fields: id, secs, year (on-screen title or ""), vo (narration, "" for none),
prompt (video model), label (evidence key shown small in the corner).
"""

STYLE = ("cinematic movie trailer shot, anamorphic 35mm film, shallow depth of field, "
         "teal and amber colour grade, dramatic lighting, film grain, high detail")
NEG = ("text, captions, subtitles, watermark, logo, cartoon, anime, low quality, blurry, "
       "distorted faces, extra limbs, deformed hands, jpeg artifacts")

SHOTS = [
    # --- ACT ONE: the promise
    dict(id="01_valley", secs=6, year="", label="",
         vo="Some families build their homes. Some inherit them.",
         prompt="aerial drone shot at dawn over green Welsh hills and a small stone village with a medieval "
                "church, mist in the valley, slow push forward"),
    dict(id="02_farmhouse", secs=5, year="", label="FAMILY ACCOUNT",
         vo="For nine generations, the Williams family held Tŷ Mawr. The Great House.",
         prompt="old whitewashed stone Welsh farmhouse with slate roof and chimneys, stone walls and "
                "barns, golden hour, slow dolly in, swallows flying"),
    dict(id="03_quarry", secs=5, year="1877", label="FAMILY ACCOUNT",
         vo="Eighteen seventy-seven. The land is sold for a quarry — with a promise.",
         prompt="Victorian era limestone quarry, workers with pickaxes and horse-drawn carts, dust in "
                "sunbeams, 1870s, sepia tint, slow pan"),
    dict(id="04_handshake", secs=4, year="", label="FAMILY ACCOUNT",
         vo="When the quarrying stops, the house comes back to the family.",
         prompt="close-up of two Victorian men shaking hands over a desk with an ink quill and a wax-sealed "
                "deed, candlelight, 1870s office"),
    dict(id="05_silence", secs=5, year="1928", label="CONTENTION",
         vo="Nineteen twenty-eight. The last machine leaves. The rent on the house stops. It is theirs.",
         prompt="an old rusted quarry crane being dismantled and hauled away on a lorry, 1920s, dusk, "
                "dust settling over an empty quarry, melancholy"),
    # --- ACT TWO: the ambushes
    dict(id="06_boardroom", secs=5, year="", label="",
         vo="But next door, the landlord of the fields had other plans.",
         prompt="dark 1950s boardroom, men in suits around a long table smoking, venetian blind shadows "
                "across their faces, one man slides a map across the table, low angle, sinister"),
    dict(id="07_hospital", secs=5, year="1955", label="FAMILY ACCOUNT",
         vo="Nineteen fifty-five. Mary comes home from hospital. She has lost a leg.",
         prompt="1950s Welsh farmhouse kitchen, a determined middle-aged woman in a wheelchair with a blanket "
                "over her lap looks out of the window, rain on the glass, cold light"),
    dict(id="08_bailiffs", secs=5, year="1955", label="RECORD",
         vo="They come to take back their fields. Then they turn to her house.",
         prompt="1950s bailiffs in long coats and hats marching across a muddy farm field towards a stone "
                "farmhouse in the rain, tracking shot, ominous"),
    dict(id="09_door1", secs=4, year="", label="RECORD",
         vo="She stops them at the door.",
         prompt="a woman in a wheelchair blocks the open front door of a stone farmhouse, facing men in "
                "long coats on the doorstep, rain, backlit, defiant, low angle"),
    dict(id="10_offer1959", secs=5, year="1959", label="RECORD",
         vo="Nineteen fifty-nine. A tenancy — of her own home.",
         prompt="a man in a grey 1950s suit and hat hands an envelope across a farmhouse table to a woman in "
                "a wheelchair, tense silence, clock ticking on the wall, warm lamp light"),
    dict(id="11_refuse1959", secs=4, year="", label="RECORD",
         vo="Her answer: I own this house. My grandfather's papers prove it.",
         prompt="close-up of a determined older Welsh woman pushing an envelope back across a wooden table, "
                "firm expression, dramatic side light"),
    dict(id="12_court1962", secs=5, year="1962", label="RECORD",
         vo="Nineteen sixty-two. They take her to court.",
         prompt="1960s British county courtroom, wood panelling, a judge in a wig bangs a gavel, dust in the "
                "light from tall windows, slow push in"),
    dict(id="13_unenforced", secs=4, year="", label="RECORD",
         vo="An order is made. It is never enforced. She stays.",
         prompt="a stone farmhouse at night with warm lights in the windows, rain, a car with headlights "
                "slowly drives away down the lane, wide shot"),
    dict(id="14_offer1965", secs=5, year="1965", label="RECORD",
         vo="Nineteen sixty-five. Two pounds a week, to rent the house she owns.",
         prompt="a typed letter and a pen left on a farmhouse table beside a cup of tea, a woman's hand "
                "pushes the pen away, 1960s, close-up, shallow focus"),
    dict(id="15_unsigned", secs=4, year="", label="RECORD",
         vo="Never signed. Not a penny paid.",
         prompt="an older woman in a wheelchair drops an unsigned letter into a crackling fireplace, the "
                "paper curls in the flames, 1960s farmhouse interior"),
    dict(id="16_sold1969", secs=5, year="1969", label="RECORD · CONTENTION",
         vo="Nineteen sixty-nine. They sell the land on — her house included — as if it were theirs to sell.",
         prompt="close-up of fountain pens signing a thick legal conveyance in a London office, 1960s, "
                "men in suits, cigar smoke, corporate, cold light"),
    dict(id="17_newspaper", secs=6, year="1974", label="RECORD",
         vo="Nineteen seventy-four. Another court action. She goes to the press: I will refuse to move.",
         prompt="vintage 1970s printing press spinning out newspapers, fast cuts, then a woman in a "
                "wheelchair reading a newspaper in front of her farmhouse, crowds of visitors"),
    dict(id="18_adjourned", secs=5, year="", label="FAMILY ACCOUNT",
         vo="The case is shelved. Her ownership is never decided.",
         prompt="a court clerk closes a thick file and ties it with red ribbon, puts it on a high dusty "
                "shelf of archive boxes, 1970s, slow motion, dim light"),
    # --- THE GOTCHA
    dict(id="19_letter", secs=6, year="31.10.1974", label="RECORD",
         vo="Then — a letter. You may stay. Under licence.",
         prompt="extreme close-up of a typewriter hammering letters onto paper in a dark 1970s corporate "
                "office, then the letter is sealed in an envelope, ominous, shallow focus"),
    dict(id="20_postbox", secs=4, year="", label="RECORD",
         vo="",
         prompt="a letter drops through the brass letterbox of an old wooden farmhouse door and lands on a "
                "stone floor, slow motion, dramatic light"),
    dict(id="21_rejects", secs=5, year="", label="RECORD · FAMILY ACCOUNT",
         vo="She never accepts it. She writes back. She tells the world the house is hers.",
         prompt="an older woman in a wheelchair writing a letter by lamplight with a fountain pen, determined, "
                "night, rain against the window, 1970s farmhouse"),
    dict(id="22_trap", secs=6, year="", label="CONTENTION",
         vo="But it was never an offer. It was a trap.",
         prompt="slow motion close-up of a steel bear trap snapping shut on fallen autumn leaves, dark forest "
                "floor, dramatic, metaphorical"),
    # --- ACT THREE: the fall
    dict(id="23_register", secs=5, year="1982", label="RECORD · FAMILY ACCOUNT",
         vo="Nineteen eighty-two. They register her land in their name. She is living in it. No one tells her.",
         prompt="1980s government registry office, a clerk stamps a document with a heavy rubber stamp, "
                "rows of filing cabinets, fluorescent light, cold and bureaucratic"),
    dict(id="24_candle", secs=5, year="14.03.1983", label="RECORD",
         vo="Nineteen days after the last application, Mary dies. Her claim, never heard.",
         prompt="a single candle burning out on a windowsill of an old farmhouse at night, the flame "
                "flickers and goes out, smoke curls, rain outside"),
    dict(id="25_verdict", secs=6, year="1987", label="RECORD",
         vo="Nineteen eighty-seven. The Court of Appeal rules the letters made her a licensee — "
            "whether or not she accepted them.",
         prompt="Royal Courts of Justice London, three appeal judges in wigs behind a high bench, low angle, "
                "gothic hall, stern, slow push in, 1980s"),
    dict(id="26_eviction", secs=5, year="29.11.1988", label="RECORD",
         vo="",
         prompt="dawn raid on a stone farmhouse, police vans and officers surround the house, flashing blue "
                "lights in fog, 1980s Britain, handheld camera, tense"),
    dict(id="27_bulldozer", secs=5, year="06.12.1988", label="RECORD",
         vo="They took the house.",
         prompt="a yellow bulldozer smashes through the stone wall of an old farmhouse, dust and rubble "
                "explode in slow motion, 1980s, grey winter light"),
    dict(id="28_title", secs=5, year="", label="CONTENTION",
         vo="They never took her title.",
         prompt="an old leather-bound deed box opened in a beam of light in a dark archive, dust particles "
                "floating, slow push in, mysterious, hopeful"),
    dict(id="29_family", secs=5, year="TODAY", label="RECORD",
         vo="Now her family has the documents. And every ploy left a paper trail.",
         prompt="a young man in a dark room surrounded by walls covered with old documents, maps and red "
                "string, lit by a desk lamp, investigating, determined, slow orbit"),
]

TITLE = "PARCEL A"
TAGLINE = "SHE NEVER SAID YES."
TITLE_VO = "Parcel A. She never said yes."
END_LINES = [
    "greathousefarmwiki.wordpress.com",
    "A dramatisation based on the public record and the family's account.",
    "FAMILY ACCOUNT and CONTENTION items are the family's case and have not been proved in court.",
    "BP Properties Ltd v Buckler [1987] EWCA Civ 2 was decided in BP's favour and remains binding.",
]


# Sharper prompts for shots whose first render missed the brief (subject first, short enough for CLIP).
PROMPT_OVERRIDES = {
    "04_handshake": "two Victorian men in frock coats shaking hands across a wooden desk, rolled deed with red "
                    "wax seal on the desk, candlelight, 1870s office",
    "09_door1": "view from inside a dark farmhouse doorway: three men in long dark overcoats and hats stand "
                "outside on the doorstep in rain, menacing, low angle",
    "10_offer1959": "close-up of a man's hand in a grey suit sleeve sliding a white envelope across a wooden "
                    "table towards a woman's hands resting on a tartan blanket, tense, clock on the wall",
    "12_court1962": "1960s courtroom, elderly judge in a white wig and red robe at the high bench, gavel, "
                    "wood panelling, dust in window light",
    "20_postbox": "brass letterbox in an old wooden front door, a white envelope falling through onto a stone "
                  "floor, close-up, slow motion, dramatic light",
    "22_trap": "extreme close-up of a heavy rusty iron padlock hanging on a chain on an old weathered wooden gate, "
               "macro, dramatic light",
    "28_title": "old leather-bound deed box with its lid open on a desk in a dark archive, beam of light falling "
                "on old documents inside, dust particles, close-up",
}
for _s in SHOTS:
    if _s["id"] in PROMPT_OVERRIDES:
        _s["prompt"] = PROMPT_OVERRIDES[_s["id"]]
