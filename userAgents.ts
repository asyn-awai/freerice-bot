import UserAgent from "user-agents";

const generateUA = new UserAgent();

export default Array.from(
	{ length: 25 },
	() => generateUA.random().data.userAgent
);
