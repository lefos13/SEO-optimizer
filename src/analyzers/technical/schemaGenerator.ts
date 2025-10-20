/**
 * Schema Markup Generator
 * Generates structured data (JSON-LD) for common schema types
 */

export type SchemaType =
  | 'Article'
  | 'BlogPosting'
  | 'Product'
  | 'Organization'
  | 'Person'
  | 'LocalBusiness'
  | 'WebSite'
  | 'BreadcrumbList'
  | 'FAQPage'
  | 'HowTo'
  | 'Recipe';

export interface SchemaMarkup {
  '@context': string;
  '@type': SchemaType;
  [key: string]: unknown;
}

export interface SchemaTemplate {
  type: SchemaType;
  name: string;
  description: string;
  category: string;
  requiredFields: string[];
  optionalFields: string[];
  example: Record<string, unknown>;
}

export interface SchemaValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  missingRequired: string[];
  score: number;
}

/**
 * Schema templates with required and optional fields
 */
export const SCHEMA_TEMPLATES: SchemaTemplate[] = [
  {
    type: 'Article',
    name: 'Article',
    description: 'Standard article or news piece',
    category: 'Content',
    requiredFields: ['headline', 'image', 'datePublished', 'author'],
    optionalFields: ['dateModified', 'description', 'publisher'],
    example: {
      headline: 'Article Title',
      image: 'https://example.com/image.jpg',
      datePublished: '2024-01-01',
      author: {
        '@type': 'Person',
        name: 'Author Name',
      },
    },
  },
  {
    type: 'BlogPosting',
    name: 'Blog Post',
    description: 'Blog article with author and publication info',
    category: 'Content',
    requiredFields: ['headline', 'image', 'datePublished', 'author'],
    optionalFields: [
      'dateModified',
      'description',
      'publisher',
      'mainEntityOfPage',
    ],
    example: {
      headline: 'Blog Post Title',
      image: 'https://example.com/image.jpg',
      datePublished: '2024-01-01',
      author: {
        '@type': 'Person',
        name: 'Author Name',
      },
    },
  },
  {
    type: 'Product',
    name: 'Product',
    description: 'E-commerce product with pricing and reviews',
    category: 'E-commerce',
    requiredFields: ['name', 'image', 'description'],
    optionalFields: ['brand', 'offers', 'aggregateRating', 'review'],
    example: {
      name: 'Product Name',
      image: 'https://example.com/product.jpg',
      description: 'Product description',
      offers: {
        '@type': 'Offer',
        price: '29.99',
        priceCurrency: 'USD',
        availability: 'https://schema.org/InStock',
      },
    },
  },
  {
    type: 'Organization',
    name: 'Organization',
    description: 'Company or organization information',
    category: 'Business',
    requiredFields: ['name'],
    optionalFields: ['url', 'logo', 'contactPoint', 'sameAs', 'address'],
    example: {
      name: 'Company Name',
      url: 'https://example.com',
      logo: 'https://example.com/logo.png',
    },
  },
  {
    type: 'LocalBusiness',
    name: 'Local Business',
    description: 'Local business with location and hours',
    category: 'Business',
    requiredFields: ['name', 'address'],
    optionalFields: ['telephone', 'openingHours', 'priceRange', 'image'],
    example: {
      name: 'Business Name',
      address: {
        '@type': 'PostalAddress',
        streetAddress: '123 Main St',
        addressLocality: 'City',
        addressRegion: 'State',
        postalCode: '12345',
        addressCountry: 'US',
      },
    },
  },
  {
    type: 'WebSite',
    name: 'Website',
    description: 'Website with search functionality',
    category: 'General',
    requiredFields: ['name', 'url'],
    optionalFields: ['potentialAction'],
    example: {
      name: 'Website Name',
      url: 'https://example.com',
      potentialAction: {
        '@type': 'SearchAction',
        target: 'https://example.com/search?q={search_term_string}',
        'query-input': 'required name=search_term_string',
      },
    },
  },
  {
    type: 'BreadcrumbList',
    name: 'Breadcrumb Navigation',
    description: 'Breadcrumb trail for navigation',
    category: 'Navigation',
    requiredFields: ['itemListElement'],
    optionalFields: [],
    example: {
      itemListElement: [
        {
          '@type': 'ListItem',
          position: 1,
          name: 'Home',
          item: 'https://example.com',
        },
        {
          '@type': 'ListItem',
          position: 2,
          name: 'Category',
          item: 'https://example.com/category',
        },
      ],
    },
  },
  {
    type: 'FAQPage',
    name: 'FAQ Page',
    description: 'Frequently asked questions page',
    category: 'Content',
    requiredFields: ['mainEntity'],
    optionalFields: [],
    example: {
      mainEntity: [
        {
          '@type': 'Question',
          name: 'Question text?',
          acceptedAnswer: {
            '@type': 'Answer',
            text: 'Answer text',
          },
        },
      ],
    },
  },
  {
    type: 'HowTo',
    name: 'How-To Guide',
    description: 'Step-by-step instructions',
    category: 'Content',
    requiredFields: ['name', 'step'],
    optionalFields: ['description', 'image', 'totalTime', 'tool', 'supply'],
    example: {
      name: 'How to do something',
      step: [
        {
          '@type': 'HowToStep',
          text: 'Step 1 description',
        },
        {
          '@type': 'HowToStep',
          text: 'Step 2 description',
        },
      ],
    },
  },
  {
    type: 'Recipe',
    name: 'Recipe',
    description: 'Cooking recipe with ingredients and instructions',
    category: 'Content',
    requiredFields: ['name', 'recipeIngredient', 'recipeInstructions'],
    optionalFields: [
      'image',
      'cookTime',
      'prepTime',
      'recipeYield',
      'nutrition',
    ],
    example: {
      name: 'Recipe Name',
      image: 'https://example.com/recipe.jpg',
      recipeIngredient: ['Ingredient 1', 'Ingredient 2'],
      recipeInstructions: [
        {
          '@type': 'HowToStep',
          text: 'Step 1',
        },
      ],
    },
  },
];

/**
 * Generates schema markup from template
 */
export function generateSchema(
  type: SchemaType,
  data: Record<string, unknown>
): SchemaMarkup {
  const template = SCHEMA_TEMPLATES.find(t => t.type === type);

  if (!template) {
    throw new Error(`Schema type "${type}" not found`);
  }

  const schema: SchemaMarkup = {
    '@context': 'https://schema.org',
    '@type': type,
    ...data,
  };

  return schema;
}

/**
 * Validates schema markup
 */
export function validateSchema(
  schema: SchemaMarkup,
  type: SchemaType
): SchemaValidation {
  const template = SCHEMA_TEMPLATES.find(t => t.type === type);

  if (!template) {
    return {
      isValid: false,
      errors: [`Unknown schema type: ${type}`],
      warnings: [],
      missingRequired: [],
      score: 0,
    };
  }

  const errors: string[] = [];
  const warnings: string[] = [];
  const missingRequired: string[] = [];

  // Check required fields
  template.requiredFields.forEach(field => {
    if (
      !(field in schema) ||
      schema[field] === null ||
      schema[field] === undefined
    ) {
      missingRequired.push(field);
      errors.push(`Required field missing: ${field}`);
    }
  });

  // Check @context
  if (schema['@context'] !== 'https://schema.org') {
    warnings.push('Context should be "https://schema.org"');
  }

  // Check @type
  if (schema['@type'] !== type) {
    errors.push(
      `Schema type mismatch: expected ${type}, got ${schema['@type']}`
    );
  }

  // Type-specific validations
  if (type === 'Article' || type === 'BlogPosting') {
    if (schema.datePublished && !isValidDate(schema.datePublished as string)) {
      warnings.push('datePublished should be in ISO 8601 format');
    }
  }

  if (type === 'Product') {
    if (schema.offers && !validateOffers(schema.offers)) {
      warnings.push(
        'Product offers should include price, currency, and availability'
      );
    }
  }

  const score = calculateSchemaScore(schema, template, errors, warnings);

  return {
    isValid: errors.length === 0 && missingRequired.length === 0,
    errors,
    warnings,
    missingRequired,
    score,
  };
}

/**
 * Validates date format
 */
function isValidDate(dateString: string): boolean {
  const iso8601Regex = /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/;
  return iso8601Regex.test(dateString);
}

/**
 * Validates product offers
 */
function validateOffers(offers: unknown): boolean {
  if (typeof offers !== 'object' || offers === null) return false;

  const offer = offers as Record<string, unknown>;
  return Boolean(
    offer['@type'] === 'Offer' &&
      offer.price &&
      offer.priceCurrency &&
      offer.availability
  );
}

/**
 * Calculates schema quality score
 */
function calculateSchemaScore(
  schema: SchemaMarkup,
  template: SchemaTemplate,
  errors: string[],
  warnings: string[]
): number {
  let score = 100;

  // Deduct for errors
  score -= errors.length * 20;

  // Deduct for warnings
  score -= warnings.length * 5;

  // Bonus for optional fields
  const optionalFieldsPresent = template.optionalFields.filter(
    field =>
      field in schema && schema[field] !== null && schema[field] !== undefined
  ).length;
  const optionalBonus =
    (optionalFieldsPresent / template.optionalFields.length) * 20;
  score += optionalBonus;

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Converts schema to JSON-LD script tag
 */
export function schemaToHTML(schema: SchemaMarkup): string {
  const jsonString = JSON.stringify(schema, null, 2);
  return `<script type="application/ld+json">\n${jsonString}\n</script>`;
}

/**
 * Creates a complete schema with defaults
 */
export function createSchemaWithDefaults(
  type: SchemaType,
  partialData: Record<string, unknown>
): SchemaMarkup {
  const template = SCHEMA_TEMPLATES.find(t => t.type === type);

  if (!template) {
    throw new Error(`Schema type "${type}" not found`);
  }

  const defaults: Record<string, unknown> = {};

  // Set placeholder values for required fields that are missing
  template.requiredFields.forEach(field => {
    if (!(field in partialData)) {
      defaults[field] = `[${field}]`;
    }
  });

  return {
    '@context': 'https://schema.org',
    '@type': type,
    ...defaults,
    ...partialData,
  };
}
