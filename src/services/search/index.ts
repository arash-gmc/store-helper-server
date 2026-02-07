import { IndexSettings } from '@opensearch-project/opensearch/api/_types/indices._common.js';
import opensearch from '../../config/opensearch';

export const indexSetting: IndexSettings = {
	analysis: {
		filter: {
			persian_stop: {
				type: 'stop',
				stopwords: '_persian_',
			},
			persian_normalizer: {
				type: 'persian_normalization',
			} as any,
		},
		analyzer: {
			persian_analyzer: {
				type: 'custom',
				tokenizer: 'standard',
				filter: ['lowercase', 'persian_normalizer', 'persian_stop'],
			},
			english_analyzer: {
				type: 'standard',
			},
			autocomplete_analyzer: {
				type: 'custom',
				tokenizer: 'edge_ngram_tokenizer',
				filter: ['lowercase'],
			},
		},
		tokenizer: {
			edge_ngram_tokenizer: {
				type: 'edge_ngram',
				min_gram: 2,
				max_gram: 20,
				token_chars: ['letter', 'digit'],
			},
		},
	},
};

export async function bulkIndex(indexName: string, data: any[]) {
	return await opensearch.bulk({
		body: data.reduce((acc, item) => {
			acc.push({ index: { _index: indexName, _id: item?.id } });
			acc.push(item);
			return acc;
		}, [] as any[]),
	});
}
