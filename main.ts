import cluster from "cluster";
import * as sa from "superagent";
import chalk from "chalk";
import { GameRequestBody, LoginResponseBody } from "./types";
import uas from "./userAgents";
import config from "./config";

class Bot {
	private req: ReturnType<typeof sa.agent>;
	private instance: number;
	private numSolved = 0;
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
		const { username, password } = config;
		[this.username, this.password] = [username, password];
		this.req = sa.agent();
		this.instance = instance;
	}

	private randomizeUA() {
		const newUA = uas[Math.floor(Math.random() * uas.length)];
		console.log(
			chalk.yellow(`Instance ${this.instance} using ${newUA} \n`)
		);
		this.req.set("User-Agent", newUA);
	}
	private getUAHeaders() {
		return {
			"user-agent": this.req,
			"x-frontend": "web-1.0.0",
		};
	}
	private resetReq() {
		this.req = sa.agent();
	}

	public async solve() {
		await this.req.set(this.getUAHeaders());
		// await this.req.get("https://freerice.com/");
		// await this.req.get("https://freerice.com/profile-login");

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
		// await this.req.get("https://freerice.com/categories");

		// select multiplication category
		let game = (
			await this.req
				.post("https://engine.freerice.com/games?lang=en")
				.send({
					category: this.MULTIPLICATION_CATEGORY_ID,
					level: 2,
					user: uuid,
				})
		).body as GameRequestBody;

		// solve
		while (true) {
			if (this.numSolved % 250 === 0) this.randomizeUA();
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
			this.numSolved++;

			const out = [] as string[];
			if (config.showInstance)
				out.push(chalk.bold(`Instance: ${this.instance}`));
			if (config.showQuestions)
				out.push(
					chalk.yellow(`Question: ${question_text} = ${answer}`)
				);
			if (config.showNumSolved)
				out.push(chalk.green(`Solved: ${this.numSolved}`));
			if (config.showRiceCount)
				out.push(chalk.blue(`Rice: ${user_rice_total}`));
			console.log(out.join(" | "));
		}
	}

	public async start() {
		while (true) {
			try {
				await this.solve();
			} catch (err) {
				if (config.logErrors) console.error(err);
				console.log(
					chalk.red.bold(
						`Instance ${this.instance} blocked; generating new session...`
					)
				);
				this.resetReq();
			}
		}
	}
}

if (cluster.isPrimary) {
	const numCores = require("os").cpus().length;
	console.log(`CPU cores: ${numCores}`);
	for (let i = 0; i < config.numProcesses; i++) {
		console.log(chalk.yellow.bold(`Starting instance ${i}...`));
		cluster.fork({ workerId: i });
	}
} else {
	const bot = new Bot(parseInt(process.env.workerId ?? "-1"));
	bot.start();
}
