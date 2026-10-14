export function publicTestimonials(items) {
  return items
    .filter((item) => item.authorized && item.published)
    .map(({ id, name, business, quote, authorized, published }) => ({
      id,
      name,
      business,
      quote,
      authorized,
      published,
    }));
}
