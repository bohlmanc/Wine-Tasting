export const WINE_COUNTRIES = [
  'France', 'Italy', 'Spain', 'Portugal', 'United States', 'Argentina',
  'Chile', 'Australia', 'New Zealand', 'Germany', 'Austria', 'South Africa',
  'Greece', 'Hungary', 'Croatia', 'Slovenia', 'Georgia', 'Israel',
  'Canada', 'Uruguay', 'Switzerland', 'Other',
];

export const WINE_REGION_DATA: Record<string, Record<string, string[]>> = {
  France: {
    'Alsace': ['Alsace Grand Cru'],
    'Beaujolais': [
      'Beaujolais-Villages', 'Brouilly', 'Chénas', 'Chiroubles', 'Côte de Brouilly',
      'Fleurie', 'Juliénas', 'Morgon', 'Moulin-à-Vent', 'Régnié', 'Saint-Amour',
    ],
    'Bordeaux': [
      'Barsac', 'Blaye', 'Bourg', 'Cadillac', 'Canon-Fronsac', 'Entre-Deux-Mers',
      'Fronsac', 'Graves', 'Haut-Médoc', 'Lalande-de-Pomerol', 'Listrac-Médoc',
      'Loupiac', 'Margaux', 'Médoc', 'Moulis-en-Médoc', 'Pauillac', 'Pessac-Léognan',
      'Pomerol', 'Puisseguin-Saint-Émilion', 'Saint-Émilion', 'Saint-Estèphe',
      'Saint-Julien', 'Sainte-Croix-du-Mont', 'Sauternes',
    ],
    'Burgundy': [
      'Chablis', 'Chambertin', 'Chambolle-Musigny', 'Chassagne-Montrachet', 'Corton',
      'Côte Chalonnaise', 'Côte de Beaune', 'Côte de Nuits', "Côte d'Or",
      'Gevrey-Chambertin', 'Givry', 'Mâcon', 'Mâconnais', 'Mercurey', 'Meursault',
      'Montagny', 'Montrachet', 'Morey-Saint-Denis', 'Nuits-Saint-Georges', 'Pommard',
      'Pouilly-Fuissé', 'Puligny-Montrachet', 'Rully', 'Saint-Aubin', 'Saint-Véran',
      'Santenay', 'Volnay', 'Vosne-Romanée', 'Vougeot',
    ],
    'Champagne': ['Côte des Blancs', 'Montagne de Reims', 'Vallée de la Marne'],
    'Corsica': ['Ajaccio', 'Patrimonio'],
    'Jura': ['Arbois', 'Château-Chalon', 'Crémant du Jura', "L'Étoile"],
    'Languedoc': [
      'Clairette du Languedoc', 'Corbières', 'Costières de Nîmes', 'Coteaux du Languedoc',
      'Faugères', 'Fitou', 'Limoux', 'Minervois', 'Muscat de Frontignan',
      'Pic Saint-Loup', 'Picpoul de Pinet', 'Saint-Chinian', 'Terrasses du Larzac',
    ],
    'Loire Valley': [
      'Anjou', 'Bonnezeaux', 'Bourgueil', 'Chinon', "Côteaux d'Ancenis",
      'Côteaux du Layon', 'Crémant de Loire', 'Fiefs Vendéens', 'Jasnières',
      'Menetou-Salon', 'Montlouis-sur-Loire', 'Muscadet', 'Muscadet Sèvre et Maine',
      'Pouilly-Fumé', 'Pouilly-sur-Loire', 'Quarts de Chaume', 'Quincy', 'Reuilly',
      'Sancerre', 'Saumur', 'Saumur-Champigny', 'Savennières', 'Touraine', 'Vouvray',
    ],
    'Provence': [
      'Bandol', 'Baux-de-Provence', 'Cassis', "Coteaux d'Aix-en-Provence",
      'Coteaux Varois en Provence', 'Côtes de Provence', 'Palette',
    ],
    'Rhône Valley': [
      'Châteauneuf-du-Pape', 'Condrieu', 'Cornas', 'Côte-Rôtie', 'Côtes du Rhône',
      'Côtes du Rhône Villages', 'Crozes-Hermitage', 'Gigondas', 'Hermitage', 'Lirac',
      'Luberon', 'Rasteau', 'Saint-Joseph', 'Saint-Péray', 'Tavel', 'Vacqueyras',
      'Ventoux', 'Vinsobres',
    ],
    'Roussillon': ['Banyuls', 'Maury', 'Muscat de Rivesaltes', 'Rivesaltes'],
    'Savoie': ['Bugey'],
    'Southwest France': [
      'Bergerac', 'Buzet', 'Cahors', 'Fronton', 'Gaillac', 'Irouléguy', 'Jurançon',
      'Madiran', 'Marcillac', 'Monbazillac', 'Pacherenc du Vic-Bilh', 'Pécharmant',
    ],
  },
  Italy: {
    'Abruzzo': ["Montepulciano d'Abruzzo", "Trebbiano d'Abruzzo"],
    'Basilicata': ['Aglianico del Vulture'],
    'Calabria': ['Cirò'],
    'Campania': ['Falanghina del Sannio', 'Fiano di Avellino', 'Greco di Tufo', 'Taurasi'],
    'Emilia-Romagna': ['Albana di Romagna', 'Colli Bolognesi', 'Lambrusco', 'Sangiovese di Romagna'],
    'Friuli-Venezia Giulia': ['Carso', 'Colli Orientali del Friuli', 'Collio', 'Grave del Friuli', 'Isonzo'],
    'Lazio': ['Cesanese', 'Est! Est!! Est!!!', 'Frascati'],
    'Lombardy': ['Franciacorta', 'Lugana', 'Oltrepò Pavese', 'Sforzato di Valtellina', 'Valtellina'],
    'Marche': [
      "Lacrima di Morro d'Alba", 'Rosso Conero', 'Rosso Piceno',
      'Verdicchio dei Castelli di Jesi', 'Verdicchio di Matelica',
    ],
    'Piedmont': [
      'Asti', 'Barbaresco', "Barbera d'Alba", "Barbera d'Asti", 'Barolo',
      "Brachetto d'Acqui", 'Carema', "Dolcetto d'Alba", 'Erbaluce di Caluso',
      'Gattinara', 'Gavi', 'Ghemme', 'Langhe', 'Loazzolo', 'Monferrato',
      "Moscato d'Asti", 'Roero', 'Ruché di Castagnole Monferrato',
    ],
    'Puglia': ['Castel del Monte', 'Locorotondo', 'Negroamaro', 'Primitivo di Manduria', 'Salice Salentino'],
    'Sardinia': ['Cannonau di Sardegna', 'Vermentino di Gallura', 'Vermentino di Sardegna'],
    'Sicily': ['Cerasuolo di Vittoria', 'Etna', 'Marsala', "Nero d'Avola", 'Pantelleria', 'Passito di Pantelleria'],
    'Trentino-Alto Adige': ['Alto Adige', 'South Tyrol', 'Südtirol', 'Trentino'],
    'Tuscany': [
      'Bolgheri', 'Brunello di Montalcino', 'Carmignano', 'Chianti', 'Chianti Classico',
      'Maremma', 'Montecucco', 'Morellino di Scansano', 'Orcia', 'Rosso di Montalcino',
      'Rosso di Montepulciano', 'Vernaccia di San Gimignano', 'Vino Nobile di Montepulciano',
    ],
    'Umbria': ['Montefalco', 'Orvieto', 'Sagrantino di Montefalco', 'Torgiano'],
    'Veneto': [
      'Amarone della Valpolicella', 'Bardolino', 'Bianco di Custoza', 'Colli Euganei',
      'Gambellara', 'Prosecco', 'Recioto della Valpolicella', 'Recioto di Soave',
      'Soave', 'Soave Classico', 'Valpolicella', 'Valpolicella Ripasso',
    ],
  },
  Spain: {
    'Andalucia': ['Condado de Huelva', 'Jerez', 'Málaga', 'Manzanilla', 'Montilla-Moriles', 'Sherry', 'Sierras de Málaga'],
    'Aragon': ['Calatayud', 'Campo de Borja', 'Cariñena', 'Somontano'],
    'Balearic Islands': ['Binissalem'],
    'Basque Country': ['Getariako Txakolina', 'Txakoli'],
    'Castile and León': ['Arribes', 'Bierzo', 'Cigales', 'Ribera del Duero', 'Rueda', 'Sierra de Salamanca', 'Tierra de León', 'Toro'],
    'Castile-La Mancha': ['Almansa', 'La Mancha', 'Manchuela', 'Mentrida', 'Utiel-Requena', 'Valdepeñas'],
    'Catalonia': ['Alella', 'Cava', 'Conca de Barberà', 'Costers del Segre', 'Empordà', 'Montsant', 'Penedès', 'Pla de Bages', 'Priorat', 'Terra Alta'],
    'Galicia': ['Monterrei', 'Rías Baixas', 'Ribeira Sacra', 'Ribeiro', 'Valdeorras'],
    'Murcia': ['Bullas', 'Jumilla', 'Yecla'],
    'Navarra': [],
    'Rioja': ['Rioja Alavesa', 'Rioja Alta', 'Rioja Oriental'],
    'Valencia': ['Alicante', 'Valencia'],
  },
  Portugal: {
    'Açores': ['Biscoitos', 'Graciosa', 'Pico'],
    'Alentejo': ['Borba', 'Évora', 'Granja-Amareleja', 'Moura', 'Portalegre', 'Redondo', 'Reguengos', 'Vidigueira'],
    'Algarve': ['Lagos', 'Portimão'],
    'Bairrada': [],
    'Beiras': ['Beira Interior', 'Cova da Beira', 'Lafões', 'Távora-Varosa'],
    'Dão': [],
    'Douro': ['Porto', 'Port'],
    'Lisboa': ['Alenquer', 'Arruda', 'Bucelas', 'Carcavelos', 'Colares', 'Lourinhã', 'Óbidos', 'Torres Vedras'],
    'Madeira': [],
    'Minho': [],
    'Setúbal': ['Palmela'],
    'Tejo': [],
    'Trás-os-Montes': [],
    'Vinho Verde': ['Amarante', 'Ave', 'Baião', 'Basto', 'Lima', 'Monção e Melgaço', 'Paiva', 'Sousa'],
  },
  'United States': {
    'Alabama': [],
    'Alaska': [],
    'Arizona': [],
    'Arkansas': [],
    'California': [
      'Alexander Valley', 'Anderson Valley', 'Arroyo Grande Valley', 'Arroyo Seco',
      'Atlas Peak', 'Ballard Canyon', 'Bennett Valley', 'Carneros', 'Central Coast',
      'Chalk Hill', 'Chiles Valley', 'Clarksburg', 'Coombsville', 'Diamond Mountain District',
      'Dry Creek Valley', 'Edna Valley', 'El Dorado', 'Fountaingrove District',
      'Green Valley of Russian River Valley', 'Happy Canyon', 'Howell Mountain',
      'Knights Valley', 'Livermore Valley', 'Lodi', 'Los Carneros', 'Los Olivos District',
      'Mendocino', 'Mendocino Ridge', 'Monterey', 'Moon Mountain District', 'Mount Veeder',
      'Napa Valley', 'North Coast', 'Oak Knoll District', 'Oakville', 'Paso Robles',
      'Petaluma Gap', 'Redwood Valley', 'Rockpile', 'Russian River Valley', 'Rutherford',
      'Santa Barbara', 'Santa Clara Valley', 'Santa Cruz Mountains', 'Santa Lucia Highlands',
      'Santa Maria Valley', 'Santa Rita Hills', 'Santa Ynez Valley', 'Sierra Foothills',
      'Sonoma', 'Sonoma Coast', 'Sonoma Valley', 'Spring Mountain District', 'Sta. Rita Hills',
      'Stags Leap District', 'St. Helena', 'Temecula Valley', 'Yorkville Highlands', 'Yountville',
    ],
    'Colorado': [],
    'Connecticut': [],
    'Delaware': [],
    'Florida': [],
    'Hawaii': [],
    'Idaho': [],
    'Illinois': [],
    'Indiana': [],
    'Iowa': [],
    'Kansas': [],
    'Kentucky': [],
    'Louisiana': [],
    'Maine': [],
    'Maryland': [],
    'Massachusetts': [],
    'Michigan': ['Leelanau Peninsula', 'Old Mission Peninsula'],
    'Minnesota': [],
    'Mississippi': [],
    'Missouri': [],
    'Montana': [],
    'Nebraska': [],
    'Nevada': [],
    'New Hampshire': [],
    'New Jersey': [],
    'New Mexico': [],
    'New York': [
      'Cayuga Lake', 'Finger Lakes', 'Hudson River Region', 'Keuka Lake',
      'Lake Erie', 'Long Island', 'Niagara Escarpment', 'North Fork of Long Island',
      'Seneca Lake', 'The Hamptons',
    ],
    'North Carolina': [],
    'North Dakota': [],
    'Ohio': [],
    'Oklahoma': [],
    'Oregon': [
      'Applegate Valley', 'Columbia Gorge', 'Dundee Hills', 'Eola-Amity Hills',
      'McMinnville', 'Ribbon Ridge', 'Rogue Valley', 'Southern Oregon',
      'Umpqua Valley', 'Van Duzer Corridor', 'Willamette Valley', 'Yamhill-Carlton',
    ],
    'Pennsylvania': [],
    'Rhode Island': [],
    'South Carolina': [],
    'South Dakota': [],
    'Tennessee': [],
    'Texas': ['Fredericksburg in the Texas Hill Country', 'Hill Country', 'Texas High Plains'],
    'Utah': [],
    'Vermont': [],
    'Virginia': ['Charlottesville', 'Middleburg', 'Monticello', 'Northern Neck', 'Shenandoah Valley'],
    'Washington': [
      'Ancient Lakes', 'Columbia Valley', 'Horse Heaven Hills', 'Lake Chelan',
      'Naches Heights', 'Puget Sound', 'Rattlesnake Hills', 'Red Mountain', 'Royal Slope',
      'Snipes Mountain', 'Wahluke Slope', 'Walla Walla', 'Walla Walla Valley', 'Yakima Valley',
    ],
    'West Virginia': [],
    'Wisconsin': [],
    'Wyoming': [],
  },
  Argentina: {
    'La Rioja': [],
    'Mendoza': [
      'Gualtallary', 'La Consulta', 'Luján de Cuyo', 'Maipú', 'San Martín',
      'San Rafael', 'Tupungato', 'Uco Valley', 'Vista Flores',
    ],
    'Neuquén': [],
    'Patagonia': ['Río Negro'],
    'Salta': ['Cafayate', 'Calchaquí Valley'],
    'San Juan': [],
  },
  Chile: {
    'Aconcagua': ['Aconcagua Valley', 'Casablanca Valley', 'San Antonio'],
    'Atacama': ['Copiapó', 'Huasco'],
    'Bio-Bio': [],
    'Central Valley': ['Cachapoal', 'Colchagua', 'Curicó', 'Maipo Valley', 'Maule', 'Rapel'],
    'Coquimbo': ['Choapa', 'Elqui', 'Limarí'],
    'Itata': [],
    'Malleco': [],
  },
  Australia: {
    'New South Wales': ['Canberra District', 'Hunter Valley', 'Mudgee', 'Orange', 'Riverina'],
    'Queensland': [],
    'South Australia': [
      'Adelaide Hills', 'Barossa Valley', 'Clare Valley', 'Coonawarra', 'Eden Valley',
      'Kangaroo Island', 'Langhorne Creek', 'McLaren Vale', 'Mount Benson', 'Mount Gambier',
      'Padthaway', 'Robe', 'Wrattonbully',
    ],
    'Tasmania': [],
    'Victoria': [
      'Beechworth', 'Bendigo', 'Goulburn Valley', 'Grampians', 'Heathcote',
      'Macedon Ranges', 'Mornington Peninsula', 'Murray Darling', 'Pyrenees',
      'Rutherglen', 'Sunbury', 'Yarra Valley',
    ],
    'Western Australia': ['Frankland River', 'Geographe', 'Great Southern', 'Margaret River', 'Pemberton', 'Swan Valley'],
  },
  'New Zealand': {
    'Auckland': ['Waiheke Island'],
    'Canterbury': ['Waipara Valley'],
    'Central Otago': [],
    'Gisborne': [],
    "Hawke's Bay": [],
    'Marlborough': [],
    'Nelson': [],
    'Northland': [],
    'Otago': [],
    'Waikato': [],
    'Wairarapa': ['Martinborough'],
    'Waitaki Valley': [],
  },
  Germany: {
    'Ahr': [],
    'Baden': [],
    'Franken': [],
    'Hessische Bergstraße': [],
    'Mittelrhein': [],
    'Mosel': ['Bernkastel', 'Mittelmosel', 'Ruwer', 'Saar'],
    'Nahe': [],
    'Pfalz': [],
    'Rheingau': ['Johannisberg'],
    'Rheinhessen': ['Nierstein', 'Wonnegau'],
    'Saale-Unstrut': [],
    'Sachsen': [],
    'Württemberg': [],
  },
  Austria: {
    'Burgenland': [
      'Eisenberg', 'Leithaberg', 'Mittelburgenland', 'Neusiedlersee',
      'Neusiedlersee-Hügelland', 'Rosalia', 'Rust', 'Ruster Ausbruch',
    ],
    'Lower Austria': ['Carnuntum', 'Kamptal', 'Kremstal', 'Thermenregion', 'Traisental', 'Wachau', 'Wagram'],
    'Styria': ['South Styria', 'Südsteiermark', 'Vulkanland Steiermark', 'Weststeiermark'],
    'Vienna': [],
  },
  'South Africa': {
    'Breede River Valley': ['Breedekloof', 'Robertson', 'Worcester'],
    'Cape Peninsula': [],
    'Cape South Coast': ['Cape Agulhas', 'Elgin', 'Hemel-en-Aarde', 'Overberg', 'Walker Bay'],
    'Cape Town': [],
    'Coastal Region': ['Constantia', 'Darling', 'Durbanville', 'Elgin', 'Elim', 'Franschhoek', 'Paarl', 'Stellenbosch', 'Swartland', 'Tulbagh', 'Wellington'],
    'Klein Karoo': [],
    'Olifants River': [],
  },
  Greece: {
    'Aegean Islands': ['Lemnos', 'Paros', 'Rhodes', 'Samos', 'Santorini'],
    'Attica': [],
    'Central Greece': ['Thessaly'],
    'Crete': ['Peza'],
    'Epirus': ['Zitsa'],
    'Ionian Islands': ['Cephalonia', 'Kefalonia'],
    'Macedonia': ['Amyndeon', 'Drama', 'Goumenissa', 'Naoussa'],
    'Peloponnese': ['Mantinia', 'Nemea', 'Patras'],
  },
  Hungary: {
    'Badacsony': [],
    'Eger': [],
    'Etyek-Buda': [],
    'Mátra': [],
    'Pannonhalma': [],
    'Pécs': [],
    'Somló': [],
    'Sopron': [],
    'Szekszárd': [],
    'Tokaj': ['Tokaj-Hegyalja'],
    'Villány': [],
  },
  Croatia: {
    'Dalmatia': ['Hvar', 'Korčula', 'Pelješac'],
    'Istria': [],
    'Slavonia': [],
    'Upland Croatia': ['Krk', 'Zagreb'],
  },
  Slovenia: {
    'Podravje': ['Štajerska Slovenija'],
    'Posavje': [],
    'Primorska': ['Brda', 'Goriška Brda', 'Kras', 'Vipava', 'Vipavska Dolina'],
  },
  Georgia: {
    'Imereti': [],
    'Kakheti': ['Alazani Valley', 'Gurjaani', 'Kindzmarauli', 'Ktsinandali', 'Kvareli', 'Mukuzani', 'Napareuli', 'Tsinandali'],
    'Kartli': [],
    'Racha-Lechkhumi': [],
    'Samegrelo': [],
  },
  Israel: {
    'Galilee': ['Upper Galilee'],
    'Golan Heights': [],
    'Judean Hills': ['Jerusalem Hills', 'Judean Lowlands'],
    'Negev': [],
    'Samson': [],
    'Sharon Plain': [],
    'Shomron': [],
  },
  Canada: {
    'British Columbia': ['Fraser Valley', 'Gulf Islands', 'Okanagan Valley', 'Similkameen Valley', 'Vancouver Island'],
    'Nova Scotia': [],
    'Ontario': ['Beamsville Bench', 'Niagara', 'Niagara Escarpment', 'Niagara-on-the-Lake', 'Prince Edward County'],
    'Quebec': [],
  },
  Uruguay: {
    'Canelones': [],
    'Colonia': [],
    'Flores': [],
    'Maldonado': [],
    'Montevideo': [],
    'Rivera': [],
    'San José': [],
    'Soriano': [],
  },
  Switzerland: {
    'Aargau': [],
    'Basel': [],
    'Geneva': [],
    'Graubünden': ['Bündner Herrschaft'],
    'Neuchâtel': [],
    'Schaffhausen': [],
    'Ticino': [],
    'Thurgau': [],
    'Valais': [],
    'Vaud': ['Lake Geneva', 'Lavaux'],
    'Zurich': [],
  },
};

export function getRegions(country: string): string[] {
  return Object.keys(WINE_REGION_DATA[country] ?? {}).sort((a, b) => a.localeCompare(b));
}

export function getSubregions(country: string, region: string): string[] {
  return [...(WINE_REGION_DATA[country]?.[region] ?? [])].sort((a, b) => a.localeCompare(b));
}

// Flat lookup derived from WINE_REGION_DATA, used by the offline label parser
const US_STATE_ABBREVIATIONS = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'HI', 'ID',
  'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
  'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
  'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
  'VA', 'WA', 'WV', 'WI', 'WY',
];

export const WINE_REGIONS: Record<string, string[]> = Object.fromEntries(
  Object.entries(WINE_REGION_DATA).map(([country, regionMap]) => {
    const all = [...Object.keys(regionMap), ...Object.values(regionMap).flat()];
    if (country === 'United States') all.push(...US_STATE_ABBREVIATIONS);
    return [country, [...new Set(all)]];
  })
);

export const US_AVA_TO_STATE: Record<string, string> = (() => {
  const result: Record<string, string> = {};
  for (const [state, avas] of Object.entries(WINE_REGION_DATA['United States'] ?? {})) {
    for (const ava of avas) {
      if (!result[ava]) result[ava] = state;
    }
  }
  result['Columbia Gorge'] = 'Oregon';
  return result;
})();

export const GRAPE_VARIETIES = [
  'Aglianico', 'Albariño', 'Barbera', 'Cabernet Franc', 'Cabernet Sauvignon',
  'Carménère', 'Chardonnay', 'Chenin Blanc', 'Corvina', 'Dolcetto',
  'Falanghina', 'Garnacha', 'Gewürztraminer', 'Glera', 'Grenache',
  'Grenache Blanc', 'Grüner Veltliner', 'Macabeu', 'Malbec', 'Marsanne',
  'Merlot', 'Monastrell', 'Montepulciano', 'Mourvèdre', 'Muscat',
  'Nebbiolo', "Nero d'Avola", 'Parellada', 'Petit Verdot', 'Pinot Blanc',
  'Pinot Grigio/Gris', 'Pinot Meunier', 'Pinot Noir', 'Primitivo', 'Riesling',
  'Roussanne', 'Sangiovese', 'Sauvignon Blanc', 'Syrah/Shiraz', 'Tempranillo',
  'Torrontés', 'Touriga Nacional', 'Trebbiano', 'Verdejo', 'Vermentino',
  'Viognier', 'Xarel-lo', 'Xinomavro', 'Zinfandel',
];

export const RED_WINE_COLORS = [
  { name: 'Ruby', subtitle: 'Bright Red Undertone', hex: '#C1121F' },
  { name: 'Garnet', subtitle: 'Slight Brown Undertone', hex: '#7B2020' },
  { name: 'Purple', subtitle: 'Bright Blue Undertone', hex: '#4A235A' },
];

export const WHITE_WINE_COLORS = [
  { name: 'Straw', subtitle: 'Very Pale Yellow', hex: '#F0DFA0' },
  { name: 'Yellow', subtitle: 'Light Gold', hex: '#D4B840' },
  { name: 'Gold', subtitle: 'Deep Golden', hex: '#C09010' },
  { name: 'Amber', subtitle: 'Orange-Tinged', hex: '#C07820' },
];

export const ROSE_WINE_COLORS = [
  { name: 'Pink', subtitle: 'Pale Blush', hex: '#F4A0A8' },
  { name: 'Salmon', subtitle: 'Salmon-Orange', hex: '#E87060' },
  { name: 'Deep Pink', subtitle: 'Vivid Rose', hex: '#D04060' },
];

export const SPARKLING_WINE_COLORS = [
  { name: 'Straw', subtitle: 'Very Pale', hex: '#F0DFA0' },
  { name: 'Yellow', subtitle: 'Light Yellow', hex: '#E8D060' },
  { name: 'Gold', subtitle: 'Golden', hex: '#C09010' },
  { name: 'Copper', subtitle: 'Warm Copper', hex: '#B8702A' },
  { name: 'Blush', subtitle: 'Pale Pinkish', hex: '#FADADD' },
  { name: 'Pink', subtitle: 'Pale Rosé', hex: '#F4A0A8' },
  { name: 'Salmon', subtitle: 'Deep Rosé', hex: '#E07060' },
  { name: 'Deep Pink', subtitle: 'Vivid Rosé', hex: '#D04060' },
  { name: 'Ruby', subtitle: 'Red Sparkling', hex: '#9B1C31' },
];

export const ORANGE_WINE_COLORS = [
  { name: 'Amber', subtitle: 'Pale Amber', hex: '#D4922A' },
  { name: 'Orange', subtitle: 'Warm Orange', hex: '#C07020' },
  { name: 'Copper', subtitle: 'Deep Copper', hex: '#A05018' },
  { name: 'Bronze', subtitle: 'Rich Bronze', hex: '#8B5E28' },
];

export const DESSERT_WINE_COLORS = [
  { name: 'Straw', subtitle: 'Pale Gold', hex: '#F0DFA0' },
  { name: 'Gold', subtitle: 'Deep Gold', hex: '#C09010' },
  { name: 'Amber', subtitle: 'Warm Amber', hex: '#C07820' },
  { name: 'Mahogany', subtitle: 'Deep Brown', hex: '#7A3A10' },
];

export const SWEETNESS_STEPS = ['Bone Dry', 'Dry', 'Off-Dry', 'Semi Sweet', 'Sweet', 'Very Sweet'];
export const ACIDITY_STEPS = ['Low', 'Medium(-)', 'Medium', 'Medium(+)', 'High'];
export const TANNIN_STEPS = ['Low', 'Medium(-)', 'Medium', 'Medium(+)', 'High'];
export const ALCOHOL_STEPS = ['Low', 'Medium(-)', 'Medium', 'Medium(+)', 'High'];
export const BODY_STEPS = ['Light', 'Medium(-)', 'Medium', 'Medium(+)', 'Full'];
export const FINISH_STEPS = ['Short', 'Medium(-)', 'Medium', 'Medium(+)', 'Long'];
