import cluster from "cluster";
import * as sa from "superagent";
import { GameRequestBody, LoginResponseBody } from "./types";

class Bot {
	private req: ReturnType<typeof sa.agent>;
	private instance: number;
	private count = 0;
	private username: string;
	private password: string;
	private MULTIPLICATION_CATEGORY_ID = "66f2a9aa-bac2-5919-997d-2d17825c1837";
	private AUTH_URL =
		"https://accounts.freerice.com/auth/login?_format=json&_lang=en";
	private jsonHeaders = {
		accept: "application/vnd.api+json;version=2",
		"accept-encoding": "gzip, deflate, br",
		"accept-language": "en-US,en;q=0.9,vi-VN;q=0.8,vi;q=0.7,ru;q=0.6",
		"content-type": "application/json",
	};

	constructor(instance: number) {
		const { username, password } = require("./config.json");
		[this.username, this.password] = [username, password];
		this.req = sa.agent();
		this.instance = instance;
	}

	randomizeUA() {
		const uas = [
			"Mozilla/5.0 (Windows NT 6.1; WOW64; rv:40.0) Gecko/20100101 Firefox/40.1",
			"Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.1; WOW64; Trident/6.0)",
			"Mozilla/5.0 (Windows NT 6.3; rv:36.0) Gecko/20100101 Firefox/36.0",
			"Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36",
		];
		this.req.set(
			"User-Agent",
			uas[Math.round(Math.random() * (uas.length - 1))]
		);
	}
	private getUaHeaders() {
		return {
			"user-agent": this.req,
			"x-frontend": "web-1.0.0",
		};
	}

	public async solve() {
		this.randomizeUA();
		await this.req.set(this.getUaHeaders());
		await this.req.get("https://freerice.com/");
		await this.req.get("https://freerice.com/profile-login");

		// login
		const { uuid, token } = (
			await this.req.set(this.jsonHeaders).post(this.AUTH_URL).send({
				username: this.username,
				password: this.password,
			})
		).body as LoginResponseBody;
		this.req.set({
			...this.jsonHeaders,
			authorization: `Bearer ${token}`,
		});

		// visit category page
		await this.req.get("https://freerice.com/categories");

		// select multiplication category
		let game = (
			await this.req
				.post("https://engine.freerice.com/games?lang=en")
				.send({
					category: this.MULTIPLICATION_CATEGORY_ID,
					level: 1,
					user: uuid,
				})
		).body as GameRequestBody;

		// solve
		while (true) {
			const { question_id, question, user_rice_total } =
				game.data.attributes;
			const { text: question_text } = question;
			const answer = "" + eval(question_text.replace("x", "*"));
			const answer_url = game.data.links.self + "/answer?lang=en";
			const answer_req = {
				answer: "a" + answer,
				question: question_id,
				user: uuid,
			};
			game = (await this.req.patch(answer_url).send(answer_req)).body;
			this.count++;
			console.log(
				`instance: ${this.instance} | question: ${question_text} = ${answer} | numSolved: ${this.count} | rice: ${user_rice_total}`
			);
		}
	}

	public async start() {
		while (true) {
			try {
				await this.solve();
			} catch (err) {
				console.error(err);
				console.log("Blocked! Retrying in 5 seconds...\n\n");
				await new Promise(resolve => setTimeout(resolve, 5000));
			}
		}
	}
}

if (cluster.isPrimary) {
	const numCPUs = require("os").cpus().length;
	for (let i = 0; i < numCPUs; i++) {
		console.log(`Starting instance ${i}...`);
		cluster.fork({ workerId: i });
	}
} else {
	const bot = new Bot(parseInt(process.env.workerId ?? "-1"));
	bot.start();
}
