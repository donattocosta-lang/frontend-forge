import { useState, useMemo } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';

const countries = [
  { code: '+93', country: 'AF', name: 'Afeganistão', flag: '🇦🇫' },
  { code: '+355', country: 'AL', name: 'Albânia', flag: '🇦🇱' },
  { code: '+213', country: 'DZ', name: 'Argélia', flag: '🇩🇿' },
  { code: '+376', country: 'AD', name: 'Andorra', flag: '🇦🇩' },
  { code: '+244', country: 'AO', name: 'Angola', flag: '🇦🇴' },
  { code: '+54', country: 'AR', name: 'Argentina', flag: '🇦🇷' },
  { code: '+374', country: 'AM', name: 'Armênia', flag: '🇦🇲' },
  { code: '+61', country: 'AU', name: 'Austrália', flag: '🇦🇺' },
  { code: '+43', country: 'AT', name: 'Áustria', flag: '🇦🇹' },
  { code: '+994', country: 'AZ', name: 'Azerbaijão', flag: '🇦🇿' },
  { code: '+973', country: 'BH', name: 'Bahrein', flag: '🇧🇭' },
  { code: '+880', country: 'BD', name: 'Bangladesh', flag: '🇧🇩' },
  { code: '+375', country: 'BY', name: 'Bielorrússia', flag: '🇧🇾' },
  { code: '+32', country: 'BE', name: 'Bélgica', flag: '🇧🇪' },
  { code: '+501', country: 'BZ', name: 'Belize', flag: '🇧🇿' },
  { code: '+229', country: 'BJ', name: 'Benin', flag: '🇧🇯' },
  { code: '+975', country: 'BT', name: 'Butão', flag: '🇧🇹' },
  { code: '+591', country: 'BO', name: 'Bolívia', flag: '🇧🇴' },
  { code: '+387', country: 'BA', name: 'Bósnia e Herzegovina', flag: '🇧🇦' },
  { code: '+267', country: 'BW', name: 'Botsuana', flag: '🇧🇼' },
  { code: '+55', country: 'BR', name: 'Brasil', flag: '🇧🇷' },
  { code: '+673', country: 'BN', name: 'Brunei', flag: '🇧🇳' },
  { code: '+359', country: 'BG', name: 'Bulgária', flag: '🇧🇬' },
  { code: '+226', country: 'BF', name: 'Burkina Faso', flag: '🇧🇫' },
  { code: '+257', country: 'BI', name: 'Burundi', flag: '🇧🇮' },
  { code: '+855', country: 'KH', name: 'Camboja', flag: '🇰🇭' },
  { code: '+237', country: 'CM', name: 'Camarões', flag: '🇨🇲' },
  { code: '+1', country: 'CA', name: 'Canadá', flag: '🇨🇦' },
  { code: '+238', country: 'CV', name: 'Cabo Verde', flag: '🇨🇻' },
  { code: '+236', country: 'CF', name: 'República Centro-Africana', flag: '🇨🇫' },
  { code: '+235', country: 'TD', name: 'Chade', flag: '🇹🇩' },
  { code: '+56', country: 'CL', name: 'Chile', flag: '🇨🇱' },
  { code: '+86', country: 'CN', name: 'China', flag: '🇨🇳' },
  { code: '+57', country: 'CO', name: 'Colômbia', flag: '🇨🇴' },
  { code: '+269', country: 'KM', name: 'Comores', flag: '🇰🇲' },
  { code: '+242', country: 'CG', name: 'Congo', flag: '🇨🇬' },
  { code: '+243', country: 'CD', name: 'Congo (RDC)', flag: '🇨🇩' },
  { code: '+506', country: 'CR', name: 'Costa Rica', flag: '🇨🇷' },
  { code: '+385', country: 'HR', name: 'Croácia', flag: '🇭🇷' },
  { code: '+53', country: 'CU', name: 'Cuba', flag: '🇨🇺' },
  { code: '+357', country: 'CY', name: 'Chipre', flag: '🇨🇾' },
  { code: '+420', country: 'CZ', name: 'República Tcheca', flag: '🇨🇿' },
  { code: '+45', country: 'DK', name: 'Dinamarca', flag: '🇩🇰' },
  { code: '+253', country: 'DJ', name: 'Djibuti', flag: '🇩🇯' },
  { code: '+593', country: 'EC', name: 'Equador', flag: '🇪🇨' },
  { code: '+20', country: 'EG', name: 'Egito', flag: '🇪🇬' },
  { code: '+503', country: 'SV', name: 'El Salvador', flag: '🇸🇻' },
  { code: '+240', country: 'GQ', name: 'Guiné Equatorial', flag: '🇬🇶' },
  { code: '+291', country: 'ER', name: 'Eritreia', flag: '🇪🇷' },
  { code: '+372', country: 'EE', name: 'Estônia', flag: '🇪🇪' },
  { code: '+251', country: 'ET', name: 'Etiópia', flag: '🇪🇹' },
  { code: '+679', country: 'FJ', name: 'Fiji', flag: '🇫🇯' },
  { code: '+358', country: 'FI', name: 'Finlândia', flag: '🇫🇮' },
  { code: '+33', country: 'FR', name: 'França', flag: '🇫🇷' },
  { code: '+241', country: 'GA', name: 'Gabão', flag: '🇬🇦' },
  { code: '+220', country: 'GM', name: 'Gâmbia', flag: '🇬🇲' },
  { code: '+995', country: 'GE', name: 'Geórgia', flag: '🇬🇪' },
  { code: '+49', country: 'DE', name: 'Alemanha', flag: '🇩🇪' },
  { code: '+233', country: 'GH', name: 'Gana', flag: '🇬🇭' },
  { code: '+30', country: 'GR', name: 'Grécia', flag: '🇬🇷' },
  { code: '+502', country: 'GT', name: 'Guatemala', flag: '🇬🇹' },
  { code: '+224', country: 'GN', name: 'Guiné', flag: '🇬🇳' },
  { code: '+245', country: 'GW', name: 'Guiné-Bissau', flag: '🇬🇼' },
  { code: '+592', country: 'GY', name: 'Guiana', flag: '🇬🇾' },
  { code: '+509', country: 'HT', name: 'Haiti', flag: '🇭🇹' },
  { code: '+504', country: 'HN', name: 'Honduras', flag: '🇭🇳' },
  { code: '+852', country: 'HK', name: 'Hong Kong', flag: '🇭🇰' },
  { code: '+36', country: 'HU', name: 'Hungria', flag: '🇭🇺' },
  { code: '+354', country: 'IS', name: 'Islândia', flag: '🇮🇸' },
  { code: '+91', country: 'IN', name: 'Índia', flag: '🇮🇳' },
  { code: '+62', country: 'ID', name: 'Indonésia', flag: '🇮🇩' },
  { code: '+98', country: 'IR', name: 'Irã', flag: '🇮🇷' },
  { code: '+964', country: 'IQ', name: 'Iraque', flag: '🇮🇶' },
  { code: '+353', country: 'IE', name: 'Irlanda', flag: '🇮🇪' },
  { code: '+972', country: 'IL', name: 'Israel', flag: '🇮🇱' },
  { code: '+39', country: 'IT', name: 'Itália', flag: '🇮🇹' },
  { code: '+225', country: 'CI', name: 'Costa do Marfim', flag: '🇨🇮' },
  { code: '+81', country: 'JP', name: 'Japão', flag: '🇯🇵' },
  { code: '+962', country: 'JO', name: 'Jordânia', flag: '🇯🇴' },
  { code: '+7', country: 'KZ', name: 'Cazaquistão', flag: '🇰🇿' },
  { code: '+254', country: 'KE', name: 'Quênia', flag: '🇰🇪' },
  { code: '+686', country: 'KI', name: 'Kiribati', flag: '🇰🇮' },
  { code: '+965', country: 'KW', name: 'Kuwait', flag: '🇰🇼' },
  { code: '+996', country: 'KG', name: 'Quirguistão', flag: '🇰🇬' },
  { code: '+856', country: 'LA', name: 'Laos', flag: '🇱🇦' },
  { code: '+371', country: 'LV', name: 'Letônia', flag: '🇱🇻' },
  { code: '+961', country: 'LB', name: 'Líbano', flag: '🇱🇧' },
  { code: '+266', country: 'LS', name: 'Lesoto', flag: '🇱🇸' },
  { code: '+231', country: 'LR', name: 'Libéria', flag: '🇱🇷' },
  { code: '+218', country: 'LY', name: 'Líbia', flag: '🇱🇾' },
  { code: '+423', country: 'LI', name: 'Liechtenstein', flag: '🇱🇮' },
  { code: '+370', country: 'LT', name: 'Lituânia', flag: '🇱🇹' },
  { code: '+352', country: 'LU', name: 'Luxemburgo', flag: '🇱🇺' },
  { code: '+853', country: 'MO', name: 'Macau', flag: '🇲🇴' },
  { code: '+389', country: 'MK', name: 'Macedônia do Norte', flag: '🇲🇰' },
  { code: '+261', country: 'MG', name: 'Madagascar', flag: '🇲🇬' },
  { code: '+265', country: 'MW', name: 'Malawi', flag: '🇲🇼' },
  { code: '+60', country: 'MY', name: 'Malásia', flag: '🇲🇾' },
  { code: '+960', country: 'MV', name: 'Maldivas', flag: '🇲🇻' },
  { code: '+223', country: 'ML', name: 'Mali', flag: '🇲🇱' },
  { code: '+356', country: 'MT', name: 'Malta', flag: '🇲🇹' },
  { code: '+692', country: 'MH', name: 'Ilhas Marshall', flag: '🇲🇭' },
  { code: '+222', country: 'MR', name: 'Mauritânia', flag: '🇲🇷' },
  { code: '+230', country: 'MU', name: 'Maurício', flag: '🇲🇺' },
  { code: '+52', country: 'MX', name: 'México', flag: '🇲🇽' },
  { code: '+691', country: 'FM', name: 'Micronésia', flag: '🇫🇲' },
  { code: '+373', country: 'MD', name: 'Moldávia', flag: '🇲🇩' },
  { code: '+377', country: 'MC', name: 'Mônaco', flag: '🇲🇨' },
  { code: '+976', country: 'MN', name: 'Mongólia', flag: '🇲🇳' },
  { code: '+382', country: 'ME', name: 'Montenegro', flag: '🇲🇪' },
  { code: '+212', country: 'MA', name: 'Marrocos', flag: '🇲🇦' },
  { code: '+258', country: 'MZ', name: 'Moçambique', flag: '🇲🇿' },
  { code: '+95', country: 'MM', name: 'Myanmar', flag: '🇲🇲' },
  { code: '+264', country: 'NA', name: 'Namíbia', flag: '🇳🇦' },
  { code: '+674', country: 'NR', name: 'Nauru', flag: '🇳🇷' },
  { code: '+977', country: 'NP', name: 'Nepal', flag: '🇳🇵' },
  { code: '+31', country: 'NL', name: 'Países Baixos', flag: '🇳🇱' },
  { code: '+64', country: 'NZ', name: 'Nova Zelândia', flag: '🇳🇿' },
  { code: '+505', country: 'NI', name: 'Nicarágua', flag: '🇳🇮' },
  { code: '+227', country: 'NE', name: 'Níger', flag: '🇳🇪' },
  { code: '+234', country: 'NG', name: 'Nigéria', flag: '🇳🇬' },
  { code: '+850', country: 'KP', name: 'Coreia do Norte', flag: '🇰🇵' },
  { code: '+47', country: 'NO', name: 'Noruega', flag: '🇳🇴' },
  { code: '+968', country: 'OM', name: 'Omã', flag: '🇴🇲' },
  { code: '+92', country: 'PK', name: 'Paquistão', flag: '🇵🇰' },
  { code: '+680', country: 'PW', name: 'Palau', flag: '🇵🇼' },
  { code: '+970', country: 'PS', name: 'Palestina', flag: '🇵🇸' },
  { code: '+507', country: 'PA', name: 'Panamá', flag: '🇵🇦' },
  { code: '+675', country: 'PG', name: 'Papua Nova Guiné', flag: '🇵🇬' },
  { code: '+595', country: 'PY', name: 'Paraguai', flag: '🇵🇾' },
  { code: '+51', country: 'PE', name: 'Peru', flag: '🇵🇪' },
  { code: '+63', country: 'PH', name: 'Filipinas', flag: '🇵🇭' },
  { code: '+48', country: 'PL', name: 'Polônia', flag: '🇵🇱' },
  { code: '+351', country: 'PT', name: 'Portugal', flag: '🇵🇹' },
  { code: '+974', country: 'QA', name: 'Catar', flag: '🇶🇦' },
  { code: '+40', country: 'RO', name: 'Romênia', flag: '🇷🇴' },
  { code: '+7', country: 'RU', name: 'Rússia', flag: '🇷🇺' },
  { code: '+250', country: 'RW', name: 'Ruanda', flag: '🇷🇼' },
  { code: '+685', country: 'WS', name: 'Samoa', flag: '🇼🇸' },
  { code: '+378', country: 'SM', name: 'San Marino', flag: '🇸🇲' },
  { code: '+239', country: 'ST', name: 'São Tomé e Príncipe', flag: '🇸🇹' },
  { code: '+966', country: 'SA', name: 'Arábia Saudita', flag: '🇸🇦' },
  { code: '+221', country: 'SN', name: 'Senegal', flag: '🇸🇳' },
  { code: '+381', country: 'RS', name: 'Sérvia', flag: '🇷🇸' },
  { code: '+248', country: 'SC', name: 'Seychelles', flag: '🇸🇨' },
  { code: '+232', country: 'SL', name: 'Serra Leoa', flag: '🇸🇱' },
  { code: '+65', country: 'SG', name: 'Singapura', flag: '🇸🇬' },
  { code: '+421', country: 'SK', name: 'Eslováquia', flag: '🇸🇰' },
  { code: '+386', country: 'SI', name: 'Eslovênia', flag: '🇸🇮' },
  { code: '+677', country: 'SB', name: 'Ilhas Salomão', flag: '🇸🇧' },
  { code: '+252', country: 'SO', name: 'Somália', flag: '🇸🇴' },
  { code: '+27', country: 'ZA', name: 'África do Sul', flag: '🇿🇦' },
  { code: '+82', country: 'KR', name: 'Coreia do Sul', flag: '🇰🇷' },
  { code: '+211', country: 'SS', name: 'Sudão do Sul', flag: '🇸🇸' },
  { code: '+34', country: 'ES', name: 'Espanha', flag: '🇪🇸' },
  { code: '+94', country: 'LK', name: 'Sri Lanka', flag: '🇱🇰' },
  { code: '+249', country: 'SD', name: 'Sudão', flag: '🇸🇩' },
  { code: '+597', country: 'SR', name: 'Suriname', flag: '🇸🇷' },
  { code: '+268', country: 'SZ', name: 'Eswatini', flag: '🇸🇿' },
  { code: '+46', country: 'SE', name: 'Suécia', flag: '🇸🇪' },
  { code: '+41', country: 'CH', name: 'Suíça', flag: '🇨🇭' },
  { code: '+963', country: 'SY', name: 'Síria', flag: '🇸🇾' },
  { code: '+886', country: 'TW', name: 'Taiwan', flag: '🇹🇼' },
  { code: '+992', country: 'TJ', name: 'Tajiquistão', flag: '🇹🇯' },
  { code: '+255', country: 'TZ', name: 'Tanzânia', flag: '🇹🇿' },
  { code: '+66', country: 'TH', name: 'Tailândia', flag: '🇹🇭' },
  { code: '+670', country: 'TL', name: 'Timor-Leste', flag: '🇹🇱' },
  { code: '+228', country: 'TG', name: 'Togo', flag: '🇹🇬' },
  { code: '+676', country: 'TO', name: 'Tonga', flag: '🇹🇴' },
  { code: '+216', country: 'TN', name: 'Tunísia', flag: '🇹🇳' },
  { code: '+90', country: 'TR', name: 'Turquia', flag: '🇹🇷' },
  { code: '+993', country: 'TM', name: 'Turcomenistão', flag: '🇹🇲' },
  { code: '+688', country: 'TV', name: 'Tuvalu', flag: '🇹🇻' },
  { code: '+256', country: 'UG', name: 'Uganda', flag: '🇺🇬' },
  { code: '+380', country: 'UA', name: 'Ucrânia', flag: '🇺🇦' },
  { code: '+971', country: 'AE', name: 'Emirados Árabes Unidos', flag: '🇦🇪' },
  { code: '+44', country: 'GB', name: 'Reino Unido', flag: '🇬🇧' },
  { code: '+1', country: 'US', name: 'Estados Unidos', flag: '🇺🇸' },
  { code: '+598', country: 'UY', name: 'Uruguai', flag: '🇺🇾' },
  { code: '+998', country: 'UZ', name: 'Uzbequistão', flag: '🇺🇿' },
  { code: '+678', country: 'VU', name: 'Vanuatu', flag: '🇻🇺' },
  { code: '+379', country: 'VA', name: 'Vaticano', flag: '🇻🇦' },
  { code: '+58', country: 'VE', name: 'Venezuela', flag: '🇻🇪' },
  { code: '+84', country: 'VN', name: 'Vietnã', flag: '🇻🇳' },
  { code: '+967', country: 'YE', name: 'Iêmen', flag: '🇾🇪' },
  { code: '+260', country: 'ZM', name: 'Zâmbia', flag: '🇿🇲' },
  { code: '+263', country: 'ZW', name: 'Zimbábue', flag: '🇿🇼' },
];

interface CountryCodeSelectProps {
  value: string;
  onChange: (value: string) => void;
}

export const CountryCodeSelect = ({ value, onChange }: CountryCodeSelectProps) => {
  const [search, setSearch] = useState('');

  const filteredCountries = useMemo(() => {
    if (!search) return countries;
    const searchLower = search.toLowerCase();
    return countries.filter(
      (c) =>
        c.name.toLowerCase().includes(searchLower) ||
        c.code.includes(search) ||
        c.country.toLowerCase().includes(searchLower)
    );
  }, [search]);

  const selectedCountry = countries.find((c) => c.code === value);

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-[120px] bg-background">
        <SelectValue>
          {selectedCountry ? (
            <span className="flex items-center gap-2">
              <span className="text-lg">{selectedCountry.flag}</span>
              <span>{selectedCountry.code}</span>
            </span>
          ) : (
            '+55'
          )}
        </SelectValue>
      </SelectTrigger>
      <SelectContent className="bg-popover border border-border">
        <div className="p-2 sticky top-0 bg-popover z-10">
          <Input
            placeholder="Buscar país..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
          />
        </div>
        <ScrollArea className="h-[200px]">
          {filteredCountries.map((country) => (
            <SelectItem
              key={`${country.country}-${country.code}`}
              value={country.code}
              className="cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="text-lg">{country.flag}</span>
                <span className="truncate">{country.name}</span>
                <span className="text-muted-foreground ml-auto">{country.code}</span>
              </span>
            </SelectItem>
          ))}
        </ScrollArea>
      </SelectContent>
    </Select>
  );
};
