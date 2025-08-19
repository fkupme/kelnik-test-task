import { readFileSync } from 'fs';
import type { H3Event } from 'h3';
import { join } from 'path';

interface Apartment {
	id: string;
	name: string;
	area: number;
	floor: number;
	totalFloors: number;
	price: number;
	rooms: number;
	planImage: string;
}

function loadAll(): Apartment[] {
	const p = join(process.cwd(), 'public', 'apartments.json');
	const raw = readFileSync(p, 'utf-8');
	const data = JSON.parse(raw);
	return data.apartments as Apartment[];
}

export default defineEventHandler((event: H3Event) => {
	// getQuery уже возвращает объект query-параметров; прежний код деструктурировал { query } и терял их
	const query = getQuery(event) as Record<string, string>;
	const offset = parseInt(query.offset || '0', 10);
	const limit = Math.min(parseInt(query.limit || '10', 10), 100);
	const sortField = query.sortField || '';
	const sortDir = (query.sortDir === 'desc' ? 'desc' : 'asc') as 'asc' | 'desc';

	// Filters
	const rooms = (query.rooms || '')
		.split(',')
		.map(v => parseInt(v, 10))
		.filter(n => !Number.isNaN(n));
	const priceMin = parseInt(query.priceMin || '0', 10);
	const priceMax =
		parseInt(query.priceMax || '0', 10) || Number.MAX_SAFE_INTEGER;
	const areaMin = parseInt(query.areaMin || '0', 10);
	const areaMax = parseInt(query.areaMax || '0', 10) || Number.MAX_SAFE_INTEGER;

	let all = loadAll();

	// Global ranges
	const prices = all.map(a => a.price);
	const areas = all.map(a => a.area);
	const globalPriceMin = Math.min(...prices);
	const globalPriceMax = Math.max(...prices);
	const globalAreaMin = Math.min(...areas);
	const globalAreaMax = Math.max(...areas);

	// Apply filters
	all = all.filter(a => {
		if (rooms.length && !rooms.includes(a.rooms)) return false;
		if (
			a.price < (priceMin || globalPriceMin) ||
			a.price > (priceMax || globalPriceMax)
		)
			return false;
		if (
			a.area < (areaMin || globalAreaMin) ||
			a.area > (areaMax || globalAreaMax)
		)
			return false;
		return true;
	});

	// Sort
	if (sortField) {
		all.sort((a: any, b: any) => {
			let av: any;
			let bv: any;
			if (sortField === 'name') {
				const an = parseInt(a.name.match(/\d+/)?.[0] || '0');
				const bn = parseInt(b.name.match(/\d+/)?.[0] || '0');
				av = an;
				bv = bn;
			} else if (sortField === 'plan') {
				const an = parseInt(a.planImage.match(/plan-(\d+)/)?.[1] || '0');
				const bn = parseInt(b.planImage.match(/plan-(\d+)/)?.[1] || '0');
				av = an;
				bv = bn;
			} else {
				av = a[sortField];
				bv = b[sortField];
			}
			if (av < bv) return sortDir === 'asc' ? -1 : 1;
			if (av > bv) return sortDir === 'asc' ? 1 : -1;
			return 0;
		});
	}

	const total = all.length;
	const slice = all.slice(offset, offset + limit);

	return {
		apartments: slice,
		total,
		priceMin: globalPriceMin,
		priceMax: globalPriceMax,
		areaMin: globalAreaMin,
		areaMax: globalAreaMax,
	};
});
