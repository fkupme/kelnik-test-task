export interface Apartment {
	id: string;
	name: string;
	area: number;
	floor: number;
	totalFloors: number;
	price: number;
	rooms: number;
	planImage: string;
}

export interface FilterState {
	rooms: number[];
	priceRange: [number, number];
	areaRange: [number, number];
}

export interface ApartmentsResponse {
	apartments: Apartment[];
}

export interface PaginationState {
	currentPage: number;
	itemsPerPage: number;
	totalItems: number;
	hasMore: boolean;
}
