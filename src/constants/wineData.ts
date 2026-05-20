export const WINE_COUNTRIES = [
  'France', 'Italy', 'Spain', 'Portugal', 'United States', 'Argentina',
  'Chile', 'Australia', 'New Zealand', 'Germany', 'Austria', 'South Africa',
  'Greece', 'Hungary', 'Croatia', 'Slovenia', 'Georgia', 'Israel',
  'Canada', 'Uruguay', 'Switzerland', 'Other',
];

export const WINE_REGIONS: Record<string, string[]> = {
  France: [
    // Alsace
    'Alsace', 'Alsace Grand Cru',
    // Beaujolais
    'Beaujolais', 'Beaujolais-Villages', 'Brouilly', 'Chénas', 'Chiroubles',
    'Côte de Brouilly', 'Fleurie', 'Juliénas', 'Morgon', 'Moulin-à-Vent',
    'Régnié', 'Saint-Amour',
    // Bordeaux
    'Bordeaux', 'Barsac', 'Blaye', 'Bourg', 'Cadillac', 'Canon-Fronsac',
    'Entre-Deux-Mers', 'Fronsac', 'Graves', 'Haut-Médoc', 'Lalande-de-Pomerol',
    'Listrac-Médoc', 'Loupiac', 'Margaux', 'Médoc', 'Moulis-en-Médoc',
    'Pauillac', 'Pessac-Léognan', 'Pomerol', 'Puisseguin-Saint-Émilion',
    'Saint-Émilion', 'Saint-Estèphe', 'Saint-Julien', 'Sainte-Croix-du-Mont',
    'Sauternes',
    // Burgundy
    'Bourgogne', 'Burgundy', 'Chablis', 'Chambertin', 'Chambolle-Musigny',
    'Chassagne-Montrachet', 'Corton', 'Côte Chalonnaise', 'Côte de Beaune',
    'Côte de Nuits', "Côte d'Or", 'Gevrey-Chambertin', 'Givry', 'Mâcon',
    'Mâconnais', 'Mercurey', 'Meursault', 'Montagny', 'Montrachet',
    'Morey-Saint-Denis', 'Nuits-Saint-Georges', 'Pommard', 'Pouilly-Fuissé',
    'Puligny-Montrachet', 'Rully', 'Saint-Aubin', 'Saint-Véran', 'Santenay',
    'Volnay', 'Vosne-Romanée', 'Vougeot',
    // Champagne
    'Champagne', 'Côte des Blancs', 'Montagne de Reims', 'Vallée de la Marne',
    // Jura & Savoie
    'Arbois', 'Bugey', 'Château-Chalon', 'Crémant du Jura', 'Jura',
    "L'Étoile", 'Savoie',
    // Languedoc-Roussillon
    'Banyuls', 'Clairette du Languedoc', 'Corbières', 'Costières de Nîmes',
    'Coteaux du Languedoc', 'Faugères', 'Fitou', 'Languedoc', 'Limoux',
    'Maury', 'Minervois', 'Muscat de Frontignan', 'Muscat de Rivesaltes',
    'Pic Saint-Loup', 'Picpoul de Pinet', 'Rivesaltes', 'Roussillon',
    'Saint-Chinian', 'Terrasses du Larzac',
    // Loire Valley
    'Anjou', 'Bonnezeaux', 'Bourgueil', 'Chinon', "Côteaux d'Ancenis",
    'Côteaux du Layon', 'Crémant de Loire', 'Fiefs Vendéens', 'Jasnières',
    'Loire Valley', 'Menetou-Salon', 'Montlouis-sur-Loire', 'Muscadet',
    'Muscadet Sèvre et Maine', 'Pouilly-Fumé', 'Pouilly-sur-Loire',
    'Quarts de Chaume', 'Quincy', 'Reuilly', 'Sancerre', 'Saumur',
    'Saumur-Champigny', 'Savennières', 'Touraine', 'Vouvray',
    // Provence & Corsica
    'Ajaccio', 'Bandol', 'Baux-de-Provence', 'Cassis',
    "Coteaux d'Aix-en-Provence", 'Coteaux Varois en Provence',
    'Côtes de Provence', 'Palette', 'Patrimonio', 'Provence',
    // Rhône Valley
    'Châteauneuf-du-Pape', 'Condrieu', 'Cornas', 'Côte-Rôtie',
    'Côtes du Rhône', 'Côtes du Rhône Villages', 'Crozes-Hermitage',
    'Gigondas', 'Hermitage', 'Lirac', 'Luberon', 'Rasteau', 'Rhône Valley',
    'Saint-Joseph', 'Saint-Péray', 'Tavel', 'Vacqueyras', 'Ventoux',
    'Vinsobres',
    // Southwest France
    'Bergerac', 'Buzet', 'Cahors', 'Fronton', 'Gaillac', 'Irouléguy',
    'Jurançon', 'Madiran', 'Marcillac', 'Monbazillac',
    'Pacherenc du Vic-Bilh', 'Pécharmant',
  ],
  Italy: [
    // Piedmont
    'Asti', 'Barbaresco', "Barbera d'Alba", "Barbera d'Asti",
    'Barolo', "Brachetto d'Acqui", 'Carema', "Dolcetto d'Alba",
    'Erbaluce di Caluso', 'Gattinara', 'Gavi', 'Ghemme', 'Langhe',
    'Loazzolo', 'Monferrato', "Moscato d'Asti", 'Piemonte', 'Piedmont',
    'Roero', 'Ruché di Castagnole Monferrato',
    // Lombardy
    'Franciacorta', 'Lugana', 'Oltrepò Pavese', 'Sforzato di Valtellina',
    'Valtellina',
    // Veneto
    'Amarone', 'Amarone della Valpolicella', 'Bardolino', 'Bianco di Custoza',
    'Colli Euganei', 'Custoza', 'Gambellara', 'Prosecco',
    'Recioto della Valpolicella', 'Recioto di Soave', 'Soave', 'Soave Classico',
    'Valpolicella', 'Valpolicella Ripasso', 'Veneto',
    // Friuli-Venezia Giulia
    'Carso', 'Colli Orientali del Friuli', 'Collio', 'Friuli',
    'Grave del Friuli', 'Isonzo',
    // Trentino-Alto Adige
    'Alto Adige', 'South Tyrol', 'Südtirol', 'Trentino',
    // Emilia-Romagna
    'Albana di Romagna', 'Colli Bolognesi', 'Emilia-Romagna',
    'Lambrusco', 'Sangiovese di Romagna',
    // Tuscany
    'Bolgheri', 'Brunello di Montalcino', 'Carmignano', 'Chianti',
    'Chianti Classico', 'Maremma', 'Montecucco', 'Morellino di Scansano',
    'Orcia', 'Rosso di Montalcino', 'Rosso di Montepulciano',
    'Toscana', 'Tuscany', 'Vernaccia di San Gimignano',
    'Vino Nobile di Montepulciano',
    // Umbria
    'Montefalco', 'Orvieto', 'Sagrantino di Montefalco', 'Torgiano', 'Umbria',
    // Marche
    'Conero', "Lacrima di Morro d'Alba", 'Marche', 'Rosso Conero',
    'Rosso Piceno', 'Verdicchio dei Castelli di Jesi', 'Verdicchio di Matelica',
    // Lazio & Abruzzo
    'Abruzzo', 'Cesanese', 'Est! Est!! Est!!!', 'Frascati', 'Lazio',
    "Montepulciano d'Abruzzo", "Trebbiano d'Abruzzo",
    // Southern Italy
    'Aglianico del Vulture', 'Basilicata', 'Calabria', 'Campania', 'Cirò',
    'Falanghina del Sannio', 'Fiano di Avellino', 'Greco di Tufo', 'Taurasi',
    // Puglia
    'Castel del Monte', 'Locorotondo', 'Negroamaro', 'Primitivo di Manduria',
    'Puglia', 'Salice Salentino',
    // Sicily & Sardinia
    'Cannonau di Sardegna', 'Cerasuolo di Vittoria', 'Etna', 'Marsala',
    "Nero d'Avola", 'Pantelleria', 'Passito di Pantelleria', 'Sardinia',
    'Sardegna', 'Sicilia', 'Sicily', 'Vermentino di Gallura',
    'Vermentino di Sardegna',
  ],
  Spain: [
    // Rioja
    'Rioja', 'Rioja Alavesa', 'Rioja Alta', 'Rioja Baja', 'Rioja Oriental',
    // Castile and León
    'Arribes', 'Bierzo', 'Cigales', 'Ribera del Duero', 'Rueda',
    'Sierra de Salamanca', 'Tierra de León', 'Toro',
    // Catalonia
    'Alella', 'Cava', 'Catalonia', 'Catalunya', 'Conca de Barberà',
    'Costers del Segre', 'Empordà', 'Montsant', 'Penedès', 'Pla de Bages',
    'Priorat', 'Terra Alta',
    // Galicia
    'Galicia', 'Monterrei', 'Rías Baixas', 'Ribeira Sacra', 'Ribeiro',
    'Valdeorras',
    // Aragon
    'Calatayud', 'Campo de Borja', 'Cariñena', 'Somontano',
    // Navarra & Basque Country
    'Basque Country', 'Getariako Txakolina', 'Navarra', 'Txakoli',
    // La Mancha & Central Spain
    'Almansa', 'La Mancha', 'Manchuela', 'Mentrida', 'Utiel-Requena',
    'Valdepeñas',
    // Valencia & Murcia
    'Alicante', 'Bullas', 'Jumilla', 'Valencia', 'Yecla',
    // Andalucia & Islands
    'Binissalem', 'Condado de Huelva', 'Jerez', 'Málaga', 'Manzanilla',
    'Montilla-Moriles', 'Sherry', 'Sierras de Málaga',
  ],
  Portugal: [
    // Northern Portugal
    'Dão', 'Douro', 'Minho', 'Porto', 'Port', 'Vinho Verde',
    'Monção e Melgaço', 'Lima', 'Ave', 'Amarante', 'Baião', 'Sousa',
    'Paiva', 'Basto',
    // Beiras
    'Bairrada', 'Beira Interior', 'Beiras', 'Cova da Beira', 'Lafões',
    'Távora-Varosa',
    // Lisbon & Tagus Valley
    'Alenquer', 'Arruda', 'Bucelas', 'Carcavelos', 'Colares', 'Lisboa',
    'Lourinhã', 'Óbidos', 'Tejo', 'Torres Vedras',
    // Alentejo
    'Alentejo', 'Borba', 'Évora', 'Granja-Amareleja', 'Moura',
    'Portalegre', 'Redondo', 'Reguengos', 'Vidigueira',
    // Setúbal Peninsula & Algarve
    'Algarve', 'Lagos', 'Palmela', 'Portimão', 'Setúbal',
    // Islands
    'Açores', 'Biscoitos', 'Graciosa', 'Madeira', 'Pico',
    // Trás-os-Montes
    'Trás-os-Montes',
  ],
  'United States': [
    // State names
    'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado',
    'Connecticut', 'Delaware', 'Florida', 'Hawaii', 'Idaho', 'Illinois',
    'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine',
    'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
    'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire',
    'New Jersey', 'New Mexico', 'New York', 'North Carolina', 'North Dakota',
    'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
    'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah',
    'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin',
    'Wyoming',
    // State abbreviations (matched with word-boundary regex in parser)
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'HI', 'ID',
    'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN',
    'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND',
    'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT',
    'VA', 'WA', 'WV', 'WI', 'WY',
    // California AVAs
    'Alexander Valley', 'Anderson Valley', 'Arroyo Grande Valley',
    'Arroyo Seco', 'Atlas Peak', 'Ballard Canyon', 'Bennett Valley',
    'Carneros', 'Central Coast', 'Chalk Hill', 'Chiles Valley', 'Clarksburg',
    'Coombsville', 'Diamond Mountain District', 'Dry Creek Valley',
    'Edna Valley', 'El Dorado', 'Fountaingrove District',
    'Green Valley of Russian River Valley', 'Happy Canyon', 'Howell Mountain',
    'Knights Valley', 'Lodi', 'Los Carneros', 'Los Olivos District',
    'Livermore Valley', 'Mendocino', 'Mendocino Ridge', 'Monterey',
    'Moon Mountain District', 'Mount Veeder', 'Napa Valley', 'North Coast',
    'Oak Knoll District', 'Oakville', 'Paso Robles', 'Petaluma Gap',
    'Redwood Valley', 'Rockpile', 'Russian River Valley', 'Rutherford',
    'Santa Barbara', 'Santa Clara Valley', 'Santa Cruz Mountains',
    'Santa Lucia Highlands', 'Santa Maria Valley', 'Santa Rita Hills',
    'Santa Ynez Valley', 'Sierra Foothills', 'Sonoma', 'Sonoma Coast',
    'Sonoma Valley', 'Spring Mountain District', 'Sta. Rita Hills',
    'Stags Leap District', 'St. Helena', 'Temecula Valley', 'Yountville',
    'Yorkville Highlands',
    // Oregon AVAs
    'Applegate Valley', 'Columbia Gorge', 'Dundee Hills', 'Eola-Amity Hills',
    'McMinnville', 'Ribbon Ridge', 'Rogue Valley', 'Southern Oregon',
    'Umpqua Valley', 'Van Duzer Corridor', 'Willamette Valley',
    'Yamhill-Carlton',
    // Washington AVAs
    'Ancient Lakes', 'Columbia Valley', 'Horse Heaven Hills', 'Lake Chelan',
    'Naches Heights', 'Puget Sound', 'Rattlesnake Hills', 'Red Mountain',
    'Royal Slope', 'Snipes Mountain', 'Wahluke Slope', 'Walla Walla',
    'Walla Walla Valley', 'Yakima Valley',
    // New York AVAs
    'Cayuga Lake', 'Finger Lakes', 'Hudson River Region', 'Keuka Lake',
    'Lake Erie', 'Long Island', 'Niagara Escarpment', 'North Fork of Long Island',
    'Seneca Lake', 'The Hamptons',
    // Virginia & other East Coast
    'Charlottesville', 'Middleburg', 'Monticello', 'Northern Neck',
    'Shenandoah Valley',
    // Texas
    'Fredericksburg in the Texas Hill Country', 'Hill Country',
    'Texas High Plains',
    // Michigan
    'Leelanau Peninsula', 'Old Mission Peninsula',
  ],
  Argentina: [
    'Cafayate', 'Calchaquí Valley', 'Gualtallary', 'La Consulta', 'La Rioja',
    'Luján de Cuyo', 'Maipú', 'Mendoza', 'Neuquén', 'Patagonia',
    'Río Negro', 'Salta', 'San Juan', 'San Rafael', 'San Martín',
    'Tupungato', 'Uco Valley', 'Valle de Uco', 'Vista Flores',
  ],
  Chile: [
    'Aconcagua', 'Alto Maipo', 'Apalta', 'Atacama', 'Bio-Bio', 'Cachapoal',
    'Casablanca Valley', 'Central Valley', 'Colchagua', 'Curicó', 'El Alto',
    'Elqui', 'Itata', 'Limari', 'Limarí', 'Maipo Valley', 'Malleco',
    'Maule', 'Puente Alto', 'Rapel', 'San Antonio', 'Valle del Maipo',
    'Valle de Casablanca',
  ],
  Australia: [
    // South Australia
    'Adelaide Hills', 'Barossa Valley', 'Clare Valley', 'Coonawarra',
    'Eden Valley', 'Kangaroo Island', 'Langhorne Creek', 'McLaren Vale',
    'Mount Benson', 'Mount Gambier', 'Padthaway', 'Robe', 'South Australia',
    'Wrattonbully',
    // Victoria
    'Beechworth', 'Bendigo', 'Goulburn Valley', 'Grampians', 'Heathcote',
    'Macedon Ranges', 'Mornington Peninsula', 'Murray Darling', 'Pyrenees',
    'Rutherglen', 'Sunbury', 'Victoria', 'Yarra Valley',
    // New South Wales
    'Canberra District', 'Hunter Valley', 'Mudgee', 'New South Wales',
    'Orange', 'Riverina',
    // Western Australia
    'Frankland River', 'Geographe', 'Great Southern', 'Margaret River',
    'Pemberton', 'Swan Valley', 'Western Australia',
    // Tasmania & Queensland
    'Queensland', 'Tasmania',
  ],
  'New Zealand': [
    'Auckland', 'Central Otago', 'Gisborne', "Hawke's Bay", 'Martinborough',
    'Marlborough', 'Nelson', 'Northland', 'Otago', 'Waikato',
    'Waiheke Island', 'Waipara Valley', 'Wairarapa', 'Waitaki Valley',
  ],
  Germany: [
    // Mosel
    'Ahr', 'Mittelmosel', 'Mosel', 'Mosel-Saar-Ruwer', 'Ruwer', 'Saar',
    // Rhine
    'Bernkastel', 'Johannisberg', 'Mittelrhein', 'Nahe', 'Nierstein',
    'Pfalz', 'Rheingau', 'Rheinhessen', 'Wonnegau',
    // Other
    'Baden', 'Franken', 'Hessische Bergstraße', 'Saale-Unstrut',
    'Sachsen', 'Württemberg',
  ],
  Austria: [
    // Lower Austria
    'Carnuntum', 'Kamptal', 'Kremstal', 'Niederösterreich',
    'Thermenregion', 'Traisental', 'Wachau', 'Wagram',
    // Burgenland
    'Burgenland', 'Eisenberg', 'Leithaberg', 'Mittelburgenland',
    'Neusiedlersee', 'Neusiedlersee-Hügelland', 'Rosalia', 'Rust',
    'Ruster Ausbruch',
    // Styria
    'South Styria', 'Steiermark', 'Styria', 'Südsteiermark',
    'Vulkanland Steiermark', 'Weststeiermark',
    // Vienna
    'Vienna', 'Wien',
  ],
  'South Africa': [
    // Coastal Region
    'Constantia', 'Darling', 'Durbanville', 'Elgin', 'Elim',
    'Franschhoek', 'Paarl', 'Stellenbosch', 'Swartland', 'Tulbagh',
    'Wellington',
    // Other
    'Breedekloof', 'Cape Agulhas', 'Cape Peninsula', 'Cape South Coast',
    'Cape Town', 'Hemel-en-Aarde', 'Klein Karoo', 'Olifants River',
    'Overberg', 'Robertson', 'Walker Bay', 'Worcester',
  ],
  Greece: [
    'Amyndeon', 'Attica', 'Cephalonia', 'Crete', 'Drama', 'Goumenissa',
    'Kefalonia', 'Lemnos', 'Limnos', 'Mantinia', 'Naoussa', 'Nemea',
    'Paros', 'Patras', 'Peza', 'Rhodes', 'Rodos', 'Samos', 'Santorini',
    'Thessaly', 'Zitsa',
  ],
  Hungary: [
    'Eger', 'Etyek-Buda', 'Mátra', 'Pannonhalma', 'Pécs', 'Somló',
    'Sopron', 'Szekszárd', 'Tokaj', 'Tokaj-Hegyalja', 'Villány',
  ],
  Croatia: [
    'Dalmatia', 'Hvar', 'Istria', 'Korčula', 'Krk', 'Pelješac',
    'Slavonia', 'Zagreb',
  ],
  Slovenia: [
    'Brda', 'Goriška Brda', 'Kras', 'Podravje', 'Posavje',
    'Štajerska Slovenija', 'Vipava', 'Vipavska Dolina',
  ],
  Georgia: [
    'Alazani Valley', 'Gurjaani', 'Imereti', 'Kakheti', 'Kartli',
    'Kindzmarauli', 'Ktsinandali', 'Kvareli', 'Mukuzani', 'Napareuli',
    'Racha-Lechkhumi', 'Tsinandali',
  ],
  Israel: [
    'Galilee', 'Golan Heights', 'Jerusalem Hills', 'Judean Hills',
    'Judean Lowlands', 'Negev', 'Samson', 'Sharon Plain', 'Shomron',
    'Upper Galilee',
  ],
  Canada: [
    // British Columbia
    'British Columbia', 'Fraser Valley', 'Gulf Islands', 'Okanagan Valley',
    'Similkameen Valley', 'Vancouver Island',
    // Ontario
    'Beamsville Bench', 'Niagara', 'Niagara Escarpment',
    'Niagara-on-the-Lake', 'Ontario', 'Prince Edward County',
    // Other
    'Nova Scotia', 'Quebec',
  ],
  Uruguay: [
    'Canelones', 'Colonia', 'Flores', 'Maldonado', 'Montevideo',
    'Rivera', 'San José', 'Soriano',
  ],
  Switzerland: [
    'Bündner Herrschaft', 'Geneva', 'Graubünden', 'Lake Geneva', 'Lavaux',
    'Neuchâtel', 'Schaffhausen', 'Ticino', 'Valais', 'Vaud', 'Zurich',
  ],
};

export const US_AVA_TO_STATE: Record<string, string> = {
  // California
  'Alexander Valley': 'California',
  'Anderson Valley': 'California',
  'Arroyo Grande Valley': 'California',
  'Arroyo Seco': 'California',
  'Atlas Peak': 'California',
  'Ballard Canyon': 'California',
  'Bennett Valley': 'California',
  'Carneros': 'California',
  'Central Coast': 'California',
  'Chalk Hill': 'California',
  'Chiles Valley': 'California',
  'Clarksburg': 'California',
  'Coombsville': 'California',
  'Diamond Mountain District': 'California',
  'Dry Creek Valley': 'California',
  'Edna Valley': 'California',
  'El Dorado': 'California',
  'Fountaingrove District': 'California',
  'Green Valley of Russian River Valley': 'California',
  'Happy Canyon': 'California',
  'Howell Mountain': 'California',
  'Knights Valley': 'California',
  'Livermore Valley': 'California',
  'Lodi': 'California',
  'Los Carneros': 'California',
  'Los Olivos District': 'California',
  'Mendocino': 'California',
  'Mendocino Ridge': 'California',
  'Monterey': 'California',
  'Moon Mountain District': 'California',
  'Mount Veeder': 'California',
  'Napa Valley': 'California',
  'North Coast': 'California',
  'Oak Knoll District': 'California',
  'Oakville': 'California',
  'Paso Robles': 'California',
  'Petaluma Gap': 'California',
  'Redwood Valley': 'California',
  'Rockpile': 'California',
  'Russian River Valley': 'California',
  'Rutherford': 'California',
  'Santa Barbara': 'California',
  'Santa Clara Valley': 'California',
  'Santa Cruz Mountains': 'California',
  'Santa Lucia Highlands': 'California',
  'Santa Maria Valley': 'California',
  'Santa Rita Hills': 'California',
  'Santa Ynez Valley': 'California',
  'Sierra Foothills': 'California',
  'Sonoma': 'California',
  'Sonoma Coast': 'California',
  'Sonoma Valley': 'California',
  'Spring Mountain District': 'California',
  'Sta. Rita Hills': 'California',
  'Stags Leap District': 'California',
  'St. Helena': 'California',
  'Temecula Valley': 'California',
  'Yorkville Highlands': 'California',
  'Yountville': 'California',
  // Oregon
  'Applegate Valley': 'Oregon',
  'Chehalem Mountains': 'Oregon',
  'Dundee Hills': 'Oregon',
  'Eola-Amity Hills': 'Oregon',
  'McMinnville': 'Oregon',
  'Ribbon Ridge': 'Oregon',
  'Rogue Valley': 'Oregon',
  'Southern Oregon': 'Oregon',
  'Umpqua Valley': 'Oregon',
  'Van Duzer Corridor': 'Oregon',
  'Willamette Valley': 'Oregon',
  'Yamhill-Carlton': 'Oregon',
  // Washington
  'Ancient Lakes': 'Washington',
  'Columbia Valley': 'Washington',
  'Horse Heaven Hills': 'Washington',
  'Lake Chelan': 'Washington',
  'Naches Heights': 'Washington',
  'Puget Sound': 'Washington',
  'Rattlesnake Hills': 'Washington',
  'Red Mountain': 'Washington',
  'Royal Slope': 'Washington',
  'Snipes Mountain': 'Washington',
  'Wahluke Slope': 'Washington',
  'Walla Walla': 'Washington',
  'Walla Walla Valley': 'Washington',
  'Yakima Valley': 'Washington',
  // New York
  'Cayuga Lake': 'New York',
  'Finger Lakes': 'New York',
  'Hudson River Region': 'New York',
  'Keuka Lake': 'New York',
  'Lake Erie': 'New York',
  'Long Island': 'New York',
  'Niagara Escarpment': 'New York',
  'North Fork of Long Island': 'New York',
  'Seneca Lake': 'New York',
  'The Hamptons': 'New York',
  // Virginia
  'Charlottesville': 'Virginia',
  'Middleburg': 'Virginia',
  'Monticello': 'Virginia',
  'Northern Neck': 'Virginia',
  'Shenandoah Valley': 'Virginia',
  // Texas
  'Fredericksburg in the Texas Hill Country': 'Texas',
  'Hill Country': 'Texas',
  'Texas High Plains': 'Texas',
  // Michigan
  'Leelanau Peninsula': 'Michigan',
  'Old Mission Peninsula': 'Michigan',
  // Cross-state (assign primary state)
  'Columbia Gorge': 'Oregon',
};

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
  { name: 'Pink', subtitle: 'Pale Rosé', hex: '#F4A0A8' },
  { name: 'Salmon', subtitle: 'Deep Rosé', hex: '#E07060' },
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
