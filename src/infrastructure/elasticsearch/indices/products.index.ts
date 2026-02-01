import { PRODUCTS_INDEX } from '~/common/constants/index.constants'

export const PRODUCTS_INDEX_CONFIG = {
  index: PRODUCTS_INDEX,
  settings: {
    number_of_shards: 1,
    number_of_replicas: 0,
    'index.mapping.total_fields.limit': 2000,
    analysis: {
      analyzer: {
        vietnamese_analyzer: {
          type: 'standard',
          stopwords: '_vietnamese_',
        },
      },
      normalizer: {
        lowercase_normalizer: {
          type: 'custom',
          filter: ['lowercase', 'trim', 'asciifolding'],
        },
      },
    },
    'index.store.preload': ['nvd', 'dvd'],
  },
  mappings: {
    dynamic_templates: [
      {
        filter_attributes: {
          path_match: ['attributes.Thương hiệu', 'attributes.Xuất xứ'],
          match_mapping_type: 'string',
          mapping: {
            type: 'text',
            analyzer: 'vietnamese_analyzer',
            fields: {
              keyword: {
                type: 'keyword',
                normalizer: 'lowercase_normalizer',
                ignore_above: 256,
              },
            },
          },
        },
      },
      {
        other_attributes: {
          path_match: 'attributes.*',
          path_unmatch: ['attributes.Thương hiệu', 'attributes.Xuất xứ'],
          match_mapping_type: 'string',
          mapping: {
            type: 'text',
            analyzer: 'vietnamese_analyzer',
          },
        },
      },
    ],
    properties: {
      id: {
        type: 'keyword',
      },
      sku: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
      },
      name: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
      },
      main_image: {
        type: 'keyword',
        index: false,
      },
      description: {
        type: 'text',
        analyzer: 'vietnamese_analyzer',
      },
      category: {
        type: 'keyword',
        normalizer: 'lowercase_normalizer',
      },
      category_hierarchy: {
        type: 'keyword',
      },
      price: {
        type: 'object',
        properties: {
          min: { type: 'integer' },
          max: { type: 'integer' },
        },
      },
      ratingAvg: {
        type: 'float',
      },
      buy_count: {
        type: 'integer',
      },
      is_in_stock: {
        type: 'boolean',
      },
      attributes: {
        type: 'object',
        dynamic: true,
      },
    },
  },
}
