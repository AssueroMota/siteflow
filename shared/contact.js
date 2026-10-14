export function whatsappNumber(value = '') {
  if (!/^[+\d\s().-]*$/.test(value)) return '';
  const digits = value.replace(/\D/g, '');
  if (/^\d{10,11}$/.test(digits)) return `55${digits}`;
  return /^55\d{10,11}$/.test(digits) ? digits : '';
}

export function whatsappLink(number, message) {
  const digits = whatsappNumber(number);
  return digits ? `https://wa.me/${digits}?text=${encodeURIComponent(message)}` : '';
}

export function projectMessage(modelName, protocol) {
  return [
    'Olá, SiteFlow! Quero conversar sobre um site ou sistema para meu negócio.',
    modelName ? `Gostei da referência ${modelName} do catálogo.` : '',
    protocol ? `Minha solicitação é ${protocol}.` : '',
  ]
    .filter(Boolean)
    .join('\n');
}
