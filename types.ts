export interface LoginResponseBody {
	uuid: string;
	token: string;
	userData: {
		username: string;
		avatar: string | null;
		email: string;
	};
	verified: boolean;
	external: boolean;
}

export interface GameRequestBody {
	data: {
		type: string;
		id: string;
		attributes: {
			rice: number;
			category: string;
			level: number;
			streak: number;
			played_categories: [];
			question: {
				type: string;
				text: string;
				resources: unknown | null;
				options: { id: string; text: string }[];
				metadata: unknown | null;
			};
			answer: object[];
			badges: object[];
			question_id: string;
			notifications: string[];
			user_rice_total: number;
		};
		links: {
			self: string;
		};
	};
}
